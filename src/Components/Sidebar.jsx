import React from 'react';
import { NavLink } from 'react-router-dom';

const CATEGORIES = [
  { name: 'All Categories', icon: '🌐' },
  { name: 'Roads & Traffic', icon: '🛣️' },
  { name: 'Sanitation & Waste', icon: '🧹' },
  { name: 'Electricity & Lighting', icon: '💡' },
  { name: 'Water Supply', icon: '🚰' },
  { name: 'Public Safety', icon: '🛡️' }
];

export default function Sidebar({ selectedCategory, setSelectedCategory, totalIssuesCount }) {
  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
      
      {/* Navigation Links */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
          Navigation
        </h3>
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Community Feed</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>My Profile & Reports</span>
          </NavLink>
        </nav>
      </div>

      {/* Category Filter */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 px-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Categories
          </h3>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {totalIssuesCount} Issues
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === (cat.name === 'All Categories' ? 'All' : cat.name);
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name === 'All Categories' ? 'All' : cat.name)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 font-semibold border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Civic Impact Box */}
      <div className="glass-card rounded-2xl p-4 bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-blue-950/40 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
          <span>⚡ Civic Impact Stats</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-center">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <p className="text-xl font-bold text-green-400">84%</p>
            <p className="text-[11px] text-slate-400">Resolution Rate</p>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <p className="text-xl font-bold text-blue-400">2.4 days</p>
            <p className="text-[11px] text-slate-400">Avg Fix Time</p>
          </div>
        </div>
      </div>

    </aside>
  );
}
