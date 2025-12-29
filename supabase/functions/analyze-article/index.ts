const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert fact-checker and media literacy educator helping students identify misinformation. Analyze the provided content and assess its credibility.

Your analysis MUST be returned as a valid JSON object with this exact structure:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence summary of the content and your assessment>",
  "findings": [
    {
      "type": "<positive|warning|negative>",
      "text": "<specific finding about the content>"
    }
  ],
  "sources": [
    {
      "name": "<source name if identifiable>",
      "reliability": "<high|medium|low>"
    }
  ],
  "tips": ["<relevant tip for evaluating this type of content>"]
}

Scoring guidelines:
- 80-100: Well-sourced, factual content from reliable sources
- 60-79: Generally reliable but may have some bias or missing context
- 40-59: Contains unverified claims or comes from questionable sources
- 20-39: Contains misleading information or significant bias
- 0-19: Likely false or highly misleading content

When analyzing, consider:
1. Source credibility and reputation
2. Language tone (sensationalist vs measured)
3. Presence of verifiable facts and citations
4. Logical consistency
5. Potential bias or agenda
6. Date and context relevance

Provide 3-6 specific findings and 2-4 actionable tips for the student.
IMPORTANT: Return ONLY the JSON object, no additional text.`;

// Validation constants
const MAX_TEXT_LENGTH = 50000; // 50KB for article text
const MAX_URL_LENGTH = 2048;
const VALID_TYPES = ['url', 'text'];

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_ANONYMOUS = 2; // 2 requests per minute for anonymous users
const MAX_REQUESTS_AUTHENTICATED = 10; // 10 requests per minute for authenticated users

// In-memory rate limit store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: Request): string {
  // Try various headers for client IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback - use a hash of user-agent + accept-language as identifier
  const ua = req.headers.get('user-agent') || '';
  const lang = req.headers.get('accept-language') || '';
  return `unknown-${ua.slice(0, 20)}-${lang.slice(0, 10)}`;
}

function checkRateLimit(clientIP: string, maxRequests: number): { allowed: boolean; remaining: number; resetIn: number; limit: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);
  
  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1, resetIn: RATE_LIMIT_WINDOW_MS, limit: maxRequests };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now, limit: maxRequests };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now, limit: maxRequests };
}

// Check if request has valid auth token
async function isAuthenticated(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.replace('Bearer ', '');
  // Skip if it's just the anon key
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (token === anonKey) {
    return false;
  }
  
  // Verify JWT token with Supabase
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': anonKey || '',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if user is authenticated for higher rate limits
  const authenticated = await isAuthenticated(req);
  const maxRequests = authenticated ? MAX_REQUESTS_AUTHENTICATED : MAX_REQUESTS_ANONYMOUS;
  
  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP, maxRequests);
  
  const rateLimitHeaders = {
    ...corsHeaders,
    'X-RateLimit-Limit': rateLimit.limit.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
    'X-RateLimit-Authenticated': authenticated.toString(),
  };
  
  if (!rateLimit.allowed) {
    console.log('Rate limit exceeded for IP:', clientIP, 'authenticated:', authenticated);
    return new Response(
      JSON.stringify({ 
        error: authenticated 
          ? 'Too many requests. Please wait before trying again.'
          : 'Rate limit exceeded. Sign in for 5x more API calls!',
        retryAfter: Math.ceil(rateLimit.resetIn / 1000)
      }),
      { 
        status: 429, 
        headers: { ...rateLimitHeaders, 'Content-Type': 'application/json', 'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString() } 
      }
    );
  }

  try {
    const body = await req.json();
    const { content, type } = body;

    // Validate content exists and is a string
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate type parameter
    if (type && !VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be "url" or "text"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate content length based on type
    if (type === 'url') {
      if (content.length > MAX_URL_LENGTH) {
        return new Response(
          JSON.stringify({ error: 'URL is too long. Maximum length is 2048 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Validate URL format
      try {
        new URL(content);
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid URL format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      if (content.length > MAX_TEXT_LENGTH) {
        return new Response(
          JSON.stringify({ error: 'Content is too large. Maximum length is 50,000 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Sanitize content - trim whitespace
    const sanitizedContent = content.trim();
    if (!sanitizedContent) {
      return new Response(
        JSON.stringify({ error: 'Content cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userMessage = type === 'url' 
      ? `Analyze this article URL for credibility. Note: I can only see the URL, not the actual content. Assess based on the domain and URL structure, and explain what additional verification would be needed: ${sanitizedContent}`
      : `Analyze this article text for credibility:\n\n${sanitizedContent}`;

    console.log('Analyzing content, type:', type, 'length:', sanitizedContent.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service quota exceeded. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('No response from AI');
      return new Response(
        JSON.stringify({ error: 'No analysis received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis complete, score:', analysisResult.score);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...rateLimitHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
