/**
 * Deterministic Rule-Based Matching Engine for GrantMatch
 * Strictly NO AI / NO Machine Learning.
 * 
 * Calculates an Eligibility Match score (0 - 100%) by comparing 
 * manually configured opportunity criteria against user profile parameters.
 */

const normalize = (str) => (str ? String(str).toLowerCase().trim() : '');

const calculateMatch = (user = {}, opportunity = {}) => {
  let totalScore = 0;
  const maxPossible = 100;
  const positiveReasons = [];
  const gaps = [];
  const criteriaBreakdown = [];

  // Normalize user inputs
  const userEdu = normalize(user.educationLevel);
  const userField = normalize(user.course || user.field || user.stream);
  const userPercentage = user.percentage !== undefined && user.percentage !== null && user.percentage !== ''
    ? Number(user.percentage)
    : null;
  const userPurpose = normalize(user.fundingPurpose);
  const userCountry = normalize(user.country || 'India');
  const userState = normalize(user.state);
  const userIncome = user.annualIncome !== undefined && user.annualIncome !== null && user.annualIncome !== ''
    ? Number(user.annualIncome)
    : null;
  const userAge = user.age !== undefined && user.age !== null && user.age !== '' ? Number(user.age) : null;
  const userNationality = normalize(user.nationality || 'Indian');
  const userCategory = normalize(user.category || 'General');

  // 1. EDUCATION LEVEL (Weight: 20 points)
  const oppEduLevels = Array.isArray(opportunity.educationLevels)
    ? opportunity.educationLevels.map(normalize)
    : ['any'];
  const eduIsAny = oppEduLevels.length === 0 || oppEduLevels.includes('any');

  if (eduIsAny) {
    totalScore += 20;
    positiveReasons.push('Open to all education levels');
    criteriaBreakdown.push({ criterion: 'Education Level', score: 20, max: 20, status: 'match' });
  } else if (userEdu && oppEduLevels.some(l => l.includes(userEdu) || userEdu.includes(l))) {
    totalScore += 20;
    positiveReasons.push(`Your education level (${user.educationLevel}) is eligible`);
    criteriaBreakdown.push({ criterion: 'Education Level', score: 20, max: 20, status: 'match' });
  } else if (!userEdu) {
    criteriaBreakdown.push({ criterion: 'Education Level', score: 0, max: 20, status: 'unspecified' });
    gaps.push(`Education level not specified in your profile (Required: ${opportunity.educationLevels.join(', ')})`);
  } else {
    criteriaBreakdown.push({ criterion: 'Education Level', score: 0, max: 20, status: 'gap' });
    gaps.push(`Education requirement mismatch (Requires: ${opportunity.educationLevels.join(', ')}, You: ${user.educationLevel})`);
  }

  // 2. FIELD / STREAM (Weight: 20 points)
  const oppFields = Array.isArray(opportunity.fields)
    ? opportunity.fields.map(normalize)
    : ['any'];
  const fieldIsAny = oppFields.length === 0 || oppFields.includes('any');

  if (fieldIsAny) {
    totalScore += 20;
    positiveReasons.push('Open to all disciplines and fields of study');
    criteriaBreakdown.push({ criterion: 'Field of Study', score: 20, max: 20, status: 'match' });
  } else if (userField && oppFields.some(f => f.includes(userField) || userField.includes(f))) {
    totalScore += 20;
    positiveReasons.push(`Your field of study (${user.course || user.field}) matches eligible streams`);
    criteriaBreakdown.push({ criterion: 'Field of Study', score: 20, max: 20, status: 'match' });
  } else if (!userField) {
    criteriaBreakdown.push({ criterion: 'Field of Study', score: 0, max: 20, status: 'unspecified' });
    gaps.push(`Field/Course not specified (Target streams: ${opportunity.fields.join(', ')})`);
  } else {
    criteriaBreakdown.push({ criterion: 'Field of Study', score: 0, max: 20, status: 'gap' });
    gaps.push(`Field of study not targeted (Requires: ${opportunity.fields.join(', ')})`);
  }

  // 3. ACADEMIC REQUIREMENT (Weight: 15 points)
  const minPercentage = Number(opportunity.minimumPercentage || 0);
  if (minPercentage === 0) {
    totalScore += 15;
    positiveReasons.push('No minimum academic score restriction');
    criteriaBreakdown.push({ criterion: 'Academic Requirement', score: 15, max: 15, status: 'match' });
  } else if (userPercentage !== null && userPercentage >= minPercentage) {
    totalScore += 15;
    positiveReasons.push(`Academic score satisfies requirement (Required: ≥${minPercentage}%, Yours: ${userPercentage}%)`);
    criteriaBreakdown.push({ criterion: 'Academic Requirement', score: 15, max: 15, status: 'match' });
  } else if (userPercentage === null) {
    criteriaBreakdown.push({ criterion: 'Academic Requirement', score: 0, max: 15, status: 'unspecified' });
    gaps.push(`Academic percentage not entered (Minimum required: ${minPercentage}%)`);
  } else {
    criteriaBreakdown.push({ criterion: 'Academic Requirement', score: 0, max: 15, status: 'gap' });
    gaps.push(`Minimum academic requirement not satisfied (Required: ≥${minPercentage}%, Yours: ${userPercentage}%)`);
  }

  // 4. FUNDING PURPOSE (Weight: 10 points)
  const oppPurposes = Array.isArray(opportunity.fundingPurpose)
    ? opportunity.fundingPurpose.map(normalize)
    : [normalize(opportunity.type)];
  const purposeIsAny = oppPurposes.length === 0 || oppPurposes.includes('any');

  if (purposeIsAny) {
    totalScore += 10;
    positiveReasons.push('Funding is adaptable to multiple financial assistance purposes');
    criteriaBreakdown.push({ criterion: 'Funding Purpose', score: 10, max: 10, status: 'match' });
  } else if (userPurpose && (oppPurposes.some(p => p.includes(userPurpose) || userPurpose.includes(p)) || normalize(opportunity.type).includes(userPurpose))) {
    totalScore += 10;
    positiveReasons.push(`Matches your funding goal: ${user.fundingPurpose}`);
    criteriaBreakdown.push({ criterion: 'Funding Purpose', score: 10, max: 10, status: 'match' });
  } else if (!userPurpose) {
    totalScore += 5; // Neutral default
    criteriaBreakdown.push({ criterion: 'Funding Purpose', score: 5, max: 10, status: 'neutral' });
  } else {
    criteriaBreakdown.push({ criterion: 'Funding Purpose', score: 0, max: 10, status: 'gap' });
    gaps.push(`Intended for ${opportunity.type} / ${opportunity.fundingPurpose ? opportunity.fundingPurpose.join(', ') : 'specific purposes'}`);
  }

  // 5. LOCATION / REGION (Weight: 10 points)
  const oppLocations = Array.isArray(opportunity.eligibleLocations)
    ? opportunity.eligibleLocations.map(normalize)
    : ['all'];
  const locIsAll = oppLocations.length === 0 || oppLocations.includes('all');
  const oppCountry = normalize(opportunity.country || 'India');
  const countryMatches = oppCountry === 'all' || oppCountry === userCountry;

  if (locIsAll && countryMatches) {
    totalScore += 10;
    positiveReasons.push('Open to applicants across all regions nationwide');
    criteriaBreakdown.push({ criterion: 'Location', score: 10, max: 10, status: 'match' });
  } else if (userState && oppLocations.some(l => l.includes(userState) || userState.includes(l))) {
    totalScore += 10;
    positiveReasons.push(`Your state/region (${user.state}) is eligible`);
    criteriaBreakdown.push({ criterion: 'Location', score: 10, max: 10, status: 'match' });
  } else if (!locIsAll && userState && !oppLocations.includes(userState)) {
    criteriaBreakdown.push({ criterion: 'Location', score: 0, max: 10, status: 'gap' });
    gaps.push(`Location restricted to: ${opportunity.eligibleLocations.join(', ')}`);
  } else {
    totalScore += 7;
    positiveReasons.push(`Country matches (${opportunity.country || 'India'})`);
    criteriaBreakdown.push({ criterion: 'Location', score: 7, max: 10, status: 'match' });
  }

  // 6. INCOME REQUIREMENT (Weight: 10 points)
  const incomeLimit = Number(opportunity.incomeLimit || 0);
  if (incomeLimit === 0) {
    totalScore += 10;
    positiveReasons.push('No family income ceiling applied');
    criteriaBreakdown.push({ criterion: 'Income Limit', score: 10, max: 10, status: 'match' });
  } else if (userIncome !== null && userIncome <= incomeLimit) {
    totalScore += 10;
    positiveReasons.push(`Income requirement satisfied (Annual ceiling: ₹${incomeLimit.toLocaleString()}, Yours: ₹${userIncome.toLocaleString()})`);
    criteriaBreakdown.push({ criterion: 'Income Limit', score: 10, max: 10, status: 'match' });
  } else if (userIncome === null) {
    criteriaBreakdown.push({ criterion: 'Income Limit', score: 0, max: 10, status: 'unspecified' });
    gaps.push(`Income threshold is ₹${incomeLimit.toLocaleString()} (Not provided in profile)`);
  } else {
    criteriaBreakdown.push({ criterion: 'Income Limit', score: 0, max: 10, status: 'gap' });
    gaps.push(`Family income exceeds ceiling (Limit: ₹${incomeLimit.toLocaleString()}, Yours: ₹${userIncome.toLocaleString()})`);
  }

  // 7. AGE REQUIREMENT (Weight: 5 points)
  const minAge = Number(opportunity.minAge || 0);
  const maxAge = Number(opportunity.maxAge || 100);
  if (minAge === 0 && maxAge >= 100) {
    totalScore += 5;
    positiveReasons.push('No age restrictions');
    criteriaBreakdown.push({ criterion: 'Age Limit', score: 5, max: 5, status: 'match' });
  } else if (userAge !== null && userAge >= minAge && userAge <= maxAge) {
    totalScore += 5;
    positiveReasons.push(`Age eligibility satisfied (${userAge} years)`);
    criteriaBreakdown.push({ criterion: 'Age Limit', score: 5, max: 5, status: 'match' });
  } else if (userAge === null) {
    totalScore += 3;
    criteriaBreakdown.push({ criterion: 'Age Limit', score: 3, max: 5, status: 'neutral' });
  } else {
    criteriaBreakdown.push({ criterion: 'Age Limit', score: 0, max: 5, status: 'gap' });
    gaps.push(`Age must be between ${minAge} and ${maxAge} years (Yours: ${userAge})`);
  }

  // 8. NATIONALITY (Weight: 5 points)
  const oppNationalities = Array.isArray(opportunity.nationalityEligibility)
    ? opportunity.nationalityEligibility.map(normalize)
    : ['any'];
  const natIsAny = oppNationalities.length === 0 || oppNationalities.includes('any');

  if (natIsAny || (userNationality && oppNationalities.includes(userNationality))) {
    totalScore += 5;
    positiveReasons.push('Citizenship / Nationality criteria met');
    criteriaBreakdown.push({ criterion: 'Nationality', score: 5, max: 5, status: 'match' });
  } else {
    criteriaBreakdown.push({ criterion: 'Nationality', score: 0, max: 5, status: 'gap' });
    gaps.push(`Citizenship requirement: ${opportunity.nationalityEligibility.join(', ')}`);
  }

  // 9. CATEGORY / SOCIAL RESERVATION (Weight: 5 points)
  const oppCategories = Array.isArray(opportunity.categoryEligibility)
    ? opportunity.categoryEligibility.map(normalize)
    : ['any'];
  const catIsAny = oppCategories.length === 0 || oppCategories.includes('any');

  if (catIsAny || (userCategory && oppCategories.includes(userCategory))) {
    totalScore += 5;
    positiveReasons.push(`Category criteria satisfied (${user.category || 'General'})`);
    criteriaBreakdown.push({ criterion: 'Applicant Category', score: 5, max: 5, status: 'match' });
  } else {
    criteriaBreakdown.push({ criterion: 'Applicant Category', score: 0, max: 5, status: 'gap' });
    gaps.push(`Category reserved for: ${opportunity.categoryEligibility.join(', ')}`);
  }

  // GENDER CHECK (Hard filter or penalty if strict)
  if (opportunity.genderEligibility && opportunity.genderEligibility !== 'Any' && user.gender && user.gender !== 'Any') {
    if (normalize(opportunity.genderEligibility) !== normalize(user.gender)) {
      gaps.push(`Restricted to ${opportunity.genderEligibility} applicants`);
      totalScore = Math.max(0, totalScore - 15);
    } else {
      positiveReasons.push(`Gender eligibility satisfied (${user.gender})`);
    }
  }

  const finalScore = Math.min(100, Math.max(0, Math.round((totalScore / maxPossible) * 100)));

  return {
    matchPercentage: finalScore,
    score: finalScore,
    reasons: positiveReasons,
    gaps: gaps,
    breakdown: criteriaBreakdown,
  };
};

module.exports = {
  calculateMatch,
};
