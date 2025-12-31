import { Send, Loader2 } from "lucide-react";
import { UploadStatus } from "../App";

interface QuestionInputProps {
  question: string;
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
  uploadStatus: UploadStatus;
  handleAsk: () => Promise<void>
  isAsking: boolean;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>)=>void
}

export default function QuestionInput({ question, setQuestion, uploadStatus, handleAsk, isAsking, handleKeyPress  }: QuestionInputProps) {

  return (
            <div className="sticky bottom-6">
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 backdrop-blur-xl shadow-2xl">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={uploadStatus === "ready" ? "Ask a question about your PDF..." : "Waiting for PDF..."}
                    disabled={uploadStatus !== "ready" || isAsking}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleAsk}
                    disabled={uploadStatus !== "ready" || isAsking || !question.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    {isAsking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Ask
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
  );
}
