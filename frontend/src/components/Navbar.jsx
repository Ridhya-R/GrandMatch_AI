import React, { useState, useEffect } from 'react';
import { Award, Bell, User, LogOut, ShieldCheck, Bookmark, Briefcase, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ currentTab, setTab, user, setUser, onOpenAuth }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('grantmatch_token');
    localStorage.removeItem('grantmatch_user');
    setUser(null);
    setTab('home');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setTab('home')}>
          <div className="brand-logo-icon">
            <Award size={20} />
          </div>
          <div>
            Grant<span style={{ color: 'var(--primary-600)' }}>Match</span>
          </div>
        </div>

        {/* Links */}
        <nav className="nav-links">
          <button
            className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => setTab('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Home
          </button>
          <button
            className={`nav-link ${currentTab === 'find-funding' ? 'active' : ''}`}
            onClick={() => setTab('find-funding')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Find Funding
          </button>
          <button
            className={`nav-link ${currentTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setTab('opportunities')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            All Opportunities
          </button>
          <button
            className={`nav-link ${currentTab === 'ai-recommended' ? 'active' : ''}`}
            onClick={() => {
              if (user) {
                setTab('ai-recommended');
              } else {
                onOpenAuth();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600,
              color: currentTab === 'ai-recommended' ? 'var(--primary-700)' : 'var(--emerald-700)',
            }}
          >
            <Sparkles size={15} style={{ color: 'var(--emerald-600)' }} />
            <span>AI Recommended</span>
            <span style={{
              fontSize: '0.625rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              padding: '0.1rem 0.45rem',
              borderRadius: '999px',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>NEW</span>
          </button>

          {user && user.role === 'user' && (
            <>
              <button
                className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setTab('dashboard')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${currentTab === 'saved' ? 'active' : ''}`}
                onClick={() => setTab('saved')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Saved
              </button>
              <button
                className={`nav-link ${currentTab === 'applications' ? 'active' : ''}`}
                onClick={() => setTab('applications')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Applications
              </button>
            </>
          )}

          {user && user.role === 'admin' && (
            <button
              className={`nav-link ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={() => setTab('admin')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary-700)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ShieldCheck size={17} /> Admin Portal
            </button>
          )}
        </nav>

        {/* Actions & Profile */}
        <div className="nav-actions">
          {user ? (
            <>
              {/* Notification Popover */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.55rem', borderRadius: 'var(--radius-full)', position: 'relative' }}
                  onClick={() => {
                    setShowNotifMenu(!showNotifMenu);
                    setShowUserMenu(false);
                  }}
                  title="Notifications & Deadline Alerts"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        background: 'var(--rose-600)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      width: '320px',
                      padding: '1rem',
                      zIndex: 200,
                      boxShadow: 'var(--shadow-xl)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Deadline Alerts & Updates</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{ fontSize: '0.75rem', color: 'var(--primary-600)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                        No pending alerts.
                      </p>
                    ) : (
                      <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {notifications.map((n) => (
                          <div
                            key={n._id}
                            style={{
                              padding: '0.6rem',
                              background: n.read ? '#f8fafc' : 'var(--primary-50)',
                              borderRadius: 'var(--radius-sm)',
                              borderLeft: n.type === 'deadline' ? '3px solid var(--amber-500)' : '3px solid var(--primary-600)',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{n.title}</div>
                            <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>{n.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifMenu(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <User size={16} />
                  <span>{user.name.split(' ')[0]}</span>
                  {user.role === 'admin' ? (
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Admin</span>
                  ) : (
                    <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>User</span>
                  )}
                </button>

                {showUserMenu && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      width: '200px',
                      padding: '0.5rem',
                      zIndex: 200,
                      boxShadow: 'var(--shadow-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>

                    {user.role === 'admin' ? (
                      <button
                        className="admin-nav-item"
                        onClick={() => {
                          setTab('admin');
                          setShowUserMenu(false);
                        }}
                      >
                        <ShieldCheck size={16} /> Admin Portal
                      </button>
                    ) : (
                      <>
                        <button
                          className="admin-nav-item"
                          onClick={() => {
                            setTab('profile');
                            setShowUserMenu(false);
                          }}
                        >
                          <User size={16} /> My Profile
                        </button>
                        <button
                          className="admin-nav-item"
                          onClick={() => {
                            setTab('dashboard');
                            setShowUserMenu(false);
                          }}
                        >
                          <Briefcase size={16} /> My Dashboard
                        </button>
                        <button
                          className="admin-nav-item"
                          onClick={() => {
                            setTab('ai-recommended');
                            setShowUserMenu(false);
                          }}
                          style={{ color: 'var(--emerald-700)', fontWeight: 600 }}
                        >
                          <Sparkles size={16} color="var(--emerald-600)" /> AI Recommendations
                        </button>
                      </>
                    )}

                    <button
                      className="admin-nav-item"
                      onClick={handleLogout}
                      style={{ color: 'var(--rose-600)', borderTop: '1px solid var(--border-subtle)' }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn btn-lime" onClick={onOpenAuth}>
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
