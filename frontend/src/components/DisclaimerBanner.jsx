import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner({ className = '' }) {
  return (
    <div className={`disclaimer-banner ${className}`}>
      <AlertCircle size={20} style={{ color: 'var(--primary-700)', flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong>Important Official Verification Notice:</strong> GrantMatch provides funding opportunity information and rule-based eligibility matching based on available criteria. It does not award funding or guarantee selection. Users should verify current eligibility, deadlines, and official application guidelines directly with the provider before applying.
      </div>
    </div>
  );
}
