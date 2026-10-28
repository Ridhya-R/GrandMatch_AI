import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Users,
  Briefcase,
  Bell,
  Settings,
  LogOut,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  FolderKanban,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPortal({ user, setUser, setTab }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'opportunities', 'add-opportunity', 'categories', 'users', 'applications', 'notifications', 'settings'
  const [stats, setStats] = useState(null);
  const [opps, setOpps] = useState([]);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOpp, setEditingOpp] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add/Edit Form State
  const initialForm = {
    name: '',
    provider: '',
    type: 'Scholarship',
    description: '',
    fundingAmount: '',
    fundingType: 'Fixed Amount',
    openingDate: '',
    deadline: '',
    officialUrl: '',
    country: 'India',
    state: 'All',
    eligibleLocations: 'All',
    educationLevels: 'Undergraduate, Postgraduate',
    fields: 'Computer Science, Engineering',
    minimumPercentage: '60',
    minAge: '18',
    maxAge: '30',
    incomeLimit: '500000',
    genderEligibility: 'Any',
    categoryEligibility: 'General, OBC, SC, ST, EWS',
    nationalityEligibility: 'Indian',
    skills: '',
    interests: '',
    fundingPurpose: 'Education',
    requiredDocuments: 'Academic marksheets, Income certificate, ID proof',
    numberOfAwards: '',
    contactInformation: '',
    notes: '',
    status: 'Published',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, oppsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOpportunities(),
        api.getAdminUsers(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (oppsRes.success) setOpps(oppsRes.opportunities || []);
      if (usersRes.success) setUserList(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (opp) => {
    setEditingOpp(opp);
    setFormData({
      name: opp.name || '',
      provider: opp.provider || '',
      type: opp.type || 'Scholarship',
      description: opp.description || '',
      fundingAmount: opp.fundingAmount !== undefined ? opp.fundingAmount : '',
      fundingType: opp.fundingType || 'Fixed Amount',
      openingDate: opp.openingDate ? opp.openingDate.split('T')[0] : '',
      deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
      officialUrl: opp.officialUrl || '',
      country: opp.country || 'India',
      state: opp.state || 'All',
      eligibleLocations: Array.isArray(opp.eligibleLocations) ? opp.eligibleLocations.join(', ') : (opp.eligibleLocations || 'All'),
      educationLevels: Array.isArray(opp.educationLevels) ? opp.educationLevels.join(', ') : (opp.educationLevels || 'Any'),
      fields: Array.isArray(opp.fields) ? opp.fields.join(', ') : (opp.fields || 'Any'),
      minimumPercentage: opp.minimumPercentage !== undefined ? opp.minimumPercentage : '',
      minAge: opp.minAge !== undefined ? opp.minAge : '',
      maxAge: opp.maxAge !== undefined ? opp.maxAge : '',
      incomeLimit: opp.incomeLimit !== undefined ? opp.incomeLimit : '',
      genderEligibility: opp.genderEligibility || 'Any',
      categoryEligibility: Array.isArray(opp.categoryEligibility) ? opp.categoryEligibility.join(', ') : (opp.categoryEligibility || 'Any'),
      nationalityEligibility: Array.isArray(opp.nationalityEligibility) ? opp.nationalityEligibility.join(', ') : (opp.nationalityEligibility || 'Indian'),
      skills: Array.isArray(opp.skills) ? opp.skills.join(', ') : (opp.skills || ''),
      interests: Array.isArray(opp.interests) ? opp.interests.join(', ') : (opp.interests || ''),
      fundingPurpose: Array.isArray(opp.fundingPurpose) ? opp.fundingPurpose.join(', ') : (opp.fundingPurpose || 'Education'),
      requiredDocuments: Array.isArray(opp.requiredDocuments) ? opp.requiredDocuments.join(', ') : (opp.requiredDocuments || ''),
      numberOfAwards: opp.numberOfAwards !== undefined && opp.numberOfAwards !== null ? opp.numberOfAwards : '',
      contactInformation: opp.contactInformation || '',
      notes: opp.notes || '',
      status: opp.status || 'Published',
    });
    setActiveTab('add-opportunity');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMsg('');
    setErrorMsg('');

    // Client-side validations
    if (!formData.name.trim() || !formData.provider.trim() || !formData.deadline || !formData.officialUrl.trim()) {
      setErrorMsg('Validation Error: Name, Provider, Deadline, and Official URL are required fields.');
      return;
    }

    try {
      new URL(formData.officialUrl);
    } catch (_) {
      setErrorMsg('Validation Error: Official URL must be a valid web URL (e.g., https://scholarships.gov.in)');
      return;
    }

    try {
      const payload = {
        ...formData,
        fundingAmount: formData.fundingAmount !== '' ? Number(formData.fundingAmount) : 0,
        minimumPercentage: formData.minimumPercentage !== '' ? Number(formData.minimumPercentage) : 0,
        minAge: formData.minAge !== '' ? Number(formData.minAge) : 0,
        maxAge: formData.maxAge !== '' ? Number(formData.maxAge) : 100,
        incomeLimit: formData.incomeLimit !== '' ? Number(formData.incomeLimit) : 0,
        numberOfAwards: formData.numberOfAwards !== '' ? Number(formData.numberOfAwards) : null,
      };

      if (editingOpp) {
        const res = await api.updateOpportunity(editingOpp._id, payload);
        if (res.success) {
          setFeedbackMsg(`Updated "${formData.name}" successfully.`);
          setEditingOpp(null);
          setFormData(initialForm);
          loadAllAdminData();
          setActiveTab('opportunities');
        }
      } else {
        const res = await api.addOpportunity(payload);
        if (res.success) {
          setFeedbackMsg(`Added "${formData.name}" to the funding directory.`);
          setFormData(initialForm);
          loadAllAdminData();
          setActiveTab('opportunities');
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteOpp = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete opportunity "${name}"?`)) return;
    try {
      await api.deleteOpportunity(id);
      setFeedbackMsg(`Deleted "${name}".`);
      setOpps(prev => prev.filter(o => o._id !== id));
      loadAllAdminData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleStatus = async (opp) => {
    const newStatus = opp.status === 'Published' ? 'Expired' : 'Published';
    try {
      await api.updateOpportunity(opp._id, { status: newStatus });
      loadAllAdminData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAutoExpire = async () => {
    try {
      const res = await api.autoExpireOpportunities();
      setFeedbackMsg(res.message);
      loadAllAdminData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSeedReset = async () => {
    if (!window.confirm('Re-synchronize sample opportunity dataset?')) return;
    try {
      const res = await api.resetSeedData();
      setFeedbackMsg(res.message);
      loadAllAdminData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('grantmatch_token');
    localStorage.removeItem('grantmatch_user');
    setUser(null);
    setTab('home');
  };

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={20} color="var(--primary-600)" />
            Admin Console
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GrantMatch Management</div>
        </div>

        <button
          className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); setEditingOpp(null); }}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => { setActiveTab('opportunities'); setEditingOpp(null); }}
        >
          <Layers size={18} /> Opportunities
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'add-opportunity' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('add-opportunity');
            if (!editingOpp) setFormData(initialForm);
          }}
        >
          <PlusCircle size={18} /> {editingOpp ? 'Edit Opportunity' : 'Add Opportunity'}
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => { setActiveTab('categories'); setEditingOpp(null); }}
        >
          <FolderKanban size={18} /> Categories
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setEditingOpp(null); }}
        >
          <Users size={18} /> Users ({userList.length})
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('settings'); setEditingOpp(null); }}
        >
          <Settings size={18} /> Settings & Seed
        </button>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <button
            className="admin-nav-item"
            style={{ color: 'var(--rose-600)' }}
            onClick={handleLogout}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="admin-main">
        {feedbackMsg && (
          <div style={{ background: 'var(--emerald-50)', color: 'var(--emerald-600)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            ✓ {feedbackMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            ⚠ {errorMsg}
          </div>
        )}

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Platform Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Real-time database statistics and funding streams.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-outline btn-sm" onClick={handleAutoExpire} title="Scan and expire passed deadlines">
                  <Clock size={14} /> Run Auto-Expire Scan
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('add-opportunity')}>
                  <PlusCircle size={14} /> Add Opportunity
                </button>
              </div>
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL REGISTERED USERS</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)', marginTop: '0.25rem' }}>
                  {stats.totalUsers}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL OPPORTUNITIES</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)', marginTop: '0.25rem' }}>
                  {stats.totalOpportunities}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--emerald-600)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACTIVE / PUBLISHED</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '0.25rem' }}>
                  {stats.activeOpportunities}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--rose-600)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>EXPIRED DEADLINES</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--rose-600)', marginTop: '0.25rem' }}>
                  {stats.expiredOpportunities}
                </div>
              </div>
            </div>

            {/* Breakdown by Funding Category */}
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Category Distribution</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              {Object.entries(stats.byType || {}).map(([key, count]) => (
                <div key={key} className="card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{key}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-800)', marginTop: '0.25rem' }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Link to Opportunities table */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Recently Modified Opportunities</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('opportunities')}>
                  View All ({opps.length})
                </button>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Funding</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opps.slice(0, 5).map((o) => (
                      <tr key={o._id}>
                        <td><strong>{o.name}</strong></td>
                        <td><span className="badge badge-blue">{o.type}</span></td>
                        <td>{o.fundingAmount ? `₹${o.fundingAmount.toLocaleString()}` : o.fundingType}</td>
                        <td>{new Date(o.deadline).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${o.status === 'Published' ? 'badge-green' : 'badge-rose'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(o)}>
                            <Edit3 size={13} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. OPPORTUNITIES MANAGEMENT */}
        {activeTab === 'opportunities' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem' }}>All Funding Opportunities ({opps.length})</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage, edit, publish or expire opportunities.</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingOpp(null); setFormData(initialForm); setActiveTab('add-opportunity'); }}>
                <PlusCircle size={15} /> Add New Opportunity
              </button>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Opportunity Name & Provider</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {opps.map((opp) => (
                    <tr key={opp._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary-900)' }}>{opp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opp.provider}</div>
                      </td>
                      <td><span className="badge badge-blue">{opp.type}</span></td>
                      <td>{opp.fundingAmount ? `₹${opp.fundingAmount.toLocaleString()}` : opp.fundingType}</td>
                      <td>{new Date(opp.deadline).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(opp)}
                          className={`badge ${opp.status === 'Published' ? 'badge-green' : 'badge-rose'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle status"
                        >
                          {opp.status}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEditClick(opp)}
                            title="Edit opportunity details"
                          >
                            <Edit3 size={14} />
                          </button>

                          <a
                            href={opp.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            title="Test Official URL"
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--rose-600)' }}
                            onClick={() => handleDeleteOpp(opp._id, opp.name)}
                            title="Delete opportunity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ADD / EDIT OPPORTUNITY FORM */}
        {activeTab === 'add-opportunity' && (
          <div style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem' }}>
                  {editingOpp ? `Edit: ${editingOpp.name}` : 'Add Funding Opportunity'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  Fields marked with * are required. The rule engine compares these values deterministically with user profiles.
                </p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('opportunities')}>
                Back to Catalog
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>1. Core Identification</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">Opportunity Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. National Merit Scholarship"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Provider / Organization *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Department of Higher Education"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Opportunity Type *</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Scholarship">Scholarship</option>
                      <option value="Fellowship">Fellowship</option>
                      <option value="Grant">Grant</option>
                      <option value="Government Funding">Government Funding</option>
                      <option value="Research Funding">Research Funding</option>
                      <option value="Startup Funding">Startup Funding</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Official Application URL *</label>
                    <input
                      type="url"
                      className="form-control"
                      required
                      placeholder="https://scholarships.gov.in/portal"
                      value={formData.officialUrl}
                      onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter detailed summary of this funding opportunity..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>2. Financial & Deadlines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Funding Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 75000 (0 for variable)"
                      value={formData.fundingAmount}
                      onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Funding Type</label>
                    <select
                      className="form-control"
                      value={formData.fundingType}
                      onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                    >
                      <option value="Fixed Amount">Fixed Amount</option>
                      <option value="Full Funding">Full Funding</option>
                      <option value="Partial Funding">Partial Funding</option>
                      <option value="Variable Amount">Variable Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Opening Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.openingDate}
                      onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Application Deadline *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>3. Eligibility Rules & Constraints</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Education Levels (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Undergraduate, Postgraduate, Any"
                      value={formData.educationLevels}
                      onChange={(e) => setFormData({ ...formData, educationLevels: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Eligible Fields / Streams</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Computer Science, Engineering, Any"
                      value={formData.fields}
                      onChange={(e) => setFormData({ ...formData, fields: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Minimum Academic % (0 for none)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={formData.minimumPercentage}
                      onChange={(e) => setFormData({ ...formData, minimumPercentage: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Annual Family Income Ceiling (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0 for unrestricted"
                      value={formData.incomeLimit}
                      onChange={(e) => setFormData({ ...formData, incomeLimit: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Min Age</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.minAge}
                      onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Max Age</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.maxAge}
                      onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Gender Eligibility</label>
                    <select
                      className="form-control"
                      value={formData.genderEligibility}
                      onChange={(e) => setFormData({ ...formData, genderEligibility: e.target.value })}
                    >
                      <option value="Any">Any</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other/Specified">Other / Specified</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Category Eligibility</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. General, OBC, SC, ST, EWS, Any"
                      value={formData.categoryEligibility}
                      onChange={(e) => setFormData({ ...formData, categoryEligibility: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Required Documents (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Marksheet, Income Certificate, ID Proof, Bonafide Letter"
                    value={formData.requiredDocuments}
                    onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActiveTab('opportunities')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-lg">
                  <CheckCircle size={18} />
                  {editingOpp ? 'Save Changes' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. CATEGORIES VIEW */}
        {activeTab === 'categories' && (
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Funding Categories</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              System category taxonomies and active counts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'Scholarships', count: opps.filter(o => o.type === 'Scholarship').length, desc: 'Educational financial support for tuition and degrees.' },
                { name: 'Fellowships', count: opps.filter(o => o.type === 'Fellowship').length, desc: 'Advanced doctoral and post-graduate stipends.' },
                { name: 'Grants', count: opps.filter(o => o.type === 'Grant').length, desc: 'Direct non-repayable project & travel funding.' },
                { name: 'Government Funding', count: opps.filter(o => o.type === 'Government Funding').length, desc: 'Central and state welfare assistance schemes.' },
                { name: 'Research Funding', count: opps.filter(o => o.type === 'Research Funding').length, desc: 'Institutional capital for experimental scientific research.' },
                { name: 'Startup Funding', count: opps.filter(o => o.type === 'Startup Funding').length, desc: 'Seed and MVP capital for student-founded ventures.' },
              ].map((c) => (
                <div key={c.name} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem' }}>{c.name}</h3>
                    <span className="badge badge-blue">{c.count} records</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. USERS VIEW */}
        {activeTab === 'users' && (
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Registered Users ({userList.length})</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              View user profiles, qualifications, and background criteria.
            </p>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name & Email</th>
                    <th>Role</th>
                    <th>Education & Stream</th>
                    <th>Score / %</th>
                    <th>Annual Income</th>
                    <th>Category</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary-900)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-amber' : 'badge-blue'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{u.educationLevel || 'Not specified'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.course}</div>
                      </td>
                      <td>{u.percentage !== null && u.percentage !== undefined ? `${u.percentage}%` : 'N/A'}</td>
                      <td>{u.annualIncome ? `₹${u.annualIncome.toLocaleString()}` : 'N/A'}</td>
                      <td>{u.category || 'General'}</td>
                      <td>{u.state || 'Pan-India'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. SETTINGS & SEED VIEW */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '720px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System Tools & Database Reset</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Administrative utilities for demonstration and testing.
            </p>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Sample Data Re-synchronization</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Reset sample opportunities across all 6 categories to ensure complete evaluation coverage.
              </p>
              <button className="btn btn-secondary" onClick={handleSeedReset}>
                <RefreshCw size={16} /> Re-sync Sample Opportunities
              </button>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Automated Deadline Check</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Force an immediate sweep across all opportunities to mark passed deadlines as 'Expired'.
              </p>
              <button className="btn btn-outline" onClick={handleAutoExpire}>
                <Clock size={16} /> Run Expiry Sweep Now
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
