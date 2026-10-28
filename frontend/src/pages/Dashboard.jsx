import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bookmark,
  Briefcase,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import AIRecommendations from '../components/AIRecommendations';
import { api } from '../services/api';

export default function Dashboard({
  user,
  setTab,
  setSelectedOpp,
  onToggleSave,
  savedIds = [],
}) {
  const [matches, setMatches] = useState([]);
  const [saved, setSaved] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [matchRes, savedRes, appRes] = await Promise.all([
        api.calculateMatch(user || {}),
        api.getSavedOpportunities(),
        api.getApplications(),
      ]);

      if (matchRes.success) setMatches(matchRes.opportunities || []);
      if (savedRes.success) setSaved(savedRes.saved || []);
      if (appRes.success) setApplications(appRes.applications || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute upcoming deadlines (opportunities due in <= 30 days)
  const upcomingDeadlines = matches
    .filter((opp) => !opp.isExpired && opp.daysRemaining !== undefined && opp.daysRemaining <= 45)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5);

  const topRecommendations = matches.slice(0, 4);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Welcome Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="hero-badge">
            <Sparkles size={15} style={{ color: 'var(--primary-600)' }} />
            <span>Student & Researcher Portal</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.35rem' }}>
            Welcome back, {user ? user.name : 'Applicant'}!
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Here is your funding intelligence overview based on your {user?.course || 'academic'} requirements and profile criteria.
          </p>
        </div>

        {/* Top 4 KPI Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>MATCHED OPPORTUNITIES</span>
              <Sparkles size={20} color="var(--primary-600)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              {matches.length}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--emerald-600)', marginTop: '0.25rem', fontWeight: 600 }}>
              {matches.filter(m => m.eligibilityMatch >= 75).length} High Compatibility (&gt;75%)
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--emerald-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>SAVED BOOKMARKS</span>
              <Bookmark size={20} color="var(--emerald-600)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              {saved.length}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Bookmarked for application prep
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--purple-500)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE APPLICATIONS</span>
              <Briefcase size={20} color="var(--purple-500)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              {applications.length}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              In-progress or submitted
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--amber-500)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>APPROACHING DEADLINES</span>
              <Clock size={20} color="var(--amber-500)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              {upcomingDeadlines.length}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--rose-600)', marginTop: '0.25rem', fontWeight: 600 }}>
              Due in next 30-45 days
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid: Upcoming Deadlines + Recommended Opportunities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start', marginBottom: '3rem' }}>
          {/* Top Recommendations */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.45rem' }}>Recommended For You</h2>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setTab('find-funding')}
              >
                Custom Matching <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Evaluating criteria recommendations...
              </div>
            ) : topRecommendations.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active recommendations. Update your profile or requirements.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {topRecommendations.map((opp) => (
                  <OpportunityCard
                    key={opp._id}
                    opp={opp}
                    onViewDetails={setSelectedOpp}
                    onToggleSave={onToggleSave}
                    isSaved={savedIds?.includes(opp._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Upcoming Deadlines List & Application Pipeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Upcoming Deadlines Widget */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Clock size={18} color="var(--amber-600)" />
                <h3 style={{ fontSize: '1.15rem' }}>Upcoming Deadlines</h3>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No urgent deadlines in the next 30 days.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {upcomingDeadlines.map((opp) => (
                    <div
                      key={opp._id}
                      style={{
                        padding: '0.85rem',
                        background: 'var(--bg-main)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedOpp(opp)}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                        {opp.name}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{opp.provider}</span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: opp.daysRemaining <= 7 ? 'var(--rose-600)' : 'var(--amber-600)',
                            background: opp.daysRemaining <= 7 ? 'var(--rose-50)' : 'var(--amber-50)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {opp.daysRemaining} days remaining
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Application Pipeline Quick View */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={18} color="var(--primary-600)" />
                  <h3 style={{ fontSize: '1.15rem' }}>Applications In-Progress</h3>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setTab('applications')}
                >
                  View All
                </button>
              </div>

              {applications.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  You are not tracking any active applications yet. Browse opportunities and update their status to track them here.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {applications.slice(0, 4).map((app) => (
                    <div
                      key={app._id}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{app.opportunity.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.75rem' }}>
                        <span className="badge badge-blue">{app.status}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Due: {new Date(app.opportunity.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Scholarship Recommendations Section */}
        <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
          <AIRecommendations user={user} setTab={setTab} />
        </div>

        <DisclaimerBanner />
      </div>
    </div>
  );
}
