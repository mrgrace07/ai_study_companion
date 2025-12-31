import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { UploadStatus } from "../App";

interface PdfUploadCardProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadStatus: UploadStatus;
  fileName?: string;
}

export default function PdfUploadCard({ onFileUpload, uploadStatus, fileName }: PdfUploadCardProps) {
  return (
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
                    onChange={onFileUpload}
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
  );
}
