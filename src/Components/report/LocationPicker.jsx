import React from 'react';

export function LocationPicker({ location, coordinates, isLocating, onDetect, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          📍 Location <span className="text-rose-400">*</span>
        </label>
        <button
          type="button"
          onClick={onDetect}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all disabled:opacity-50 active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isLocating ? 'Detecting GPS...' : 'Detect Location'}
        </button>
      </div>

      <input
        type="text"
        value={location}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Sector 14, Main Market Road, Central Ward"
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
      />

      {coordinates.lat && (
        <p className="mt-1 text-[10px] text-emerald-400 font-mono">
          ✅ GPS: {coordinates.lat.toFixed(5)}°, {coordinates.lng.toFixed(5)}°
        </p>
      )}
    </div>
  );
}

export default LocationPicker;
