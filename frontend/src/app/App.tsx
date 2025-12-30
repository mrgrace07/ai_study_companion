import { useState } from "react";
import { Upload, FileText, Loader2, Send, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";

type UploadStatus = "idle" | "uploading" | "processing" | "ready" | "error";

type Conversation = {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  audioFile?: string;
};

const API_BASE_URL = "http://localhost:8000";

export default function App() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setError("Please upload a PDF file");
      return;
    }

    setFileName(file.name);
    setUploadStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload PDF");
      }

      setUploadStatus("processing");
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setUploadStatus("ready");
    } catch (err) {
      setUploadStatus("error");
      setError(err instanceof Error ? err.message : "Failed to upload PDF");
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || uploadStatus !== "ready") return;

    setIsAsking(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          save_audio: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();

      const newConversation: Conversation = {
        id: Date.now().toString(),
        question: data.question,
        answer: data.answer,
        timestamp: new Date(),
        audioFile: data.audio_file,
      };

      setConversations((prev) => [...prev, newConversation]);
      setQuestion("");

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get answer");
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PDF Chat AI</h1>
                <p className="text-xs text-slate-400">Ask anything about your documents</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8 space-y-12 max-w-4xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-300 font-medium">Error</h3>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              <span className="text-sm font-medium">Step 1</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Upload Your PDF</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Start by uploading a PDF document. Our AI will process it and be ready to answer any questions you have.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 backdrop-blur-sm">
            <label
              htmlFor="pdf-upload"
              className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                uploadStatus === "idle"
                  ? "border-slate-700 hover:border-blue-500 hover:bg-blue-500/5"
                  : uploadStatus === "error"
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-green-500/50 bg-green-500/5"
              }`}
            >
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
              />

              <div className="flex flex-col items-center gap-4">
                {uploadStatus === "idle" && (
                  <>
                    <Upload className="w-12 h-12 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">Click to upload PDF</p>
                      <p className="text-slate-400 text-sm mt-1">or drag and drop</p>
                    </div>
                  </>
                )}

                {uploadStatus === "uploading" && (
                  <>
                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                    <div>
                      <p className="text-white font-medium">Uploading...</p>
                      <p className="text-slate-400 text-sm mt-1">{fileName}</p>
                    </div>
                  </>
                )}

                {uploadStatus === "processing" && (
                  <>
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                    <div>
                      <p className="text-white font-medium">Processing document...</p>
                      <p className="text-slate-400 text-sm mt-1">Creating embeddings</p>
                    </div>
                  </>
                )}

                {uploadStatus === "ready" && (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Ready to answer questions!</p>
                      <p className="text-slate-400 text-sm mt-1">{fileName}</p>
                    </div>
                  </>
                )}

                {uploadStatus === "error" && (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-400" />
                    <div>
                      <p className="text-white font-medium">Upload failed</p>
                      <p className="text-slate-400 text-sm mt-1">Click to try again</p>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>
        </section>

        {uploadStatus !== "idle" && (
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <span className="relative flex h-2 w-2">
                  {uploadStatus === "ready" && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                    </>
                  )}
                  {uploadStatus !== "ready" && (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600"></span>
                  )}
                </span>
                <span className="text-sm font-medium">Step 2</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Ask Questions</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                {uploadStatus === "ready"
                  ? "Your PDF is ready! Ask any question about the document content."
                  : "Please wait while we process your PDF..."}
              </p>
            </div>

            {conversations.length > 0 && (
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
            )}

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
          </section>
        )}
      </main>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}