import { useNavigate } from "react-router-dom";
import { Gauge, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface RateLimitIndicatorProps {
  remaining: number;
  limit: number;
  resetIn: number;
  isAuthenticated?: boolean;
}

export function RateLimitIndicator({ remaining, limit, resetIn, isAuthenticated = false }: RateLimitIndicatorProps) {
  const navigate = useNavigate();
  const percentage = (remaining / limit) * 100;
  
  const getStatusColor = () => {
    if (percentage > 50) return "text-trust-high";
    if (percentage > 20) return "text-trust-medium";
    return "text-destructive";
  };

  const getProgressColor = () => {
    if (percentage > 50) return "bg-trust-high";
    if (percentage > 20) return "bg-trust-medium";
    return "bg-destructive";
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 border border-border/50">
      <Gauge className={`w-4 h-4 ${getStatusColor()}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-muted-foreground">
            API Calls {isAuthenticated && <span className="text-accent">(Pro)</span>}
          </span>
          <span className={`font-medium ${getStatusColor()}`}>
            {remaining}/{limit}
          </span>
        </div>
        <Progress 
          value={percentage} 
          className="h-1.5" 
          indicatorClassName={getProgressColor()}
        />
      </div>
      {remaining === 0 && resetIn > 0 && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Resets in {resetIn}s
        </span>
      )}
      {!isAuthenticated && remaining <= 1 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/auth")}
          className="gap-1 text-xs"
        >
          <Sparkles className="w-3 h-3" />
          Get 5x More
        </Button>
      )}
    </div>
  );
}
