import { ReactNode } from "react";
import BrandMark from "./BrandMark";
import ConstellationBackground from "./ConstellationBackground";
import { SparkleIcon } from "./icons";

interface AuthLayoutProps {
  eyebrow: string;
  headline: string;
  points: string[];
  children: ReactNode;
}

export default function AuthLayout({ eyebrow, headline, points, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-paper">
      {/* Left: brand / narrative panel */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-ink px-12 py-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.35),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(245,165,36,0.18),transparent_40%)]" />
        <ConstellationBackground />

        <div className="relative z-10">
          <BrandMark variant="light" />
        </div>

        <div className="relative z-10 max-w-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-signal">
            <SparkleIcon className="h-3.5 w-3.5" />
            {eyebrow}
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight">
            {headline}
          </h1>
          <ul className="mt-7 space-y-3.5">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-signal" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} CareerPilot.AI — Career Intelligence Platform
        </p>
      </aside>

      {/* Right: form panel */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="mb-8 lg:hidden">
          <BrandMark variant="dark" />
        </div>
        <div className="w-full max-w-[400px] animate-fade-up">{children}</div>
      </main>
    </div>
  );
}
