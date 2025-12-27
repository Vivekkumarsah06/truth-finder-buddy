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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
