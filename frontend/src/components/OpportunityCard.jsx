import React from 'react';
import { ExternalLink, Bookmark, Clock, CheckCircle2, XCircle, ChevronRight, AlertTriangle } from 'lucide-react';

export default function OpportunityCard({
  opp,
  onViewDetails,
  onToggleSave,
  isSaved = false,
}) {
  const isExpired = opp.isExpired || opp.status === 'Expired';
  const matchScore = opp.eligibilityMatch !== null && opp.eligibilityMatch !== undefined
    ? Number(opp.eligibilityMatch)
    : null;

  // Format currency
  const formattedAmount = opp.fundingAmount > 0
    ? `₹${opp.fundingAmount.toLocaleString('en-IN')}`
    : opp.fundingType || 'Full / Partial Support';

  // Format deadline
  const deadlineDate = new Date(opp.deadline).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getBadgeClass = (type) => {
    switch (type) {
      case 'Scholarship': return 'badge-lime';
      case 'Fellowship': return 'badge-green';
      case 'Grant': return 'badge-lime';
      case 'Government Funding': return 'badge-amber';
      case 'Research Funding': return 'badge-blue';
      case 'Startup Funding': return 'badge-purple';
      default: return 'badge-gray';
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="opp-card">
      {/* Header: Provider & Type */}
      <div className="opp-card-header">
        <div>
          <div className="opp-provider">{opp.provider}</div>
          <h3 className="opp-name">{opp.name}</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <span className={`badge ${getBadgeClass(opp.type)}`}>{opp.type}</span>
          {opp.isSample && (
            <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>Demo Record</span>
          )}
        </div>
      </div>

      {/* Funding Banner */}
      <div className="opp-funding-banner">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {opp.fundingType || 'Funding Support'}
          </div>
          <div className="opp-funding-amount">{formattedAmount}</div>
        </div>

        {/* Deadline Indicator */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end', fontSize: '0.8rem', color: isExpired ? 'var(--rose-600)' : 'var(--text-muted)' }}>
            <Clock size={14} />
            <span>{isExpired ? 'Application Closed' : `Due: ${deadlineDate}`}</span>
          </div>
          {!isExpired && opp.daysRemaining !== undefined && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: opp.daysRemaining <= 7 ? 'var(--rose-600)' : 'var(--emerald-600)',
              }}
            >
              {opp.daysRemaining === 0 ? 'Last Day Today' : `${opp.daysRemaining} days remaining`}
            </span>
          )}
        </div>
      </div>

      {/* Eligibility Match Pill */}
      {matchScore !== null && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.4rem 0' }}>
          <div className={`match-score-pill ${getScoreBadgeClass(matchScore)}`}>
            <span>{matchScore}% Eligibility Match</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rule-based check</span>
        </div>
      )}

      {/* Checklist Preview */}
      {(opp.reasons?.length > 0 || opp.gaps?.length > 0) && (
        <ul className="opp-reasons-list">
          {opp.reasons?.slice(0, 3).map((reason, idx) => (
            <li key={`r-${idx}`} className="opp-reason-item">
              <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{reason}</span>
            </li>
          ))}
          {opp.gaps?.slice(0, 2).map((gap, idx) => (
            <li key={`g-${idx}`} className="opp-gap-item">
              <XCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{gap}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Card Footer Actions */}
      <div className="opp-card-footer">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onViewDetails(opp)}
          title="View full eligibility criteria and required documents"
        >
          View Details <ChevronRight size={15} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onToggleSave && (
            <button
              className={`btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => onToggleSave(opp._id)}
              title={isSaved ? 'Saved to Bookmarks' : 'Save Opportunity'}
              style={{ padding: '0.45rem 0.65rem' }}
            >
              <Bookmark size={16} fill={isSaved ? 'var(--primary-600)' : 'none'} color={isSaved ? 'var(--primary-600)' : 'currentColor'} />
            </button>
          )}

          <a
            href={opp.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            title="Redirect to official application website"
          >
            Apply Official <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
