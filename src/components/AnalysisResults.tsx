import { FileText, AlertCircle, CheckCircle, Info, ExternalLink, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { CredibilityScore } from "./CredibilityScore";

export interface AnalysisResult {
  score: number;
  summary: string;
  findings: {
    type: 'positive' | 'warning' | 'negative';
    text: string;
  }[];
  sources?: {
    name: string;
    reliability: 'high' | 'medium' | 'low';
    url?: string;
  }[];
  tips: string[];
}

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const getFindingIcon = (type: 'positive' | 'warning' | 'negative') => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-trust-high flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-trust-medium flex-shrink-0" />;
      case 'negative':
        return <AlertCircle className="w-5 h-5 text-trust-low flex-shrink-0" />;
    }
  };

  const getFindingBg = (type: 'positive' | 'warning' | 'negative') => {
    switch (type) {
      case 'positive':
        return "bg-trust-high/5 border-trust-high/20";
      case 'warning':
        return "bg-trust-medium/5 border-trust-medium/20";
      case 'negative':
        return "bg-trust-low/5 border-trust-low/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score */}
      <CredibilityScore
        score={result.score}
        label="Based on AI analysis of content, sources, and writing patterns"
      />

      {/* Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Summary</h3>
        </div>
        <p className="text-foreground/80 leading-relaxed">{result.summary}</p>
      </div>

      {/* Key Findings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Key Findings</h3>
        </div>
        <div className="space-y-3">
          {result.findings.map((finding, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border transition-all hover:shadow-sm",
                getFindingBg(finding.type)
              )}
            >
              {getFindingIcon(finding.type)}
              <p className="text-foreground/80 text-sm leading-relaxed">{finding.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      {result.sources && result.sources.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Source Analysis</h3>
          </div>
          <div className="space-y-2">
            {result.sources.map((source, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
              >
                <span className="text-foreground font-medium">{source.name}</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    {
                      "bg-trust-high/10 text-trust-high": source.reliability === 'high',
                      "bg-trust-medium/10 text-trust-medium": source.reliability === 'medium',
                      "bg-trust-low/10 text-trust-low": source.reliability === 'low',
                    }
                  )}
                >
                  {source.reliability === 'high' && 'Reliable'}
                  {source.reliability === 'medium' && 'Mixed'}
                  {source.reliability === 'low' && 'Unreliable'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context Tips */}
      {result.tips.length > 0 && (
        <div className="glass-card p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Things to Consider</h3>
          </div>
          <ul className="space-y-2">
            {result.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-foreground/80 text-sm">
                <span className="text-primary mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
