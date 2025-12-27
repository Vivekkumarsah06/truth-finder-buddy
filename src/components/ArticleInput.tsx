import { useState } from "react";
import { Search, Link, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArticleInputProps {
  onAnalyze: (content: string, type: 'url' | 'text') => void;
  isLoading: boolean;
}

export function ArticleInput({ onAnalyze, isLoading }: ArticleInputProps) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = activeTab === 'url' ? url : text;
    if (content.trim()) {
      onAnalyze(content, activeTab);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Search className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Analyze Content</h2>
          <p className="text-sm text-muted-foreground">Paste a URL or article text to check its credibility</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'url' | 'text')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
            <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Link className="w-4 h-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-0">
            <Input
              type="url"
              placeholder="https://example.com/news-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-14 text-base bg-background border-border/50 focus:border-primary"
            />
          </TabsContent>

          <TabsContent value="text" className="mt-0">
            <Textarea
              placeholder="Paste the article text here... (Headlines, body text, or both)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[180px] text-base bg-background border-border/50 focus:border-primary resize-none"
            />
          </TabsContent>
        </Tabs>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-6"
          disabled={isLoading || (activeTab === 'url' ? !url.trim() : !text.trim())}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Check Credibility
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
