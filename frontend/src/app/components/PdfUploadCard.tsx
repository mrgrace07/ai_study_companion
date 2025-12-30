import { useState, useRef } from "react";
import { Upload, FileText, CircleCheck, Loader } from "lucide-react";
import { Button } from "./ui/button";

type UploadStatus = "idle" | "uploading" | "processing" | "ready";

interface PdfUploadCardProps {
  onFileUpload: (file: File) => void;
  status: UploadStatus;
  fileName?: string;
}

export function PdfUploadCard({ onFileUpload, status, fileName }: PdfUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "uploading":
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Processing PDF...</span>
          </div>
        );
      case "ready":
        return (
          <div className="flex items-center gap-2 text-green-500">
            <CircleCheck className="w-4 h-4" />
            <span>Ready to answer questions</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div
          className={`
            relative rounded-xl border-2 border-dashed transition-all duration-200
            ${isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-border bg-card/50 hover:border-muted-foreground/50"
            }
            ${status !== "idle" ? "pointer-events-none opacity-75" : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className={`
                p-4 rounded-full transition-colors
                ${isDragging ? "bg-primary/10" : "bg-muted/50"}
              `}>
                <Upload className={`
                  w-10 h-10 transition-colors
                  ${isDragging ? "text-primary" : "text-muted-foreground"}
                `} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-foreground">
                  {status === "idle" ? "Upload your PDF" : "PDF Uploaded"}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Drag and drop your PDF file here, or click the button below
                </p>
              </div>

              {status === "idle" && (
                <Button 
                  onClick={handleUploadClick}
                  className="mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select PDF
                </Button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {fileName && (
          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-foreground">{fileName}</p>
                </div>
              </div>
              {getStatusDisplay()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
