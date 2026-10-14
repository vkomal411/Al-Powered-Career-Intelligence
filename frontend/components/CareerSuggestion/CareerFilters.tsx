import React from "react";

interface CareerFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (diff: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function CareerFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedDifficulty,
  onSelectDifficulty,
  searchQuery,
  onSearchChange,
}: CareerFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xs text-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <input
          type="text"
          placeholder="Filter by role or skill..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50/60 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        />
        <svg
          className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Category and Difficulty Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => onSelectCategory(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Transition Effort Selector */}
        <select
          value={selectedDifficulty}
          onChange={(e) => onSelectDifficulty(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
        >
          <option value="All">All Transition Levels</option>
          <option value="Low">Low Effort (0-2 Gaps)</option>
          <option value="Moderate">Moderate Effort</option>
          <option value="High">Higher Effort (5+ Gaps)</option>
        </select>
      </div>
    </div>
  );
}
