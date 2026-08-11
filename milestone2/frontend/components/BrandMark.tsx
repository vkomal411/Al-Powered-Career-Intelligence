interface BrandMarkProps {
  variant?: "light" | "dark";
  subtitle?: string;
}

export default function BrandMark({ variant = "dark", subtitle }: BrandMarkProps) {
  const isLight = variant === "light";
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-400 shadow-lg shadow-primary/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
          <path
            d="M4 17V9.5L12 5l8 4.5V17l-8 4.5L4 17Z"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <path d="M4 9.5 12 14l8-4.5" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M12 14v7.5" stroke="currentColor" strokeWidth={1.6} />
        </svg>
      </div>
      <div>
        <p
          className={`font-display text-lg font-semibold leading-none tracking-tight ${
            isLight ? "text-white" : "text-ink"
          }`}
        >
          CareerPilot<span className="text-signal">.</span>AI
        </p>
        {subtitle && (
          <p className={`mt-1 text-xs ${isLight ? "text-white/60" : "text-slate-500"}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
