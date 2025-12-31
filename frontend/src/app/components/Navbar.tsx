import { FileText } from "lucide-react";

export default function Navbar() {
  return (
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
  );
}
