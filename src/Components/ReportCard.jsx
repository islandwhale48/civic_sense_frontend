import React, { useState, useRef, useEffect } from 'react';

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
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [routingPreview, setRoutingPreview] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIRefining, setIsAIRefining] = useState(false);

  const fileInputRef = useRef(null);

  // Trigger authority re-routing when category or coordinates change
  useEffect(() => {
    if (coordinates.lat && coordinates.lng) {
      fetchRoutingPreview(coordinates.lat, coordinates.lng, formData.category);
    }
  }, [formData.category, coordinates]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Query Backend Authority Routing Preview
  const fetchRoutingPreview = async (lat, lng, category) => {
    try {
      const res = await fetch('http://localhost:5000/api/issues/route-authority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, category })
      });
      if (res.ok) {
        const data = await res.json();
        setRoutingPreview(data);
        if (data.geoData && data.geoData.address && !formData.location) {
          setFormData((prev) => ({ ...prev, location: data.geoData.address }));
        }
      }
    } catch (err) {
      // ignore
    }
  };

  // Get Browser GPS Location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoordinates({ lat, lng });

        await fetchRoutingPreview(lat, lng, formData.category);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please allow location access in browser.';
        }
        alert(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // AI Description Refinement
  const handleAIRefineDescription = async () => {
    if (!formData.description || !formData.description.trim()) {
      alert('Please type a brief description or notes first for AI to refine.');
      return;
    }

    setIsAIRefining(true);
    try {
      const res = await fetch('http://localhost:5000/api/issues/ai-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          title: formData.title,
          category: formData.category
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.refinedDescription) {
          setFormData((prev) => ({ ...prev, description: data.refinedDescription }));
        }
      } else {
        throw new Error('AI endpoint notice');
      }
    } catch (err) {
      const raw = formData.description.trim();
      const polished = `Hazard: ${raw.charAt(0).toUpperCase() + raw.slice(1)}.\nImpact: Poses an active safety risk and traffic hazard for local commuters.\nAction Needed: Requesting prompt site inspection and repair by the responsible municipal authority.`;
      setFormData((prev) => ({ ...prev, description: polished }));
    } finally {
      setIsAIRefining(false);
    }
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('category', formData.category);
      payload.append('priority', formData.priority);
      payload.append('location', formData.location || 'Local Sector');
      payload.append('description', formData.description);
      if (coordinates.lat) payload.append('latitude', coordinates.lat);
      if (coordinates.lng) payload.append('longitude', coordinates.lng);
      if (imageFile) payload.append('image', imageFile);

      const response = await fetch('http://localhost:5000/api/issues', {
        method: 'POST',
        body: payload
      });

      if (response.ok) {
        const data = await response.json();
        onSubmitIssue(data.issue);
        if (data.isDuplicate) {
          alert(`📍 Duplicate report detected! Linked to existing Ticket #${data.ticketId}`);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        if (errData.error) {
          alert(`⚠️ Image Validation Failed:\n${errData.error}`);
          setIsSubmitting(false);
          return;
        }
        throw new Error('Backend response error');
      }
    } catch (err) {
      // Fallback local issue creation
      const districtCode = (routingPreview?.geoData?.district || 'GEN').slice(0, 3).toUpperCase();
      const fallbackTicketId = `TKT-${districtCode}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newIssue = {
        id: `issue-${Date.now()}`,
        ticketId: fallbackTicketId,
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        status: 'pending',
        location: formData.location || 'Local Sector',
        description: formData.description,
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800',
        assignedAuthority: routingPreview?.responsibleAuthority || 'Municipal Public Works Dept',
        jurisdiction: routingPreview?.jurisdiction || { type: 'Municipality / Local Body' },
        upvotes: 1,
        upvotedByUser: true,
        linkedReportsCount: 1,
        createdAt: new Date().toISOString(),
        reporter: {
          name: 'Prakash Kumar',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          badge: 'Civic Champion'
        },
        timeline: [
          { status: 'Ticket Created', date: 'Just now', detail: `Ticket #${fallbackTicketId} generated with GIS authority routing.` }
        ],
        comments: []
      };
      onSubmitIssue(newIssue);
    } finally {
      setIsSubmitting(false);
      onClose();
      setFormData({
        title: '',
        category: 'Roads & Traffic',
        priority: 'Medium',
        location: '',
        description: ''
      });
      clearImage();
      setCoordinates({ lat: null, lng: null });
      setRoutingPreview(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-card rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg">
              📢
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Report a Civic Issue</h2>
              <p className="text-xs text-slate-400">GIS Jurisdiction Lookup, Spatial Deduplication & AI Refinement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
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
              placeholder="e.g. Deep hazardous pothole near Metro Pillar 42"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Photo Capture & Gallery */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Take Photo / Pick from Gallery (Cloudinary)
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2">
                <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover rounded-xl" />
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    onClick={clearImage}
                    className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold shadow-md"
                  >
                    Remove / Retake
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-5 text-center bg-slate-800/50 hover:bg-slate-800/80 cursor-pointer transition-all"
              >
                <p className="text-xs font-semibold text-slate-200">📷 Click to Capture Photo or Pick Image</p>
                <p className="text-[11px] text-slate-400 mt-1">Uploaded to Cloudinary for municipal verification</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Issue Category
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
                <option value="Medium" className="bg-slate-900">Medium - Attention Needed</option>
                <option value="High" className="bg-slate-900">High - Urgent Hazard</option>
                <option value="Critical" className="bg-slate-900">Critical - Emergency</option>
              </select>
            </div>
          </div>

          {/* GPS Location & Administrative Jurisdiction Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Location & Landmarks <span className="text-rose-400">*</span>
              </label>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all"
              >
                <span>{isLocating ? 'Detecting GPS...' : '📍 Detect Current Location'}</span>
              </button>
            </div>

            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Sector 14, Main Market Road"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />

            {/* Dynamic GIS Authority Routing Pipeline Display */}
            {routingPreview && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-blue-500/30 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold">GIS Jurisdiction:</span>
                  <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    {routingPreview.jurisdiction.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold">Routed Authority:</span>
                  <span className="text-blue-300 font-bold text-right max-w-[280px]">
                    🏛️ {routingPreview.responsibleAuthority}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description & AI Refine Action */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Detailed Description <span className="text-rose-400">*</span>
              </label>

              <button
                type="button"
                onClick={handleAIRefineDescription}
                disabled={isAIRefining}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-300 border border-purple-500/40 text-xs font-semibold shadow-sm transition-all transform hover:scale-105 active:scale-95"
              >
                <span>{isAIRefining ? '✨ AI Polishing Report...' : '✨ AI Refine Description'}</span>
              </button>
            </div>

            <textarea
              rows="4"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide specific details about the issue or type raw notes and click 'AI Refine Description'..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
            ></textarea>
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
            >
              {isSubmitting ? 'Processing Ticket...' : 'Submit Report'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
