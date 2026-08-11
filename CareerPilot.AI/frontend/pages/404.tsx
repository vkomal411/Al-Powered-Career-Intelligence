import React from "react";
import Head from "next/head";
import Link from "next/link";
import BrandMark from "../components/BrandMark";
import ConstellationBackground from "../components/ConstellationBackground";

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page Not Found — career.AI</title>
      </Head>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-6 py-16">
        <ConstellationBackground />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8">
            <Link href="/overview" aria-label="CareerPilot.AI home">
              <BrandMark variant="dark" />
            </Link>
          </div>

          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-400 shadow-lg shadow-primary/30 mb-6">
            <span className="font-display text-2xl font-bold text-white">404</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            This page wandered off the career path
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
            The link you followed doesn&apos;t exist or may have been moved. Let&apos;s get you back to building
            your best resume.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/overview"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
            >
              Go to Overview
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>

          <p className="mt-10 text-xs text-slate-400">
            CareerPilot<span className="text-signal">.</span>AI — your AI career guide &amp; workspace
          </p>
        </div>
      </div>
    </>
  );
}
