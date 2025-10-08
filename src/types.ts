// ============================================
// EXISTING TYPES (Calculator & Saved Data)
// ============================================

export interface CalculatorInputs {
  annualSalary: number;
  monthlyLoanPayment: number;
  matchPercentage: number;
  matchCap: number;
  monthly401kContribution: number;
}

export interface CalculatorResults {
  annualLoanPayments: number;
  eligibleMatchAmount: number;
  totalASUContribution: number;
  totalEmployeeContribution: number;
  projectedBalance10Year: number;
  monthlyMatchAmount: number;
  matchUtilizationPercent: number;
}

export interface SavedCalculation {
  id?: string;
  user_id?: string;
  inputs: CalculatorInputs;
  results: CalculatorResults;
  created_at?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

// ============================================
// NEW TYPES (Blueprint Page - Authentication)
// ============================================

export interface QuickSignUpData {
  fullName: string;
  email: string;
  employeeId: string; // ✅ REQUIRED - 10-digit ASU ID
}

export interface UserSession {
  userId: string; // Will be the 10-digit ASU ID
  token: string;
  profile: {
    fullName: string;
    email: string;
    employeeId: string; // ✅ REQUIRED - 10-digit ASU ID
  };
  createdAt: string;
}

// ============================================
// AWS API TYPES (User Profile & Documents)
// ============================================

export interface CreateUserProfileRequest {
  asuId: string;
  asuEmail: string;
  firstName: string;
  lastName: string;
  password?: string; // Add this for signup
  debtAmount?: string;
  salary?: string;
  repaymentPeriod?: string;
  interestRate?: string;
}


export interface CreateUserProfileResponse {
  message: string;
  asuId: string;
  error?: string;
}

export interface GetUploadUrlsRequest {
  asuId: string;
}

export interface GetUploadUrlsResponse {
  asuId: string;
  loanDocument: {
    uploadUrl: string;
    fileKey: string;
  };
  salarySlips: {
    uploadUrl: string;
    fileKey: string;
  };
  bucket: string;
  expiresIn: number;
}

export interface ProcessDocumentsRequest {
  asuId: string;
  loanDocKey: string;
  salarySlipsKey: string;
}

export interface LoanApplicationData {
  loanProvider: string;
  applicantName: string;
  sanctionedAmount: number;
  loanAmount: number;
  currency: string;
  interestRate: number;
  loanTenure: number;
  loanType: string;
  applicationDate: string;
  disbursementDate: string | null;
}

export interface SalaryVerificationData {
  employerName: string;
  employeeName: string;
  month: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  currency: string;
  averageSalary3Months: number | null;
  employmentDuration: string | null;
}

export interface ProfileUpdatesData {
  debtAmount: number;
  interestRate: number;
  salary: number;
  repaymentPeriod: number;
}

export interface ProcessDocumentsResponse {
  asuId: string;
  status: string;
  action: string;
  processingTime: number;
  loanApplication: LoanApplicationData;
  salaryVerification: SalaryVerificationData;
  profileUpdates: ProfileUpdatesData;
  documents: {
    loanDocUrl: string;
    salaryDocUrl: string;
  };
}

// ============================================
// NEW TYPES (Blueprint Page - Documents)
// ============================================

export interface UploadedDocument {
  id: string;
  userId: string;
  documentType: 'salary_slip' | 'loan_statement';
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  uploadDate: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'verified' | 'rejected';
  verificationNotes?: string;
}

export interface DocumentUploadState {
  loanDocument: File | null;
  salaryDocument: File | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  processedData: ProcessDocumentsResponse | null;
}

// ============================================
// NEW TYPES (Blueprint Page - Eligibility)
// ============================================

export interface CheckResult {
  passed: boolean;
  details: string;
  recommendation?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  checks: {
    employment: CheckResult;
    loanType: CheckResult;
    salary: CheckResult;
  };
  extractedData?: {
    annualSalary: number;
    monthlyLoanPayment: number;
    loanBalance: number;
    loanType: string;
    loanInterestRate?: number;
    loanTermRemaining?: number;
  };
  message?: string;
}

// ============================================
// NEW TYPES (Blueprint Page - AI Insights)
// ============================================

export interface AIInsight {
  milestone: '5-year' | '10-year' | 'loan-payoff' | 'retirement';
  year: number;
  headline: string;
  mainNumber: number;
  explanation: string;
  comparisonWithout: number;
  insights: string[];
  emotionalHook: string;
}

export interface AIFinancialJourneyData {
  userId: string;
  generatedAt: string;
  insights: AIInsight[];
  narrative: string;
  recommendations: string[];
}

// ============================================
// NEW TYPES (Blueprint Page - State Management)
// ============================================

export type PageState = 
  | 'not-signed-in'        // Show sign-up modal
  | 'signed-in-new'        // Show document upload
  | 'documents-uploaded'   // Documents uploaded, ready to check eligibility
  | 'checking-eligibility' // Processing eligibility
  | 'eligible'             // Passed eligibility check
  | 'ineligible'           // Failed eligibility check
  | 'generating-ai'        // Generating AI insights
  | 'complete';            // AI insights ready, show full page

// ============================================
// NEW TYPES (Blueprint Page - Enhanced Calculator)
// ============================================

export interface EnhancedCalculatorData extends CalculatorInputs {
  verified: boolean;
  dataSource: {
    salary: string;      // e.g., "Verified from Sept 2025 paystub"
    loanPayment: string; // e.g., "From loan statement dated 10/01/2025"
  };
  loanBalance: number;
  loanInterestRate?: number;
  loanTermRemaining?: number;
}

export interface EnhancedCalculatorResults extends CalculatorResults {
  comparisonWithQuickEstimate?: {
    quickEstimateMatch: number;
    verifiedMatch: number;
    difference: number;
  };
  loanPayoffDate?: string;
  totalMatchEarnedByPayoff?: number;
}

// ============================================
// DASHBOARD TYPES (DynamoDB User Profile)
// ============================================

export interface UserProfile {
  asuId: string;
  approvalStatus: 'approved' | 'pending' | 'rejected';
  salary: number;
  debtAmount: string;
  interestRate: number;
  repaymentPeriod: string;
  latestRecommendation?: RecommendationData;
  loanApplication?: LoanApplication;
  salaryVerification?: SalaryVerification;
  recommendations?: RecommendationData[];
  created_at?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface RecommendationData {
  timestamp: string;
  status: string;
  recommendation: Recommendation;
  financialProjections: FinancialProjections;
  dashboardData: DashboardData;
  metadata: Metadata;
}

export interface Recommendation {
  recommendedMatchPercentage: number;
  recommendedMonthlyMatchAmount: number;
  recommendedAnnualMatchAmount: number;
  rationale: string;
  riskAssessment: string;
  capApplied: string;
  financialHealthScore: number;
  recommendations: string[];
  taxBenefits: string;
  projectedOutcomes: {
    '5years': string;
    '10years': string;
    atLoanPayoff: string;
  };
  alternativeOptions: AlternativeOption[];
}

export interface AlternativeOption {
  matchPercentage: number;
  monthlyAmount: number;
  annualAmount: number;
  pros: string;
  cons: string;
}

export interface FinancialProjections {
  currency: string;
  note: string;
  monthlyBreakdown: MonthlyBreakdown;
  annualSummary: AnnualSummary;
  debtToIncomeImpact: DebtToIncomeImpact;
  taxSavings: TaxSavings;
  loanPayoffProjection: LoanPayoffProjection;
  salaryCapInfo: SalaryCapInfo;
  conversionInfo: ConversionInfo;
}

export interface MonthlyBreakdown {
  netSalary: number;
  loanPayment: number;
  matchContribution: number;
  remainingIncome: number;
  effectiveIncomeAfterMatch: number;
}

export interface AnnualSummary {
  totalMatchContribution: number;
  projectedRetirementValue10Years: number;
  projectedRetirementValue20Years: number;
  projectedRetirementValue30Years: number;
  totalLoanPrincipalReduction: number;
}

export interface DebtToIncomeImpact {
  beforeMatch: number;
  afterMatch: number;
  improvement: number;
}

export interface TaxSavings {
  annualTaxBenefit: number;
  lifetimeTaxSavings: number;
  effectiveCostReduction: number;
}

export interface LoanPayoffProjection {
  originalLoanAmountUSD: number;
  originalTenureYears: number;
  withMatchSupport: string;
  interestSavings: string;
}

export interface SalaryCapInfo {
  annualSalary: number;
  maxSalaryPercentage: number;
  maxMonthlyBasedOnSalary: number;
  maxAnnualBasedOnSalary: number;
  isMatchLimitedBySalaryCap: boolean;
}

export interface ConversionInfo {
  originalCurrency: string;
  originalLoanAmount: number;
  exchangeRate: number;
  allCalculationsInUSD: boolean;
}

export interface DashboardData {
  programApproval: ProgramApproval;
  currentPeriodProgress: CurrentPeriodProgress;
  progressMetrics: ProgressMetrics;
  financialHealth: FinancialHealth;
  retirementProjection: RetirementProjection;
  salaryCapInfo: SalaryCapInfo;
}

export interface ProgramApproval {
  status: string;
  matchPercentage: number;
  maxAnnualMatch: number;
  policyCompliant: boolean;
  capApplied: string;
}

export interface CurrentPeriodProgress {
  currentMonth: string;
  monthlyMatchEarned: number;
  monthlyMatchPending: number;
  ytdMatchEarned: number;
  nextPaymentDate: string;
}

export interface ProgressMetrics {
  annualLimitUsed: number;
  annualLimitRemaining: number;
  percentOfLimitUsed: number;
  onTrackForMaxMatch: boolean;
  projectedYearEndTotal: number;
}

export interface FinancialHealth {
  healthScore: number;
  riskLevel: string;
  debtToIncomeRatio: number;
  improvementWithMatch: number;
}

export interface RetirementProjection {
  value10Years: number;
  value20Years: number;
  value30Years: number;
}

export interface Metadata {
  exchangeRate: number;
  calculationDate: string;
  calculationCurrency: string;
  originalLoanCurrency: string;
  originalLoanAmount: number;
  convertedLoanAmountUSD: number;
  salaryCapPercentage: number;
  version: string;
}

export interface LoanApplication {
  applicantName: string;
  applicationDate: string;
  currency: string;
  interestRate: number;
  loanAmount: number;
  loanProvider: string;
  loanTenure: number;
  loanType: string;
  sanctionedAmount: number;
}

export interface SalaryVerification {
  currency: string;
  deductions: number;
  employeeName: string;
  employerName: string;
  grossSalary: number;
  month: string;
  netSalary: number;
}

// ============================================
// SESSION TYPES
// ============================================

export interface CurrentUserSession {
  asuId: string;
  approvalStatus: 'approved' | 'pending' | 'rejected';
  userProfile: UserProfile;
  loginTime: string;
}