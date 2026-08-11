import React, { useState } from "react";
import { SparkleIcon, InterviewIcon, DownloadIcon } from "./icons";

export type QuestionCategory = "Technical" | "System Architecture" | "Behavioral" | "Leadership";

export interface QuestionItem {
  id: string;
  category: QuestionCategory;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  suggestedAnswer: string;
  keyConcepts: string[];
}

export const InterviewQuestionGeneratorCard: React.FC = () => {
  const [targetRole, setTargetRole] = useState("Senior Software Engineer");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>("q1");
  const [generating, setGenerating] = useState<boolean>(false);

  const [questions, setQuestions] = useState<QuestionItem[]>([
    // --- TECHNICAL & CODING (1-4) ---
    {
      id: "q1",
      category: "Technical",
      question: "How do React hooks work internally, and what are the rules of hooks?",
      difficulty: "Medium",
      suggestedAnswer:
        "React hooks rely on an internal linked list of memoized state cells attached to Fiber nodes during rendering. Rules: 1) Call hooks only at top level (never inside loops/conditionals), 2) Call hooks only from React function components or custom hooks.",
      keyConcepts: ["React Fiber Nodes", "Linked List Memoization", "Re-render Ordering"],
    },
    {
      id: "q2",
      category: "Technical",
      question: "Explain the Python GIL (Global Interpreter Lock) and strategies to bypass it.",
      difficulty: "Hard",
      suggestedAnswer:
        "The GIL is a mutual exclusion lock preventing multiple native threads from executing Python bytecode simultaneously in CPython. To bypass: use multiprocessing for CPU-bound tasks, C extensions (NumPy/Cython), or AsyncIO/threading for I/O-bound tasks.",
      keyConcepts: ["CPython Memory Lock", "Multiprocessing vs Threading", "AsyncIO Event Loop"],
    },
    {
      id: "q3",
      category: "Technical",
      question: "What is the difference between SQL B-Tree indexes and Hash indexes?",
      difficulty: "Medium",
      suggestedAnswer:
        "B-Tree indexes store keys in a self-balancing search tree supporting range queries (<, >, BETWEEN) and equality. Hash indexes map keys to buckets for O(1) equality searches (=) but cannot optimize range comparisons.",
      keyConcepts: ["B-Tree Balanced Nodes", "O(1) Hash Bucket Lookup", "Query Execution Plans"],
    },
    {
      id: "q4",
      category: "Technical",
      question: "How does JavaScript Event Loop handle Macro-tasks vs Micro-tasks?",
      difficulty: "Hard",
      suggestedAnswer:
        "Micro-tasks (Promises, process.nextTick, queueMicrotask) take priority and run until the micro-task queue is completely empty before the event loop advances to process the next Macro-task (setTimeout, setInterval, I/O events).",
      keyConcepts: ["Microtask Queue Drain", "Macrotask Callback Queue", "Event Loop Phases"],
    },

    // --- SYSTEM ARCHITECTURE (5-8) ---
    {
      id: "q5",
      category: "System Architecture",
      question: "Design a distributed rate limiter servicing 100,000 requests per second.",
      difficulty: "Hard",
      suggestedAnswer:
        "Architect a distributed rate limiter using the Token Bucket or Sliding Window Algorithm with atomic Lua scripts on a Redis cluster. Use consistent hashing for key distribution and local sliding memory caches for micro-downtime resiliency.",
      keyConcepts: ["Token Bucket Algorithm", "Redis Atomic Lua Scripts", "Consistent Hashing"],
    },
    {
      id: "q6",
      category: "System Architecture",
      question: "How do you achieve zero-downtime database schema migrations in a high-traffic system?",
      difficulty: "Hard",
      suggestedAnswer:
        "Follow the Expand-Contract pattern: 1) Add new column/table without constraints, 2) Deploy dual-write application code, 3) Backfill historical data via asynchronous workers, 4) Switch read path, 5) Remove deprecated columns safely.",
      keyConcepts: ["Expand-Contract Migration", "Dual-Writing Pattern", "Asynchronous Backfill"],
    },
    {
      id: "q7",
      category: "System Architecture",
      question: "Explain the CAP Theorem and PACELC extension for distributed data stores.",
      difficulty: "Hard",
      suggestedAnswer:
        "CAP states a distributed system can guarantee at most 2 of Consistency, Availability, and Partition Tolerance. PACELC expands this: If Partitioned (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C).",
      keyConcepts: ["CAP Trade-offs", "PACELC Latency Bounds", "Eventual Consistency"],
    },
    {
      id: "q8",
      category: "System Architecture",
      question: "Design a Web-scale notification engine pushing real-time alerts to 10M users.",
      difficulty: "Hard",
      suggestedAnswer:
        "Use Apache Kafka event streams partitioned by User ID. Workers consume messages and push alerts via WebSocket connections backed by Socket.IO servers with FCM/APNS push notification fallbacks.",
      keyConcepts: ["Event Streaming (Kafka)", "WebSocket Clusters", "Push Notification Queues"],
    },

    // --- BEHAVIORAL & STAR METHOD (9-12) ---
    {
      id: "q9",
      category: "Behavioral",
      question: "Describe a situation where you had to push back against an unreasonable project deadline.",
      difficulty: "Medium",
      suggestedAnswer:
        "S (Situation): Sprint target deadline reduced by 2 weeks. T (Task): Deliver core API features safely. A (Action): Audited features using risk-matrix, presented data-driven trade-offs to stakeholders, and agreed on a phased MVP launch. R (Result): Delivered 100% on time with zero high-severity post-launch bugs.",
      keyConcepts: ["STAR Method Framework", "Data-Driven Trade-offs", "MVP Scope Negotiation"],
    },
    {
      id: "q10",
      category: "Behavioral",
      question: "Give an example of resolving a major production outage under high pressure.",
      difficulty: "Medium",
      suggestedAnswer:
        "S: Payment gateway latency spike during peak sale hours. T: Mitigate revenue loss quickly. A: Triggered feature flag rollback to stable payment fallback, set up Slack incident command, and communicated updates every 15 mins. R: Restored throughput in 8 minutes; led a blameless post-mortem.",
      keyConcepts: ["Incident Mitigation", "Feature Flag Rollbacks", "Blameless Post-Mortem"],
    },
    {
      id: "q11",
      category: "Behavioral",
      question: "Tell me about a technical disagreement you had with a senior teammate and how you resolved it.",
      difficulty: "Medium",
      suggestedAnswer:
        "S: Disagreed on REST vs GraphQL for a new microservice. T: Align on architecture without friction. A: Benchmarked payload latency and developer DX for both options; presented empirical benchmark data in an RFC document. R: Team agreed on GraphQL for complex frontend queries.",
      keyConcepts: ["Empirical Benchmarks", "RFC Documentation", "Technical Alignment"],
    },
    {
      id: "q12",
      category: "Behavioral",
      question: "Describe a project where you took initiative beyond your explicit job responsibilities.",
      difficulty: "Easy",
      suggestedAnswer:
        "S: Build CI/CD pipeline was taking 35 minutes per PR. T: Improve developer velocity. A: Identified redundant test steps, parallelized Docker container builds, and implemented GitHub Actions layer caching. R: Reduced build times from 35m to 6m.",
      keyConcepts: ["Developer Productivity", "CI/CD Parallelization", "Build Caching"],
    },

    // --- LEADERSHIP & GOVERNANCE (13-16) ---
    {
      id: "q13",
      category: "Leadership",
      question: "How do you handle technical debt while keeping feature delivery on schedule?",
      difficulty: "Medium",
      suggestedAnswer:
        "Allocate a consistent 20% sprint budget to tech debt refactoring. Rank debt items using a risk vs velocity impact matrix, and pair technical debt refactoring with incoming feature development work.",
      keyConcepts: ["Sprint Budget Allocation", "Risk Impact Matrix", "Refactoring Hygiene"],
    },
    {
      id: "q14",
      category: "Leadership",
      question: "How do you mentor junior engineers and foster a culture of technical excellence?",
      difficulty: "Easy",
      suggestedAnswer:
        "Establish constructive code review guidelines, pair programming cadences, quarterly career growth objectives, and weekly engineering tech talks. Empower engineers to own feature design docs end-to-end.",
      keyConcepts: ["Constructive Code Reviews", "Career Growth Objectives", "Engineering Tech Talks"],
    },
    {
      id: "q15",
      category: "Leadership",
      question: "How do you establish engineering standards and code consistency across distributed teams?",
      difficulty: "Hard",
      suggestedAnswer:
        "Author RFC blueprints for architecture patterns, enforce automated linters/formatters in pre-commit hooks, set up reusable component libraries, and hold monthly cross-team Architecture Guild syncs.",
      keyConcepts: ["Architecture Guilds", "Automated Linter Gates", "RFC Blueprint Process"],
    },
    {
      id: "q16",
      category: "Leadership",
      question: "How do you handle low performance or code quality issues on your engineering team?",
      difficulty: "Medium",
      suggestedAnswer:
        "Conduct 1-on-1s to identify root causes (unclear requirements, lack of context, personal hurdles). Provide specific, actionable feedback with code examples and set clear 30-day milestone checkpoints.",
      keyConcepts: ["Actionable 1-on-1 Feedback", "Milestone Tracking", "Empathetic Mentorship"],
    },
  ]);

  const categories = [
    { id: "All", label: "All Categories", icon: "📌" },
    { id: "Technical", label: "Technical & Coding", icon: "💻" },
    { id: "System Architecture", label: "System Architecture", icon: "🏗️" },
    { id: "Behavioral", label: "Behavioral & STAR", icon: "🤝" },
    { id: "Leadership", label: "Leadership & Management", icon: "👑" },
  ];

  const handleGenerateMore = () => {
    setGenerating(true);
    setTimeout(() => {
      const newQuestions: QuestionItem[] = [
        {
          id: `q_${Date.now()}_1`,
          category: "Technical",
          question: `How do memory management and garbage collection work for ${targetRole} applications?`,
          difficulty: "Hard",
          suggestedAnswer:
            "Modern garbage collectors (e.g. V8 generational GC or JVM ZGC/G1) split heap memory into Young and Old generations. Minor GC reclaims ephemeral objects, while Major GC handles long-lived references.",
          keyConcepts: ["Generational Heap", "Mark-and-Sweep", "Stop-the-World Pauses"],
        },
        {
          id: `q_${Date.now()}_2`,
          category: "System Architecture",
          question: `Design an enterprise real-time log ingestion pipeline for ${targetRole} monitoring systems.`,
          difficulty: "Hard",
          suggestedAnswer:
            "Deploy FluentBit sidecars to ship log streams to Apache Kafka. Logstash workers transform raw logs and index them into Elasticsearch/OpenSearch clusters backed by Grafana dashboards.",
          keyConcepts: ["Kafka Event Ingestion", "OpenSearch Indexing", "FluentBit Sidecars"],
        },
      ];
      setQuestions([...newQuestions, ...questions]);
      setExpandedId(newQuestions[0].id);
      setGenerating(false);
    }, 600);
  };

  // PDF Export / Print Helper with Job Name based document title
  const handleDownloadPDF = () => {
    const documentTitle = `${targetRole.trim()} Interview Q&A`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download the Q&A PDF.");
      return;
    }

    const filteredList =
      activeCategory === "All" ? questions : questions.filter((q) => q.category === activeCategory);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; }
            .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #1e1b4b; margin: 0; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 5px; }
            .badge-role { background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
            .meta { display: flex; gap: 10px; margin-bottom: 10px; }
            .tag { font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; }
            .tag-tech { background: #dbeafe; color: #1e40af; }
            .tag-arch { background: #f3e8ff; color: #6b21a8; }
            .tag-beh { background: #d1fae5; color: #065f46; }
            .tag-lead { background: #fef3c7; color: #92400e; }
            .question { font-size: 15px; font-weight: bold; color: #0f172a; margin-bottom: 12px; }
            .answer-box { background: #f8fafc; border-left: 4px solid #6366f1; padding: 12px 15px; font-size: 12px; line-height: 1.6; color: #334155; margin-bottom: 10px; }
            .concepts { font-size: 11px; font-weight: bold; color: #64748b; }
            .concept-chip { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; margin-right: 5px; }
            @media print {
              body { padding: 0; }
              .card { border: 1px solid #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Interview Questions & Answers Prep Guide</h1>
            <p class="subtitle">Target Role: <span class="badge-role">${targetRole}</span> • Category Filter: <strong>${activeCategory}</strong> • Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          ${filteredList
            .map(
              (q, idx) => `
            <div class="card">
              <div class="meta">
                <span class="tag ${
                  q.category === "Technical"
                    ? "tag-tech"
                    : q.category === "System Architecture"
                    ? "tag-arch"
                    : q.category === "Behavioral"
                    ? "tag-beh"
                    : "tag-lead"
                }">${q.category}</span>
                <span class="tag" style="background: #f1f5f9; color: #475569;">${q.difficulty}</span>
              </div>
              <div class="question">Q${idx + 1}. ${q.question}</div>
              <div class="answer-box">
                <strong>💡 Suggested AI Response Model:</strong><br/>
                ${q.suggestedAnswer}
              </div>
              <div class="concepts">
                Evaluation Criteria: ${q.keyConcepts.map((c) => `<span class="concept-chip">${c}</span>`).join(" ")}
              </div>
            </div>
          `
            )
            .join("")}

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getCategoryBadge = (cat: QuestionCategory) => {
    switch (cat) {
      case "Technical":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "System Architecture":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Behavioral":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Leadership":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredQuestions =
    activeCategory === "All" ? questions : questions.filter((q) => q.category === activeCategory);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <InterviewIcon className="w-3.5 h-3.5" />
              Categorized AI Interview Generator
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-2">Interview Question Generator</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate role-tailored behavioral and technical interview questions with detailed answers & PDF export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
            title="Download Q&A document as printable PDF"
          >
            <DownloadIcon className="w-4 h-4 text-indigo-600" />
            <span>Download Q&A as PDF</span>
          </button>

          <button
            onClick={handleGenerateMore}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating AI Questions...</span>
              </>
            ) : (
              <>
                <SparkleIcon className="h-4 w-4" />
                <span>✨ Generate AI Questions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Role & Category Tabs Bar */}
      <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">🎯 Target Role:</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all"
            />
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredQuestions.length} Questions Available
          </span>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/80">
          {categories.map((cat) => {
            const count = cat.id === "All" ? questions.length : questions.filter((q) => q.category === cat.id).length;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorized Question List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm font-bold text-slate-700">No questions found in this category</p>
            <p className="text-xs text-slate-500 mt-1">Select another category or click Generate AI Questions.</p>
          </div>
        ) : (
          filteredQuestions.map((q, index) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded ? "border-indigo-300 bg-indigo-50/20 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-none"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-400">Q{index + 1}.</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getCategoryBadge(q.category)}`}>
                        {q.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : q.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{q.question}</h3>
                  </div>

                  <span className="text-slate-400 font-bold text-base flex-shrink-0 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center">
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4 animate-fade-in">
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span>💡 Suggested AI Response Model</span>
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs font-medium">
                        {q.suggestedAnswer}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Key Evaluation Concepts
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {q.keyConcepts.map((concept) => (
                          <span key={concept} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold border border-indigo-100">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InterviewQuestionGeneratorCard;
