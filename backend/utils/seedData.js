const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const SavedOpportunity = require('../models/SavedOpportunity');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

const sampleOpportunities = [
  {
    name: 'National Higher Education Merit Scholarship',
    provider: 'Central Board for Educational Grants',
    type: 'Scholarship',
    description: '[SAMPLE / DEMO RECORD for Academic Evaluation] Comprehensive financial support for meritorious students pursuing full-time graduate and postgraduate degrees in science, technology, and humanities.',
    fundingAmount: 75000,
    fundingType: 'Fixed Amount',
    openingDate: new Date('2026-08-01'),
    deadline: new Date('2026-10-31'),
    officialUrl: 'https://scholarships.gov.in/merit-demo',
    country: 'India',
    state: 'All',
    eligibleLocations: ['All'],
    educationLevels: ['Undergraduate', 'Postgraduate'],
    fields: ['Computer Science', 'Engineering', 'Science', 'Management', 'Arts'],
    minimumPercentage: 70,
    minAge: 18,
    maxAge: 26,
    incomeLimit: 500000,
    genderEligibility: 'Any',
    categoryEligibility: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    nationalityEligibility: ['Indian'],
    skills: ['Academic Merit', 'Leadership'],
    interests: ['Higher Education', 'Technology', 'Research'],
    fundingPurpose: ['Education'],
    requiredDocuments: [
      'Academic Marksheets (10th, 12th & Degree)',
      'Income Certificate issued by competent authority',
      'Proof of College Admission / Bonafide Certificate',
      'Government ID (Aadhaar / Voter ID)',
      'Bank Account Passbook Details',
    ],
    numberOfAwards: 500,
    contactInformation: 'merit-support@grantmatch.demo | 1800-200-0111',
    notes: 'Renewable yearly subject to maintaining at least 65% aggregate score.',
    status: 'Published',
    isSample: true,
  },
  {
    name: 'Pragati Women in STEM Fellowship',
    provider: 'Council for Scientific Empowerment & Innovation',
    type: 'Fellowship',
    description: '[SAMPLE / DEMO RECORD for Academic Evaluation] Prestigious fellowship program intended to encourage, support, and advance girl students and women in technical education and research careers.',
    fundingAmount: 120000,
    fundingType: 'Full Funding',
    openingDate: new Date('2026-07-15'),
    deadline: new Date('2026-10-15'),
    officialUrl: 'https://fellowships.org/pragati-demo',
    country: 'India',
    state: 'All',
    eligibleLocations: ['All'],
    educationLevels: ['Undergraduate', 'Postgraduate', 'PhD'],
    fields: ['Computer Science', 'Engineering', 'Science', 'Information Technology'],
    minimumPercentage: 65,
    minAge: 18,
    maxAge: 32,
    incomeLimit: 800000,
    genderEligibility: 'Female',
    categoryEligibility: ['Any'],
    nationalityEligibility: ['Indian'],
    skills: ['STEM', 'Software Development', 'Applied Science'],
    interests: ['STEM Research', 'Innovation', 'Technology'],
    fundingPurpose: ['Education', 'Fellowship', 'Research'],
    requiredDocuments: [
      'Bonafide Enrollment Proof in accredited institution',
      'Degree Marksheets',
      'Statement of Purpose (SOP)',
      'Income Proof of Parents/Guardian',
      'Valid Photo ID',
    ],
    numberOfAwards: 250,
    contactInformation: 'pragati-desk@stem-council.demo',
    notes: 'Award includes tuition fee reimbursement and a monthly contingency allowance.',
    status: 'Published',
    isSample: true,
  },
  {
    name: 'Ramanujan Doctoral Research Innovation Fellowship',
    provider: 'National Science & Technology Foundation',
    type: 'Research Funding',
    description: '[SAMPLE / DEMO RECORD for Academic Evaluation] High-impact fellowship for doctoral scholars and postgraduates engaged in experimental computer science, artificial intelligence hardware, and mathematical sciences.',
    fundingAmount: 420000,
    fundingType: 'Full Funding',
    openingDate: new Date('2026-06-01'),
    deadline: new Date('2026-11-15'),
    officialUrl: 'https://research-fellowships.edu.demo/ramanujan',
    country: 'India',
    state: 'All',
    eligibleLocations: ['All'],
    educationLevels: ['Postgraduate', 'PhD'],
    fields: ['Computer Science', 'Engineering', 'Mathematics', 'Science'],
    minimumPercentage: 75,
    minAge: 21,
    maxAge: 35,
    incomeLimit: 0, // No income ceiling
    genderEligibility: 'Any',
    categoryEligibility: ['Any'],
    nationalityEligibility: ['Indian'],
    skills: ['Research Methodology', 'Data Analysis', 'Publication Writing'],
    interests: ['Research', 'Algorithms', 'Scientific Computing'],
    fundingPurpose: ['Research', 'Fellowship'],
    requiredDocuments: [
      'Master Degree Transcripts',
      'Research Proposal (max 1000 words)',
      'Two Letters of Recommendation',
      'CV / Resume with publication record',
    ],
    numberOfAwards: 80,
    contactInformation: 'ramanujan-cell@nstf.edu.demo',
    notes: 'Includes monthly stipend of ₹35,000 plus annual contingency grant of ₹50,000.',
    status: 'Published',
    isSample: true,
  },
  {
    name: 'Campus Startup Seed Grant & Accelerator Fund',
    provider: 'National Innovation and Entrepreneurship Center',
    type: 'Startup Funding',
    description: '[SAMPLE / DEMO RECORD for Academic Evaluation] Seed funding scheme providing non-dilutive prototype and MVP capital to student and recent graduate founders building tech-enabled ventures.',
    fundingAmount: 500000,
    fundingType: 'Fixed Amount',
    openingDate: new Date('2026-08-15'),
    deadline: new Date('2026-10-05'), // Urgent deadline for testing reminders
    officialUrl: 'https://startup-india.demo/seed-capital',
    country: 'India',
    state: 'All',
    eligibleLocations: ['All'],
    educationLevels: ['Diploma', 'Undergraduate', 'Postgraduate', 'PhD', 'Any'],
    fields: ['Any'],
    minimumPercentage: 0,
    minAge: 18,
    maxAge: 40,
    incomeLimit: 0,
    genderEligibility: 'Any',
    categoryEligibility: ['Any'],
    nationalityEligibility: ['Indian'],
    skills: ['Entrepreneurship', 'Product Prototyping', 'Business Planning'],
    interests: ['Startup', 'Technology', 'Product Development'],
    fundingPurpose: ['Startup', 'Business'],
    requiredDocuments: [
      'Pitch Deck (10 slides max)',
      'Executive Summary & Problem Statement',
      'Student ID / Founder ID Proof',
      'Company Incorporation or Prototyping Milestone report (if registered)',
    ],
    numberOfAwards: 30,
    contactInformation: 'invest@incubator.demo | 080-4567-8901',
    notes: 'Shortlisted teams will pitch before a panel of venture capitalists and industry mentors.',
    status: 'Published',
    isSample: true,
  },
  {
    name: 'Post-Matric Educational Assistance Scheme',
    provider: 'Department of Social Justice and Welfare',
    type: 'Government Funding',
    description: '[SAMPLE / DEMO RECORD for Academic Evaluation] Government welfare financial assistance scheme supporting post-matriculation students from economically and socially disadvantaged categories.',
    fundingAmount: 45000,
    fundingType: 'Full Funding',
    openingDate: new Date('2026-07-01'),
    deadline: new Date('2026-09-30'), // Near deadline
    officialUrl: 'https://welfare.gov.in/post-matric-demo',
    country: 'India',
    state: 'All',
    eligibleLocations: ['All'],
    educationLevels: ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate'],
    fields: ['Any'],
    minimumPercentage: 50,
    minAge: 16,
    maxAge: 30,
    incomeLimit: 250000,
    genderEligibility: 'Any',
    categoryEligibility: ['SC', 'ST', 'OBC', 'EWS', 'Minority'],
    nationalityEligibility: ['Indian'],
    skills: [],
    interests: ['Higher Education'],
    fundingPurpose: ['Education'],
    requiredDocuments: [
      'Caste / Category Certificate',
      'Tahsildar Issued Income Certificate (< ₹2.5 Lakhs)',
      'Previous Academic Mark Sheet',
      'Hostel / Day Scholar certificate',
      'Aadhaar seeded bank account',
    ],
    numberOfAwards: 5000,
    contactInformation: 'welfare-helpdesk@gov.demo',
    notes: 'Direct Benefit Transfer (DBT) deposited straight into student bank account.',
    status: 'Published',
    isSample: true,
  },
  {
    name: 'State Youth Innovation & Technical Project Grant',
    provider: 'Kerala State Council for Science & Technology',
    type: 'Grant',
    description: '[SAMPLE / DEMO RECORD for Academic Evaluation] Project funding grant awarded to undergraduate and postgraduate computing and engineering students executing final-year capstone or social innovation projects.',
    fundingAmount: 30000,
    fundingType: 'Partial Funding',
    openingDate: new Date('2026-08-10'),
    deadline: new Date('2026-11-30'),
    officialUrl: 'https://kscste.demo/student-projects',
    country: 'India',
    state: 'Kerala',
    eligibleLocations: ['Kerala', 'All'],
    educationLevels: ['Undergraduate', 'Postgraduate'],
    fields: ['Computer Science', 'Engineering', 'Information Technology', 'Science'],
    minimumPercentage: 60,
    minAge: 19,
    maxAge: 28,
    incomeLimit: 600000,
    genderEligibility: 'Any',
    categoryEligibility: ['Any'],
    nationalityEligibility: ['Indian'],
    skills: ['Software Engineering', 'Embedded Systems', 'IoT', 'AI Systems'],
    interests: ['Technology', 'Open Source', 'Engineering'],
    fundingPurpose: ['Education', 'Research', 'Startup'],
    requiredDocuments: [
      'Project Synopsis endorsed by Head of Department',
      'Faculty Guide Endorsement Letter',
      'Itemized Budget Quotation',
      'College Bonafide ID Card',
    ],
    numberOfAwards: 120,
    contactInformation: 'kscste-projects@state.demo',
    notes: 'Funding disbursed in two tranches upon milestone demonstration.',
    status: 'Published',
    isSample: true,
  },
  {
    name: 'Young Innovators Global Academic Exchange Fellowship',
    provider: 'International Academic Mobility Consortium',
    type: 'Fellowship',
    description: '[SAMPLE / DEMO RECORD for Academic Evaluation] Cross-border fellowship covering travel, living expenses, and tuition for outstanding postgraduate and doctoral candidates visiting collaborative labs abroad.',
    fundingAmount: 350000,
    fundingType: 'Full Funding',
    openingDate: new Date('2026-05-15'),
    deadline: new Date('2026-12-15'),
    officialUrl: 'https://global-exchange.edu.demo/fellowships',
    country: 'India',
    state: 'All',
    eligibleLocations: ['All'],
    educationLevels: ['Postgraduate', 'PhD'],
    fields: ['Computer Science', 'Engineering', 'Science', 'Management'],
    minimumPercentage: 75,
    minAge: 20,
    maxAge: 32,
    incomeLimit: 0,
    genderEligibility: 'Any',
    categoryEligibility: ['Any'],
    nationalityEligibility: ['Indian'],
    skills: ['English Proficiency', 'Research Proposal Writing', 'Presentation'],
    interests: ['International Research', 'Academic Collaboration'],
    fundingPurpose: ['Fellowship', 'Research', 'Education'],
    requiredDocuments: [
      'Valid Passport Copy',
      'Host University Invitation / Acceptance Letter',
      'Academic Transcripts with CGPA conversion',
      'Letter of Motivation',
    ],
    numberOfAwards: 40,
    contactInformation: 'mobility-desk@consortium.demo',
    notes: 'Shortlisted candidates participate in an online interview round.',
    status: 'Published',
    isSample: true,
  },
  {
    name: 'AICTE PG Scholarship for GATE/GPAT Qualified Candidates',
    provider: 'All India Council for Technical Education',
    type: 'Scholarship',
    description: '[SAMPLE / DEMO RECORD for Academic Evaluation] Financial assistance of ₹12,400 per month granted to full-time GATE/GPAT qualified students admitted to AICTE approved postgraduate (M.Tech/M.E/M.Pharm) institutions.',
    fundingAmount: 148800,
    fundingType: 'Fixed Amount',
    openingDate: new Date('2026-08-01'),
    deadline: new Date('2026-10-25'),
    officialUrl: 'https://aicte-india.org/schemes/students-development-schemes/pg-scholarship',
    country: 'India',
    state: 'All',
    eligibleLocations: ['All'],
    educationLevels: ['Postgraduate'],
    fields: ['Computer Science', 'Engineering', 'Medicine', 'Science'],
    minimumPercentage: 60,
    minAge: 20,
    maxAge: 35,
    incomeLimit: 0,
    genderEligibility: 'Any',
    categoryEligibility: ['Any'],
    nationalityEligibility: ['Indian'],
    skills: ['Technical Aptitude'],
    interests: ['Higher Education', 'Technical Specialization'],
    fundingPurpose: ['Education'],
    requiredDocuments: [
      'Valid GATE/GPAT Scorecard',
      'Aadhaar Card copy',
      'Institution Verification Certificate',
      'Personal Bank Account Passbook copy',
    ],
    numberOfAwards: 10000,
    contactInformation: 'pgscholarship@aicte-india.org',
    notes: 'Monthly attendance of at least 75% required from the admitting institute.',
    status: 'Published',
    isSample: true,
  },
  {
    name: 'Special Opportunity in Heritage Arts & Literature (Archived/Expired)',
    provider: 'Cultural Heritage Preservation Trust',
    type: 'Grant',
    description: '[SAMPLE / DEMO RECORD for Academic Evaluation] Archival sample grant for testing deadline expiration logic and historical archiving in GrantMatch platform.',
    fundingAmount: 25000,
    fundingType: 'Fixed Amount',
    openingDate: new Date('2026-01-01'),
    deadline: new Date('2026-05-01'), // Already expired
    officialUrl: 'https://heritage-trust.demo/expired-grant',
    country: 'India',
    state: 'All',
    eligibleLocations: ['All'],
    educationLevels: ['Any'],
    fields: ['Arts', 'Literature'],
    minimumPercentage: 50,
    minAge: 18,
    maxAge: 60,
    incomeLimit: 0,
    genderEligibility: 'Any',
    categoryEligibility: ['Any'],
    nationalityEligibility: ['Indian'],
    skills: ['Creative Writing'],
    interests: ['Arts', 'Culture'],
    fundingPurpose: ['Other', 'Education'],
    requiredDocuments: ['Portfolio sample'],
    numberOfAwards: 10,
    contactInformation: 'info@heritage.demo',
    notes: 'Opportunity application window has officially concluded.',
    status: 'Expired',
    isSample: true,
  },
];

const seedDatabase = async () => {
  try {
    console.log('[SEED] Checking database state for initial seeding...');

    // 1. Seed or Update Admin User
    let admin = await User.findOne({ email: 'admin@grantmatch.org' });
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);

    if (!admin) {
      admin = await User.create({
        name: 'GrantMatch Administrator',
        email: 'admin@grantmatch.org',
        password: adminPasswordHash,
        role: 'admin',
        phone: '+91 9876543210',
        educationLevel: 'Postgraduate',
        course: 'Computer Science',
        institution: 'National Institute of Technology',
        annualIncome: 1200000,
        country: 'India',
        state: 'Kerala',
        category: 'General',
        nationality: 'Indian',
        userType: 'Professional',
      });
      console.log('[SEED] ✓ Admin account created: admin@grantmatch.org (Password: Admin@123)');
    } else {
      admin.role = 'admin';
      await admin.save();
      console.log('[SEED] ✓ Admin account confirmed: admin@grantmatch.org');
    }

    // 2. Seed Demo Student User
    let demoUser = await User.findOne({ email: 'user@grantmatch.org' });
    const userPasswordHash = await bcrypt.hash('User@123', salt);

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Athira Nair',
        email: 'user@grantmatch.org',
        password: userPasswordHash,
        role: 'user',
        phone: '+91 9845123456',
        age: 23,
        gender: 'Female',
        country: 'India',
        state: 'Kerala',
        district: 'Ernakulam',
        educationLevel: 'Postgraduate',
        course: 'Computer Science (MCA)',
        institution: 'Cochin University of Science and Technology',
        percentage: 82.5,
        skills: ['Python', 'Web Development', 'Full-Stack Engineering', 'Machine Learning Basics'],
        interests: ['Software Engineering', 'Research', 'Higher Studies'],
        annualIncome: 280000,
        category: 'OBC',
        nationality: 'Indian',
        employmentStatus: 'Student',
        userType: 'Student',
        fundingPurpose: 'Education',
        requiredAmount: 75000,
        preferredLocation: 'Kerala / All-India',
      });
      console.log('[SEED] ✓ Demo Student user created: user@grantmatch.org (Password: User@123)');
    } else {
      console.log('[SEED] ✓ Demo Student user confirmed: user@grantmatch.org');
    }

    // 3. Seed Opportunities
    const existingCount = await Opportunity.countDocuments();
    if (existingCount === 0) {
      for (const oppData of sampleOpportunities) {
        // Automatically check if deadline is in past
        if (new Date(oppData.deadline) < new Date() && oppData.status !== 'Draft') {
          oppData.status = 'Expired';
        }
        await Opportunity.create(oppData);
      }
      console.log(`[SEED] ✓ Seeded ${sampleOpportunities.length} sample opportunities across scholarships, fellowships, and grants.`);
    } else {
      console.log(`[SEED] Opportunities already populated (${existingCount} records found).`);
    }

    // 4. Seed sample bookmark & application for demo user
    const firstOpp = await Opportunity.findOne({ status: 'Published' });
    if (firstOpp && demoUser) {
      const existingSaved = await SavedOpportunity.findOne({ userId: demoUser._id, opportunityId: firstOpp._id });
      if (!existingSaved) {
        await SavedOpportunity.create({
          userId: demoUser._id,
          opportunityId: firstOpp._id,
        });
      }

      const existingApp = await Application.findOne({ userId: demoUser._id, opportunityId: firstOpp._id });
      if (!existingApp) {
        await Application.create({
          userId: demoUser._id,
          opportunityId: firstOpp._id,
          status: 'Application Started',
          notes: 'Prepared marksheets and income certificate; filling out online form on official portal.',
        });
      }

      const existingNotif = await Notification.findOne({ userId: demoUser._id });
      if (!existingNotif) {
        await Notification.create({
          userId: demoUser._id,
          title: 'Welcome to GrantMatch!',
          message: 'Explore your top eligibility-matched opportunities and track upcoming deadlines.',
          type: 'system',
        });
      }
    }

    console.log('[SEED] Database verification & seeding completed successfully.');
  } catch (err) {
    console.error('[SEED] Error during database seeding:', err.message);
  }
};

module.exports = {
  sampleOpportunities,
  seedDatabase,
};
