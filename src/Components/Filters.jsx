import React from 'react';

const STATUSES = [
  { label: 'All Issues', value: 'All' },
  { label: 'Pending', value: 'pending', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { label: 'In Progress', value: 'in_progress', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { label: 'Resolved', value: 'resolved', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
];

export default function Filters({ statusFilter, setStatusFilter, sortBy, setSortBy, count }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 mb-6">
      
      {/* Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline">
          Status:
        </span>
        {STATUSES.map((status) => {
          const isSelected = statusFilter === status.value;
          return (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {status.label}
            </button>
          );
        })}
      </div>

      {/* Sorting & Result Count */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-white font-bold">{count}</strong> issues
        </span>

        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="upvotes" className="bg-slate-900 text-slate-200">Most Upvoted</option>
            <option value="latest" className="bg-slate-900 text-slate-200">Latest First</option>
          </select>
        </div>
      </div>

    </div>
  );
}
