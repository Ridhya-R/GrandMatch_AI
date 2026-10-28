import React, { useState, useEffect } from 'react';
import { User, Save, CheckCircle2, AlertCircle, BookOpen, DollarSign, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function Profile({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Any',
    country: 'India',
    state: '',
    district: '',
    educationLevel: 'Undergraduate',
    course: '',
    institution: '',
    percentage: '',
    skills: '',
    interests: '',
    annualIncome: '',
    category: 'General',
    nationality: 'Indian',
    employmentStatus: 'Student',
    userType: 'Student',
    fundingPurpose: 'Education',
    requiredAmount: '',
    preferredLocation: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || '',
        gender: user.gender || 'Any',
        country: user.country || 'India',
        state: user.state || '',
        district: user.district || '',
        educationLevel: user.educationLevel || 'Undergraduate',
        course: user.course || '',
        institution: user.institution || '',
        percentage: user.percentage !== null && user.percentage !== undefined ? user.percentage : '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        interests: Array.isArray(user.interests) ? user.interests.join(', ') : (user.interests || ''),
        annualIncome: user.annualIncome !== null && user.annualIncome !== undefined ? user.annualIncome : '',
        category: user.category || 'General',
        nationality: user.nationality || 'Indian',
        employmentStatus: user.employmentStatus || 'Student',
        userType: user.userType || 'Student',
        fundingPurpose: user.fundingPurpose || 'Education',
        requiredAmount: user.requiredAmount || '',
        preferredLocation: user.preferredLocation || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...formData,
        age: formData.age !== '' ? Number(formData.age) : null,
        percentage: formData.percentage !== '' ? Number(formData.percentage) : null,
        annualIncome: formData.annualIncome !== '' ? Number(formData.annualIncome) : null,
        requiredAmount: formData.requiredAmount !== '' ? Number(formData.requiredAmount) : null,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
        interests: formData.interests ? formData.interests.split(',').map(s => s.trim()) : [],
      };

      const res = await api.updateProfile(payload);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('grantmatch_user', JSON.stringify(res.user));
        setMessage('Profile updated successfully! Recommendation calculations will now reflect these updates.');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setError(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '920px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.35rem' }}>My Profile & Eligibility Criteria</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Keep your academic, financial, and personal information accurate so our rule-based matching engine calculates precise eligibility scores.
          </p>
        </div>

        {message && (
          <div style={{ background: 'var(--emerald-50)', color: 'var(--emerald-600)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Personal Information */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--primary-600)" /> Personal Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Email Address (Read-Only)</label>
                <input
                  type="email"
                  className="form-control"
                  disabled
                  value={formData.email}
                  style={{ background: '#f1f5f9' }}
                />
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Gender</label>
                <select
                  className="form-control"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Any">Any / Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other/Specified">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label">Citizenship / Nationality</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">State / Union Territory</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Kerala, Delhi, Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">District</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ernakulam"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Credentials */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--primary-600)" /> Academic Credentials
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Current Education Level</label>
                <select
                  className="form-control"
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                >
                  <option value="Higher Secondary">Higher Secondary (+2)</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, B.Com, etc.)</option>
                  <option value="Postgraduate">Postgraduate (MCA, M.Tech, M.Sc, MBA)</option>
                  <option value="PhD">PhD / Doctoral</option>
                </select>
              </div>

              <div>
                <label className="form-label">Course / Degree Stream</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Computer Science (MCA)"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">College / University / Institution</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CUSAT, Cochin"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Academic Percentage / CGPA (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  placeholder="e.g. 82.5"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Category Profile */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={20} color="var(--primary-600)" /> Financial & Social Category
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Annual Family Income (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 280000"
                  value={formData.annualIncome}
                  onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Applicant Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="General">General / Open</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  <option value="Minority">Minority</option>
                </select>
              </div>

              <div>
                <label className="form-label">User Type</label>
                <select
                  className="form-control"
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                >
                  <option value="Student">Student</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Startup">Startup Founder</option>
                  <option value="Professional">Professional</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label">Funding Requirement Purpose</label>
                <select
                  className="form-control"
                  value={formData.fundingPurpose}
                  onChange={(e) => setFormData({ ...formData, fundingPurpose: e.target.value })}
                >
                  <option value="Education">Education</option>
                  <option value="Research">Research</option>
                  <option value="Startup">Startup</option>
                  <option value="Business">Business</option>
                  <option value="Fellowship">Fellowship</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label">Estimated Required Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 75000"
                  value={formData.requiredAmount}
                  onChange={(e) => setFormData({ ...formData, requiredAmount: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Skills (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Python, Machine Learning, Web Dev"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
