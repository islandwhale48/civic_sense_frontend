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

/* ─── Inline Success / Duplicate Overlay ─────────────────────────────────── */
function SubmitSuccessOverlay({ result, onDone }) {
  const isDuplicate = result?.isDuplicate;

  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,14,26,0.93)',
      backdropFilter: 'blur(8px)',
      borderRadius: '1rem',
      animation: 'fadeInOverlay 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes popIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(18px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes ring { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
      `}</style>

      {/* Icon ring */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: isDuplicate
          ? 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(251,191,36,0.06) 70%)'
          : 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.06) 70%)',
        border: `2px solid ${isDuplicate ? 'rgba(251,191,36,0.5)' : 'rgba(16,185,129,0.5)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, marginBottom: 20,
        animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both, ring 1.6s ease 0.5s infinite'
      }}>
        {isDuplicate ? '🔗' : '✅'}
      </div>

      {/* Title */}
      <h3 style={{
        color: isDuplicate ? '#fbbf24' : '#10b981',
        fontSize: 18, fontWeight: 700, marginBottom: 8,
        animation: 'slideUp 0.35s ease 0.15s both'
      }}>
        {isDuplicate ? 'Already Reported Nearby' : 'Report Submitted!'}
      </h3>

      {/* Body */}
      <p style={{
        color: '#94a3b8', fontSize: 13, textAlign: 'center',
        maxWidth: 300, lineHeight: 1.55, marginBottom: 6,
        animation: 'slideUp 0.35s ease 0.25s both'
      }}>
        {isDuplicate
          ? <>Your evidence has been <strong style={{color:'#fbbf24'}}>linked to Ticket #{result.issueNumber || result.ticketId}</strong> and saved under its reports list.</>
          : <>Ticket <strong style={{color:'#10b981'}}>#{result.issueNumber}</strong> created and routed to <strong style={{color:'#e2e8f0'}}>{result.authority || 'the responsible authority'}</strong>.</>
        }
      </p>

      {isDuplicate && (
        <p style={{
          color: '#64748b', fontSize: 11.5, textAlign: 'center',
          maxWidth: 280, lineHeight: 1.5, marginBottom: 0,
          animation: 'slideUp 0.35s ease 0.32s both'
        }}>
          Multiple citizen reports strengthen the case for faster resolution.
        </p>
      )}

      {/* Ward badge */}
      {result?.ward && (
        <div style={{
          marginTop: 16, padding: '5px 14px', borderRadius: 999,
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)',
          color: '#a5b4fc', fontSize: 11.5, fontWeight: 600,
          animation: 'slideUp 0.35s ease 0.38s both'
        }}>
          📍 {result.ward}
        </div>
      )}

      {/* Close button */}
      <button onClick={onDone} style={{
        marginTop: 22, padding: '8px 28px', borderRadius: 999,
        background: isDuplicate
          ? 'linear-gradient(135deg,rgba(251,191,36,0.2),rgba(251,191,36,0.08))'
          : 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.08))',
        border: `1px solid ${isDuplicate ? 'rgba(251,191,36,0.4)' : 'rgba(16,185,129,0.4)'}`,
        color: isDuplicate ? '#fbbf24' : '#10b981',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        animation: 'slideUp 0.35s ease 0.45s both',
        transition: 'all 0.2s'
      }}>
        Got it
      </button>
    </div>
  );
}

/* ─── Main Report Modal ───────────────────────────────────────────────────── */
export function ReportModal({ isOpen, onClose, onSubmitIssue }) {
  const [form, setForm] = useState({ title: '', category: 'Roads & Traffic', priority: 'Medium', location: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiScanResult, setAiScanResult] = useState(null);
  const [routingPreview, setRoutingPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIRefining, setIsAIRefining] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // drives overlay
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

  const handleDetect = async () => { await detectLocation(); };

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

      if (data.aiScan) setAiScanResult(data.aiScan);

      onSubmitIssue(issue);

      // Show animated overlay instead of alert()
      setSubmitResult({
        isDuplicate: data.isDuplicate,
        issueNumber: data.issueNumber || issue.issueNumber,
        ticketId: data.ticketId || issue.ticketId,
        authority: data.authority,
        ward: data.ward || issue.jurisdiction?.ward
      });
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
      setSubmitResult({ isDuplicate: false, issueNumber: issueNum, authority, ward });
    } finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setForm({ title: '', category: 'Roads & Traffic', priority: 'Medium', location: '', description: '' });
    clearImage();
    setRoutingPreview(null);
    setCoordinates({ lat: null, lng: null });
  };

  const handleOverlayDone = () => {
    setSubmitResult(null);
    onClose();
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report a Civic Issue" subtitle="AI Validation • GPS Location • Ward Routing" icon="📢" maxWidth="max-w-xl">
      {/* Success/Duplicate overlay — rendered on top of form */}
      <div style={{ position: 'relative' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ visibility: submitResult ? 'hidden' : 'visible' }}>
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

        {/* Overlay rendered on top once result arrives */}
        {submitResult && (
          <SubmitSuccessOverlay result={submitResult} onDone={handleOverlayDone} />
        )}
      </div>
    </Modal>
  );
}

export default ReportModal;
