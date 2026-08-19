import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { loginUser, registerUser, persistAccessToken, AuthResponse, requestPasswordReset, completePasswordReset } from "../lib/api";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
} from "../components/icons";

function isConnectionError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("Unable to connect");
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotToken, setForgotToken] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotStep, setForgotStep] = useState<"request" | "reset" | "done">("request");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotErr, setForgotErr] = useState<string | null>(null);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotErr(null);
    setForgotMsg(null);
    try {
      const res = await requestPasswordReset(forgotEmail);
      setForgotMsg(res.message);
      if (res.reset_token) {
        setForgotToken(res.reset_token);
      }
      setForgotStep("reset");
    } catch (err: unknown) {
      setForgotErr(err instanceof Error ? err.message : "Failed to generate password reset request.");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleCompleteReset(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotToken || !forgotNewPass) return;
    setForgotLoading(true);
    setForgotErr(null);
    setForgotMsg(null);
    try {
      const res = await completePasswordReset(forgotToken, forgotNewPass);
      setForgotMsg(res.message);
      setForgotStep("done");
    } catch (err: unknown) {
      setForgotErr(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setForgotLoading(false);
    }
  }

  function saveSessionAndRedirect() {
    setSuccess("Login successful! Redirecting to Overview...");
    const redirectTarget = (router.query.redirect as string) || "/overview";

    setTimeout(() => {
      router.push(redirectTarget);
    }, 300);
  }

  async function handleDemoLogin() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const demoEmail = "demo@career.ai";
    const demoPass = "Demo123456!";

    try {
      let res: AuthResponse;
      try {
        res = await loginUser(demoEmail, demoPass);
      } catch (loginErr) {
        if (isConnectionError(loginErr)) {
          setError(
            "Couldn't reach the AI server. Please make sure the backend is running, then try again."
          );
          return;
        }
        res = await registerUser("Demo User", demoEmail, demoPass);
      }
      if (res.access_token) {
        persistAccessToken(res.access_token);
      }
      saveSessionAndRedirect();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Quick demo login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res.access_token) {
        persistAccessToken(res.access_token);
      }
      saveSessionAndRedirect();
    } catch (err: unknown) {
      let message = "Login failed. If you don't have an account yet, please register below or use Quick Demo Login.";

      if (isConnectionError(err)) {
        message = "Couldn't reach the AI server. Please make sure the backend is running, then try again.";
      } else if (err instanceof Error) {
        message = err.message;
      }

      if (message.toLowerCase().includes("record") || message.toLowerCase().includes("not found")) {
        try {
          const res = await registerUser(email.split("@")[0] || "User", email, password);
          if (res.access_token) {
            persistAccessToken(res.access_token);
          }
          saveSessionAndRedirect();
          return;
        } catch {
          // Keep original error message
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Log in — career.AI</title>
      </Head>

      <AuthLayout
        eyebrow="AI Career Intelligence"
        headline="Your career, decoded and guided by AI."
        points={[
          "Resume parsing that extracts skills, contact details, and experience in seconds.",
          "A single dashboard to track every application and insight.",
          "Built to plug into job matching and scoring as you grow.",
        ]}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card sm:p-9 dark:bg-slate-900 dark:border-slate-800 dark:shadow-lg dark:shadow-indigo-500/5 transition-colors duration-150">
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-white">
            Welcome back
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to continue your AI career journey.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-3.5"
          >
            <FormField
              icon={<MailIcon className="h-[18px] w-[18px]" />}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div>
              <FormField
                icon={<LockIcon className="h-[18px] w-[18px]" />}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-[18px] w-[18px]" />
                    ) : (
                      <EyeIcon className="h-[18px] w-[18px]" />
                    )}
                  </button>
                }
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-primary hover:text-primary-dark font-medium transition-colors dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 space-y-1 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                <p>{error}</p>
                <p className="text-[11px] text-red-600 font-normal dark:text-red-400">
                  Tip: If you haven&apos;t registered this email yet, click <Link href="/register" className="font-bold underline dark:text-red-200 dark:hover:text-white">Register</Link> or use <button type="button" onClick={handleDemoLogin} className="font-bold underline dark:text-red-200 dark:hover:text-white">Quick Demo Login</button>.
                </p>
              </div>
            )}

            {success && (
              <div role="alert" aria-live="polite" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring mt-1 flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-indigo-500/20 dark:hover:shadow-indigo-500/30"
            >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary-dark dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Register
            </Link>
          </p>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 dark:bg-slate-900 dark:border-slate-800 dark:shadow-indigo-500/10">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-primary flex items-center justify-center mx-auto text-lg dark:bg-indigo-950/50 dark:text-indigo-400">
                🔒
              </div>
              <h3 className="text-base font-bold text-slate-900 text-center dark:text-white">Reset Password</h3>

              {forgotErr && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  {forgotErr}
                </div>
              )}
              {forgotMsg && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
                  {forgotMsg}
                </div>
              )}

              {forgotStep === "request" && (
                <form onSubmit={handleRequestReset} className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed text-center dark:text-slate-400">
                    Enter your account email to receive a secure password reset token.
                  </p>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 dark:shadow-lg dark:shadow-indigo-500/20"
                  >
                    {forgotLoading ? "Generating token..." : "Send Reset Token"}
                  </button>
                </form>
              )}

              {forgotStep === "reset" && (
                <form onSubmit={handleCompleteReset} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1 dark:text-slate-300">Reset Token</label>
                    <input
                      type="text"
                      required
                      placeholder="Paste reset token"
                      value={forgotToken}
                      onChange={(e) => setForgotToken(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1 dark:text-slate-300">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 8 chars (uppercase, digit, symbol)"
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 dark:shadow-lg dark:shadow-indigo-500/20"
                  >
                    {forgotLoading ? "Updating..." : "Confirm New Password"}
                  </button>
                </form>
              )}

              {forgotStep === "done" && (
                <div className="space-y-3 text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    You can now sign in using your updated password.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotStep("request");
                      setForgotMsg(null);
                      setForgotErr(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors dark:shadow-lg dark:shadow-indigo-500/20"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {forgotStep !== "done" && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStep("request");
                    setForgotMsg(null);
                    setForgotErr(null);
                  }}
                  className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </AuthLayout>
    </>
  );
}