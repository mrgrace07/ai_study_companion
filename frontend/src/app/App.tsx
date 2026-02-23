import { useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import Navbar from "./components/Navbar";
import PdfUploadCard from "./components/PdfUploadCard";
import QuestionInput from "./components/QuestionInput";
import { AnswerDisplay } from "./components/AnswerDisplay";
import Footer from "./components/Footer";

export type UploadStatus = "idle" | "uploading" | "processing" | "ready" | "error";

type Conversation = {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  audioFile?: string;
};

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:8000";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), save_audio: false }),
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
      <Navbar />

      {/* Ambient background glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-600/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[140px]" />
      </div>

      <main className="flex-1 pt-24 pb-8">
        {/* Hero Section */}
        <section className="text-center px-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-violet-500/10 border border-violet-500/20">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-300">AI-Powered Study Companion</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-tight">
            An AI tutor made
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              for Students
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Turns your learning materials into notes, interactive chats, quizzes, and more.
          </p>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="max-w-2xl mx-auto px-4 mb-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-300 font-medium text-sm">Error</h3>
                <p className="text-red-200/80 text-sm mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <section className="px-4 mb-12">
          <PdfUploadCard
            uploadStatus={uploadStatus}
            fileName={fileName}
            onFileUpload={handleFileUpload}
          />
        </section>

        {/* Chat Section */}
        {uploadStatus !== "idle" && (
          <section className="max-w-3xl mx-auto px-4 space-y-6">
            {conversations.length > 0 && (
              <AnswerDisplay
                conversations={conversations}
                apiBaseUrl={API_BASE_URL}
                onAudioGenerated={(conversationId, audioFile) => {
                  setConversations((prev) =>
                    prev.map((conv) =>
                      conv.id === conversationId
                        ? { ...conv, audioFile }
                        : conv
                    )
                  );
                }}
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

      <Footer />
    </div>
  );
}