import React, { useRef } from 'react';

/**
 * Photo upload component with AI validation feedback preview
 */
export function PhotoUpload({ imagePreview, aiScanResult, onFileChange, onClear }) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileChange({ target: { files: [file] } });
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
        📷 Upload Photo Evidence
      </label>

      {imagePreview ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
          <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover" />
          {/* AI Scan Result Badge */}
          {aiScanResult && (
            <div className={`absolute top-3 left-3 px-2.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm border ${
              aiScanResult.is_relevant
                ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500/50'
                : 'bg-red-900/80 text-red-200 border-red-500/50'
            }`}>
              {aiScanResult.is_relevant ? '✅ AI: Valid Civic Photo' : '❌ AI: Invalid Photo'}
              {aiScanResult.detected_categories?.[0] && (
                <span className="ml-1 opacity-80">
                  — {aiScanResult.detected_categories[0].category} ({Math.round((aiScanResult.detected_categories[0].confidence || 0) * 100)}%)
                </span>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onClear}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold"
          >
            Remove / Retake
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer transition-all group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📷</div>
          <p className="text-xs font-semibold text-slate-200">Click to capture or pick image</p>
          <p className="text-[11px] text-slate-400 mt-1">Drag & drop or tap to browse • AI checks image relevance</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;
