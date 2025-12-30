import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 blur-md bg-primary/20" />
            </div>
            <h1 className="text-foreground">PDF AI Assistant</h1>
          </div>
        </div>
      </div>
    </nav>
  );
}
