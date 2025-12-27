import { Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg hero-gradient">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">TruthCheck</span>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-trust-low fill-current" /> for students everywhere
          </p>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TruthCheck. All rights reserved.
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Disclaimer: This tool uses AI to analyze content and provide credibility assessments. 
            Results should be used as a starting point for critical evaluation, not as definitive fact-checking. 
            Always verify important information through multiple reliable sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
