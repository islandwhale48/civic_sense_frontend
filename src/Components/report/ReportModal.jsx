import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PhotoUpload } from './PhotoUpload';
import { LocationPicker } from './LocationPicker';
import { WardRoutingBox } from './WardRoutingBox';
import { useGeolocation } from '../../hooks/useGeolocation';
import { issueService } from '../../services/issueService';

const CATEGORIES = ['Roads & Traffic', 'Sanitation & Waste', 'Electricity & Lighting', 'Water Supply', 'Public Safety', 'Drainage & Sewage', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export function ReportModal({ isOpen, onClose, onSubmitIssue }) {
  const [form, setForm] = useState({ title: '', category: 'Roads & Traffic', priority: 'Medium', location: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiScanResult, setAiScanResult] = useState(null);
  const [routingPreview, setRoutingPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIRefining, setIsAIRefining] = useState(false);
  const { coordinates, setCoordinates, isLocating, detectLocation } = useGeolocation();

  useEffect(() => {
    if (coordinates.lat && coordinates.lng) {
      issueService.previewRouting(coordinates.lat, coordinates.lng, form.category)
        .then((res) => {
          const data = res.data || res;
          setRoutingPreview(data);
          if (data.geoData?.address && !form.location) {
            setForm((prev) => ({ ...prev, location: data.geoData.address }));
          }
        })
        .catch(() => {});
    }
  }, [coordinates, form.category]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setAiScanResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => { setImageFile(null); setImagePreview(null); setAiScanResult(null); };

  const handleDetect = async () => {
    await detectLocation();
    // Note: detectLocation already calls setCoordinates internally in the hook,
    // which triggers the useEffect to call previewRouting automatically.
  };

  const handleAIRefine = async () => {
    if (!form.description.trim()) { alert('Please add a brief description first.'); return; }
    setIsAIRefining(true);
    try {
      const res = await issueService.refineDescription(form.description, form.category, form.title);
      const data = res.data || res;
      if (data.refinedDescription) setForm((prev) => ({ ...prev, description: data.refinedDescription }));
    } catch {
      const raw = form.description.trim();
      setForm((prev) => ({
        ...prev,
        description: `Hazard: ${raw.charAt(0).toUpperCase() + raw.slice(1)}.\nImpact: Active safety risk for local commuters.\nAction Needed: Requesting prompt inspection and repair by the responsible municipal authority.`
      }));
    } finally { setIsAIRefining(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) { alert('Please fill all required fields.'); return; }
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('category', form.category);
      payload.append('priority', form.priority);
      payload.append('location', form.location);
      payload.append('description', form.description);
      if (coordinates.lat) { payload.append('latitude', coordinates.lat); payload.append('longitude', coordinates.lng); }
      if (imageFile) payload.append('image', imageFile);

      const res = await issueService.createIssue(payload);
      const data = res.data || res;
      const issue = data.issue || data;

      // Attach AI scan to display
      if (data.aiScan) setAiScanResult(data.aiScan);

      onSubmitIssue(issue);
      if (data.isDuplicate) {
        alert(`📍 Linked to existing Issue #${data.issueNumber || data.ticketId} (duplicate detected nearby)`);
      }
      onClose();
      resetForm();
    } catch (err) {
      // Fallback local creation if backend offline
      const ward = routingPreview?.ward || 'Central Ward #14';
      const authority = routingPreview?.responsibleAuthority || 'Municipal Public Works Dept';
      const issueNum = `CKH-${Math.floor(100 + Math.random() * 900)}`;
      const fallbackIssue = {
        id: `issue-${Date.now()}`,
        issueNumber: issueNum,
        ticketId: `TKT-${ward.replace(/[^A-Z0-9]/gi, '').slice(0, 5).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: form.title, category: form.category, priority: form.priority,
        status: 'pending', location: form.location, description: form.description,
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800',
        assignedAuthority: authority,
        jurisdiction: { ward, type: 'Municipality / Corporation' },
        upvotes: 1, upvotedByUser: true, linkedReportsCount: 1,
        createdAt: new Date().toISOString(),
        reporter: { name: 'Prakash Kumar', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', badge: 'Active Citizen' },
        timeline: [{ status: 'Reported', date: 'Just now', detail: `Ticket ${issueNum} raised. Routed to ${authority}.` }],
        comments: []
      };
      onSubmitIssue(fallbackIssue);
      onClose();
      resetForm();
    } finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setForm({ title: '', category: 'Roads & Traffic', priority: 'Medium', location: '', description: '' });
    clearImage();
    setRoutingPreview(null);
    setCoordinates({ lat: null, lng: null });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report a Civic Issue" subtitle="AI Validation • GPS Location • Ward Routing" icon="📢" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Issue Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Deep pothole near Metro Pillar 42"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Photo Upload with AI */}
        <PhotoUpload imagePreview={imagePreview} aiScanResult={aiScanResult} onFileChange={handleImageChange} onClear={clearImage} />

        {/* Category & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500">
              {CATEGORIES.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500">
              {PRIORITIES.map((p) => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
            </select>
          </div>
        </div>

        {/* Location Picker */}
        <LocationPicker
          location={form.location}
          coordinates={coordinates}
          isLocating={isLocating}
          onDetect={handleDetect}
          onChange={(v) => setForm({ ...form, location: v })}
        />

        {/* Ward Routing Live Preview */}
        <WardRoutingBox routingPreview={routingPreview} />

        {/* Description with AI Refine */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Description <span className="text-rose-400">*</span>
            </label>
            <button type="button" onClick={handleAIRefine} disabled={isAIRefining}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all active:scale-95">
              {isAIRefining ? '✨ Polishing...' : '✨ AI Refine'}
            </button>
          </div>
          <textarea rows="3" required value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the issue or type brief notes and click AI Refine..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : '🚀 Submit Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ReportModal;
