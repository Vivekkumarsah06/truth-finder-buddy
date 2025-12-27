import { Shield, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CredibilityScoreProps {
  score: number; // 0-100
  label: string;
}

export function CredibilityScore({ score, label }: CredibilityScoreProps) {
  const getScoreColor = () => {
    if (score >= 70) return "trust-high";
    if (score >= 40) return "trust-medium";
    return "trust-low";
  };

  const getScoreIcon = () => {
    if (score >= 70) return <CheckCircle className="w-8 h-8" />;
    if (score >= 40) return <AlertTriangle className="w-8 h-8" />;
    return <XCircle className="w-8 h-8" />;
  };

  const getScoreLabel = () => {
    if (score >= 70) return "Likely Reliable";
    if (score >= 40) return "Use Caution";
    return "Likely Unreliable";
  };

  const colorClass = getScoreColor();
  const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="glass-card p-6 md:p-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Credibility Score</h3>
      </div>

      {/* Gauge */}
      <div className="relative w-48 h-24 mx-auto mb-4 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0 trust-gauge opacity-30" style={{ borderRadius: '96px 96px 0 0' }} />
        
        {/* Colored arc based on score */}
        <div
          className={cn("absolute inset-0", {
            "bg-trust-high": score >= 70,
            "bg-trust-medium": score >= 40 && score < 70,
            "bg-trust-low": score < 40,
          })}
          style={{
            borderRadius: '96px 96px 0 0',
            clipPath: `polygon(0 100%, 50% 100%, 50% 0, ${50 + (score / 100) * 50}% 0, ${score}% 100%)`,
          }}
        />

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom -translate-x-1/2 transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-1 h-16 bg-foreground rounded-full" />
          <div className="w-3 h-3 bg-foreground rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </div>

        {/* Center cover */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 bg-card rounded-t-full" />
      </div>

      {/* Score display */}
      <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3", {
        "bg-trust-high/10 text-trust-high": score >= 70,
        "bg-trust-medium/10 text-trust-medium": score >= 40 && score < 70,
        "bg-trust-low/10 text-trust-low": score < 40,
      })}>
        {getScoreIcon()}
        <span className="text-3xl font-bold">{score}%</span>
      </div>

      <div className={cn("text-lg font-semibold", {
        "text-trust-high": score >= 70,
        "text-trust-medium": score >= 40 && score < 70,
        "text-trust-low": score < 40,
      })}>
        {getScoreLabel()}
      </div>

      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </div>
  );
}
