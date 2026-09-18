import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  pending: { label: 'Reported', color: 'badge-pending' },
  in_progress: { label: 'In Progress', color: 'badge-in_progress' },
  resolved: { label: 'Resolved', color: 'badge-resolved' }
};

export default function IssueCard({ issue, onToggleUpvote }) {
  const navigate = useNavigate();
  const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    navigate(`/issue/${issue.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row group border border-slate-800 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer"
    >
      
      {/* Thumbnail Image */}
      {issue.imageUrl && (
        <div className="md:w-56 h-48 md:h-auto shrink-0 relative overflow-hidden bg-slate-900">
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 md:hidden flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Header Badges & Category */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700/80">
                {issue.category}
              </span>
              {issue.ticketId && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {issue.ticketId}
                </span>
              )}
              {issue.linkedReportsCount > 1 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  👥 {issue.linkedReportsCount} Linked Reports
                </span>
              )}
              {issue.priority === 'Critical' && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Critical
                </span>
              )}
            </div>

            <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/issue/${issue.id}`}
            className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1 block mb-2"
          >
            {issue.title}
          </Link>

          {/* Description */}
          <p className="text-sm text-slate-300 line-clamp-2 mb-3 leading-relaxed">
            {issue.description}
          </p>

          {/* Location & Authority */}
          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-400">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate max-w-[200px]">{issue.location}</span>
            </div>

            {issue.assignedAuthority && (
              <div className="flex items-center gap-1 text-slate-400">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0a2 2 0 012-2h2a2 2 0 012 2v4" />
                </svg>
                <span>{issue.assignedAuthority}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info & Interactivity */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          
          {/* Reporter info */}
          <div className="flex items-center gap-2">
            <img
              src={issue.reporter?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
              alt={issue.reporter?.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-slate-300 font-medium">
              {issue.reporter?.name || 'Anonymous'}
            </span>
            <span className="text-[10px] text-slate-500">
              • {new Date(issue.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action buttons (Upvote & Comment) */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleUpvote(issue.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                issue.upvotedByUser
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform ${issue.upvotedByUser ? 'text-blue-400 scale-110' : 'text-slate-400'}`}
                fill={issue.upvotedByUser ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
              <span>{issue.upvotes || 0}</span>
            </button>

            <Link
              to={`/issue/${issue.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{issue.commentsCount || 0}</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
