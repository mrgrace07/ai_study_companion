import { MessageSquare } from "lucide-react";

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
  return (
            <div className="space-y-4">
                {conversations.map((conv) => (
                  <div key={conv.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{conv.question}</p>
                        <p className="text-slate-400 text-xs mt-1">
                          {conv.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="pl-8 border-l-2 border-slate-700">
                      <p className="text-slate-300 leading-relaxed">{conv.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
  );
}
