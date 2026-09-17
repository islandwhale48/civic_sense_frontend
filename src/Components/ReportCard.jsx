import React, { useState } from 'react';

const CATEGORIES = [
  'Roads & Traffic',
  'Sanitation & Waste',
  'Electricity & Lighting',
  'Water Supply',
  'Public Safety',
  'Other'
];

export default function ReportCard({ isOpen, onClose, onSubmitIssue }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Roads & Traffic',
    priority: 'Medium',
    location: '',
    description: '',
    imageUrl: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.description) {
      alert('Please fill out all required fields.');
      return;
    }

    const newIssue = {
      id: `issue-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      priority: formData.priority,
      status: 'pending',
      location: formData.location,
      description: formData.description,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800',
      upvotes: 1,
      upvotedByUser: true,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      reporter: {
        name: 'Prakash Kumar',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        badge: 'Civic Champion'
      },
      assignedAuthority: 'Pending Municipal Verification',
      timeline: [
        { status: 'Reported', date: 'Just now', detail: 'Issue submitted by Prakash K. Awaiting inspector verification.' }
      ],
      comments: []
    };

    onSubmitIssue(newIssue);
    onClose();
    setFormData({
      title: '',
      category: 'Roads & Traffic',
      priority: 'Medium',
      location: '',
      description: '',
      imageUrl: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-card rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              📢
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Report a Civic Issue</h2>
              <p className="text-xs text-slate-400">Help municipal authorities identify & resolve local problems</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Issue Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Deep pothole causing traffic jam near Metro station"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Urgency Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Low" className="bg-slate-900">Low - Routine</option>
                <option value="Medium" className="bg-slate-900">Medium - Needs Attention</option>
                <option value="High" className="bg-slate-900">High - Urgent hazard</option>
                <option value="Critical" className="bg-slate-900">Critical - Emergency</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Exact Location / Landmark <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Sector 14, Opposite City Bank ATM"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the issue, hazards, or length of time it has been unaddressed..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          {/* Image URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Photo URL (Optional)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
            >
              Submit Report
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
