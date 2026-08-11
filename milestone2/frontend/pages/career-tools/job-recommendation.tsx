import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Topbar from "../../components/Topbar";
import BrandMark from "../../components/BrandMark";
import GroupNavControl from "../../components/GroupNavControl";
import { JobMatchesCard } from "../../components/JobMatchesCard";
import { apiFetch, UserResponse, getResumeHistory, logoutUser } from "../../lib/api";

export default function JobRecommendationPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasUserResume, setHasUserResume] = useState(false);

  useEffect(() => {
    apiFetch<UserResponse>("/auth/me")
      .then(async (userData) => {
        setUser(userData);
        try {
          const resumes = await getResumeHistory();
          setHasUserResume(resumes.length > 0);
        } catch {
          setHasUserResume(false);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, []);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.push("/login");
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading Job Recommendations...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <div className="flex justify-center mb-6">
            <BrandMark variant="dark" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink">Sign In Required</h1>
          <p className="mt-2 text-xs text-slate-500">Please sign in to access Job Recommendations.</p>
          <button
            type="button"
            onClick={() => router.push("/login?redirect=/career-tools/job-recommendation")}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Job Recommendation — Career Tools</title>
      </Head>
      <div className="min-h-screen bg-paper">
        <Topbar fullName={user.full_name} onLogout={handleLogout} activeMenu="opportunities" />

        <main className="mx-auto max-w-7xl px-6 sm:px-8 py-8 space-y-6">
          <GroupNavControl group="career-tools" activeId="job-recommendation" />
          <div className="animate-fade-in">
            <JobMatchesCard
              hasResume={hasUserResume}
              onNavigateTab={() => {
                router.push("/resume-tools/ats-score-analysis");
              }}
              defaultFilterMode="all"
            />
          </div>
        </main>
      </div>
    </>
  );
}
