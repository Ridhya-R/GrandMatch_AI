import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Bookmark,
  Calendar,
  DollarSign,
  GraduationCap,
  BookOpen,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  MapPin,
  Clock,
  Phone,
  Info
} from 'lucide-react';
import DisclaimerBanner from './DisclaimerBanner';
import { api } from '../services/api';

export default function OpportunityModal({
  opp,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  user,
  onApplicationUpdated
}) {
  const [appStatus, setAppStatus] = useState('Not Started');
  const [appNotes, setAppNotes] = useState('');
  const [savingApp, setSavingApp] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (opp && user) {
      fetchCurrentApplication();
    }
  }, [opp, user]);

  const fetchCurrentApplication = async () => {
    try {
      const res = await api.getApplications();
      if (res.success && res.applications) {
        const found = res.applications.find(a => a.opportunity._id === opp._id);
        if (found) {
          setAppStatus(found.status);
          setAppNotes(found.notes || '');
        } else {
          setAppStatus('Not Started');
          setAppNotes('');
        }
      }
    } catch (err) {
      console.warn('Failed to load application status:', err);
    }
  };

  const handleUpdateApplicationStatus = async () => {
    if (!user) return;
    setSavingApp(true);
    setStatusMessage('');
    try {
      const res = await api.saveApplication({
        opportunityId: opp._id,
        status: appStatus,
        notes: appNotes,
      });
      if (res.success) {
        setStatusMessage('Application tracking updated!');
        if (onApplicationUpdated) onApplicationUpdated();
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setSavingApp(false);
    }
  };

  if (!isOpen || !opp) return null;

  const deadlineDate = new Date(opp.deadline).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedAmount = opp.fundingAmount > 0
    ? `₹${opp.fundingAmount.toLocaleString('en-IN')}`
    : opp.fundingType || 'Full / Variable Funding';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {opp.provider}
            </div>
            <h2 style={{ fontSize: '1.45rem', marginTop: '0.2rem' }}>{opp.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Key Facts Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              background: 'var(--bg-main)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-light)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OPPORTUNITY TYPE</div>
              <div style={{ fontWeight: 700, color: 'var(--primary-800)', marginTop: '0.2rem' }}>{opp.type}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>FUNDING AMOUNT</div>
              <div style={{ fontWeight: 700, color: 'var(--emerald-600)', fontSize: '1.1rem', marginTop: '0.1rem' }}>
                {formattedAmount}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>APPLICATION DEADLINE</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>{deadlineDate}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</div>
              <div style={{ fontWeight: 700, color: opp.status === 'Expired' ? 'var(--rose-600)' : 'var(--emerald-600)', marginTop: '0.2rem' }}>
                {opp.status}
              </div>
            </div>
          </div>

          {/* Rule-Based Eligibility Match Breakdown */}
          {opp.eligibilityMatch !== null && opp.eligibilityMatch !== undefined && (
            <div
              className="card"
              style={{
                padding: '1.25rem',
                marginBottom: '1.5rem',
                borderLeft: '4px solid var(--primary-600)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  Rule-Based Eligibility Match: {opp.eligibilityMatch}%
                </span>
                <span className="badge badge-blue">Deterministic backend logic</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--emerald-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={16} /> Criteria Satisfied
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.825rem' }}>
                    {opp.reasons?.length ? (
                      opp.reasons.map((r, i) => (
                        <li key={i} style={{ color: '#065f46', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <span>✓</span> <span>{r}</span>
                        </li>
                      ))
                    ) : (
                      <li style={{ color: 'var(--text-muted)' }}>No explicit criteria matched yet.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--rose-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <XCircle size={16} /> Criteria Gaps or Requirements
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.825rem' }}>
                    {opp.gaps?.length ? (
                      opp.gaps.map((g, i) => (
                        <li key={i} style={{ color: '#b91c1c', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <span>✗</span> <span>{g}</span>
                        </li>
                      ))
                    ) : (
                      <li style={{ color: 'var(--text-muted)' }}>No critical criteria unmet.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Opportunity Description</h3>
            <p style={{ color: '#334155', lineHeight: 1.6, fontSize: '0.925rem' }}>
              {opp.description || 'No detailed description provided by administrator.'}
            </p>
          </div>

          {/* Eligibility Requirements Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Eligibility Criteria</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.85rem',
                fontSize: '0.875rem',
              }}
            >
              <div className="card" style={{ padding: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>EDUCATION LEVEL</span>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                  {opp.educationLevels?.join(', ') || 'Any Level'}
                </div>
              </div>

              <div className="card" style={{ padding: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>ELIGIBLE FIELDS / STREAMS</span>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                  {opp.fields?.join(', ') || 'Any Stream'}
                </div>
              </div>

              <div className="card" style={{ padding: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>MINIMUM ACADEMIC SCORE</span>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                  {opp.minimumPercentage ? `≥ ${opp.minimumPercentage}%` : 'No minimum restriction'}
                </div>
              </div>

              <div className="card" style={{ padding: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>FAMILY INCOME CEILING</span>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                  {opp.incomeLimit ? `Up to ₹${opp.incomeLimit.toLocaleString()}/year` : 'No income ceiling'}
                </div>
              </div>

              <div className="card" style={{ padding: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>AGE REQUIREMENT</span>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                  {opp.minAge || opp.maxAge < 100 ? `${opp.minAge || 0} to ${opp.maxAge} years` : 'Open to all ages'}
                </div>
              </div>

              <div className="card" style={{ padding: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>GENDER & CATEGORY</span>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                  {opp.genderEligibility || 'Any'} | {opp.categoryEligibility?.join(', ') || 'Any'}
                </div>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          {opp.requiredDocuments?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileCheck size={18} /> Required Documents for Application
              </h3>
              <ul style={{ paddingLeft: '1.25rem', color: '#334155', fontSize: '0.9rem', lineHeight: 1.7 }}>
                {opp.requiredDocuments.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes & Contact */}
          {(opp.notes || opp.contactInformation) && (
            <div
              style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
              }}
            >
              {opp.notes && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Important Notes:</strong> {opp.notes}
                </div>
              )}
              {opp.contactInformation && (
                <div>
                  <strong>Official Contact:</strong> {opp.contactInformation}
                </div>
              )}
            </div>
          )}

          {/* User Application Tracker Section (if logged in) */}
          {user && user.role === 'user' && (
            <div
              className="card"
              style={{
                padding: '1.25rem',
                background: '#fafafa',
                border: '1px dashed var(--primary-300)',
                marginBottom: '1rem',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.65rem' }}>
                Personal Application Status Tracker
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                  <label className="form-label">Current Status</label>
                  <select
                    className="form-control"
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value)}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Planning to Apply">Planning to Apply</option>
                    <option value="Application Started">Application Started</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Notes (e.g. Reference No, Prep)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter private notes or application token..."
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleUpdateApplicationStatus}
                  disabled={savingApp}
                >
                  {savingApp ? 'Saving...' : 'Update Status'}
                </button>
              </div>
              {statusMessage && (
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', marginTop: '0.5rem' }}>
                  {statusMessage}
                </div>
              )}
            </div>
          )}

          {/* Mandatory Official Verification Disclaimer */}
          <DisclaimerBanner />
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onToggleSave && (
              <button
                className={`btn ${isSaved ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => onToggleSave(opp._id)}
              >
                <Bookmark size={16} fill={isSaved ? 'var(--primary-600)' : 'none'} />
                {isSaved ? 'Bookmarked' : 'Save Opportunity'}
              </button>
            )}

            <a
              href={opp.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Apply on Official Website <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
