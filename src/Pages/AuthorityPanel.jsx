import React, { useState, useEffect, useCallback, useRef } from 'react';
import { issueService } from '../services/issueService';

/* ─── Status Configuration ─────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    dot: '#f59e0b'
  },
  in_progress: {
    label: 'In Progress',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.3)',
    dot: '#3b82f6'
  },
  work_assigned: {
    label: 'Work Assigned',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
    dot: '#8b5cf6'
  },
  pending_inspection: {
    label: 'Pending Inspection',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.3)',
    dot: '#06b6d4'
  },
  resolution_submitted: {
    label: 'Awaiting Admin',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.3)',
    dot: '#f97316'
  },
  resolved: {
    label: 'Resolved',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    dot: '#10b981'
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    dot: '#ef4444'
  }
};

const PRIORITY_COLOR = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981'
};

const CATEGORY_ICONS = {
  'Roads & Traffic': '🛣️',
  'Sanitation & Waste': '🗑️',
  'Water Supply': '💧',
  'Electricity & Lighting': '💡',
  'Public Safety': '🛡️',
  'Drainage & Sewage': '🌊',
  'default': '📋'
};

/* ─── Resolution Modal ─────────────────────────────────────────────────────── */
function ResolutionModal({ issue, authorityName, onClose, onSuccess }) {
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!description.trim()) { setError('Please describe the completed work.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('submittedBy', authorityName);
      if (photoFile) formData.append('image', photoFile);
      await issueService.submitResolution(issue.id, formData);
      onSuccess(issue.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalBadge}>📸 Resolution Report</div>
            <h2 style={styles.modalTitle}>Submit Work Completion</h2>
            <p style={styles.modalSubtitle}>{issue.issueNumber} — {issue.title}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Before / After images */}
        <div style={styles.imageCompare}>
          <div style={styles.imageBox}>
            <div style={styles.imageLabel}>🔴 Before (Issue Photo)</div>
            <img src={issue.imageUrl} alt="Before" style={styles.compareImg}
              onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div style={styles.imageArrow}>→</div>
          <div style={styles.imageBox}>
            <div style={styles.imageLabel}>🟢 After (Completion Photo)</div>
            {photoPreview ? (
              <img src={photoPreview} alt="After" style={styles.compareImg} />
            ) : (
              <div style={styles.uploadPlaceholder} onClick={() => fileInputRef.current?.click()}>
                <span style={{ fontSize: 32 }}>📷</span>
                <span style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>Click to upload completion photo</span>
              </div>
            )}
            {photoPreview && (
              <button style={styles.changePhotoBtn} onClick={() => fileInputRef.current?.click()}>
                Change Photo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>
        </div>

        {/* Description */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Work Completion Description *</label>
          <textarea
            style={styles.textarea}
            placeholder="Describe the work completed, materials used, team involved, and any follow-up actions needed..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <div style={styles.modalActions}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={submitting}>Cancel</button>
          <button style={styles.submitResolutionBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <><span style={styles.spinner} />Submitting...</>
            ) : (
              '✅ Submit for Admin Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status Update Dropdown ───────────────────────────────────────────────── */
function StatusDropdown({ issue, authorityName, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef();

  const NEXT_STATUSES = {
    pending: ['in_progress', 'work_assigned'],
    in_progress: ['work_assigned', 'pending_inspection'],
    work_assigned: ['pending_inspection'],
    pending_inspection: [],
    resolution_submitted: [],
    resolved: [],
    rejected: ['in_progress', 'work_assigned']
  };

  const allowed = NEXT_STATUSES[issue.status] || [];

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (allowed.length === 0) return null;

  const handleSelect = async (newStatus) => {
    setOpen(false);
    setLoading(true);
    try {
      await issueService.updateIssueStatus(issue.id, newStatus, '', authorityName);
      onStatusChange(issue.id, newStatus);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const cfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      <button
        style={{ ...styles.statusChip, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
        disabled={loading}
      >
        <span style={{ ...styles.dot, background: cfg.dot }} />
        {loading ? 'Updating...' : cfg.label}
        <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>▾</span>
      </button>
      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownTitle}>Change Status</div>
          {allowed.map((s) => {
            const c = STATUS_CONFIG[s];
            return (
              <button key={s} style={styles.dropdownItem} onClick={() => handleSelect(s)}>
                <span style={{ ...styles.dot, background: c.dot }} />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Ticket Card ──────────────────────────────────────────────────────────── */
function TicketCard({ issue, authorityName, onStatusChange, onSubmitResolution }) {
  const cfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;
  const categoryIcon = CATEGORY_ICONS[issue.category] || CATEGORY_ICONS.default;
  const priorityColor = PRIORITY_COLOR[issue.priority] || '#94a3b8';

  const canSubmitResolution = issue.status === 'pending_inspection';

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  };

  return (
    <div style={styles.card}>
      {/* Card header */}
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderLeft}>
          <span style={styles.categoryIcon}>{categoryIcon}</span>
          <div>
            <div style={styles.ticketMeta}>
              <span style={styles.issueNumber}>{issue.issueNumber}</span>
              <span style={styles.ticketDot}>•</span>
              <span style={styles.ticketId}>{issue.ticketId}</span>
            </div>
            <h3 style={styles.cardTitle}>{issue.title}</h3>
          </div>
        </div>
        <div style={styles.cardHeaderRight}>
          <span style={{ ...styles.priorityBadge, background: priorityColor + '22', color: priorityColor, border: `1px solid ${priorityColor}44` }}>
            {issue.priority}
          </span>
          {issue.sla?.isEscalated && (
            <span style={styles.escalatedBadge}>⚡ Escalated</span>
          )}
        </div>
      </div>

      {/* Image + Description */}
      <div style={styles.cardBody}>
        {issue.imageUrl && (
          <img src={issue.imageUrl} alt="Issue" style={styles.cardImage}
            onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        <p style={styles.cardDesc}>{issue.description}</p>
      </div>

      {/* Location */}
      <div style={styles.cardLocation}>
        <span style={{ opacity: 0.6 }}>📍</span>
        <span style={styles.locationText}>{issue.geoData?.address || issue.location || 'Location not specified'}</span>
        {issue.jurisdiction?.ward && (
          <span style={styles.wardChip}>{issue.jurisdiction.ward}</span>
        )}
      </div>

      {/* Footer */}
      <div style={styles.cardFooter}>
        <div style={styles.cardStats}>
          <span style={styles.statItem}>👍 {issue.upvotes || 0}</span>
          <span style={styles.statItem}>📋 {issue.linkedReportsCount || 1} reports</span>
          <span style={styles.statItem}>🕐 {timeAgo(issue.createdAt)}</span>
        </div>

        <div style={styles.cardActions}>
          <StatusDropdown issue={issue} authorityName={authorityName} onStatusChange={onStatusChange} />

          {canSubmitResolution && (
            <button style={styles.resolveBtn} onClick={() => onSubmitResolution(issue)}>
              📸 Submit Resolution
            </button>
          )}

          {issue.status === 'resolution_submitted' && (
            <span style={styles.awaitingBadge}>⏳ Awaiting Admin Approval</span>
          )}

          {issue.status === 'resolved' && (
            <span style={{ ...styles.statusChip, background: STATUS_CONFIG.resolved.bg, color: STATUS_CONFIG.resolved.color, border: `1px solid ${STATUS_CONFIG.resolved.border}` }}>
              <span style={{ ...styles.dot, background: STATUS_CONFIG.resolved.dot }} />
              ✓ Resolved
            </span>
          )}
        </div>
      </div>

      {/* Timeline (last entry) */}
      {issue.timeline && issue.timeline.length > 0 && (
        <div style={styles.lastTimeline}>
          <span style={styles.timelineDot} />
          <span style={styles.timelineText}>
            {issue.timeline[issue.timeline.length - 1].detail}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Authority Panel ─────────────────────────────────────────────────── */
export default function AuthorityPanel() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedResolutionIssue, setSelectedResolutionIssue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Parse authority from URL query param
  const params = new URLSearchParams(window.location.search);
  const authorityParam = params.get('body') || params.get('authority') || '';
  const wardParam = params.get('ward') || '';
  // Friendly display name — strip jurisdiction boilerplate
  const authorityName = authorityParam || 'Local Authority';

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await issueService.getIssuesByAuthority({
        authority: authorityParam,
        ward: wardParam
      });
      setIssues(data.issues || []);
      setStats(data.stats || {});
    } catch (err) {
      // Fallback: if no authority param, fetch all issues for demo
      try {
        const fallback = await issueService.getIssues({});
        setIssues(fallback.issues || []);
        setStats({
          total: (fallback.issues || []).length,
          pending: (fallback.issues || []).filter(i => i.status === 'pending').length,
          in_progress: (fallback.issues || []).filter(i => ['in_progress', 'work_assigned'].includes(i.status)).length,
          pending_inspection: (fallback.issues || []).filter(i => i.status === 'pending_inspection').length,
          resolved: (fallback.issues || []).filter(i => i.status === 'resolved').length,
          escalated: 0
        });
      } catch {
        setError('Failed to load issues. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [authorityParam, wardParam]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleStatusChange = (issueId, newStatus) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status: newStatus } : i));
  };

  const handleResolutionSuccess = (issueId) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status: 'resolution_submitted' } : i));
    fetchIssues(); // Refresh for fresh data
  };

  // Filter issues
  const FILTER_TABS = [
    { key: 'All', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'in_progress', label: 'In Progress', count: stats.in_progress },
    { key: 'pending_inspection', label: 'Inspection', count: stats.pending_inspection },
    { key: 'resolution_submitted', label: 'Awaiting Admin', count: stats.resolution_submitted },
    { key: 'resolved', label: 'Resolved', count: stats.resolved }
  ];

  const filteredIssues = issues.filter(i => {
    const matchStatus = activeFilter === 'All' || i.status === activeFilter;
    const matchSearch = !searchQuery.trim() ||
      i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.issueNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.govLogo}>🏛️</div>
            <div>
              <div style={styles.govBadge}>Authority Management Panel</div>
              <h1 style={styles.headerTitle}>
                {authorityName || 'Local Body Dashboard'}
              </h1>
              {wardParam && <div style={styles.wardLabel}>📍 {wardParam}</div>}
            </div>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.refreshBtn} onClick={fetchIssues}>🔄 Refresh</button>
            <a href="/" style={styles.citizenLink}>← Citizen View</a>
          </div>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total Tickets', value: stats.total || 0, icon: '📋', color: '#a78bfa' },
            { label: 'Pending Action', value: stats.pending || 0, icon: '⏳', color: '#f59e0b' },
            { label: 'In Progress', value: stats.in_progress || 0, icon: '⚙️', color: '#3b82f6' },
            { label: 'Pending Inspection', value: stats.pending_inspection || 0, icon: '🔍', color: '#06b6d4' },
            { label: 'Awaiting Admin', value: stats.resolution_submitted || 0, icon: '📤', color: '#f97316' },
            { label: 'Resolved', value: stats.resolved || 0, icon: '✅', color: '#10b981' },
            { label: 'Escalated', value: stats.escalated || 0, icon: '⚡', color: '#ef4444' }
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={styles.toolbar}>
        <div style={styles.filterTabs}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              style={{ ...styles.filterTab, ...(activeFilter === tab.key ? styles.filterTabActive : {}) }}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
              {tab.count != null && (
                <span style={{ ...styles.tabCount, ...(activeFilter === tab.key ? styles.tabCountActive : {}) }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <input
          style={styles.searchInput}
          placeholder="🔍 Search by title, issue #, description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ── Content ── */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner} />
            <p style={{ color: '#94a3b8', marginTop: 16 }}>Loading tickets...</p>
          </div>
        ) : error ? (
          <div style={styles.errorState}>
            <div style={{ fontSize: 48 }}>⚠️</div>
            <p style={{ color: '#f87171', marginTop: 12 }}>{error}</p>
            <button style={styles.retryBtn} onClick={fetchIssues}>Retry</button>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 64 }}>📭</div>
            <h3 style={{ color: '#cbd5e1', marginTop: 16 }}>No tickets found</h3>
            <p style={{ color: '#64748b', marginTop: 8 }}>
              {activeFilter === 'All'
                ? 'No issues assigned to this local body yet.'
                : `No issues with status "${activeFilter}".`}
            </p>
          </div>
        ) : (
          <div style={styles.ticketGrid}>
            {filteredIssues.map((issue) => (
              <TicketCard
                key={issue.id}
                issue={issue}
                authorityName={authorityName}
                onStatusChange={handleStatusChange}
                onSubmitResolution={setSelectedResolutionIssue}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Resolution Modal ── */}
      {selectedResolutionIssue && (
        <ResolutionModal
          issue={selectedResolutionIssue}
          authorityName={authorityName}
          onClose={() => setSelectedResolutionIssue(null)}
          onSuccess={handleResolutionSuccess}
        />
      )}
    </div>
  );
}

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1627 50%, #0a1120 100%)',
    color: '#e2e8f0',
    fontFamily: "'Inter', -apple-system, sans-serif",
    paddingBottom: 60
  },

  /* Header */
  header: {
    background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(10,15,30,0.95) 100%)',
    borderBottom: '1px solid rgba(99,102,241,0.2)',
    padding: '24px 32px 0',
    backdropFilter: 'blur(12px)'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  govLogo: {
    fontSize: 40,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 12,
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  govBadge: {
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f1f5f9',
    margin: 0,
    lineHeight: 1.3,
    maxWidth: 600
  },
  wardLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  refreshBtn: {
    padding: '8px 16px',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 8,
    color: '#a78bfa',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.2s'
  },
  citizenLink: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(100,116,139,0.3)',
    borderRadius: 8,
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 13,
    textDecoration: 'none',
    display: 'block'
  },

  /* Stats Row */
  statsRow: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    paddingBottom: 20,
    scrollbarWidth: 'none'
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '12px 20px',
    textAlign: 'center',
    minWidth: 110,
    flexShrink: 0
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, whiteSpace: 'nowrap' },

  /* Toolbar */
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    gap: 16,
    flexWrap: 'wrap'
  },
  filterTabs: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterTab: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s',
    fontWeight: 500
  },
  filterTabActive: {
    background: 'rgba(99,102,241,0.18)',
    border: '1px solid rgba(99,102,241,0.4)',
    color: '#a78bfa'
  },
  tabCount: {
    background: 'rgba(255,255,255,0.08)',
    padding: '1px 7px',
    borderRadius: 10,
    fontSize: 11,
    color: '#64748b'
  },
  tabCountActive: { background: 'rgba(167,139,250,0.2)', color: '#a78bfa' },
  searchInput: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 13,
    width: 280,
    outline: 'none'
  },

  /* Content */
  content: { padding: '0 32px' },
  ticketGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
    gap: 16
  },

  /* Card */
  card: {
    background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(20,30,50,0.9) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 20,
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12
  },
  cardHeaderLeft: { display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 },
  cardHeaderRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  categoryIcon: {
    fontSize: 24,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 40,
    height: 40
  },
  ticketMeta: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  issueNumber: { fontSize: 12, color: '#a78bfa', fontWeight: 700 },
  ticketDot: { color: '#334155', fontSize: 10 },
  ticketId: { fontSize: 11, color: '#475569' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#f1f5f9', margin: 0, lineHeight: 1.4 },
  priorityBadge: {
    fontSize: 11,
    padding: '2px 9px',
    borderRadius: 12,
    fontWeight: 600,
    letterSpacing: '0.04em'
  },
  escalatedBadge: {
    fontSize: 11,
    color: '#ef4444',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 600
  },
  cardBody: { marginBottom: 12 },
  cardImage: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    borderRadius: 8,
    marginBottom: 10,
    border: '1px solid rgba(255,255,255,0.06)'
  },
  cardDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  cardLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.05)'
  },
  locationText: { fontSize: 12, color: '#64748b', flex: 1 },
  wardChip: {
    fontSize: 11,
    color: '#7c3aed',
    background: 'rgba(124,58,237,0.1)',
    border: '1px solid rgba(124,58,237,0.2)',
    padding: '2px 8px',
    borderRadius: 10,
    flexShrink: 0,
    fontWeight: 500
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap'
  },
  cardStats: { display: 'flex', gap: 12 },
  statItem: { fontSize: 12, color: '#475569' },
  cardActions: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  statusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.02em'
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0
  },
  resolveBtn: {
    padding: '6px 14px',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.15))',
    border: '1px solid rgba(16,185,129,0.4)',
    borderRadius: 20,
    color: '#34d399',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.2s'
  },
  awaitingBadge: {
    fontSize: 12,
    color: '#f97316',
    background: 'rgba(249,115,22,0.1)',
    border: '1px solid rgba(249,115,22,0.3)',
    padding: '5px 12px',
    borderRadius: 20,
    fontWeight: 500
  },
  lastTimeline: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: '8px 12px',
    background: 'rgba(99,102,241,0.05)',
    borderRadius: 8,
    border: '1px solid rgba(99,102,241,0.1)'
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#6366f1',
    flexShrink: 0,
    marginTop: 5
  },
  timelineText: { fontSize: 11, color: '#64748b', lineHeight: 1.5 },

  /* Dropdown */
  dropdown: {
    position: 'absolute',
    top: '110%',
    right: 0,
    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 10,
    padding: '6px',
    zIndex: 100,
    minWidth: 180,
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
  },
  dropdownTitle: {
    fontSize: 10,
    color: '#475569',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '4px 8px 6px'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 7,
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: 13,
    textAlign: 'left',
    transition: 'background 0.15s'
  },

  /* States */
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(99,102,241,0.2)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 80,
    textAlign: 'center'
  },
  retryBtn: {
    marginTop: 16,
    padding: '8px 24px',
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.4)',
    borderRadius: 8,
    color: '#a78bfa',
    cursor: 'pointer',
    fontSize: 14
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 80,
    textAlign: 'center'
  },

  /* Modal */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  modal: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 40px 80px rgba(0,0,0,0.7)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  modalBadge: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 16,
    padding: '4px 10px',
    flexShrink: 0
  },
  imageCompare: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.07)'
  },
  imageBox: { flex: 1, position: 'relative' },
  imageLabel: { fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8 },
  compareImg: { width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 },
  imageArrow: { fontSize: 20, color: '#475569', flexShrink: 0 },
  uploadPlaceholder: {
    width: '100%',
    height: 160,
    background: 'rgba(255,255,255,0.03)',
    border: '2px dashed rgba(99,102,241,0.3)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  changePhotoBtn: {
    marginTop: 6,
    width: '100%',
    padding: '5px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 6,
    color: '#a78bfa',
    cursor: 'pointer',
    fontSize: 11
  },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, color: '#94a3b8', fontWeight: 500, marginBottom: 8 },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#e2e8f0',
    fontSize: 14,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#f87171',
    fontSize: 13,
    marginBottom: 16
  },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9,
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 14
  },
  submitResolutionBtn: {
    padding: '10px 22px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    borderRadius: 9,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  spinner: {
    display: 'inline-block',
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite'
  }
};

// Inject keyframes
if (typeof document !== 'undefined' && !document.getElementById('authority-panel-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'authority-panel-styles';
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    .authority-card:hover { transform: translateY(-2px); border-color: rgba(99,102,241,0.25) !important; }
    .dropdown-item:hover { background: rgba(99,102,241,0.1) !important; }
  `;
  document.head.appendChild(styleEl);
}
