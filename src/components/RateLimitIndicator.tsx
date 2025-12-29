import { Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RateLimitIndicatorProps {
  remaining: number;
  limit: number;
  resetIn: number;
}

export function RateLimitIndicator({ remaining, limit, resetIn }: RateLimitIndicatorProps) {
  const percentage = (remaining / limit) * 100;
  
  const getStatusColor = () => {
    if (percentage > 50) return "text-green-500";
    if (percentage > 20) return "text-yellow-500";
    return "text-destructive";
  };

  const getProgressColor = () => {
    if (percentage > 50) return "bg-green-500";
    if (percentage > 20) return "bg-yellow-500";
    return "bg-destructive";
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50">
      <Gauge className={`w-4 h-4 ${getStatusColor()}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-muted-foreground">API Calls</span>
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
    </div>
  );
}
