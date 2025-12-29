import { useRef, useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { ArticleInput } from "@/components/ArticleInput";
import { AnalysisResults, type AnalysisResult } from "@/components/AnalysisResults";
import { TipsSection } from "@/components/TipsSection";
import { Footer } from "@/components/Footer";
import { RateLimitIndicator } from "@/components/RateLimitIndicator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetIn: number;
  isAuthenticated: boolean;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const analyzerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { session } = useAuth();

  // Countdown timer for rate limit reset
  useEffect(() => {
    if (!rateLimit || rateLimit.remaining > 0 || rateLimit.resetIn <= 0) return;

    const interval = setInterval(() => {
      setRateLimit(prev => {
        if (!prev || prev.resetIn <= 1) {
          // Reset to full limit when timer expires
          return { remaining: prev?.limit || 10, limit: prev?.limit || 10, resetIn: 0, isAuthenticated: prev?.isAuthenticated || false };
        }
        return { ...prev, resetIn: prev.resetIn - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimit]);

  // Reset rate limit display when auth state changes
  useEffect(() => {
    setRateLimit(null);
  }, [session]);

  const scrollToAnalyzer = () => {
    analyzerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnalyze = async (content: string, type: 'url' | 'text') => {
    setIsLoading(true);
    setResult(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };

      // Include auth token if user is logged in
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-article`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ content, type }),
        }
      );

      // Extract rate limit headers
      const limit = parseInt(response.headers.get('X-RateLimit-Limit') || '10', 10);
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '10', 10);
      const resetIn = parseInt(response.headers.get('X-RateLimit-Reset') || '60', 10);
      const isAuthenticated = response.headers.get('X-RateLimit-Authenticated') === 'true';
      
      setRateLimit({ remaining, limit, resetIn, isAuthenticated });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "We've assessed the credibility of this content.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Hero onScrollToAnalyzer={scrollToAnalyzer} />

      {/* Analyzer Section */}
      <section ref={analyzerRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Check Any Article
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Paste a URL or article text below and our AI will analyze its credibility,
                identify potential issues, and provide a trustworthy summary.
              </p>
            </div>

            <div className="grid gap-6">
              {rateLimit && (
                <RateLimitIndicator 
                  remaining={rateLimit.remaining} 
                  limit={rateLimit.limit} 
                  resetIn={rateLimit.resetIn}
                  isAuthenticated={rateLimit.isAuthenticated}
                />
              )}
              
              <ArticleInput onAnalyze={handleAnalyze} isLoading={isLoading} />

              {result && <AnalysisResults result={result} />}
            </div>
          </div>
        </div>
      </section>

      <TipsSection />
      <Footer />
    </main>
  );
};

export default Index;
