import { Upload, Loader2, CheckCircle2, AlertCircle, FileUp } from "lucide-react";
import type { UploadStatus } from "../App";

interface PdfUploadCardProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadStatus: UploadStatus;
  fileName?: string;
}

export default function PdfUploadCard({ onFileUpload, uploadStatus, fileName }: PdfUploadCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#12122a]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-violet-500/5">
        <label
          htmlFor="pdf-upload"
          className={`group block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${uploadStatus === "idle"
            ? "border-slate-700/60 hover:border-violet-500/60 hover:bg-violet-500/5"
            : uploadStatus === "error"
              ? "border-red-500/40 bg-red-500/5"
              : "border-emerald-500/40 bg-emerald-500/5"
            }`}
        >
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={onFileUpload}
            className="hidden"
            disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
          />

          <div className="flex flex-col items-center gap-4">
            {uploadStatus === "idle" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-indigo-500/30 transition-all duration-300">
                  <FileUp className="w-8 h-8 text-violet-400 group-hover:text-violet-300 transition-colors" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Drop your PDF here</p>
                  <p className="text-slate-500 text-sm mt-1.5">Or click to browse from your computer</p>
                </div>
              </>
            )}

            {uploadStatus === "uploading" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Uploading...</p>
                  <p className="text-slate-500 text-sm mt-1.5">{fileName}</p>
                </div>
              </>
            )}

            {uploadStatus === "processing" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Processing document...</p>
                  <p className="text-slate-500 text-sm mt-1.5">Creating embeddings for your PDF</p>
                </div>
              </>
            )}

            {uploadStatus === "ready" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Ready to answer questions!</p>
                  <p className="text-slate-500 text-sm mt-1.5">{fileName}</p>
                </div>
              </>
            )}

            {uploadStatus === "error" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Upload failed</p>
                  <p className="text-slate-500 text-sm mt-1.5">Click to try again</p>
                </div>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-2 mt-5">
        <p className="text-xs text-slate-500">Made with ❤️ by ACE AIML, SASTRA University</p>
      </div>
    </div>
  );
}
