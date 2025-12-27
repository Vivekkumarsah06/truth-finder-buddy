import { useRef, useState } from "react";
import { Hero } from "@/components/Hero";
import { ArticleInput } from "@/components/ArticleInput";
import { AnalysisResults, type AnalysisResult } from "@/components/AnalysisResults";
import { TipsSection } from "@/components/TipsSection";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const analyzerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToAnalyzer = () => {
    analyzerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnalyze = async (content: string, type: 'url' | 'text') => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-article', {
        body: { content, type }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
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

            <div className="grid gap-8">
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
