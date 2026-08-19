import React from "react";
import { NextPageContext } from "next";
import Head from "next/head";
import Link from "next/link";
import BrandMark from "../components/BrandMark";

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

export default function ErrorPage({ statusCode, message }: ErrorProps) {
  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} — Error` : "Error"} — CareerPilot.AI</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f8fb] dark:bg-[#090d16] px-6 py-16 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="mb-6">
            <Link href="/overview" aria-label="CareerPilot.AI Home">
              <BrandMark variant="dark" />
            </Link>
          </div>

          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl mb-4 border border-indigo-500/20">
            {statusCode || "500"}
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight">
            {statusCode === 404
              ? "Page Not Found"
              : statusCode
              ? `Server Error (${statusCode})`
              : "An unexpected error occurred"}
          </h1>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {message ||
              "Something unexpected happened. We've logged this event and are working to resolve it."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/overview"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Go to Overview
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, message: err?.message };
};
