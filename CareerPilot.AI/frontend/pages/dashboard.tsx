import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiFetch, UserResponse } from "../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<UserResponse | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    const rawSection = router.query.section as string;
    const rawSubtab = router.query.subtab as string;

    if (rawSection === "resume") {
      if (rawSubtab === "boost") router.replace("/resume-tools/resume-boost");
      else router.replace("/resume-tools/ats-score-analysis");
    } else if (rawSection === "opportunities") {
      router.replace("/career-tools/job-recommendation");
    } else if (rawSection === "learning") {
      router.replace("/career-tools/learning-level-up");
    } else {
      router.replace("/overview");
    }
  }, [router.isReady, router.query, router]);

  useEffect(() => {
    apiFetch<UserResponse>("/auth/me")
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FB] dark:bg-[#090d16] flex items-center justify-center transition-colors duration-150">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Redirecting...</p>
      </div>
    </div>
  );
}
