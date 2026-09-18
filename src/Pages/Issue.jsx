import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';

const STAGES = ['REPORTED', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

export default function Issue({ issues, onToggleUpvote, onAddComment }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [liveIssue, setLiveIssue] = useState(null);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [activeReportModal, setActiveReportModal] = useState(null);
  const [fullImageModalUrl, setFullImageModalUrl] = useState(null);

  // Seed from the in-memory prop while the live fetch is in flight
  const propIssue = issues.find((i) => i.id === id || i.issueNumber === id || i.ticketId === id);

  // Fetch the fresh issue from the API every time the page is opened
  // This ensures reportsList (linked reports) are always up-to-date
  useEffect(() => {
    if (!id) return;
    setIsLoadingLive(true);
    issueService.getIssueById(id)
      .then((res) => {
        const data = res?.data?.issue || res?.issue || res?.data || res;
        if (data && (data.id || data.issueNumber)) setLiveIssue(data);
      })
      .catch(() => {/* fall through to propIssue */})
      .finally(() => setIsLoadingLive(false));
  }, [id]);

  // Prefer live (API) data; fall back to prop data while loading
  const issue = liveIssue || propIssue;

  if (!issue) {
    return (
      <div className="flex-1 glass-card rounded-2xl p-12 text-center my-8">
        {isLoadingLive ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid rgba(99,102,241,0.15)',
              borderTopColor: '#6366f1',
              animation: 'spin 0.8s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p className="text-sm text-slate-400">Loading issue details…</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Issue Not Found</h2>
            <p className="text-sm text-slate-400 mb-6">The requested civic report could not be found.</p>
            <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500">
              Back to Feed
            </button>
          </>
        )}
      </div>
    );
  }

  const currentStatus = (issue.status || 'REPORTED').toUpperCase();
  const currentStageIndex = STAGES.findIndex((stage) => stage === currentStatus);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const comment = {
      id: `c-${Date.now()}`,
      author: 'Prakash Kumar',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      text: commentText.trim(),
      date: 'Just now'
    };
    onAddComment(issue.id, comment);
    // Optimistically append to live copy too
    setLiveIssue((prev) => prev ? { ...prev, comments: [comment, ...(prev.comments || [])] } : null);
    setCommentText('');
  };

  const reports = issue.reportsList || [];

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">

      {/* Back button */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <span>← Back to Community Feed</span>
        </button>
        <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
          Ticket #{issue.ticketId || issue.id}
        </span>
      </div>

      {/* Main Issue Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800">

        {/* Header Badges */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
              {issue.category}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              👥 {reports.length || issue.reportCount || issue.linkedReportsCount || 1} Citizen Reports
            </span>
          </div>

          {/* Upvote Action */}
          <button
            onClick={() => onToggleUpvote(issue.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${issue.upvotedByUser
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <svg className={`w-4 h-4 ${issue.upvotedByUser ? 'text-white' : 'text-slate-400'}`} fill={issue.upvotedByUser ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
            <span>{issue.upvotes || 0} Upvotes</span>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{issue.title}</h1>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <img src={issue.reporter?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'} alt="" className="w-6 h-6 rounded-full object-cover" />
            <span>Reported by <strong className="text-slate-200">{issue.reporter?.name || 'Anonymous'}</strong></span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>{issue.location}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-blue-300">
            <span>🏛️ Authority: <strong>{issue.authority || issue.assignedAuthority}</strong></span>
          </div>
        </div>

        {/* Status Timeline Stepper */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Official Resolution Progress Stepper
          </h3>

          <div className="grid grid-cols-5 gap-1 text-center relative">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx <= (currentStageIndex >= 0 ? currentStageIndex : 0);
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[11px] font-medium ${isCurrent ? 'text-blue-400 font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                    {stage.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timeline Event Log */}
          {issue.timeline && issue.timeline.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-3">
              {issue.timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">{item.status}</span>
                    <span className="text-slate-500 ml-2">({item.date})</span>
                    <p className="text-slate-400 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Master Photo Preview */}
        {(issue.media?.url || issue.imageUrl) && (
          <div
            onClick={() => setFullImageModalUrl(issue.media?.url || issue.imageUrl)}
            className="rounded-2xl overflow-hidden mb-6 bg-slate-950 border border-slate-800 max-h-96 cursor-pointer group relative"
          >
            <img src={issue.media?.url || issue.imageUrl} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
              <span className="p-2 rounded-full bg-slate-900/80 border border-slate-700">🔍 Click to enlarge photo</span>
            </div>
          </div>
        )}

        {/* Master Description */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Master Issue Description</h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {issue.description}
          </p>
        </div>

        {/* ── Linked Citizen Reports ─────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              👥 Linked Citizen Reports
              <span style={{
                background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)',
                color: '#c084fc', borderRadius: 999, padding: '1px 10px', fontSize: 11, fontWeight: 700
              }}>
                {reports.length}
              </span>
            </h3>
            {/* Live badge when liveIssue is loaded */}
            {liveIssue && (
              <span style={{
                fontSize: 10, color: '#34d399', background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '2px 8px', fontWeight: 600
              }}>
                ● Live DB Synced
              </span>
            )}
          </div>

          {reports.length === 0 ? (
            <div style={{
              padding: '28px 20px', borderRadius: 16, textAlign: 'center',
              background: 'rgba(15,23,42,0.6)', border: '1px dashed rgba(100,116,139,0.3)'
            }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>📋</span>
              <p style={{ color: '#64748b', fontSize: 13 }}>No additional citizen reports linked yet.</p>
              <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>Reports submitted at the same GPS location will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reports.map((report, idx) => (
                <div
                  key={report.id || idx}
                  onClick={() => setActiveReportModal(report)}
                  className="group cursor-pointer transition-all duration-200 hover:border-purple-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-purple-500/5"
                  style={{
                    padding: '16px 18px', borderRadius: 16,
                    background: idx === 0 ? 'rgba(99,102,241,0.08)' : 'rgba(15,23,42,0.7)',
                    border: idx === 0 ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(51,65,85,0.7)',
                    display: 'flex', gap: 16, alignItems: 'flex-start'
                  }}
                >
                  {/* Index / order badge */}
                  <div style={{
                    minWidth: 32, height: 32, borderRadius: '50%',
                    background: idx === 0 ? 'rgba(99,102,241,0.3)' : 'rgba(51,65,85,0.8)',
                    border: `1px solid ${idx === 0 ? 'rgba(99,102,241,0.5)' : 'rgba(71,85,105,0.6)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: idx === 0 ? '#a5b4fc' : '#94a3b8', fontSize: 12, fontWeight: 700, flexShrink: 0
                  }}>
                    #{idx + 1}
                  </div>

                  {/* Thumbnail Image (Larger & Clickable) */}
                  {report.imageUrl && (
                    <div className="relative shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-slate-700/80 group-hover:border-purple-400 transition-colors" style={{ width: 104, height: 104 }}>
                      <img
                        src={report.imageUrl}
                        alt="Report visual"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        🔍 Enlarge
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                          {report.reporterName || 'Anonymous Citizen'}
                        </span>
                        {idx === 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 800, color: '#818cf8',
                            background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                            borderRadius: 999, padding: '1px 8px'
                          }}>ORIGINAL REPORT</span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'Just now'}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.55, whiteSpace: 'pre-line', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {report.description || '—'}
                    </p>

                    <div style={{ marginTop: 8, display: 'flex', items: 'center', gap: 6, color: '#a855f7', fontSize: 11, fontWeight: 600 }}>
                      <span>View full report & enlarged photo →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">
            Community Discussion ({issue.comments ? issue.comments.length : 0})
          </h3>

          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment or update on this issue..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20">
              Post Comment
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {issue.comments && issue.comments.length > 0 ? (
              issue.comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <img src={comment.avatar} alt="" className="w-5 h-5 rounded-full" />
                      <span className="text-xs font-semibold text-slate-200">{comment.author}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{comment.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-7">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-2">No comments yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* ── Modal for Enlarged Report Details & Image ────────────────────── */}
      {activeReportModal && (
        <div
          onClick={() => setActiveReportModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl animate-fade-in"
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveReportModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Citizen Report Details
              </span>
              <span className="text-xs text-slate-400">
                Submitted {activeReportModal.createdAt ? new Date(activeReportModal.createdAt).toLocaleString('en-IN') : 'Recently'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Report by {activeReportModal.reporterName || 'Anonymous Citizen'}
            </h3>

            {/* Large Image View */}
            {activeReportModal.imageUrl && (
              <div
                onClick={() => setFullImageModalUrl(activeReportModal.imageUrl)}
                className="my-4 rounded-2xl overflow-hidden bg-black border border-slate-700 max-h-96 cursor-pointer group relative"
              >
                <img
                  src={activeReportModal.imageUrl}
                  alt="Enlarged Report Visual"
                  className="w-full h-full object-contain max-h-96 mx-auto group-hover:scale-102 transition-transform"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/70 text-slate-200 text-xs font-semibold border border-slate-700">
                  🔍 Click for Fullscreen Image
                </div>
              </div>
            )}

            {/* Description */}
            <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Report Description</h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {activeReportModal.description || 'No description provided.'}
              </p>
            </div>

            {/* Action close button */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveReportModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Image Lightbox Modal ───────────────────────────────── */}
      {fullImageModalUrl && (
        <div
          onClick={() => setFullImageModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setFullImageModalUrl(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800/90 text-white flex items-center justify-center font-bold text-lg border border-slate-700"
          >
            ✕
          </button>
          <img
            src={fullImageModalUrl}
            alt="Fullscreen photo"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );
}
