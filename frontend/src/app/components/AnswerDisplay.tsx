import { useState, useRef, useEffect } from "react";
import { User, Bot, Volume2, VolumeX, Loader2, Copy, Check } from "lucide-react";

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

  // Auto-scroll to bottom when new messages arrive
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
    // If this audio is currently playing, stop it
    if (playingAudioId === conv.id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingAudioId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingAudioId(null);
    }

    let audioFileName = conv.audioFile;

    // If no audio file exists, generate one
    if (!audioFileName) {
      setLoadingAudioId(conv.id);
      try {
        const response = await fetch(`${apiBaseUrl}/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: conv.question,
            save_audio: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate audio");
        }

        const data = await response.json();
        audioFileName = data.audio_file;

        // Notify parent to cache the audio file
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

    // Play the audio
    if (audioFileName) {
      const audio = new Audio(`${apiBaseUrl}/audio/${audioFileName}`);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingAudioId(null);
      };

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
      className="flex flex-col space-y-0 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
    >
      {conversations.map((conv) => (
        <div key={conv.id} className="animate-fadeIn">
          {/* User Message */}
          <div className="py-5 px-4 hover:bg-slate-800/30 transition-colors">
            <div className="max-w-3xl mx-auto flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-medium text-slate-300 mb-1">You</p>
                <p className="text-white leading-relaxed">{conv.question}</p>
              </div>
            </div>
          </div>

          {/* AI Response */}
          <div className="py-5 px-4 bg-slate-800/40 hover:bg-slate-800/50 transition-colors">
            <div className="max-w-3xl mx-auto flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-300">AI Assistant</p>
                  <span className="text-xs text-slate-500">
                    {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {conv.answer}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-700/50">
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyAnswer(conv)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-md transition-all"
                    title="Copy response"
                  >
                    {copiedId === conv.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Audio Button */}
                  <button
                    onClick={() => handleSpeakerClick(conv)}
                    disabled={loadingAudioId === conv.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={playingAudioId === conv.id ? "Stop audio" : "Read aloud"}
                  >
                    {loadingAudioId === conv.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : playingAudioId === conv.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-purple-400">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Read aloud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
