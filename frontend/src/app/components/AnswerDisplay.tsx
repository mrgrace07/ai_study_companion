import { useState, useRef, useEffect } from "react";
import { User, Bot, Volume2, VolumeX, Loader2, Copy, Check, Quote } from "lucide-react";

export interface Conversation {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  audioFile?: string;
}

interface AnswerDisplayProps {
  conversations: Conversation[];
  apiBaseUrl: string;
  onAudioGenerated?: (conversationId: string, audioFile: string) => void;
}

export function AnswerDisplay({ conversations, apiBaseUrl, onAudioGenerated }: AnswerDisplayProps) {
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversations]);

  const handleCopyAnswer = async (conv: Conversation) => {
    try {
      await navigator.clipboard.writeText(conv.answer);
      setCopiedId(conv.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleSpeakerClick = async (conv: Conversation) => {
    if (playingAudioId === conv.id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingAudioId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingAudioId(null);
    }

    let audioFileName = conv.audioFile;

    if (!audioFileName) {
      setLoadingAudioId(conv.id);
      try {
        const response = await fetch(`${apiBaseUrl}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: conv.question, save_audio: true }),
        });

        if (!response.ok) throw new Error("Failed to generate audio");

        const data = await response.json();
        audioFileName = data.audio_file;

        if (audioFileName && onAudioGenerated) {
          onAudioGenerated(conv.id, audioFileName);
        }
      } catch (error) {
        console.error("Error generating audio:", error);
        setLoadingAudioId(null);
        return;
      }
      setLoadingAudioId(null);
    }

    if (audioFileName) {
      const audio = new Audio(`${apiBaseUrl}/audio/${audioFileName}`);
      audioRef.current = audio;
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => {
        console.error("Error playing audio");
        setPlayingAudioId(null);
      };
      try {
        await audio.play();
        setPlayingAudioId(conv.id);
      } catch (error) {
        console.error("Error playing audio:", error);
        setPlayingAudioId(null);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1"
    >
      {/* AI Greeting — show once at the top */}
      {conversations.length > 0 && (
        <div className="flex gap-3 animate-fadeIn">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 bg-[#1a1a35]/80 border border-white/5 rounded-2xl rounded-tl-md p-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Hello! I've analyzed your document. How can I help you learn today?
              You can ask me to summarize, quiz you, or explain complex concepts.
            </p>
          </div>
        </div>
      )}

      {conversations.map((conv) => (
        <div key={conv.id} className="space-y-4 animate-fadeIn">
          {/* User Message */}
          <div className="flex gap-3 justify-end">
            <div className="max-w-[80%] bg-gradient-to-r from-violet-600/90 to-indigo-600/90 rounded-2xl rounded-tr-md px-4 py-3 shadow-lg shadow-violet-500/10">
              <p className="text-white text-sm leading-relaxed">{conv.question}</p>
            </div>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* AI Response */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              {/* Answer bubble */}
              <div className="bg-[#1a1a35]/80 border border-white/5 rounded-2xl rounded-tl-md p-4">
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {conv.answer}
                </div>
              </div>

              {/* Citation block */}
              <div className="bg-[#12122a]/60 border border-white/5 rounded-xl p-3 flex gap-3">
                <Quote className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-violet-300 mb-1">Citation</p>
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    Source referenced from your uploaded document.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopyAnswer(conv)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Copy response"
                >
                  {copiedId === conv.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSpeakerClick(conv)}
                  disabled={loadingAudioId === conv.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={playingAudioId === conv.id ? "Stop audio" : "Read aloud"}
                >
                  {loadingAudioId === conv.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : playingAudioId === conv.id ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-violet-400">Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Read aloud</span>
                    </>
                  )}
                </button>

                <span className="ml-auto text-[10px] text-slate-600">
                  {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
