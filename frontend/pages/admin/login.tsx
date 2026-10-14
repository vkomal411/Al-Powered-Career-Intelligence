import React, { useState } from "react";
import Head from "next/head";
import { getApiBase, getFallbackHost } from "../../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seamless SSO Check on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const siteToken = localStorage.getItem("token");
      if (siteToken) {
        const apiBase = getApiBase();
        fetch(`${apiBase}/admin/auth/me`, {
          headers: { Authorization: `Bearer ${siteToken}` },
        })
          .then((res) => (res.ok ? res.json() : Promise.reject()))
          .then((user) => {
            localStorage.setItem("admin_token", siteToken);
            localStorage.setItem("admin_user", JSON.stringify(user));
            window.location.href = "/admin";
          })
          .catch(() => {});
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiBase = getApiBase();
      let res: Response;
      try {
        res = await fetch(`${apiBase}/admin/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      } catch {
        const altHost = getFallbackHost(apiBase);
        if (altHost) {
          res = await fetch(`${altHost}/admin/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
        } else {
          throw new Error(`Unable to connect to API server (${apiBase}). Please check if the backend server is running.`);
        }
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("admin_token", data.access_token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Portal Login | CareerPilot AI</title>
      </Head>

      <div className="min-h-screen bg-slate-950 dark:bg-[#090d16] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-150">
        {/* Glowing Ambient Background Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 dark:bg-indigo-600/30 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/15 dark:bg-purple-600/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-900/80 dark:bg-[#111726] backdrop-blur-2xl border border-slate-800/90 dark:border-white/[0.08] rounded-2xl p-8 shadow-2xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] relative z-10">
          {/* Brand & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/30 mb-4">
              CP
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-indigo-300 dark:from-white dark:via-slate-200 dark:to-indigo-300 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-slate-400 dark:text-slate-400 text-xs mt-1">AI Career Intelligence Platform Management</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@careerpilot.ai"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 dark:bg-slate-800/80 border border-slate-800 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 dark:text-white text-sm placeholder-slate-600 dark:placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 dark:bg-slate-800/80 border border-slate-800 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 dark:text-white text-sm placeholder-slate-600 dark:placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 dark:shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Admin Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-800/80 dark:border-white/[0.08] pt-4">
            <span>Protected Route • Rate Limited (5 req/min)</span>
          </div>
        </div>
      </div>
    </>
  );
}
