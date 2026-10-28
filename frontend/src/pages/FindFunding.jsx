import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Sliders,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Award
} from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { api } from '../services/api';

export default function FindFunding({
  user,
  setSelectedOpp,
  onToggleSave,
  savedIds = [],
}) {
  // Requirement form inputs initialized with user profile values if available
  const [formData, setFormData] = useState({
    fundingPurpose: user?.fundingPurpose || 'Education',
    requiredAmount: user?.requiredAmount || '',
    educationLevel: user?.educationLevel || 'Undergraduate',
    course: user?.course || '',
    percentage: user?.percentage !== null && user?.percentage !== undefined ? user.percentage : '',
    age: user?.age || '',
    annualIncome: user?.annualIncome !== null && user?.annualIncome !== undefined ? user.annualIncome : '',
    state: user?.state || 'All',
    nationality: user?.nationality || 'Indian',
    category: user?.category || 'General',
    gender: user?.gender || 'Any',
    skills: user?.skills ? (Array.isArray(user.skills) ? user.skills.join(', ') : user.skills) : '',
    interests: user?.interests ? (Array.isArray(user.interests) ? user.interests.join(', ') : user.interests) : '',
  });

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('Highest Match');

  useEffect(() => {
    // If user profile is available, run initial match automatically
    if (user) {
      handleMatchSubmit();
    }
  }, [user]);

  const handleMatchSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setHasCalculated(true);
    try {
      const payload = {
        fundingPurpose: formData.fundingPurpose,
        requiredAmount: formData.requiredAmount ? Number(formData.requiredAmount) : null,
        educationLevel: formData.educationLevel,
        course: formData.course,
        percentage: formData.percentage !== '' ? Number(formData.percentage) : null,
        age: formData.age !== '' ? Number(formData.age) : null,
        annualIncome: formData.annualIncome !== '' ? Number(formData.annualIncome) : null,
        state: formData.state,
        country: 'India',
        nationality: formData.nationality,
        category: formData.category,
        gender: formData.gender,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
        interests: formData.interests ? formData.interests.split(',').map(s => s.trim()) : [],
      };

      const res = await api.calculateMatch(payload);
      if (res.success) {
        setMatches(res.opportunities || []);
      }
    } catch (err) {
      console.error('Match error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort matched opportunities
  const filteredMatches = matches.filter((opp) => {
    if (filterType === 'All') return true;
    return opp.type === filterType;
  });

  filteredMatches.sort((a, b) => {
    if (sortBy === 'Highest Match') {
      return (b.eligibilityMatch || 0) - (a.eligibilityMatch || 0);
    } else if (sortBy === 'Deadline Soon') {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortBy === 'Funding Amount') {
      return (b.fundingAmount || 0) - (a.fundingAmount || 0);
    }
    return 0;
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="hero-badge">
            <Award size={15} style={{ color: 'var(--primary-600)' }} />
            <span>Rule-Based Eligibility Discovery</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Find Your Funding</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '720px' }}>
            Enter your academic credentials, family income, and funding goals. Our deterministic rule engine compares your profile directly with database criteria to compute your verified eligibility match score.
          </p>
        </div>

        {/* Requirements Input Form */}
        <div className="card" style={{ padding: '2rem', marginBottom: '3rem', borderTop: '4px solid var(--primary-600)' }}>
          <form onSubmit={handleMatchSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Funding Purpose */}
              <div>
                <label className="form-label">What do you need funding for?</label>
                <select
                  className="form-control"
                  value={formData.fundingPurpose}
                  onChange={(e) => setFormData({ ...formData, fundingPurpose: e.target.value })}
                >
                  <option value="Education">Education (Tuition & College)</option>
                  <option value="Research">Research & Fellowship</option>
                  <option value="Startup">Startup & Prototyping</option>
                  <option value="Business">Business Venture</option>
                  <option value="Fellowship">Doctoral Fellowship</option>
                  <option value="Other">Other Assistance</option>
                </select>
              </div>

              {/* Required Funding Amount */}
              <div>
                <label className="form-label">Required Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 50000"
                  value={formData.requiredAmount}
                  onChange={(e) => setFormData({ ...formData, requiredAmount: e.target.value })}
                />
              </div>

              {/* Education Level */}
              <div>
                <label className="form-label">Education Level</label>
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
                  <option value="Any">Any Level</option>
                </select>
              </div>

              {/* Course / Stream */}
              <div>
                <label className="form-label">Field / Stream of Study</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Computer Science, Engineering"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>

              {/* Academic Percentage */}
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

              {/* Age */}
              <div>
                <label className="form-label">Applicant Age</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 23"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              {/* Annual Income */}
              <div>
                <label className="form-label">Annual Family Income (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 300000"
                  value={formData.annualIncome}
                  onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                />
              </div>

              {/* State / Region */}
              <div>
                <label className="form-label">State / Region</label>
                <select
                  className="form-control"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                >
                  <option value="All">All Regions / Pan-India</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Other">Other State</option>
                </select>
              </div>

              {/* Nationality */}
              <div>
                <label className="form-label">Citizenship / Nationality</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>

              {/* Applicant Category */}
              <div>
                <label className="form-label">Social / Reservation Category</label>
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

              {/* Gender */}
              <div>
                <label className="form-label">Gender</label>
                <select
                  className="form-control"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Any">Any / Not Specified</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other/Specified">Other / Specified</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="form-label">Skills (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Python, STEM, Web Dev"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? <RefreshCw className="spin" size={18} /> : <Search size={18} />}
                Find Matching Opportunities
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {hasCalculated && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem' }}>
                  Matching Opportunities ({filteredMatches.length})
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Ranked by deterministic criteria compatibility score.
                </p>
              </div>

              {/* Filter & Sort Controls */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  className="form-control"
                  style={{ width: 'auto' }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Funding Types</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Fellowship">Fellowship</option>
                  <option value="Grant">Grant</option>
                  <option value="Government Funding">Government Funding</option>
                  <option value="Research Funding">Research Funding</option>
                  <option value="Startup Funding">Startup Funding</option>
                </select>

                <select
                  className="form-control"
                  style={{ width: 'auto' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Highest Match">Sort: Highest Match</option>
                  <option value="Deadline Soon">Sort: Deadline Soon</option>
                  <option value="Funding Amount">Sort: Funding Amount</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Evaluating eligibility criteria...
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No opportunities match the selected criteria.</p>
                <p style={{ fontSize: '0.85rem' }}>Try broadening your education level, location, or funding purpose.</p>
              </div>
            ) : (
              <div className="opp-grid">
                {filteredMatches.map((opp) => (
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

            <DisclaimerBanner />
          </div>
        )}
      </div>
    </div>
  );
}
