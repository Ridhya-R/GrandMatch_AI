import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, X, SlidersHorizontal, ChevronDown, Sparkles } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { api } from '../services/api';

export default function Opportunities({
  setSelectedOpp,
  onToggleSave,
  savedIds = [],
  user,
  setTab,
}) {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [educationLevel, setEducationLevel] = useState('All');
  const [fundingType, setFundingType] = useState('All');
  const [location, setLocation] = useState('All');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetchOpportunities();
  }, [type, educationLevel, fundingType, location, sort]);

  const fetchOpportunities = async (customSearch = search) => {
    setLoading(true);
    try {
      const res = await api.getOpportunities({
        search: customSearch,
        type,
        educationLevel,
        fundingType,
        location,
        sort,
      });
      if (res.success) {
        setOpps(res.opportunities || []);
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities(search);
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('All');
    setEducationLevel('All');
    setFundingType('All');
    setLocation('All');
    setSort('newest');
    fetchOpportunities('');
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header & Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Explore Opportunities</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Browse verified scholarships, fellowships, research grants, and government funding opportunities.
          </p>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '680px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by opportunity name, provider, stream, course, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            {(search || type !== 'All' || educationLevel !== 'All' || location !== 'All') && (
              <button type="button" className="btn btn-outline" onClick={handleResetFilters}>
                Reset
              </button>
            )}
          </form>
        </div>

        {/* AI Recommendations Feature Callout Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(200, 241, 105, 0.18) 0%, rgba(5, 150, 105, 0.12) 100%)',
          border: '1.5px solid rgba(5, 150, 105, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--emerald-600), var(--primary-700))',
              color: '#fff',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-900)' }}>
                  Looking for AI-Recommended Scholarships?
                </span>
                <span className="badge badge-lime" style={{ fontSize: '0.65rem', fontWeight: 800 }}>AI MATCH</span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Our ML engine automatically calculates verified eligibility and rank scores based on your profile.
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
            onClick={() => setTab ? setTab('ai-recommended') : null}
          >
            <Sparkles size={15} />
            View My AI Recommendations
          </button>
        </div>

        {/* Catalog Layout: Sidebar + Grid */}
        <div className="catalog-layout">
          {/* Filters Sidebar */}
          <aside className="filter-sidebar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <SlidersHorizontal size={16} /> Filter Criteria
              </span>
              <button
                onClick={handleResetFilters}
                style={{ fontSize: '0.75rem', color: 'var(--primary-600)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear All
              </button>
            </div>

            {/* Type */}
            <div className="filter-group">
              <label className="filter-title">Funding Stream / Type</label>
              <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="All">All Funding Types</option>
                <option value="Scholarship">Scholarships</option>
                <option value="Fellowship">Fellowships</option>
                <option value="Grant">Grants</option>
                <option value="Government Funding">Government Funding</option>
                <option value="Research Funding">Research Funding</option>
                <option value="Startup Funding">Startup Funding</option>
              </select>
            </div>

            {/* Education Level */}
            <div className="filter-group">
              <label className="filter-title">Education Level</label>
              <select className="form-control" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                <option value="All">All Education Levels</option>
                <option value="Higher Secondary">Higher Secondary</option>
                <option value="Diploma">Diploma</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="PhD">PhD / Doctoral</option>
              </select>
            </div>

            {/* Funding Nature */}
            <div className="filter-group">
              <label className="filter-title">Funding Support Type</label>
              <select className="form-control" value={fundingType} onChange={(e) => setFundingType(e.target.value)}>
                <option value="All">All Support Types</option>
                <option value="Full Funding">Full Funding</option>
                <option value="Partial Funding">Partial Funding</option>
                <option value="Fixed Amount">Fixed Amount</option>
                <option value="Variable Amount">Variable Amount</option>
              </select>
            </div>

            {/* Location */}
            <div className="filter-group">
              <label className="filter-title">Location / State</label>
              <select className="form-control" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="All">All Locations / Nationwide</option>
                <option value="Kerala">Kerala</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="filter-group">
              <label className="filter-title">Sort By</label>
              <select className="form-control" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Recently Published</option>
                <option value="deadline">Approaching Deadline</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                {user && <option value="match">Highest Eligibility Match</option>}
              </select>
            </div>
          </aside>

          {/* Opportunities Grid */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Showing {opps.length} verified opportunities
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Fetching opportunities catalog...
              </div>
            ) : opps.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No opportunities found matching these filters.</p>
                <button className="btn btn-outline btn-sm" onClick={handleResetFilters} style={{ marginTop: '0.75rem' }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="opp-grid">
                {opps.map((opp) => (
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
          </main>
        </div>
      </div>
    </div>
  );
}
