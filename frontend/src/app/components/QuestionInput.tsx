import { Send, Loader2, Sparkles } from "lucide-react";
import { UploadStatus } from "../App";
import { useState, useRef, useEffect } from "react";

interface QuestionInputProps {
  question: string;
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
  uploadStatus: UploadStatus;
  handleAsk: () => Promise<void>
  isAsking: boolean;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export default function QuestionInput({ question, setQuestion, uploadStatus, handleAsk, isAsking, handleKeyPress }: QuestionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [question]);

  const isDisabled = uploadStatus !== "ready" || isAsking;
  const canSend = !isDisabled && question.trim().length > 0;

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-6 pb-4">
      <div className="max-w-3xl mx-auto px-4">
        <div
          className={`
            relative bg-slate-800/90 backdrop-blur-xl rounded-xl 
            border-2 transition-all duration-300
            ${isFocused
              ? 'border-blue-500/70'
              : 'border-slate-600 hover:border-slate-500'
            }
            ${isDisabled ? 'opacity-60' : ''}
          `}
        >


          <div className="flex items-end gap-2 p-3">
            {/* Textarea Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  uploadStatus === "ready"
                    ? "Message AI Study Companion..."
                    : "Upload a PDF to start asking questions..."
                }
                disabled={isDisabled}
                rows={1}
                className={`
                  w-full bg-transparent text-white placeholder-slate-500 
                  focus:outline-none resize-none py-2.5 px-3
                  text-[15px] leading-relaxed
                  disabled:cursor-not-allowed
                `}
                style={{ maxHeight: '200px' }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleAsk}
              disabled={!canSend}
              className={`
                flex-shrink-0 w-10 h-10 rounded-lg
                flex items-center justify-center
                transition-all duration-200
                ${canSend
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-105'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                }
              `}
              title={isAsking ? "Generating response..." : "Send message"}
            >
              {isAsking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Hint Text */}
          {uploadStatus === "ready" && (
            <div className="px-4 pb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-slate-500">
                Press Enter to send, Shift + Enter for new line
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
