import React from 'react';
import Filters from '../Components/Filters';
import IssueCard from '../Components/IssueCard';

export default function Feed({
  issues,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onToggleUpvote,
  onOpenReportModal
}) {
  return (
    <div className="flex-1 flex flex-col">
      
      {/* Hero Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden border border-blue-500/20 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
            📍 Real-time Community Reporting
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2">
            Spot an issue? <br className="hidden sm:inline" />
            Report & track civic fixes in your neighborhood.
          </h1>
          <p className="text-slate-300 text-sm mb-5 leading-relaxed">
            CivicSense connects citizens directly with municipal authorities. Upvote urgent issues to boost resolution priority.
          </p>
          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all"
          >
            <span>+ Report an Issue Now</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <Filters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        count={issues.length}
      />

      {/* Issues List */}
      {issues.length > 0 ? (
        <div className="flex flex-col gap-4">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onToggleUpvote={onToggleUpvote}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4 text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-1">No Issues Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            There are no civic issue reports matching your selected category or status filters.
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            Report the First Issue
          </button>
        </div>
      )}

    </div>
  );
}
