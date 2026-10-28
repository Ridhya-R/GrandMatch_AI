import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OpportunityModal from './components/OpportunityModal';
import AuthModal from './components/AuthModal';

// Pages
import Home from './pages/Home';
import FindFunding from './pages/FindFunding';
import Opportunities from './pages/Opportunities';
import Dashboard from './pages/Dashboard';
import SavedOpportunities from './pages/SavedOpportunities';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import AdminPortal from './pages/AdminPortal';
import AIRecommendations from './components/AIRecommendations';

import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  // Check stored user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('grantmatch_user');
    const token = localStorage.getItem('grantmatch_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify with backend
        api.getMe()
          .then((res) => {
            if (res.success && res.user) {
              setUser(res.user);
              localStorage.setItem('grantmatch_user', JSON.stringify(res.user));
            }
          })
          .catch(() => {
            // Token might be expired
            localStorage.removeItem('grantmatch_token');
            localStorage.removeItem('grantmatch_user');
            setUser(null);
          });
      } catch (_) {}
    }
  }, []);

  // Fetch saved IDs whenever user changes
  useEffect(() => {
    if (user) {
      api.getSavedOpportunities()
        .then((res) => {
          if (res.success && res.saved) {
            setSavedIds(res.saved.map((s) => s.opportunity._id));
          }
        })
        .catch((err) => console.warn(err));
    } else {
      setSavedIds([]);
    }
  }, [user]);

  // Global bookmark toggle
  const handleToggleSave = async (opportunityId) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const res = await api.toggleSaveOpportunity(opportunityId);
      if (res.success) {
        if (res.isSaved) {
          setSavedIds((prev) => [...prev, opportunityId]);
        } else {
          setSavedIds((prev) => prev.filter((id) => id !== opportunityId));
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    if (authenticatedUser.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setTab={setCurrentTab}
        user={user}
        setUser={setUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Routed Page Content */}
      <div style={{ flex: 1 }}>
        {currentTab === 'home' && (
          <Home
            setTab={setCurrentTab}
            setSelectedOpp={setSelectedOpp}
            user={user}
            onToggleSave={handleToggleSave}
            savedIds={savedIds}
          />
        )}

        {currentTab === 'find-funding' && (
          <FindFunding
            user={user}
            setSelectedOpp={setSelectedOpp}
            onToggleSave={handleToggleSave}
            savedIds={savedIds}
          />
        )}

        {currentTab === 'opportunities' && (
          <Opportunities
            setSelectedOpp={setSelectedOpp}
            onToggleSave={handleToggleSave}
            savedIds={savedIds}
            user={user}
            setTab={setCurrentTab}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            user={user}
            setTab={setCurrentTab}
            setSelectedOpp={setSelectedOpp}
            onToggleSave={handleToggleSave}
            savedIds={savedIds}
          />
        )}

        {currentTab === 'saved' && (
          <SavedOpportunities
            setSelectedOpp={setSelectedOpp}
            onToggleSave={handleToggleSave}
            user={user}
          />
        )}

        {currentTab === 'applications' && (
          <Applications
            setSelectedOpp={setSelectedOpp}
          />
        )}

        {currentTab === 'profile' && (
          <Profile
            user={user}
            setUser={setUser}
          />
        )}

        {currentTab === 'ai-recommended' && (
          <div className="page-wrapper">
            <div className="container" style={{ paddingBottom: '3.5rem' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <div className="hero-badge" style={{ marginBottom: '0.5rem' }}>
                  <span>AI Scholarship Matching Engine</span>
                </div>
                <h1 style={{ fontSize: '2.25rem', marginBottom: '0.35rem' }}>
                  AI-Recommended Scholarships
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  Tailored opportunities analyzed against your academic profile, category, GPA, and state eligibility.
                </p>
              </div>
              <AIRecommendations
                user={user}
                setTab={setCurrentTab}
                autoLoad={true}
              />
            </div>
          </div>
        )}

        {currentTab === 'admin' && (
          <AdminPortal
            user={user}
            setUser={setUser}
            setTab={setCurrentTab}
          />
        )}
      </div>

      {/* Footer */}
      <Footer setTab={setCurrentTab} user={user} />

      {/* Detail Modal */}
      <OpportunityModal
        opp={selectedOpp}
        isOpen={Boolean(selectedOpp)}
        onClose={() => setSelectedOpp(null)}
        isSaved={selectedOpp ? savedIds.includes(selectedOpp._id) : false}
        onToggleSave={handleToggleSave}
        user={user}
        onApplicationUpdated={() => {}}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
