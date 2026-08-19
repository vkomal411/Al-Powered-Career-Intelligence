import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { registerUser, persistAccessToken } from "../lib/api";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
} from "../components/icons";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  function saveSessionAndRedirect() {
    router.push("/dashboard");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service & Privacy Policy to register.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await registerUser(fullName, email, password);
      if (res.access_token) {
        persistAccessToken(res.access_token);
      }
      saveSessionAndRedirect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Create your account — CareerPilot.AI</title>
      </Head>

      <AuthLayout
        eyebrow="Get started free"
        headline="Build your career profile in minutes."
        points={[
          "Upload a resume once — we extract your skills and contact details automatically.",
          "Enterprise-grade encryption keeps your personal data safe.",
          "One account, ready for job matching and scoring as new tools ship.",
        ]}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card sm:p-9 dark:bg-[#111726] dark:border-white/[0.08] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-colors duration-150">
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-white">
            Create your account
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Start your AI-guided career journey today.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3.5">
            <FormField
              icon={<UserIcon className="h-[18px] w-[18px]" />}
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />

            <FormField
              icon={<MailIcon className="h-[18px] w-[18px]" />}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <FormField
              icon={<LockIcon className="h-[18px] w-[18px]" />}
              type={showPassword ? "text" : "password"}
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-[18px] w-[18px]" />
                  ) : (
                    <EyeIcon className="h-[18px] w-[18px]" />
                  )}
                </button>
              }
            />

            {password.length > 0 && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1.5 text-xs dark:border-white/[0.06] dark:bg-slate-800/50">
                <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400 dark:text-slate-500"}`}>
                    <span>{password.length >= 8 ? "✓" : "○"}</span> At least 8 chars
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400 dark:text-slate-500"}`}>
                    <span>{/[A-Z]/.test(password) ? "✓" : "○"}</span> Uppercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400 dark:text-slate-500"}`}>
                    <span>{/[a-z]/.test(password) ? "✓" : "○"}</span> Lowercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 ${/\d/.test(password) ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400 dark:text-slate-500"}`}>
                    <span>{/\d/.test(password) ? "✓" : "○"}</span> At least 1 number
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400 dark:text-slate-500"}`}>
                    <span>{/[^A-Za-z0-9]/.test(password) ? "✓" : "○"}</span> Special character
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-primary focus:ring-primary cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 leading-snug cursor-pointer select-none">
                I agree to the{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-indigo-400 underline">Terms of Service</span>
                {" "}and{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-indigo-400 underline">Privacy Policy</span>.
              </label>
            </div>

            {error && (
              <p role="alert" aria-live="polite" className="rounded-lg bg-danger-light dark:bg-red-950/40 dark:border dark:border-red-800 px-3 py-2 text-sm text-danger dark:text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="focus-ring mt-1 flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 dark:shadow-indigo-500/20 hover:bg-primary-dark dark:hover:shadow-indigo-500/30 active:scale-[0.99] transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-dark dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </AuthLayout>
    </>
  );
}