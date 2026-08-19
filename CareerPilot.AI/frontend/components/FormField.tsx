import { InputHTMLAttributes, ReactNode, useId } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
  trailing?: ReactNode;
  label?: string;
  error?: string;
}

export default function FormField({ icon, trailing, label, error, className, id: propId, ...inputProps }: FormFieldProps) {
  const autoId = useId();
  const inputId = propId || autoId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
          {label}
        </label>
      )}
      <div className={`focus-ring flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-colors focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 dark:focus-within:border-indigo-500 dark:focus-within:bg-slate-800 dark:focus-within:ring-indigo-500/20 ${
        error ? "border-red-300 bg-red-50/30 dark:border-red-800 dark:bg-red-950/30" : "border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/50"
      }`}>
        <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">{icon}</span>
        <input
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorId}
          {...inputProps}
          className={`w-full border-none bg-transparent text-[15px] text-ink placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500 ${className || ""}`}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
