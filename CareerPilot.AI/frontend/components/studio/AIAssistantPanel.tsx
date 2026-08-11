import React, { useState } from "react";
import { SparkleIcon } from "../icons";

interface AIAssistantPanelProps {
  targetRole: string;
  onApplySummary: (newSummary: string) => void;
  onApplyBullet: (newBullet: string) => void;
}

const AIAssistantPanelInner: React.FC<AIAssistantPanelProps> = ({
  targetRole,
  onApplySummary,
  onApplyBullet
}) => {
  const [selectedTone, setSelectedTone] = useState<"Professional" | "Executive" | "Technical" | "Concise">("Professional");
  const [inputText, setInputText] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    setLoading(true);
    setTimeout(() => {
      let result = "";
      if (selectedTone === "Executive") {
        result = `Strategic and results-driven ${targetRole || 'Professional'} with proven record leading cross-functional teams and optimizing business SLAs by 35%.`;
      } else if (selectedTone === "Technical") {
        result = `Deeply technical ${targetRole || 'Engineer'} specializing in low-latency architecture, microservices, and high-throughput systems.`;
      } else if (selectedTone === "Concise") {
        result = `Performance-focused ${targetRole || 'Professional'} with expertise in modern tools and workflow automation.`;
      } else {
        result = `Spearheaded end-to-end user experience redesign for flagship products; increased product retention by 35% using Figma design systems.`;
      }
      setGeneratedOutput(result);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-4 shadow-md border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <SparkleIcon className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Studio AI Assistant</h4>
        </div>
        <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
          Tone Switching Enabled
        </span>
      </div>

      {/* Tone Switcher Pills */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-300">Select Tone:</label>
        <div className="flex flex-wrap gap-1.5">
          {(["Professional", "Executive", "Technical", "Concise"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTone(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                selectedTone === t
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-2xs font-bold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-300">Input Text or Bullet Point to Enhance:</label>
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Enter bullet point or leave blank to auto-generate for ${targetRole}...`}
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <button
        onClick={handleRewrite}
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>AI Polishing...</span>
          </>
        ) : (
          <>
            <SparkleIcon className="w-3.5 h-3.5 text-white" />
            <span>✨ AI Polish Bullet & Summary</span>
          </>
        )}
      </button>

      {generatedOutput && (
        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2 animate-fade-in">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Generated Result ({selectedTone}):</span>
          <p className="text-xs text-slate-200 leading-relaxed">{generatedOutput}</p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onApplySummary(generatedOutput)}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
            >
              Apply as Summary
            </button>
            <button
              onClick={() => onApplyBullet(generatedOutput)}
              className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold"
            >
              Apply as Bullet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const AIAssistantPanel = React.memo(AIAssistantPanelInner);
