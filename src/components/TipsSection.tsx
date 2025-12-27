import { Shield, Eye, Search, Users, Clock, Link2, Brain, BookOpen } from "lucide-react";

const tips = [
  {
    icon: Eye,
    title: "Check the Source",
    description: "Look for well-known, established news outlets. Be wary of sites you've never heard of or that mimic legitimate sources.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Verify the Author",
    description: "Research the author's credentials and past work. Credible journalists have a track record you can verify.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Clock,
    title: "Check the Date",
    description: "Old news can be misleading when shared out of context. Always verify when the article was originally published.",
    color: "text-trust-high",
    bgColor: "bg-trust-high/10",
  },
  {
    icon: Link2,
    title: "Follow the Links",
    description: "Reliable articles cite their sources. Click through to verify claims and check if the original sources support the story.",
    color: "text-trust-medium",
    bgColor: "bg-trust-medium/10",
  },
  {
    icon: Brain,
    title: "Watch for Bias",
    description: "Be aware of emotional language designed to provoke reactions. Factual reporting tends to be more measured and balanced.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Search,
    title: "Cross-Reference",
    description: "Check if other reputable sources are reporting the same story. Major news is usually covered by multiple outlets.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: BookOpen,
    title: "Read Beyond Headlines",
    description: "Headlines can be misleading or sensationalized. Always read the full article before forming an opinion or sharing.",
    color: "text-trust-high",
    bgColor: "bg-trust-high/10",
  },
  {
    icon: Shield,
    title: "Trust Your Instincts",
    description: "If something seems too outrageous, too perfect, or too convenient, it probably deserves extra scrutiny.",
    color: "text-trust-medium",
    bgColor: "bg-trust-medium/10",
  },
];

export function TipsSection() {
  return (
    <section id="tips" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Student Guide</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How to Spot Fake News
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Develop critical thinking skills to identify misinformation and become a more informed reader.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tips.map((tip, index) => (
            <div
              key={tip.title}
              className="glass-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-3 rounded-xl ${tip.bgColor} mb-4`}>
                <tip.icon className={`w-6 h-6 ${tip.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{tip.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
