import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { apiFetch, UserResponse } from "../lib/api";
import BrandMark from "../components/BrandMark";
import { CheckCircleIcon, SparkleIcon, FileIcon } from "../components/icons";

// Interactive Widget Data
interface DemoState {
  score: number;
  contact: { email: boolean; phone: boolean; linkedin: boolean; github: boolean };
  sections: { summary: boolean; skills: boolean; experience: boolean; projects: boolean };
  skills: string[];
}

const initialDemoState: DemoState = {
  score: 35,
  contact: { email: false, phone: false, linkedin: false, github: false },
  sections: { summary: false, skills: false, experience: false, projects: false },
  skills: [],
};

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Demo Widget State
  const [demoState, setDemoState] = useState<DemoState>(initialDemoState);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    apiFetch<UserResponse>("/auth/me")
      .then(() => {
        setIsLoggedIn(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  const triggerDemoStep = (step: number) => {
    if (isScanning || activeStep === step) return;
    setIsScanning(true);
    setActiveStep(step);

    setTimeout(() => {
      setIsScanning(false);
      setDemoState((prev) => {
        const next = { ...prev };
        if (step === 1) {
          next.contact = { email: true, phone: true, linkedin: true, github: false };
          next.score = prev.score + 25;
        } else if (step === 2) {
          next.skills = ["Python", "TypeScript", "Docker", "PostgreSQL", "AWS"];
          next.sections = { ...prev.sections, skills: true };
          next.score = prev.score + 20;
        } else if (step === 3) {
          next.sections = { ...prev.sections, summary: true, experience: true, projects: true };
          next.score = prev.score + 15;
        }
        return next;
      });
    }, 900);
  };

  const resetDemo = () => {
    setDemoState(initialDemoState);
    setActiveStep(null);
  };

  return (
    <>
      <Head>
        <title>CareerPilot.AI — AI-Powered Resume Parsing & ATS Intelligence</title>
        <meta name="description" content="Optimize your resume for applicant tracking systems. Parse skills, identify layout issues, and score your resume instantly." />
      </Head>

      <div className="min-h-screen bg-paper dark:bg-[#090d16] text-slate-700 dark:text-slate-300 selection:bg-primary/10 selection:text-primary-dark scroll-smooth transition-colors duration-150">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-white/[0.08] bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md transition-colors duration-150">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/">
              <BrandMark variant="dark" />
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-semibold text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer">Features</a>
              <a href="#demo" onClick={(e) => { e.preventDefault(); document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-semibold text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer">Interactive Demo</a>
              <a href="#workflow" onClick={(e) => { e.preventDefault(); document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-semibold text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer">How It Works</a>
            </nav>
            <div className="flex items-center gap-4">
              {checkingAuth ? (
                <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ) : isLoggedIn ? (
                <Link
                  href="/overview"
                  className="focus-ring inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5"
                >
                  Go to Overview
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-ink dark:text-slate-300 dark:hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="focus-ring inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Get Started Free
                  </Link>
                </>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light hover:bg-primary-light/50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 md:hidden transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 ease-in-out ${
                      mobileMenuOpen ? "translate-y-[6px] rotate-45" : ""
                    }`}
                    style={{ transformOrigin: "12px 6px" }}
                    d="M4 6h16"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 ease-in-out ${
                      mobileMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                    d="M4 12h16"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 ease-in-out ${
                      mobileMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
                    }`}
                    style={{ transformOrigin: "12px 18px" }}
                    d="M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
              mobileMenuOpen ? "max-h-64 opacity-100 border-t border-slate-100 dark:border-white/[0.08]" : "max-h-0 opacity-0"
            }`}
          >
            <nav className="flex flex-col gap-3 px-6 py-4 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-md">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold font-display text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors py-1.5 border-b border-slate-50 dark:border-slate-800"
              >
                Features
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold font-display text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors py-1.5 border-b border-slate-50 dark:border-slate-800"
              >
                Interactive Demo
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold font-display text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors py-1.5"
              >
                How It Works
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Constellation background effect */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70 dark:opacity-40" />
          <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/10 to-indigo-400/5 dark:from-primary/20 dark:to-indigo-500/10 blur-3xl" />

          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/25 px-3.5 py-1.5 text-xs font-semibold text-primary-dark shadow-sm">
              <SparkleIcon className="h-3.5 w-3.5" />
              AI-Powered Resume Analysis
            </span>
            
            <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight text-ink dark:text-white sm:text-5xl md:text-6xl leading-[1.1]">
              Your Resume, Optimized for the <br />
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Future of Hiring.
              </span>
            </h1>
            
            <p className="mt-6 text-base text-slate-500 dark:text-slate-300 sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Don&apos;t get filtered out by Applicant Tracking Systems. Extract skills, audit your contact details, and instantly score your resume with our modern ATS engine.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={isLoggedIn ? "/overview" : "/register"}
                className="focus-ring w-full rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-primary/30 hover:-translate-y-0.5 sm:w-auto"
              >
                {isLoggedIn ? "Go to Overview" : "Upload Your Resume Now"}
              </Link>
              <a
                href="#demo"
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-800/80 px-8 py-4 text-sm font-semibold text-slate-600 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-ink dark:hover:text-white sm:w-auto text-center"
              >
                Try Live Interactive Demo
              </a>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="border-t border-slate-100 dark:border-white/[0.08] bg-white dark:bg-[#090d16] py-24 px-6 transition-colors duration-150">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-3xl">
                Engineered for Complete Transparency
              </h2>
              <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Applicant tracking systems shouldn&apos;t be a black box. Surfacing exactly what parameters make resumes match candidate parameters.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-100 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-8 shadow-sm transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-white/[0.15]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light dark:bg-indigo-500/15 text-primary dark:text-indigo-400">
                  <FileIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-ink dark:text-white">ATS Integrity Audit</h3>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Validates layout formatting, ensuring key categories (Education, Summary, Experience) are detectable and standard.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-100 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-8 shadow-sm transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-white/[0.15]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-verified dark:text-emerald-400">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-ink dark:text-white">Skills Taxonomy Mapping</h3>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Instantly extracts raw technologies, languages, and frameworks. Generates clear visual skill taxonomies.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-100 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-8 shadow-sm transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-white/[0.15]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/15 text-signal dark:text-amber-400">
                  <SparkleIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-ink dark:text-white">Prioritized Action Items</h3>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Provides prioritized warning suggestions (Critical, High, General) to guide quick layout updates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof & Testimonials Section */}
        <section className="border-t border-slate-100 dark:border-white/[0.08] bg-paper dark:bg-[#090d16]/50 py-20 px-6 transition-colors duration-150">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-verified dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/25">
                ★★★★★ Rated 4.9/5 by Job Seekers
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-3xl">
                Helping Job Seekers Land Interviews Faster
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Here is what professionals say about optimizing their resume with CareerPilot.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-6 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &quot;CareerPilot showed me that my PDF formatting was hiding my skills section from ATS scanners. Fixed it in 5 minutes and got 3 recruiter callbacks the next week!&quot;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 dark:bg-indigo-500/20 text-primary dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                    AR
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink dark:text-white">Alex Rivera</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Software Engineer</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-6 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &quot;I loved the encouraging health check score instead of a harsh rejection grade. The quick fixes section told me exactly what contact info I was missing.&quot;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                    SP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink dark:text-white">Sarah Patel</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Product Designer</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-6 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &quot;The 1-click profile sync saved me so much time. It extracted all my technical stack directly into my candidate profile with complete accuracy.&quot;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                    MK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink dark:text-white">Marcus Chen</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Data Analyst</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Demo Widget Section */}
        <section id="demo" className="border-t border-slate-100 dark:border-white/[0.08] py-24 px-6 bg-slate-50/50 dark:bg-[#090d16] transition-colors duration-150">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-3xl">
                Test CareerPilot Live
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Click on the raw resume blocks below to see how our parsing engine extracts data and updates the ATS Integrity Scan in real-time.
              </p>
            </div>

            {/* Interactive Widget Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Left Column: Input Blocks */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                  <h3 className="text-sm font-bold text-ink dark:text-white uppercase tracking-wider">Raw Resume Blocks</h3>
                  <button 
                    onClick={resetDemo}
                    className="text-xs font-semibold text-primary dark:text-indigo-400 hover:text-primary-dark dark:hover:text-indigo-300 transition-colors"
                  >
                    Reset Widget
                  </button>
                </div>

                {/* Step 1 */}
                <button 
                  onClick={() => triggerDemoStep(1)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activeStep === 1 
                      ? "border-primary bg-primary-light/40 dark:border-indigo-500 dark:bg-indigo-500/15" 
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/40 dark:border-white/[0.06] dark:hover:border-white/[0.12] dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Snippet 01</span>
                    {demoState.contact.email && <span className="text-[10px] font-bold text-verified dark:text-emerald-400 uppercase">Parsed</span>}
                  </div>
                  <h4 className="font-semibold text-ink dark:text-white text-sm mt-1">Contact & Core Credentials</h4>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100/50 dark:border-white/[0.06] overflow-x-auto whitespace-nowrap">
                    alex.jones@tech.io | +1 555-0199 | linkedin.com/in/alexj
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-2.5">Click to simulate contact details extraction.</p>
                </button>

                {/* Step 2 */}
                <button 
                  onClick={() => triggerDemoStep(2)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activeStep === 2 
                      ? "border-primary bg-primary-light/40 dark:border-indigo-500 dark:bg-indigo-500/15" 
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/40 dark:border-white/[0.06] dark:hover:border-white/[0.12] dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Snippet 02</span>
                    {demoState.sections.skills && <span className="text-[10px] font-bold text-verified dark:text-emerald-400 uppercase">Parsed</span>}
                  </div>
                  <h4 className="font-semibold text-ink dark:text-white text-sm mt-1">Technical Skills Taxonomy</h4>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100/50 dark:border-white/[0.06] overflow-x-auto whitespace-nowrap">
                    Stack: Python, TypeScript, Docker, PostgreSQL, AWS Cloud
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-2.5">Click to simulate skill taxonomy mapping.</p>
                </button>

                {/* Step 3 */}
                <button 
                  onClick={() => triggerDemoStep(3)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activeStep === 3 
                      ? "border-primary bg-primary-light/40 dark:border-indigo-500 dark:bg-indigo-500/15" 
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/40 dark:border-white/[0.06] dark:hover:border-white/[0.12] dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Snippet 03</span>
                    {demoState.sections.projects && <span className="text-[10px] font-bold text-verified dark:text-emerald-400 uppercase">Parsed</span>}
                  </div>
                  <h4 className="font-semibold text-ink dark:text-white text-sm mt-1">Experience & Projects Headers</h4>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100/50 dark:border-white/[0.06] overflow-x-auto whitespace-nowrap">
                    PROFESSIONAL SUMMARY ... WORK EXPERIENCE ... PROJECTS
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-2.5">Click to simulate key structural section audits.</p>
                </button>
              </div>

              {/* Right Column: Simulated Live Output */}
              <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111726] shadow-sm overflow-hidden relative">
                {isScanning && (
                  <div className="absolute inset-0 z-20 bg-white/70 dark:bg-[#111726]/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                      <p className="text-sm font-semibold text-ink dark:text-white mt-3">Scanning Snippet...</p>
                    </div>
                  </div>
                )}
                
                <div className="border-b border-slate-100 dark:border-white/[0.08] px-6 py-4 bg-slate-50/40 dark:bg-slate-800/30">
                  <h3 className="text-sm font-bold text-ink dark:text-white uppercase tracking-wider">Simulated Output Card</h3>
                </div>

                {/* Gauge Section */}
                <div className="flex items-center gap-6 p-6 border-b border-slate-100 dark:border-white/[0.08]">
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        className="stroke-primary transition-all duration-1000 ease-out" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray="263.89" 
                        strokeDashoffset={263.89 - (263.89 * demoState.score) / 100} 
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-ink dark:text-white leading-none">{demoState.score}%</span>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-400 uppercase mt-0.5 tracking-wider">Score</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-ink dark:text-white text-sm">Interactive Compatibility Score</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                      Score reflects formatting, section layouts, credentials, and skills found in snippets.
                    </p>
                  </div>
                </div>

                {/* Credentials Audit */}
                <div className="p-6 border-b border-slate-100 dark:border-white/[0.08]">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-3">Credentials</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100/50 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">Email</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${demoState.contact.email ? "bg-emerald-50 text-verified dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-50 text-danger dark:bg-red-500/20 dark:text-red-400"}`}>
                        {demoState.contact.email ? "Found" : "Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100/50 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">Phone</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${demoState.contact.phone ? "bg-emerald-50 text-verified dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-50 text-danger dark:bg-red-500/20 dark:text-red-400"}`}>
                        {demoState.contact.phone ? "Found" : "Missing"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills Taxonomy Output */}
                <div className="p-6 flex-grow">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-3">Extracted Skills</h4>
                  {demoState.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {demoState.skills.map((s) => (
                        <span key={s} className="bg-primary-light dark:bg-indigo-500/15 border border-primary/10 dark:border-indigo-500/25 text-primary-dark dark:text-indigo-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-400 italic">No skills extracted yet. Click Snippet 02.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="workflow" className="border-t border-slate-100 dark:border-white/[0.08] py-24 px-6 bg-white dark:bg-[#090d16] transition-colors duration-150">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-3xl">
              Getting Optimized in 3 Steps
            </h2>
            
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="relative">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold shadow-md shadow-primary/25">1</div>
                <h3 className="mt-6 font-semibold text-ink dark:text-white text-base">Upload Document</h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                  Drag and drop your PDF or DOCX resume into your secure user dashboard.
                </p>
              </div>

              <div className="relative">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold shadow-md shadow-primary/25">2</div>
                <h3 className="mt-6 font-semibold text-ink dark:text-white text-base">Analyze Integrity</h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                  The parser extracts contact details, maps skill taxonomies, and cross-references sections.
                </p>
              </div>

              <div className="relative">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold shadow-md shadow-primary/25">3</div>
                <h3 className="mt-6 font-semibold text-ink dark:text-white text-base">Implement Fixes</h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                  Use prioritized recommendations to optimize layout formatting and credential tags.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-150 dark:border-white/[0.08] bg-slate-50 dark:bg-[#090d16] py-12 px-6 transition-colors duration-150">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
            <BrandMark variant="dark" subtitle="Resume Intelligence platform" />
            <div className="text-xs text-slate-400 dark:text-slate-400">
              © {new Date().getFullYear()} CareerPilot.AI. All rights reserved. Powered by Milestone 1 ATS Parser.
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}