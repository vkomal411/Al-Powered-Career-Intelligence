import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { loginUser, registerUser, persistAccessToken, AuthResponse } from "../lib/api";
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

  function saveSessionAndRedirect() {
    setSuccess("Login successful! Redirecting to Overview...");
    const redirectTarget = (router.query.redirect as string) || "/overview";

    setTimeout(() => {
      router.push(redirectTarget);
    }, 400);
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
        // Account not provisioned yet (or its password was changed): try to create it.
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

      // Try automatic registration if account doesn't exist
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
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card sm:p-9">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Welcome back
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
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
                  className="text-slate-400 hover:text-primary transition-colors"
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

            {error && (
              <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 space-y-1">
                <p>{error}</p>
                <p className="text-[11px] text-red-600 font-normal">
                  Tip: If you haven&apos;t registered this email yet, click <Link href="/register" className="font-bold underline">Register</Link> or use <button type="button" onClick={handleDemoLogin} className="font-bold underline">Quick Demo Login</button>.
                </p>
              </div>
            )}

            {success && (
              <div role="alert" aria-live="polite" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring mt-1 flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary-dark"
            >
              Register
            </Link>
          </p>
        </div>
      </AuthLayout>
    </>
  );
}