import React, { useState } from 'react';
import { userProfile } from '../data/mockIssues';
import IssueCard from '../Components/IssueCard';

export default function Profile({ issues = [], onToggleUpvote }) {
  const [activeTab, setActiveTab] = useState('reported');

  // Safely filter user's reported issues with optional chaining
  // Prevents crash when backend issues have string reporterName or undefined reporter object
  const myReportedIssues = (issues || []).filter((i) => {
    if (!i) return false;
    const reporterName = i.reporter?.name || i.reporterName || (typeof i.reporter === 'string' ? i.reporter : '');
    return (
      reporterName === userProfile.name ||
      reporterName === 'Prakash Kumar' ||
      reporterName === 'Rahul Sharma'
    );
  });

  const myUpvotedIssues = (issues || []).filter((i) => i && i.upvotedByUser);

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      
      {/* Profile Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <img
            src={userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={userProfile?.name || 'User'}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-xl"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{userProfile?.name || 'Prakash Kumar'}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {userProfile?.role || 'Civic Champion'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {userProfile?.email || 'prakash@civicsense.org'} • Member since {userProfile?.joined || '2026'}
            </p>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
                <p className="text-xl font-extrabold text-blue-400">{myReportedIssues.length}</p>
                <p className="text-[11px] text-slate-400">Issues Reported</p>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
                <p className="text-xl font-extrabold text-emerald-400">
                  {myReportedIssues.filter(i => (i.status || '').toLowerCase() === 'resolved').length}
                </p>
                <p className="text-[11px] text-slate-400">Resolved</p>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
                <p className="text-xl font-extrabold text-amber-400">{userProfile?.stats?.upvotesGiven || 148}</p>
                <p className="text-[11px] text-slate-400">Upvotes Given</p>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
                <p className="text-xl font-extrabold text-purple-400">{userProfile?.stats?.civicKarma || 850}</p>
                <p className="text-[11px] text-slate-400">Civic Karma</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Community Badges & Honors
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(userProfile?.badges || []).map((badge) => (
            <div key={badge.title} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <h4 className="text-xs font-bold text-slate-200">{badge.title}</h4>
                <p className="text-[11px] text-slate-400">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('reported')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reported'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Reported Issues ({myReportedIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('upvoted')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upvoted'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Upvoted Issues ({myUpvotedIssues.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-4">
        {activeTab === 'reported' ? (
          myReportedIssues.length > 0 ? (
            myReportedIssues.map((issue, idx) => (
              <IssueCard key={issue.id || issue._id || idx} issue={issue} onToggleUpvote={onToggleUpvote} />
            ))
          ) : (
            <p className="text-slate-400 text-sm text-center py-6">You haven't reported any issues yet.</p>
          )
        ) : (
          myUpvotedIssues.length > 0 ? (
            myUpvotedIssues.map((issue, idx) => (
              <IssueCard key={issue.id || issue._id || idx} issue={issue} onToggleUpvote={onToggleUpvote} />
            ))
          ) : (
            <p className="text-slate-400 text-sm text-center py-6">You haven't upvoted any issues yet.</p>
          )
        )}
      </div>

    </div>
  );
}
