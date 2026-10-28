import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  Award,
  BookOpen,
  Landmark,
  Microscope,
  Rocket,
  Search,
  ExternalLink,
  ChevronRight,
  Play,
  CheckCircle2,
  Trees,
  Globe2,
  Users2
} from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { api } from '../services/api';

export default function Home({ setTab, setSelectedOpp, user, onToggleSave, savedIds }) {
  const [featuredOpps, setFeaturedOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [showEngineModal, setShowEngineModal] = useState(false);

  useEffect(() => {
    loadFeatured();
  }, [user]);

  const loadFeatured = async () => {
    setLoading(true);
    try {
      const res = await api.getOpportunities({ sort: 'newest' });
      if (res.success) {
        setFeaturedOpps(res.opportunities?.slice(0, 6) || []);
      }
    } catch (err) {
      console.error('Error fetching featured opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    setTab('find-funding');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  const categories = [
    { title: 'Scholarships', icon: GraduationCap, color: 'var(--primary-700)', desc: 'Merit and need-based tuition assistance for students.' },
    { title: 'Fellowships', icon: Award, color: 'var(--emerald-600)', desc: 'Stipends and research support for postgraduates and doctorates.' },
    { title: 'Grants', icon: BookOpen, color: 'var(--lime-text)', desc: 'Project, travel, and student innovation funding.' },
    { title: 'Government Funding', icon: Landmark, color: 'var(--amber-600)', desc: 'State and central government welfare financial schemes.' },
    { title: 'Research Funding', icon: Microscope, color: 'var(--primary-800)', desc: 'Institutional capital for scientific computing & lab work.' },
    { title: 'Startup Funding', icon: Rocket, color: 'var(--primary-600)', desc: 'Non-dilutive prototype seed capital for student entrepreneurs.' },
  ];

  return (
    <div>
      {/* ====================================================================
          1. Hero Section (Aeline Aesthetic)
          ==================================================================== */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Content Column */}
            <div>
              <div className="hero-badge">
                <Sparkles size={14} style={{ color: 'var(--primary-700)' }} />
                <span>Together for a Greener Tomorrow</span>
              </div>

              <h1 className="hero-title">
                Find <span className="accent-word">Funding</span>,<br />
                Shape <span className="accent-word">Tomorrow</span>.
              </h1>

              <p className="hero-subtitle">
                We unite students, researchers, and creators with verified scholarships and funding opportunities to empower education and build a sustainable future for all.
              </p>

              {/* Quick Search / Email Input Pill (Aeline style) */}
              <form onSubmit={handleQuickSearch} className="hero-input-pill-wrap">
                <input
                  type="text"
                  className="hero-input-pill-field"
                  placeholder="Enter degree, scholarship, or scheme..."
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.35rem', fontSize: '0.9rem' }}>
                  Find Match <ArrowRight size={16} />
                </button>
              </form>

              {/* Quick AI Recommended Pill CTA */}
              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setTab(user ? 'ai-recommended' : 'find-funding')}
                  style={{
                    background: 'linear-gradient(135deg, rgba(200, 241, 105, 0.2), rgba(5, 150, 105, 0.15))',
                    border: '1px solid rgba(5, 150, 105, 0.3)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.45rem 1rem',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: 'var(--primary-800)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Sparkles size={14} color="var(--emerald-600)" />
                  <span>Try AI Scholarship Recommendations</span>
                  <span style={{
                    fontSize: '0.625rem',
                    background: 'var(--emerald-600)',
                    color: '#fff',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '999px',
                    fontWeight: 800,
                  }}>NEW</span>
                </button>
              </div>

              {/* Social Proof Avatars Cluster */}
              <div className="hero-social-proof">
                <div className="avatar-stack">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="Applicant"
                    className="avatar-bubble"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                    alt="Applicant"
                    className="avatar-bubble"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                    alt="Applicant"
                    className="avatar-bubble"
                  />
                </div>
                <div className="social-proof-text">
                  Join <strong>15,000+ applicants</strong> making a difference
                </div>
              </div>
            </div>

            {/* Right Atmospheric Hero Graphic with Floating Frosted Cards */}
            <div className="hero-visual-container">
              <img
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
                alt="Lush forest canopy"
                className="hero-visual-bg"
              />
              <div className="hero-visual-gradient" />

              {/* Floating Play Badge */}
              <div
                className="hero-play-pill"
                onClick={() => setShowEngineModal(true)}
                title="Explore 100-Point Rule Engine"
              >
                <Play size={14} fill="var(--primary-800)" />
                <span>How Scoring Works</span>
              </div>

              {/* Stack of Floating Frosted Mini-Cards (From Reference) */}
              <div className="hero-floating-column">
                <div
                  className="hero-floating-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTab('opportunities')}
                >
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80"
                    alt="Scholarships"
                    className="hero-floating-card-thumb"
                  />
                  <div>
                    <div className="hero-floating-card-title">Scholarships & Waivers</div>
                    <div className="hero-floating-card-desc">Merit & need-based college funding</div>
                  </div>
                </div>

                <div
                  className="hero-floating-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTab('opportunities')}
                >
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80"
                    alt="Research Fellowships"
                    className="hero-floating-card-thumb"
                  />
                  <div>
                    <div className="hero-floating-card-title">Research Fellowships</div>
                    <div className="hero-floating-card-desc">Postgrad & doctorate lab stipends</div>
                  </div>
                </div>

                <div
                  className="hero-floating-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTab('opportunities')}
                >
                  <img
                    src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=200&q=80"
                    alt="Innovation Grants"
                    className="hero-floating-card-thumb"
                  />
                  <div>
                    <div className="hero-floating-card-title">Innovation & Startup Grants</div>
                    <div className="hero-floating-card-desc">Non-dilutive prototype seed capital</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Frosted Glass Stat Cards (From Reference) */}
          <div className="hero-stats-row">
            <div className="hero-stat-card">
              <div className="hero-stat-number">₹25Cr+</div>
              <div className="hero-stat-label">Funding Pool Tracked</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number">120+</div>
              <div className="hero-stat-label">Verified Opportunities</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number">350+</div>
              <div className="hero-stat-label">Institutions Indexed</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number">100%</div>
              <div className="hero-stat-label">Deterministic Rule-Based</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. Section 2: "We're Building a Greener, Cleaner, Stronger World"
          ==================================================================== */}
      <section style={{ padding: '5.5rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '3.5rem', alignItems: 'center' }}>
            {/* Left Column */}
            <div>
              <div className="hero-badge" style={{ marginBottom: '1rem' }}>
                <Trees size={14} style={{ color: 'var(--primary-700)' }} />
                <span>Our Mission</span>
              </div>

              <h2 style={{ fontSize: '2.85rem', lineHeight: 1.15, marginBottom: '1.25rem' }}>
                We're Building a <span style={{ color: 'var(--primary-600)' }}>Clearer,</span> Fairer, Stronger Future.
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2.25rem' }}>
                Through auditable rule-based matching, transparent criteria verification, and direct official redirection, we empower students and researchers to navigate funding without black-box bias.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setTab('find-funding')}
                >
                  Find My Match <ArrowRight size={16} />
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setTab('opportunities')}
                >
                  Explore All
                </button>
              </div>
            </div>

            {/* Right Column: 3 Tall Photographic Feature Cards (From Reference) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {/* Card 1 */}
              <div
                className="feature-tall-card"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80)' }}
              >
                <div className="feature-tall-overlay" />
                <div className="feature-tall-content">
                  <div className="feature-tall-icon-bubble">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="feature-tall-title">Academic Match</h3>
                  <p className="feature-tall-desc">
                    Evaluate degrees, streams, and minimum CGPA criteria with zero guesswork.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="feature-tall-card"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80)' }}
              >
                <div className="feature-tall-overlay" />
                <div className="feature-tall-content">
                  <div className="feature-tall-icon-bubble">
                    <Globe2 size={20} />
                  </div>
                  <h3 className="feature-tall-title">Need & Quota</h3>
                  <p className="feature-tall-desc">
                    Deterministic checks for state domiciles, income ceilings, and social categories.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div
                className="feature-tall-card"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80)' }}
              >
                <div className="feature-tall-overlay" />
                <div className="feature-tall-content">
                  <div className="feature-tall-icon-bubble">
                    <Users2 size={20} />
                  </div>
                  <h3 className="feature-tall-title">Direct Portal</h3>
                  <p className="feature-tall-desc">
                    Zero third-party intermediaries. Apply directly on authorized government portals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted By Logos Row (From Reference) */}
          <div style={{ marginTop: '4.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)' }}>
              Trusted Institutional Sources
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
              <span>UGC India</span>
              <span>CSIR Labs</span>
              <span>DST Schemes</span>
              <span>AICTE Grants</span>
              <span>National Scholarship Portal</span>
              <span>Tata Trusts</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. Section 3: Categories Directory
          ==================================================================== */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="hero-badge" style={{ marginBottom: '0.75rem' }}>
                <Sparkles size={14} style={{ color: 'var(--primary-700)' }} />
                <span>Explore Directory</span>
              </div>
              <h2 style={{ fontSize: '2.4rem' }}>Funding By Stream</h2>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => setTab('opportunities')}
            >
              Browse All Opportunities <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{ padding: '2rem 1.75rem', cursor: 'pointer', background: '#ffffff', borderRadius: '22px' }}
                  onClick={() => setTab('opportunities')}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      background: 'var(--primary-50)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                      color: cat.color,
                      border: '1px solid var(--primary-100)',
                    }}
                  >
                    <IconComp size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem', color: 'var(--text-main)' }}>{cat.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                    {cat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. Section 4: Featured Opportunities + Signature Lime Card
          ==================================================================== */}
      <section style={{ padding: '5.5rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div className="hero-badge" style={{ marginBottom: '0.75rem' }}>
                <CheckCircle size={14} style={{ color: 'var(--primary-700)' }} />
                <span>Verified Calls</span>
              </div>
              <h2 style={{ fontSize: '2.5rem' }}>Featured Opportunities</h2>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setTab('find-funding')}
            >
              Match My Requirements <ArrowRight size={16} />
            </button>
          </div>

          {/* Opportunities Grid & Callout */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Left 2 Cols: Cards */}
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 0', color: 'var(--text-muted)' }}>
                  Loading opportunities...
                </div>
              ) : (
                <div className="opp-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                  {featuredOpps.slice(0, 4).map((opp) => (
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

            {/* Right Column: Signature Lime Card & Summary Info (Aeline Section 3) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Signature Lime Card */}
              <div className="lime-promo-card">
                <div>
                  <h3 className="lime-promo-title">
                    Stay Inspired.<br />Stay Informed.
                  </h3>
                  <p className="lime-promo-desc">
                    Subscribe to receive deadline reminders, new government notifications, and newly released schemes tailored to your requirements.
                  </p>

                  <form onSubmit={handleNewsletterSubmit} className="lime-promo-input-box">
                    <input
                      type="email"
                      required
                      className="lime-promo-input"
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                    >
                      Subscribe →
                    </button>
                  </form>

                  {newsletterSubscribed && (
                    <div style={{ marginTop: '0.85rem', fontSize: '0.825rem', color: '#163300', fontWeight: 700 }}>
                      ✓ Subscribed! You'll receive deadline alerts directly.
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="avatar-stack">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      alt="Scholar"
                      className="avatar-bubble"
                      style={{ width: '28px', height: '28px' }}
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                      alt="Scholar"
                      className="avatar-bubble"
                      style={{ width: '28px', height: '28px' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#163300', fontWeight: 600 }}>
                    Join thousands of change-makers
                  </span>
                </div>
              </div>

              {/* Real Actions Summary Card */}
              <div className="card" style={{ padding: '1.75rem', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  Real Actions. Real Impact.
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Our rule engine maps academic degrees, caste reservations, income limits, and project domains into concrete eligibility percentages.
                </p>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => setTab('opportunities')}
                >
                  View All Initiatives →
                </button>
              </div>
            </div>
          </div>

          {/* Official Verification Disclaimer */}
          <DisclaimerBanner />
        </div>
      </section>

      {/* ====================================================================
          Engine Explanation Modal (When clicking "How Scoring Works")
          ==================================================================== */}
      {showEngineModal && (
        <div className="modal-overlay" onClick={() => setShowEngineModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-800)' }}>
                  <ShieldCheck size={18} />
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>How GrantMatch Scores Eligibility</h3>
              </div>
              <button
                onClick={() => setShowEngineModal(false)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                GrantMatch uses a 100-point deterministic evaluation formula. Every point corresponds directly to an official requirement in the provider's criteria:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Education Level & Degree</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Degree level and specific course enrollment match</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--primary-800)', fontSize: '1.05rem' }}>40 pts</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Academic Performance</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cutoff percentage / CGPA requirements</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--primary-800)', fontSize: '1.05rem' }}>15 pts</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Income Ceiling & Domicile</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Family income thresholds and state residency</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--primary-800)', fontSize: '1.05rem' }}>20 pts</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Category, Age & Purpose</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Social quota, age bracket, and funding intent</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--primary-800)', fontSize: '1.05rem' }}>25 pts</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--lime-50)', border: '1px solid var(--lime-border)', borderRadius: 'var(--radius-md)', color: 'var(--lime-text)', fontSize: '0.85rem' }}>
                ✓ <strong>100% Deterministic & Auditable:</strong> Zero AI hallucinations or opaque black-box scoring.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowEngineModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => { setShowEngineModal(false); setTab('find-funding'); }}>
                Try Eligibility Check →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
