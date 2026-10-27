import React from 'react';
import { Filter, RotateCcw, Search, SlidersHorizontal, Sparkles } from 'lucide-react';

interface TenderFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  minBudget: number;
  onMinBudgetChange: (val: number) => void;
  minScore: number;
  onMinScoreChange: (val: number) => void;
  onReset: () => void;
}

const CATEGORIES = [
  'All',
  'IT',
  'Construction',
  'Healthcare',
  'Renewable Energy',
  'Manufacturing',
  'Education',
  'Defense'
];

export const TenderFilters: React.FC<TenderFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  minBudget,
  onMinBudgetChange,
  minScore,
  onMinScoreChange,
  onReset
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-5">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <SlidersHorizontal className="h-4 w-4 text-brand-400" />
          <span>Filters & Discovery Engine</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Domain Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Filter */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
          Keywords / Clauses
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search keywords, e.g. React, MRI, Solar..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Min Budget Range */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold uppercase tracking-wider text-slate-400">Min Budget Threshold</span>
          <span className="font-bold text-emerald-400">
            {minBudget === 0 ? 'Any Budget' : `≥ ₹${(minBudget / 10000000).toFixed(1)} Cr`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="500000000"
          step="10000000"
          value={minBudget}
          onChange={(e) => onMinBudgetChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>₹0</span>
          <span>₹25 Cr</span>
          <span>₹50 Cr+</span>
        </div>
      </div>

      {/* Minimum AI Match Score Slider */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand-400" />
            <span>Min AI Match Score</span>
          </span>
          <span className="font-bold text-brand-400">{minScore}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="90"
          step="5"
          value={minScore}
          onChange={(e) => onMinScoreChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>All Tenders</span>
          <span>50%</span>
          <span>80%+ (High Fit)</span>
        </div>
      </div>

    </div>
  );
};
