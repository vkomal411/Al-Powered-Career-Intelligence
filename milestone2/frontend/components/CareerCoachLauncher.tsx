import React, { useState } from "react";
import AICareerAdviceCard from "./AICareerAdviceCard";
import { ParsedResume } from "./ResumeReportCard";

interface CareerCoachLauncherProps {
  targetRole?: string;
  parsedResume?: ParsedResume | null;
  onOpenJobMatcher?: () => void;
  onAdviceRegenerated?: (updated: ParsedResume) => void;
}

export const CareerCoachLauncher: React.FC<CareerCoachLauncherProps> = ({
  targetRole,
  parsedResume,
  onOpenJobMatcher,
  onAdviceRegenerated,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button in Bottom-Right Corner */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Career Coach"
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-200 hover:scale-105 active:scale-95 border border-indigo-500/40"
        title="Ask Career Coach"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="text-xs tracking-wide">Career Coach</span>
      </button>

      {/* Slide-out Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Side Drawer Panel */}
          <div className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto p-6 animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Career Coach</h3>
                <p className="text-xs text-slate-500">Ask quick questions or get advice anytime.</p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1">
              <AICareerAdviceCard
                targetRole={targetRole}
                parsedResume={parsedResume}
                onOpenJobMatcher={() => onOpenJobMatcher?.()}
                onAdviceRegenerated={onAdviceRegenerated}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CareerCoachLauncher;
