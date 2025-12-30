import { useState } from "react";
import { Send, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface QuestionInputProps {
  onAsk: (question: string) => void;
  disabled: boolean;
  isAsking: boolean;
}

export function QuestionInput({ onAsk, disabled, isAsking }: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    if (question.trim() && !disabled && !isAsking) {
      onAsk(question.trim());
      setQuestion("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Please upload a PDF first..." : "Ask a question about your PDF..."}
            disabled={disabled || isAsking}
            className="min-h-[100px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-14 text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between p-3 border-t border-border">
            <p className="text-muted-foreground">
              Press Enter to send, Shift + Enter for new line
            </p>
            <Button
              onClick={handleSubmit}
              disabled={disabled || isAsking || !question.trim()}
              size="sm"
              className="gap-2"
            >
              {isAsking ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ask
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
