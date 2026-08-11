import React from "react";
import { DownloadIcon } from "../icons";

interface ExportCenterProps {
  onExportPDF: () => void;
  onExportDocx: () => void;
  onExportTxt: () => void;
  onExportJson: () => void;
}

const ExportCenterInner: React.FC<ExportCenterProps> = ({
  onExportPDF,
  onExportDocx,
  onExportTxt,
  onExportJson
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-fade-in">
      <div className="border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Multi-Format Export Center</h4>
        <p className="text-[11px] text-slate-500">Download ATS-optimized files in high-resolution PDF, Word, TXT, or JSON</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onExportPDF}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all"
        >
          <DownloadIcon className="w-4 h-4 text-white" />
          <span>📄 PDF (ATS Validated)</span>
        </button>

        <button
          onClick={onExportDocx}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all"
        >
          <DownloadIcon className="w-4 h-4 text-white" />
          <span>📝 Word (.docx)</span>
        </button>

        <button
          onClick={onExportTxt}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all"
        >
          <DownloadIcon className="w-4 h-4 text-white" />
          <span>📋 Plain Text (.txt)</span>
        </button>

        <button
          onClick={onExportJson}
          className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all"
        >
          <DownloadIcon className="w-4 h-4 text-white" />
          <span>⚡ JSON Resume</span>
        </button>
      </div>
    </div>
  );
};

export const ExportCenter = React.memo(ExportCenterInner);
