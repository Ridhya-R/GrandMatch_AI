import React, { useState, useEffect } from 'react';
import { Bookmark, ExternalLink, Trash2, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { api } from '../services/api';

export default function SavedOpportunities({
  setSelectedOpp,
  onToggleSave,
  user,
}) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const res = await api.getSavedOpportunities();
      if (res.success) {
        setSaved(res.saved || []);
      }
    } catch (err) {
      console.error('Error loading saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (opportunityId, newStatus) => {
    try {
      await api.saveApplication({
        opportunityId,
        status: newStatus,
      });
      loadSaved();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleRemove = async (opportunityId) => {
    try {
      await api.removeSavedOpportunity(opportunityId);
      setSaved(prev => prev.filter(s => s.opportunity._id !== opportunityId));
      if (onToggleSave) onToggleSave(opportunityId);
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>My Saved Opportunities</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Manage and prepare applications for your bookmarked scholarships, fellowships, and grants.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Loading saved bookmarks...
          </div>
        ) : saved.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bookmark size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Saved Opportunities Yet</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Click the bookmark icon on any opportunity card in the catalog to save it for quick reference.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {saved.map((item) => {
              const opp = item.opportunity;
              const formattedAmount = opp.fundingAmount > 0
                ? `₹${opp.fundingAmount.toLocaleString('en-IN')}`
                : opp.fundingType || 'Full / Variable Support';

              return (
                <div key={item._id} className="card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr', gap: '1.5rem', alignItems: 'center' }}>
                  {/* Opportunity Details */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-blue">{opp.type}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opp.provider}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                      {opp.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary-800)' }}>{formattedAmount}</span>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} /> Deadline: {new Date(opp.deadline).toLocaleDateString()}
                      </span>
                      {opp.eligibilityMatch !== null && (
                        <span className="badge badge-green">
                          {opp.eligibilityMatch}% Eligibility Match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Application Status Dropdown */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>APPLICATION STATUS</label>
                    <select
                      className="form-control"
                      value={item.applicationStatus}
                      onChange={(e) => handleStatusChange(opp._id, e.target.value)}
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

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedOpp(opp)}
                    >
                      Details <ChevronRight size={14} />
                    </button>

                    <a
                      href={opp.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      Apply Official <ExternalLink size={14} />
                    </a>

                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--rose-600)', borderColor: 'var(--rose-200)' }}
                      onClick={() => handleRemove(opp._id)}
                      title="Remove from saved"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DisclaimerBanner />
      </div>
    </div>
  );
}
