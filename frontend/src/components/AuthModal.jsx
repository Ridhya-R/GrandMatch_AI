import React, { useState } from 'react';
import { X, ShieldCheck, User, Lock, Mail, Phone, BookOpen, DollarSign } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    educationLevel: 'Undergraduate',
    course: 'Computer Science',
    percentage: '80',
    annualIncome: '300000',
    category: 'General',
    userType: 'Student',
    fundingPurpose: 'Education',
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(loginEmail, loginPassword);
      if (res.success) {
        localStorage.setItem('grantmatch_token', res.token);
        localStorage.setItem('grantmatch_user', JSON.stringify(res.user));
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.register(regData);
      if (res.success) {
        localStorage.setItem('grantmatch_token', res.token);
        localStorage.setItem('grantmatch_user', JSON.stringify(res.user));
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.demoLogin(role);
      if (res.success) {
        localStorage.setItem('grantmatch_token', res.token);
        localStorage.setItem('grantmatch_user', JSON.stringify(res.user));
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => { setTab('login'); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: tab === 'login' ? 'var(--primary-700)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderBottom: tab === 'login' ? '2px solid var(--primary-600)' : 'none',
                paddingBottom: '0.25rem',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: tab === 'register' ? 'var(--primary-700)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderBottom: tab === 'register' ? '2px solid var(--primary-600)' : 'none',
                paddingBottom: '0.25rem',
              }}
            >
              Create Account
            </button>
          </div>

          <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.35rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* One-click evaluator quick fills */}
          <div style={{ background: 'var(--primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Academic Evaluation Quick-Access:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                style={{ fontSize: '0.8rem' }}
              >
                <ShieldCheck size={14} /> Demo Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo('user')}
                disabled={loading}
                style={{ fontSize: '0.8rem' }}
              >
                <User size={14} /> Demo Student
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  placeholder="Enter your account password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Athira Nair"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    placeholder="email@domain.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  placeholder="Create a strong password"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Education Level</label>
                  <select
                    className="form-control"
                    value={regData.educationLevel}
                    onChange={(e) => setRegData({ ...regData, educationLevel: e.target.value })}
                  >
                    <option value="Higher Secondary">Higher Secondary</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Course / Stream</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Computer Science"
                    value={regData.course}
                    onChange={(e) => setRegData({ ...regData, course: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Academic Score (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 82.5"
                    value={regData.percentage}
                    onChange={(e) => setRegData({ ...regData, percentage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Annual Family Income (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 300000"
                    value={regData.annualIncome}
                    onChange={(e) => setRegData({ ...regData, annualIncome: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Registering Account...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
