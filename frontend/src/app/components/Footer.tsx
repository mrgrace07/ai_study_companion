import { FileText } from "lucide-react";

const footerLinks = {
    Product: ["Features", "Pricing", "Updates"],
    Community: ["Discord", "Twitter", "Blog"],
    Legal: ["Privacy", "Terms"],
};

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#0a0a1a]/60 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base font-semibold text-white">AskMyPDF</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Your AI-powered study companion. Upload PDFs and get instant answers.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-slate-300 mb-4">{category}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-sm text-slate-500 hover:text-white transition-colors"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">
                        © {new Date().getFullYear()} AskMyPDF. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-600">
                        AI Study Companion can make mistakes. Verify important info.
                    </p>
                </div>
            </div>
        </footer>
    );
}
