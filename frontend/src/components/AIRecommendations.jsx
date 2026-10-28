/**
 * AIRecommendations — GrantMatch
 * ================================
 * Polished "AI Scholarship Recommendations" panel integrated into the Dashboard.
 * Fetches results from /api/recommendations which runs the deterministic eligibility
 * engine + optional ML re-ranking from the Python FastAPI service.
 *
 * Design rules:
 *  - No fake confidence percentages.
 *  - No fabricated AI explanations.
 *  - Shows verified eligibility status per scholarship.
 *  - Displays profile gaps so users know what to complete.
 *  - Handles loading, empty, error, and retry states.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, CheckCircle2, AlertCircle, XCircle,
  ExternalLink, ChevronDown, ChevronUp, RefreshCw,
  Brain, Info, Clock, IndianRupee, FileText,
  AlertTriangle, User, Zap
} from 'lucide-react';
import { api } from '../services/api';

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'Variable';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

// Eligibility badge config
const ELIGIBILITY_CONFIG = {
  eligible: {
    label: 'Eligible',
    icon: CheckCircle2,
    color: 'var(--emerald-600)',
    bg: 'var(--emerald-50)',
    border: 'rgba(5, 150, 105, 0.25)',
  },
  partial: {
    label: 'Partial Match',
    icon: AlertCircle,
    color: 'var(--amber-600)',
    bg: 'var(--amber-50)',
    border: 'rgba(217, 119, 6, 0.25)',
  },
  ineligible: {
    label: 'Not Eligible',
    icon: XCircle,
    color: 'var(--rose-600)',
    bg: 'var(--rose-50)',
    border: 'rgba(220, 38, 38, 0.2)',
  },
};

// ---------------------------------------------------------------------------
// Single Scholarship Card
// ---------------------------------------------------------------------------
function RecommendationCard({ rec, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = ELIGIBILITY_CONFIG[rec.eligibilityStatus] || ELIGIBILITY_CONFIG.partial;
  const EligIcon = cfg.icon;

  const isUrgent = rec.daysRemaining !== undefined && rec.daysRemaining <= 14;
  const showML   = rec.aiRanked && rec.ml_rank_score !== null;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.35rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow var(--transition-normal), transform var(--transition-fast)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Rank badge */}
      <div style={{
        position: 'absolute', top: '1rem', right: '1rem',
        background: index < 3 ? 'var(--lime-card)' : 'var(--bg-card-subtle)',
        color: index < 3 ? 'var(--lime-text)' : 'var(--text-muted)',
        fontWeight: 800, fontSize: '0.7rem',
        padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)',
        letterSpacing: '0.04em',
      }}>
        #{index + 1}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 'var(--radius-md)',
          background: `${cfg.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: `1px solid ${cfg.border}`,
        }}>
          <EligIcon size={20} color={cfg.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, marginBottom: '0.25rem', paddingRight: '3rem' }}>
            {rec.name}
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {rec.provider} · {rec.type}
          </div>
        </div>
      </div>

      {/* Key metrics row */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap',
        marginBottom: '0.9rem', paddingBottom: '0.9rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {/* Eligibility badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: cfg.bg, color: cfg.color,
          padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem', fontWeight: 700, border: `1px solid ${cfg.border}`,
        }}>
          <EligIcon size={13} />
          {cfg.label}
        </span>

        {/* Match % */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: 'var(--primary-50)', color: 'var(--primary-700)',
          padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem', fontWeight: 600,
        }}>
          <Zap size={12} />
          {rec.eligibilityMatch}% Match
        </span>

        {/* Award amount */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          color: 'var(--text-muted)', fontSize: '0.8rem',
        }}>
          <IndianRupee size={13} />
          {formatCurrency(rec.fundingAmount)}
        </span>

        {/* Deadline */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          color: isUrgent ? 'var(--rose-600)' : 'var(--text-muted)',
          fontSize: '0.8rem', fontWeight: isUrgent ? 700 : 400,
        }}>
          <Clock size={13} />
          {isUrgent
            ? `URGENT — ${rec.daysRemaining}d left`
            : `Due: ${formatDate(rec.deadline)}`}
        </span>
      </div>

      {/* Why it matches */}
      {rec.matchExplanation && rec.eligibilityStatus !== 'ineligible' && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Why it matches
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
            {rec.matchExplanation}
          </div>
        </div>
      )}

      {/* Gaps / missing info */}
      {rec.gaps && rec.gaps.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--amber-600)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚠ Needs Verification / Gaps
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {rec.gaps.slice(0, 3).map((g, i) => (
              <li key={i} style={{ fontSize: '0.83rem', color: 'var(--amber-600)', marginBottom: '0.15rem' }}>{g}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Expand/Collapse toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600,
          padding: '0.2rem 0', marginBottom: expanded ? '0.75rem' : 0,
        }}
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Show less' : 'View details'}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          {/* Criteria breakdown */}
          {rec.breakdown && rec.breakdown.length > 0 && (
            <div style={{ marginBottom: '0.9rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Eligibility Criteria Breakdown
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {rec.breakdown.map((b, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem', fontWeight: 600,
                      background: b.status === 'match' ? 'var(--emerald-50)' : b.status === 'gap' ? 'var(--rose-50)' : 'var(--amber-50)',
                      color: b.status === 'match' ? 'var(--emerald-600)' : b.status === 'gap' ? 'var(--rose-600)' : 'var(--amber-600)',
                    }}
                  >
                    {b.status === 'match' ? '✓' : b.status === 'gap' ? '✗' : '?'} {b.criterion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required docs */}
          {rec.requiredDocuments && rec.requiredDocuments.length > 0 && (
            <div style={{ marginBottom: '0.9rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <FileText size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                Required Documents
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {rec.requiredDocuments.map((doc, i) => (
                  <li key={i} style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{doc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI ranking notice */}
          {showML && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--purple-50)', borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
            }}>
              <Brain size={14} color="var(--purple-500)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--purple-500)', fontWeight: 600 }}>
                ML Ranking Score: {(rec.ml_rank_score * 100).toFixed(0)}% · Advisory only (synthetic training data)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      <a
        href={rec.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: rec.eligibilityStatus === 'eligible' ? 'var(--primary-800)' : 'var(--bg-card-subtle)',
          color: rec.eligibilityStatus === 'eligible' ? '#fff' : 'var(--text-muted)',
          padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-md)',
          fontSize: '0.83rem', fontWeight: 700, textDecoration: 'none',
          marginTop: '0.75rem',
          transition: 'opacity var(--transition-fast)',
          pointerEvents: rec.officialUrl ? 'auto' : 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        <ExternalLink size={13} />
        Apply on Official Portal
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Completeness Banner
// ---------------------------------------------------------------------------
function ProfileGapsBanner({ gaps, onGoToProfile }) {
  if (!gaps || gaps.length === 0) return null;
  return (
    <div style={{
      background: 'var(--amber-50)',
      border: '1px solid rgba(217, 119, 6, 0.25)',
      borderRadius: 'var(--radius-md)',
      padding: '0.9rem 1.2rem',
      marginBottom: '1.25rem',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    }}>
      <AlertTriangle size={18} color="var(--amber-600)" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--amber-600)', marginBottom: '0.3rem' }}>
          Complete your profile for better matches
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--amber-600)', lineHeight: 1.5 }}>
          {gaps.join(' · ')}
        </div>
      </div>
      {onGoToProfile && (
        <button
          onClick={onGoToProfile}
          style={{
            background: 'var(--amber-600)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-md)',
            padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          Update Profile
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AIRecommendations Component
// ---------------------------------------------------------------------------
export default function AIRecommendations({ user, setTab, autoLoad = false }) {
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [data, setData]   = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | eligible | partial

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    setState('loading');
    setError('');
    try {
      const res = await api.getAIRecommendations();
      if (res.success) {
        setData(res);
        setState('success');
      } else {
        throw new Error(res.message || 'Failed to load recommendations.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setState('error');
    }
  }, [user]);

  useEffect(() => {
    if (autoLoad && user && state === 'idle') {
      fetchRecommendations();
    }
  }, [autoLoad, user, fetchRecommendations, state]);

  // Filtered recommendations
  const filteredRecs = data?.recommendations?.filter(r => {
    if (filter === 'eligible') return r.eligibilityStatus === 'eligible';
    if (filter === 'partial')  return ['eligible', 'partial'].includes(r.eligibilityStatus);
    return true;
  }) || [];

  // ── Not logged in ──
  if (!user) {
    return (
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        padding: '2.5rem', textAlign: 'center',
        border: '1.5px dashed var(--border-light)',
      }}>
        <Sparkles size={40} color="var(--primary-400)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI Scholarship Recommendations</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Log in to receive personalised scholarship recommendations based on your profile.
        </p>
      </div>
    );
  }

  // ── IDLE state ──
  if (state === 'idle') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-700) 60%, #2d6a4f 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orb */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 220, height: 220,
          background: 'rgba(200, 241, 105, 0.08)', borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            background: 'rgba(200, 241, 105, 0.15)',
            color: 'var(--lime-300)', borderRadius: 'var(--radius-full)',
            padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 700,
            marginBottom: '1rem', letterSpacing: '0.05em',
            border: '1px solid rgba(200, 241, 105, 0.25)',
          }}>
            <Brain size={13} />
            AI-POWERED · DETERMINISTIC ELIGIBILITY ENGINE
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.6rem', lineHeight: 1.25 }}>
            Find My Scholarships
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem', maxWidth: 520 }}>
            Get personalized scholarship recommendations based on your existing profile —
            education level, marks, income, category, state, and more. No duplicate data entry needed.
          </p>

          <button
            id="ai-recommend-btn"
            onClick={fetchRecommendations}
            style={{
              background: 'var(--lime-card)',
              color: 'var(--lime-text)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-lime)',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Sparkles size={17} />
            Find My Scholarships
          </button>

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={13} color="rgba(255,255,255,0.45)" />
            <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)' }}>
              Uses your saved profile. No extra information required.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING state ──
  if (state === 'loading') {
    return (
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        padding: '3rem', textAlign: 'center',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          border: '3px solid var(--border-light)',
          borderTopColor: 'var(--primary-600)',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1.25rem',
        }} />
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>
          Analysing your profile…
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Running eligibility engine across all active scholarships
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── ERROR state ──
  if (state === 'error') {
    return (
      <div style={{
        background: 'var(--rose-50)', border: '1.5px solid rgba(220,38,38,0.2)',
        borderRadius: 'var(--radius-xl)', padding: '2rem', textAlign: 'center',
      }}>
        <XCircle size={36} color="var(--rose-600)" style={{ marginBottom: '0.75rem' }} />
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--rose-600)', marginBottom: '0.35rem' }}>
          Could not load recommendations
        </div>
        <div style={{ color: 'var(--rose-600)', fontSize: '0.875rem', marginBottom: '1.25rem', opacity: 0.8 }}>
          {error}
        </div>
        <button
          onClick={fetchRecommendations}
          style={{
            background: 'var(--rose-600)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius-md)', padding: '0.6rem 1.4rem',
            fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  // ── SUCCESS state ──
  const { eligible = 0, partial = 0, ineligible = 0, aiAssisted, profileGaps, aiModelMeta } = data || {};
  const totalShown = filteredRecs.length;

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={20} color="var(--primary-600)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>AI Scholarship Recommendations</h2>
            {aiAssisted && (
              <span style={{
                background: 'var(--purple-50)', color: 'var(--purple-500)',
                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)', border: '1px solid rgba(139,92,246,0.2)',
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              }}>
                <Brain size={11} /> ML Ranked
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>{eligible} fully eligible</span>
            {' · '}
            <span style={{ color: 'var(--amber-600)', fontWeight: 600 }}>{partial} partial match</span>
            {' · '}
            <span style={{ color: 'var(--text-light)' }}>{ineligible} not eligible</span>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          title="Refresh recommendations"
          style={{
            background: 'var(--bg-card-subtle)', color: 'var(--text-muted)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Profile gaps banner */}
      <ProfileGapsBanner gaps={profileGaps} onGoToProfile={() => setTab && setTab('profile')} />

      {/* Filter tabs */}
      {data?.total > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all',      label: 'All Opportunities', count: data.total },
            { key: 'eligible', label: 'Eligible',          count: eligible },
            { key: 'partial',  label: 'Eligible + Partial', count: eligible + partial },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                background: filter === f.key ? 'var(--primary-800)' : 'var(--bg-card)',
                color: filter === f.key ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${filter === f.key ? 'var(--primary-800)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {f.label}
              <span style={{
                marginLeft: '0.4rem', background: filter === f.key ? 'rgba(255,255,255,0.2)' : 'var(--bg-card-subtle)',
                padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem',
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Recommendation cards */}
      {totalShown === 0 ? (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
          padding: '2.5rem', textAlign: 'center',
          border: '1px dashed var(--border-light)',
        }}>
          <User size={36} color="var(--text-light)" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
            No scholarships found for this filter
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Try "All Opportunities" or update your profile for more matches.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRecs.map((rec, i) => (
            <RecommendationCard key={String(rec._id)} rec={rec} index={i} />
          ))}
        </div>
      )}

      {/* Footer disclaimer */}
      <div style={{
        marginTop: '1.5rem', padding: '0.9rem 1.1rem',
        background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
      }}>
        <Info size={14} color="var(--text-light)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: '0.76rem', color: 'var(--text-light)', lineHeight: 1.55, margin: 0 }}>
          {data?.disclaimer}
          {aiAssisted && aiModelMeta && (
            <> ML model F1: {aiModelMeta.f1} · <em>{aiModelMeta.warning}</em></>
          )}
        </p>
      </div>
    </div>
  );
}
