import { useState } from "react";
import { AlertCircle } from "lucide-react";
import Navbar from "./components/Navbar";
import PdfUploadCard from "./components/PdfUploadCard";
import QuestionInput from "./components/QuestionInput";
import { AnswerDisplay } from "./components/AnswerDisplay";

export type UploadStatus = "idle" | "uploading" | "processing" | "ready" | "error";

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
      <Navbar />
      
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

          <PdfUploadCard 
            uploadStatus={uploadStatus} 
            fileName={fileName} 
            onFileUpload={handleFileUpload}
          />
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
              <AnswerDisplay 
                conversations={conversations}
              />
            )}
            <QuestionInput 
              question={question}
              setQuestion={setQuestion}
              uploadStatus={uploadStatus}
              handleAsk={handleAsk}
              isAsking={isAsking}
              handleKeyPress={handleKeyPress}
            />
            
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