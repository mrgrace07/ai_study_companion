import { FileText, Sparkles } from "lucide-react";

export interface Conversation {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

interface AnswerDisplayProps {
  conversations: Conversation[];
}

export function AnswerDisplay({ conversations }: AnswerDisplayProps) {
  if (conversations.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center py-12 space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-muted/30">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground">No questions yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload a PDF and start asking questions to get AI-powered answers
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {conversations.map((conv) => (
        <div key={conv.id} className="space-y-4">
          {/* User Question */}
          <div className="flex justify-end">
            <div className="max-w-[80%]">
              <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-5 py-3 shadow-md">
                <p className="whitespace-pre-wrap break-words">{conv.question}</p>
              </div>
              <p className="text-muted-foreground mt-1 px-2">
                {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* AI Answer */}
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-5 py-3 shadow-md">
                    <p className="whitespace-pre-wrap break-words text-foreground leading-relaxed">
                      {conv.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
