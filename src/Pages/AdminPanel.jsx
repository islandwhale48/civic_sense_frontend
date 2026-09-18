import React, { useState, useEffect, useCallback } from 'react';
import { issueService } from '../services/issueService';

const ADMIN_PIN = 'ADMIN-2026';

/* ─── Priority & Category Config ───────────────────────────────────────────── */
const PRIORITY_COLOR = {
  Critical: { text: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  High:     { text: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
  Medium:   { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  Low:      { text: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' }
};

/* ─── PIN Login Screen ─────────────────────────────────────────────────────── */
function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onUnlock(pin);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(`Incorrect PIN. ${3 - newAttempts > 0 ? `${3 - newAttempts} attempts remaining.` : 'Too many attempts.'}`);
      setPin('');
      if (newAttempts >= 3) {
        setError('Too many failed attempts. Refresh to try again.');
      }
    }
  };

  return (
    <div style={adminStyles.pinPage}>
      {/* Background decoration */}
      <div style={adminStyles.pinBg1} />
      <div style={adminStyles.pinBg2} />

      <div style={adminStyles.pinCard}>
        <div style={adminStyles.pinLogo}>
          <span style={{ fontSize: 32 }}>🔐</span>
        </div>
        <div style={adminStyles.pinBadge}>Admin Portal</div>
        <h1 style={adminStyles.pinTitle}>CivicSense Admin</h1>
        <p style={adminStyles.pinSubtitle}>
          Enter your admin PIN to access the resolution verification dashboard.
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            id="admin-pin-input"
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(''); }}
            placeholder="Enter Admin PIN"
            style={adminStyles.pinInput}
            autoFocus
            disabled={attempts >= 3}
          />
          {error && <div style={adminStyles.pinError}>{error}</div>}
          <button
            id="admin-login-btn"
            type="submit"
            style={adminStyles.pinBtn}
            disabled={!pin || attempts >= 3}
          >
            Unlock Dashboard →
          </button>
        </form>

        <div style={adminStyles.pinHint}>
          <span style={{ opacity: 0.5, fontSize: 12 }}>Demo PIN: </span>
          <code style={{ color: '#a78bfa', fontSize: 12 }}>ADMIN-2026</code>
        </div>
      </div>
    </div>
  );
}

/* ─── Review Modal ─────────────────────────────────────────────────────────── */
function ReviewModal({ issue, adminPin, onClose, onDecision }) {
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!decision) { setError('Please select Approve or Reject.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await issueService.reviewResolution(issue.id, decision, notes, adminPin, 'Admin Officer');
      onDecision(issue.id, decision);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const priority = PRIORITY_COLOR[issue.priority] || PRIORITY_COLOR.Medium;
  const res = issue.resolution || {};

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
    <div style={adminStyles.modalOverlay} onClick={onClose}>
      <div style={adminStyles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={adminStyles.modalHeader}>
          <div>
            <div style={adminStyles.modalTag}>📋 Resolution Review</div>
            <h2 style={adminStyles.modalTitle}>{issue.title}</h2>
            <div style={adminStyles.modalMeta}>
              <span style={adminStyles.issueNumBadge}>{issue.issueNumber}</span>
              <span style={adminStyles.ticketIdBadge}>{issue.ticketId}</span>
              <span style={{ ...adminStyles.priorityChip, color: priority.text, background: priority.bg, border: `1px solid ${priority.border}` }}>
                {issue.priority}
              </span>
            </div>
          </div>
          <button style={adminStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Photo Comparison */}
        <div style={adminStyles.photoSection}>
          <h3 style={adminStyles.sectionTitle}>📸 Photo Evidence</h3>
          <div style={adminStyles.photoGrid}>
            <div style={adminStyles.photoBox}>
              <div style={adminStyles.photoLabel}>🔴 Before — Issue Reported</div>
              {issue.imageUrl ? (
                <img src={issue.imageUrl} alt="Before" style={adminStyles.photo}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div style={adminStyles.noPhoto}>No issue photo</div>
              )}
            </div>
            <div style={adminStyles.photoArrow}>⟶</div>
            <div style={adminStyles.photoBox}>
              <div style={adminStyles.photoLabel}>🟢 After — Work Completed</div>
              {res.afterImageUrl ? (
                <img src={res.afterImageUrl} alt="After" style={adminStyles.photo}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div style={adminStyles.noPhoto}>No completion photo submitted</div>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Details */}
        <div style={adminStyles.resolutionDetails}>
          <h3 style={adminStyles.sectionTitle}>📝 Authority Resolution Report</h3>
          <div style={adminStyles.detailGrid}>
            <div style={adminStyles.detailItem}>
              <span style={adminStyles.detailLabel}>Submitted By</span>
              <span style={adminStyles.detailValue}>{res.submittedBy || 'Authority Officer'}</span>
            </div>
            <div style={adminStyles.detailItem}>
              <span style={adminStyles.detailLabel}>Submitted At</span>
              <span style={adminStyles.detailValue}>{timeAgo(res.submittedAt)}</span>
            </div>
            <div style={adminStyles.detailItem}>
              <span style={adminStyles.detailLabel}>Authority</span>
              <span style={adminStyles.detailValue}>{issue.assignedAuthority || 'N/A'}</span>
            </div>
            <div style={adminStyles.detailItem}>
              <span style={adminStyles.detailLabel}>Ward</span>
              <span style={adminStyles.detailValue}>{issue.jurisdiction?.ward || 'N/A'}</span>
            </div>
          </div>
          <div style={adminStyles.resolutionDesc}>
            <div style={adminStyles.detailLabel}>Work Description</div>
            <div style={adminStyles.resolutionDescText}>{res.description || 'No description provided.'}</div>
          </div>
        </div>

        {/* Original Issue Details */}
        <div style={adminStyles.issueDetails}>
          <h3 style={adminStyles.sectionTitle}>🗂️ Original Issue</h3>
          <div style={adminStyles.issueDescText}>{issue.description}</div>
          <div style={adminStyles.issueMeta}>
            <span>📍 {issue.geoData?.address || issue.location}</span>
            <span>🏷️ {issue.category}</span>
            <span>📅 Reported {timeAgo(issue.createdAt)}</span>
            <span>👍 {issue.upvotes} upvotes</span>
          </div>
        </div>

        {/* Decision */}
        <div style={adminStyles.decisionSection}>
          <h3 style={adminStyles.sectionTitle}>⚖️ Admin Decision</h3>
          <div style={adminStyles.decisionBtns}>
            <button
              id="approve-btn"
              style={{ ...adminStyles.decisionBtn, ...(decision === 'APPROVED' ? adminStyles.approveActive : adminStyles.approveInactive) }}
              onClick={() => setDecision('APPROVED')}
            >
              ✅ Approve — Mark as Resolved
            </button>
            <button
              id="reject-btn"
              style={{ ...adminStyles.decisionBtn, ...(decision === 'REJECTED' ? adminStyles.rejectActive : adminStyles.rejectInactive) }}
              onClick={() => setDecision('REJECTED')}
            >
              ❌ Reject — Send Back for Rework
            </button>
          </div>

          <div style={adminStyles.formGroup}>
            <label style={adminStyles.label}>Admin Notes (Optional)</label>
            <textarea
              style={adminStyles.textarea}
              placeholder={decision === 'REJECTED' ? 'Specify reason for rejection and what needs to be redone...' : 'Optional verification notes or observations...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && <div style={adminStyles.errorBanner}>{error}</div>}

          <div style={adminStyles.actionRow}>
            <button style={adminStyles.cancelBtn} onClick={onClose} disabled={submitting}>Cancel</button>
            <button
              id="confirm-decision-btn"
              style={{ ...adminStyles.confirmBtn, ...(decision === 'APPROVED' ? adminStyles.confirmApprove : decision === 'REJECTED' ? adminStyles.confirmReject : {}) }}
              onClick={handleSubmit}
              disabled={!decision || submitting}
            >
              {submitting ? 'Submitting...' : decision === 'APPROVED' ? '✅ Confirm Approval' : decision === 'REJECTED' ? '❌ Confirm Rejection' : 'Select a Decision'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pending Resolution Card ──────────────────────────────────────────────── */
function ResolutionCard({ issue, onReview }) {
  const res = issue.resolution || {};
  const priority = PRIORITY_COLOR[issue.priority] || PRIORITY_COLOR.Medium;

  const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  };

  return (
    <div style={adminStyles.resCard}>
      {/* Card top */}
      <div style={adminStyles.resCardTop}>
        <div style={adminStyles.resCardLeft}>
          <div style={adminStyles.resCardMeta}>
            <span style={adminStyles.resIssueNum}>{issue.issueNumber}</span>
            <span style={adminStyles.resDot}>•</span>
            <span style={{ ...adminStyles.priorityChip, color: priority.text, background: priority.bg, border: `1px solid ${priority.border}` }}>
              {issue.priority}
            </span>
            {issue.sla?.isEscalated && (
              <span style={adminStyles.escalatedChip}>⚡ Escalated</span>
            )}
          </div>
          <h3 style={adminStyles.resCardTitle}>{issue.title}</h3>
          <div style={adminStyles.resCardAuthority}>
            🏛️ {issue.assignedAuthority || 'Authority Not Assigned'}
          </div>
        </div>
        <div style={adminStyles.resCardRight}>
          <div style={adminStyles.submittedAgo}>
            <div style={adminStyles.submittedLabel}>Resolution Submitted</div>
            <div style={adminStyles.submittedTime}>{timeAgo(res.submittedAt)}</div>
          </div>
        </div>
      </div>

      {/* Photo thumbnails */}
      <div style={adminStyles.photoThumbs}>
        <div style={adminStyles.thumbBox}>
          <div style={adminStyles.thumbLabel}>Before</div>
          {issue.imageUrl ? (
            <img src={issue.imageUrl} alt="Before" style={adminStyles.thumb}
              onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div style={adminStyles.noThumb}>—</div>
          )}
        </div>
        <div style={adminStyles.thumbArrow}>→</div>
        <div style={adminStyles.thumbBox}>
          <div style={adminStyles.thumbLabel}>After</div>
          {res.afterImageUrl ? (
            <img src={res.afterImageUrl} alt="After" style={adminStyles.thumb}
              onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div style={adminStyles.noThumb}>No photo</div>
          )}
        </div>
        <div style={adminStyles.resDescSnippet}>
          <div style={adminStyles.thumbLabel}>Work Summary</div>
          <div style={adminStyles.resDescText}>
            {res.description ? res.description.slice(0, 120) + (res.description.length > 120 ? '...' : '') : 'No description provided.'}
          </div>
          <div style={adminStyles.submittedBy}>by {res.submittedBy || 'Authority'}</div>
        </div>
      </div>

      {/* Card footer */}
      <div style={adminStyles.resCardFooter}>
        <div style={adminStyles.resCardStats}>
          <span>📍 {issue.geoData?.ward || issue.jurisdiction?.ward || '—'}</span>
          <span>🏷️ {issue.category}</span>
          <span>👍 {issue.upvotes || 0} upvotes</span>
        </div>
        <button id={`review-btn-${issue.id}`} style={adminStyles.reviewBtn} onClick={() => onReview(issue)}>
          Review Resolution →
        </button>
      </div>
    </div>
  );
}

/* ─── Admin Panel ──────────────────────────────────────────────────────────── */
export default function AdminPanel() {
  const [unlocked, setUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewingIssue, setReviewingIssue] = useState(null);
  const [recentDecisions, setRecentDecisions] = useState([]);

  const fetchPending = useCallback(async (pin) => {
    setLoading(true);
    setError('');
    try {
      const data = await issueService.getPendingResolutions(pin);
      setIssues(data.issues || []);
      setStats(data.stats || {});
    } catch (err) {
      setError(err.message || 'Failed to load resolution queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUnlock = (pin) => {
    setAdminPin(pin);
    setUnlocked(true);
    fetchPending(pin);
  };

  const handleDecision = (issueId, decision) => {
    const issue = issues.find(i => i.id === issueId);
    setIssues(prev => prev.filter(i => i.id !== issueId));
    setRecentDecisions(prev => [{ issue, decision, at: new Date().toISOString() }, ...prev.slice(0, 9)]);
    // Refresh stats
    fetchPending(adminPin);
  };

  if (!unlocked) {
    return <PinGate onUnlock={handleUnlock} />;
  }

  return (
    <div style={adminStyles.page}>
      {/* Header */}
      <div style={adminStyles.header}>
        <div style={adminStyles.headerContent}>
          <div style={adminStyles.headerLeft}>
            <div style={adminStyles.adminLogo}>⚖️</div>
            <div>
              <div style={adminStyles.adminBadge}>Admin Verification Panel</div>
              <h1 style={adminStyles.adminTitle}>CivicSense Admin Dashboard</h1>
              <p style={adminStyles.adminSubtitle}>Review & approve authority resolution submissions</p>
            </div>
          </div>
          <div style={adminStyles.headerRight}>
            <button style={adminStyles.refreshBtn} onClick={() => fetchPending(adminPin)}>
              🔄 Refresh Queue
            </button>
            <a href="/" style={adminStyles.citizenLink}>← Citizen View</a>
            <a href="/authority" style={adminStyles.citizenLink}>↗ Authority Panel</a>
          </div>
        </div>

        {/* Stats Row */}
        <div style={adminStyles.statsRow}>
          {[
            { label: 'Total Issues', value: stats.totalIssues || 0, icon: '📋', color: '#a78bfa' },
            { label: 'Pending Review', value: stats.pendingReview || 0, icon: '⏳', color: '#f59e0b' },
            { label: 'Approved', value: stats.approved || 0, icon: '✅', color: '#10b981' },
            { label: 'Rejected', value: stats.rejected || 0, icon: '❌', color: '#ef4444' },
            { label: 'Total Resolved', value: stats.totalResolved || 0, icon: '🏆', color: '#6366f1' }
          ].map((s) => (
            <div key={s.label} style={adminStyles.statCard}>
              <div style={adminStyles.statIcon}>{s.icon}</div>
              <div style={{ ...adminStyles.statValue, color: s.color }}>{s.value}</div>
              <div style={adminStyles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={adminStyles.content}>
        <div style={adminStyles.contentGrid}>
          {/* Main Queue */}
          <div style={adminStyles.mainCol}>
            <div style={adminStyles.sectionHeader}>
              <h2 style={adminStyles.sectionTitle2}>
                ⏳ Pending Resolutions
                {issues.length > 0 && (
                  <span style={adminStyles.queueCount}>{issues.length}</span>
                )}
              </h2>
              <p style={adminStyles.sectionDesc}>
                These are resolution requests submitted by authorities awaiting your verification.
              </p>
            </div>

            {loading ? (
              <div style={adminStyles.loadingState}>
                <div style={adminStyles.spinner} />
                <p style={{ color: '#64748b', marginTop: 16 }}>Loading resolution queue...</p>
              </div>
            ) : error ? (
              <div style={adminStyles.errorState}>
                <div style={{ fontSize: 48 }}>⚠️</div>
                <p style={{ color: '#f87171', marginTop: 12 }}>{error}</p>
                <button style={adminStyles.retryBtn} onClick={() => fetchPending(adminPin)}>Retry</button>
              </div>
            ) : issues.length === 0 ? (
              <div style={adminStyles.emptyState}>
                <div style={{ fontSize: 64 }}>✅</div>
                <h3 style={{ color: '#10b981', marginTop: 16 }}>Queue is Clear!</h3>
                <p style={{ color: '#64748b', marginTop: 8 }}>
                  No pending resolution requests at this time. All submissions have been reviewed.
                </p>
              </div>
            ) : (
              <div style={adminStyles.cardsCol}>
                {issues.map(issue => (
                  <ResolutionCard key={issue.id} issue={issue} onReview={setReviewingIssue} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Recent Decisions */}
          <div style={adminStyles.sideCol}>
            <div style={adminStyles.sideCard}>
              <h3 style={adminStyles.sideTitle}>📊 Recent Decisions</h3>
              {recentDecisions.length === 0 ? (
                <p style={{ color: '#475569', fontSize: 13 }}>No decisions made yet in this session.</p>
              ) : (
                <div style={adminStyles.decisionList}>
                  {recentDecisions.map((d, idx) => (
                    <div key={idx} style={adminStyles.decisionEntry}>
                      <div style={{ ...adminStyles.decisionBadge, ...(d.decision === 'APPROVED' ? adminStyles.decisionApproved : adminStyles.decisionRejected) }}>
                        {d.decision === 'APPROVED' ? '✅ Approved' : '❌ Rejected'}
                      </div>
                      <div style={adminStyles.decisionIssueName}>{d.issue?.title?.slice(0, 50)}</div>
                      <div style={adminStyles.decisionIssueNum}>{d.issue?.issueNumber}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How-to guide */}
            <div style={adminStyles.sideCard}>
              <h3 style={adminStyles.sideTitle}>📖 Verification Guide</h3>
              <div style={adminStyles.guideSteps}>
                {[
                  { n: '1', text: 'Review before/after photos carefully' },
                  { n: '2', text: 'Read the authority work description' },
                  { n: '3', text: 'Verify the issue is genuinely resolved' },
                  { n: '4', text: 'Approve to close the issue, or reject with a reason' },
                  { n: '5', text: 'Rejected tickets go back to the authority for rework' }
                ].map((step) => (
                  <div key={step.n} style={adminStyles.guideStep}>
                    <div style={adminStyles.guideNum}>{step.n}</div>
                    <div style={adminStyles.guideText}>{step.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingIssue && (
        <ReviewModal
          issue={reviewingIssue}
          adminPin={adminPin}
          onClose={() => setReviewingIssue(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}

/* ─── Admin Styles ─────────────────────────────────────────────────────────── */
const adminStyles = {
  /* PIN Gate */
  pinPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #020817 0%, #0f172a 50%, #080e1d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  pinBg1: {
    position: 'absolute',
    width: 600,
    height: 600,
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    top: -100,
    left: -100,
    pointerEvents: 'none'
  },
  pinBg2: {
    position: 'absolute',
    width: 400,
    height: 400,
    background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
    bottom: -50,
    right: -50,
    pointerEvents: 'none'
  },
  pinCard: {
    background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: 20,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
    position: 'relative',
    zIndex: 1
  },
  pinLogo: {
    width: 72,
    height: 72,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  pinBadge: {
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 10
  },
  pinTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#f1f5f9',
    margin: '0 0 10px',
    textAlign: 'center'
  },
  pinSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 1.5
  },
  pinInput: {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 10,
    color: '#e2e8f0',
    fontSize: 16,
    outline: 'none',
    marginBottom: 12,
    boxSizing: 'border-box',
    textAlign: 'center',
    letterSpacing: '0.15em',
    fontFamily: 'monospace'
  },
  pinError: {
    color: '#f87171',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center'
  },
  pinBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  pinHint: {
    marginTop: 20,
    fontSize: 12,
    color: '#334155'
  },

  /* Main layout */
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #020817 0%, #0a1120 50%, #050d18 100%)',
    color: '#e2e8f0',
    fontFamily: "'Inter', -apple-system, sans-serif",
    paddingBottom: 60
  },
  header: {
    background: 'rgba(5,10,25,0.97)',
    borderBottom: '1px solid rgba(239,68,68,0.15)',
    padding: '24px 32px 0',
    backdropFilter: 'blur(12px)'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 20
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  adminLogo: {
    fontSize: 36,
    background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 14,
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  adminBadge: {
    fontSize: 11,
    color: '#f87171',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  adminTitle: { fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  adminSubtitle: { fontSize: 13, color: '#64748b', margin: '4px 0 0' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' },
  refreshBtn: {
    padding: '8px 16px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 8,
    color: '#f87171',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500
  },
  citizenLink: {
    padding: '8px 14px',
    border: '1px solid rgba(100,116,139,0.3)',
    borderRadius: 8,
    color: '#94a3b8',
    fontSize: 13,
    textDecoration: 'none',
    display: 'block'
  },

  /* Stats */
  statsRow: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    paddingBottom: 20,
    scrollbarWidth: 'none'
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: '12px 24px',
    textAlign: 'center',
    minWidth: 110,
    flexShrink: 0
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 11, color: '#475569', marginTop: 4, whiteSpace: 'nowrap' },

  /* Content */
  content: { padding: '24px 32px' },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 24,
    alignItems: 'flex-start'
  },
  mainCol: {},
  sectionHeader: { marginBottom: 20 },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f1f5f9',
    margin: '0 0 6px',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  queueCount: {
    background: 'rgba(245,158,11,0.2)',
    color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.3)',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700
  },
  sectionDesc: { fontSize: 13, color: '#475569', margin: 0 },
  cardsCol: { display: 'flex', flexDirection: 'column', gap: 16 },

  /* States */
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60 },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid rgba(239,68,68,0.2)',
    borderTopColor: '#ef4444',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  errorState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    padding: '8px 24px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    color: '#f87171',
    cursor: 'pointer',
    fontSize: 14
  },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, textAlign: 'center' },

  /* Sidebar */
  sideCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  sideCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 20
  },
  sideTitle: { fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 16px' },
  decisionList: { display: 'flex', flexDirection: 'column', gap: 10 },
  decisionEntry: {
    padding: 12,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 9,
    border: '1px solid rgba(255,255,255,0.06)'
  },
  decisionBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
    display: 'inline-block',
    marginBottom: 6
  },
  decisionApproved: {
    color: '#10b981',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)'
  },
  decisionRejected: {
    color: '#ef4444',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)'
  },
  decisionIssueName: { fontSize: 12, color: '#94a3b8', lineHeight: 1.4 },
  decisionIssueNum: { fontSize: 11, color: '#475569', marginTop: 3 },
  guideSteps: { display: 'flex', flexDirection: 'column', gap: 10 },
  guideStep: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  guideNum: {
    width: 22,
    height: 22,
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#a78bfa',
    flexShrink: 0
  },
  guideText: { fontSize: 12, color: '#64748b', lineHeight: 1.5, paddingTop: 2 },

  /* Resolution Card */
  resCard: {
    background: 'linear-gradient(135deg, rgba(10,15,30,0.95), rgba(20,30,50,0.9))',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 20,
    transition: 'all 0.2s'
  },
  resCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12
  },
  resCardLeft: { flex: 1 },
  resCardRight: { flexShrink: 0 },
  resCardMeta: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 },
  resIssueNum: { fontSize: 12, color: '#a78bfa', fontWeight: 700 },
  resDot: { color: '#334155' },
  priorityChip: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 600
  },
  escalatedChip: {
    fontSize: 11,
    color: '#ef4444',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 600
  },
  resCardTitle: { fontSize: 15, fontWeight: 600, color: '#f1f5f9', margin: '0 0 6px', lineHeight: 1.4 },
  resCardAuthority: { fontSize: 12, color: '#475569' },
  submittedAgo: { textAlign: 'right' },
  submittedLabel: { fontSize: 10, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' },
  submittedTime: { fontSize: 16, fontWeight: 700, color: '#f59e0b', marginTop: 3 },
  photoThumbs: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 14,
    padding: 14,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.06)'
  },
  thumbBox: { flex: 0, minWidth: 80 },
  thumbLabel: { fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase' },
  thumb: { width: 80, height: 60, objectFit: 'cover', borderRadius: 6 },
  noThumb: {
    width: 80,
    height: 60,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#334155',
    fontSize: 11
  },
  thumbArrow: { color: '#334155', fontSize: 16, marginTop: 20, flexShrink: 0 },
  resDescSnippet: { flex: 1 },
  resDescText: { fontSize: 12, color: '#94a3b8', lineHeight: 1.5 },
  submittedBy: { fontSize: 11, color: '#475569', marginTop: 6 },
  resCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  resCardStats: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  },
  reviewBtn: {
    padding: '8px 18px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))',
    border: '1px solid rgba(99,102,241,0.4)',
    borderRadius: 8,
    color: '#a78bfa',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
    transition: 'all 0.2s'
  },

  /* Modal */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  modal: {
    background: 'linear-gradient(135deg, #0a1120 0%, #1e293b 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 28,
    width: '100%',
    maxWidth: 760,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 40px 80px rgba(0,0,0,0.8)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16
  },
  modalTag: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' },
  modalMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  issueNumBadge: {
    fontSize: 12,
    color: '#a78bfa',
    background: 'rgba(167,139,250,0.1)',
    border: '1px solid rgba(167,139,250,0.2)',
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 700
  },
  ticketIdBadge: { fontSize: 11, color: '#475569' },
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
  photoSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 12px', letterSpacing: '0.03em' },
  photoGrid: { display: 'flex', gap: 16, alignItems: 'center' },
  photoBox: { flex: 1 },
  photoLabel: { fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: '0.05em' },
  photo: { width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' },
  noPhoto: {
    width: '100%',
    height: 180,
    background: 'rgba(255,255,255,0.03)',
    border: '2px dashed rgba(255,255,255,0.1)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#334155',
    fontSize: 13
  },
  photoArrow: { fontSize: 20, color: '#334155', flexShrink: 0 },
  resolutionDetails: {
    padding: 16,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.07)',
    marginBottom: 16
  },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  detailItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  detailLabel: { fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' },
  detailValue: { fontSize: 13, color: '#cbd5e1' },
  resolutionDesc: { marginTop: 8 },
  resolutionDescText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.6,
    marginTop: 6,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.05)'
  },
  issueDetails: {
    padding: 16,
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.05)',
    marginBottom: 16
  },
  issueDescText: { fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 },
  issueMeta: { display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#475569' },
  decisionSection: {
    padding: 20,
    background: 'rgba(99,102,241,0.05)',
    borderRadius: 12,
    border: '1px solid rgba(99,102,241,0.15)'
  },
  decisionBtns: { display: 'flex', gap: 10, marginBottom: 16 },
  decisionBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.2s',
    border: '2px solid transparent'
  },
  approveInactive: {
    background: 'rgba(16,185,129,0.08)',
    border: '2px solid rgba(16,185,129,0.2)',
    color: '#6ee7b7'
  },
  approveActive: {
    background: 'rgba(16,185,129,0.2)',
    border: '2px solid #10b981',
    color: '#34d399'
  },
  rejectInactive: {
    background: 'rgba(239,68,68,0.08)',
    border: '2px solid rgba(239,68,68,0.2)',
    color: '#fca5a5'
  },
  rejectActive: {
    background: 'rgba(239,68,68,0.2)',
    border: '2px solid #ef4444',
    color: '#f87171'
  },
  formGroup: { marginBottom: 14 },
  label: { display: 'block', fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 6 },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 13,
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
    marginBottom: 14
  },
  actionRow: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9,
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 14
  },
  confirmBtn: {
    padding: '10px 22px',
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 9,
    color: '#a78bfa',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.2s'
  },
  confirmApprove: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    color: '#fff'
  },
  confirmReject: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: 'none',
    color: '#fff'
  }
};

// Inject keyframes for admin panel
if (typeof document !== 'undefined' && !document.getElementById('admin-panel-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'admin-panel-styles';
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 900px) {
      .admin-content-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(styleEl);
}
