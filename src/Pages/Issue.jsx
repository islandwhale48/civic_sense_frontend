import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const STAGES = ['Reported', 'Verified', 'In Progress', 'Resolved'];

export default function Issue({ issues, onToggleUpvote, onAddComment }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');

  const issue = issues.find((i) => i.id === id);

  if (!issue) {
    return (
      <div className="flex-1 glass-card rounded-2xl p-12 text-center my-8">
        <h2 className="text-xl font-bold text-slate-200 mb-2">Issue Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The requested civic report could not be found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  // Calculate current stage index for timeline stepper
  const currentStageIndex = STAGES.findIndex((stage) => {
    if (issue.status === 'pending') return stage === 'Reported';
    if (issue.status === 'in_progress') return stage === 'In Progress';
    if (issue.status === 'resolved') return stage === 'Resolved';
    return false;
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(issue.id, {
      id: `c-${Date.now()}`,
      author: 'Prakash Kumar',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      text: commentText.trim(),
      date: 'Just now'
    });
    setCommentText('');
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <span>← Back to Community Feed</span>
        </button>

        <span className="text-xs text-slate-500 font-mono">
          Report ID: {issue.id}
        </span>
      </div>

      {/* Main Issue Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800">
        
        {/* Header Details */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
              {issue.category}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              issue.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300'
            }`}>
              {issue.priority} Priority
            </span>
          </div>

          {/* Upvote Action */}
          <button
            onClick={() => onToggleUpvote(issue.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              issue.upvotedByUser
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <svg
              className={`w-4 h-4 ${issue.upvotedByUser ? 'text-white' : 'text-slate-400'}`}
              fill={issue.upvotedByUser ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
            <span>{issue.upvotes || 0} Upvotes</span>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {issue.title}
        </h1>

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
        </div>

        {/* Status Timeline Stepper */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Resolution Progress Timeline
          </h3>
          
          <div className="grid grid-cols-4 gap-2 text-center relative">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx <= (currentStageIndex >= 0 ? currentStageIndex : 0);
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-medium ${isCurrent ? 'text-blue-400 font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                    {stage}
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
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
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

        {/* Photo Preview */}
        {issue.imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-6 bg-slate-950 border border-slate-800 max-h-96">
            <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Full Description */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {issue.description}
          </p>
        </div>

        {/* Comments Section */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">
            Discussion & Updates ({issue.comments ? issue.comments.length : 0})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment or update on this issue..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
            >
              Post Comment
            </button>
          </form>

          {/* Comments List */}
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
              <p className="text-xs text-slate-500 italic py-2">No comments yet. Be the first to share an update!</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
