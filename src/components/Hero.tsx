import { Shield, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";

interface HeroProps {
  onScrollToAnalyzer: () => void;
}

export function Hero({ onScrollToAnalyzer }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-95" />
      
      {/* User menu in top right */}
      <div className="absolute top-4 right-4 z-20">
        <UserMenu />
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-foreground/5 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground">AI-Powered Fact Checking</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground mb-6 animate-slide-up text-balance leading-tight">
          Don't Get Fooled by
          <br />
          <span className="bg-gradient-to-r from-primary-foreground via-primary-foreground/90 to-accent bg-clip-text text-transparent">
            Fake News
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
          Our AI analyzes articles and sources to help you identify misinformation,
          assess credibility, and get reliable summaries in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button variant="hero" size="xl" onClick={onScrollToAnalyzer}>
            <Search className="w-5 h-5" />
            Analyze an Article
          </Button>
          <Button variant="hero-outline" size="xl" onClick={() => document.getElementById('tips')?.scrollIntoView({ behavior: 'smooth' })}>
            <Shield className="w-5 h-5" />
            Learn to Spot Fakes
          </Button>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { value: "10K+", label: "Articles Analyzed" },
            { value: "95%", label: "Accuracy Rate" },
            { value: "Free", label: "For Students" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">{stat.value}</div>
              <div className="text-sm text-primary-foreground/70 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
