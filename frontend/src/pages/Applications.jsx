import React, { useState, useEffect } from 'react';
import { Briefcase, ExternalLink, Trash2, Edit3, CheckCircle2, Clock } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { api } from '../services/api';

export default function Applications({ setSelectedOpp }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getApplications();
      if (res.success) {
        setApps(res.applications || []);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (app) => {
    setEditingId(app._id);
    setEditStatus(app.status);
    setEditNotes(app.notes || '');
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.updateApplication(id, {
        status: editStatus,
        notes: editNotes,
      });
      setEditingId(null);
      loadApplications();
    } catch (err) {
      console.error('Failed to update application:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application tracking entry?')) return;
    try {
      await api.deleteApplication(id);
      setApps(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'badge-green';
      case 'Submitted': return 'badge-blue';
      case 'Under Review': return 'badge-purple';
      case 'Rejected': return 'badge-rose';
      case 'Closed': return 'badge-gray';
      default: return 'badge-amber';
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Application Tracker & History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Track progress across all your scholarship and grant submissions. Keep notes and monitor deadlines.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Loading application history...
          </div>
        ) : apps.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Tracked Applications</h3>
            <p style={{ fontSize: '0.9rem' }}>
              When viewing an opportunity, set its status to "Planning to Apply" or "Submitted" to monitor its journey here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Opportunity & Provider</th>
                  <th>Current Status</th>
                  <th>Deadline</th>
                  <th>Submission Date</th>
                  <th>Personal Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => {
                  const opp = app.opportunity;
                  const isEditing = editingId === app._id;

                  return (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary-900)' }}>{opp.name}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{opp.provider}</div>
                      </td>

                      <td>
                        {isEditing ? (
                          <select
                            className="form-control"
                            style={{ fontSize: '0.825rem', padding: '0.35rem' }}
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
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
                        ) : (
                          <span className={`badge ${getStatusBadge(app.status)}`}>{app.status}</span>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{new Date(opp.deadline).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.75rem', color: opp.daysRemaining <= 7 ? 'var(--rose-600)' : 'var(--text-muted)' }}>
                          {opp.daysRemaining} days left
                        </div>
                      </td>

                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Not Yet Submitted'}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: '0.825rem', padding: '0.35rem' }}
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                          />
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                            {app.notes || <em style={{ color: 'var(--text-light)' }}>No notes added</em>}
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {isEditing ? (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(app._id)}>
                                Save
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleStartEdit(app)}
                                title="Edit Status & Notes"
                              >
                                <Edit3 size={14} />
                              </button>

                              <a
                                href={opp.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary btn-sm"
                                title="Open Official Portal"
                              >
                                <ExternalLink size={14} />
                              </a>

                              <button
                                className="btn btn-outline btn-sm"
                                style={{ color: 'var(--rose-600)' }}
                                onClick={() => handleDelete(app._id)}
                                title="Delete Tracking Entry"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <DisclaimerBanner />
      </div>
    </div>
  );
}
