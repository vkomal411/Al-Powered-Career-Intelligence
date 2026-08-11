import React, { useState } from "react";

interface BlurredPhoneProps {
  phone: string | null | undefined;
  className?: string;
}

export const BlurredPhone: React.FC<BlurredPhoneProps> = ({ phone, className = "" }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!phone) {
    return <span className="text-slate-400 font-mono text-sm">not found</span>;
  }

  return (
    <span
      onClick={() => setIsRevealed(!isRevealed)}
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
      className={`inline-flex items-center cursor-pointer transition-all rounded-md px-1.5 py-0.5 border border-transparent hover:border-indigo-200 ${
        isRevealed ? "bg-indigo-50/70" : "bg-slate-100/80 hover:bg-indigo-50/50"
      } ${className}`}
      title={isRevealed ? "Click or leave mouse to blur phone number" : "Hover or click to view phone number"}
    >
      <span
        className={`font-mono text-sm transition-all duration-200 ${
          isRevealed
            ? "filter-none select-text text-slate-900 font-bold"
            : "filter blur-[2px] select-none text-slate-700 font-medium"
        }`}
      >
        {phone}
      </span>
    </span>
  );
};

export default BlurredPhone;
