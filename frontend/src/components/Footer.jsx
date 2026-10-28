import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';

const TwitterIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer({ setTab, user }) {
  return (
    <footer style={{ background: '#ffffff', color: 'var(--text-main)', padding: '4rem 0 2rem', marginTop: 'auto', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Col 1: Brand & Mission */}
          <div style={{ maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-800)', marginBottom: '0.85rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--primary-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime-300)' }}>
                <Award size={18} />
              </div>
              Grant<span style={{ color: 'var(--primary-600)' }}>Match</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Together, we empower students, researchers, and creators to access verified opportunities and build a brighter, sustainable tomorrow.
            </p>
          </div>

          {/* Col 2: Explore */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.15rem' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setTab('opportunities')}>Scholarships</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setTab('opportunities')}>Research Fellowships</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setTab('opportunities')}>Grants & Fellowships</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setTab('opportunities')}>Government Schemes</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setTab('opportunities')}>Startup Innovation Funds</li>
            </ul>
          </div>

          {/* Col 3: Get Involved / Navigation */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.15rem' }}>Get Involved</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => setTab('home')}>Home</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setTab('find-funding')}>Find Your Funding</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setTab('opportunities')}>All Opportunities</li>
              {user && user.role === 'admin' ? (
                <li style={{ cursor: 'pointer', color: 'var(--primary-700)', fontWeight: 600 }} onClick={() => setTab('admin')}>Admin Portal</li>
              ) : (
                <li style={{ cursor: 'pointer' }} onClick={() => setTab('dashboard')}>User Dashboard</li>
              )}
            </ul>
          </div>

          {/* Col 4: Support & Follow Us */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.15rem' }}>Follow Us</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <a href="#twitter" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }} title="Twitter">
                <TwitterIcon size={16} />
              </a>
              <a href="#instagram" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }} title="Instagram">
                <InstagramIcon size={16} />
              </a>
              <a href="#facebook" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }} title="Facebook">
                <FacebookIcon size={16} />
              </a>
              <a href="#linkedin" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }} title="LinkedIn">
                <LinkedinIcon size={16} />
              </a>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--primary-800)', display: 'block', marginBottom: '2px' }}>100% Deterministic Engine</strong>
              Auditable, rule-based matching with zero black-box bias.
            </div>
          </div>
        </div>

        {/* Official Disclaimer */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-light)', lineHeight: 1.6, textAlign: 'center', maxWidth: '980px', margin: '0 auto' }}>
            <strong>Official Verification Disclaimer:</strong> GrantMatch provides funding opportunity information and rule-based eligibility matching based on available criteria. It does not award funding or guarantee selection. Users should verify current eligibility, deadlines, and application requirements directly with the official funding provider before applying.
          </p>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            © {new Date().getFullYear()} GrantMatch. All rights reserved. Master of Computer Applications (MCA) Project.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
