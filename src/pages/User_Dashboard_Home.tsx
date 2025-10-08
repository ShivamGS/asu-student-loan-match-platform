import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  PiggyBank, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Sparkles,
  Target,
  Lightbulb,
  TrendingDown
} from 'lucide-react';
import User_Dashboard_MetricCard from '../components/User_Dashboard_MetricCard';
import User_Dashboard_Timeline from '../components/User_Dashboard_Timeline';
import { getCurrentUserAsuId } from '../services/sessionHelper';


interface UserData {
  success: boolean;
  user: {
    asuId: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    loanApplication?: {
      applicantName: string;
      applicationDate: string;
      currency: string;
      interestRate: number;
      loanAmount: number;
      loanProvider: string;
      loanTenure: number;
      loanType: string;
      sanctionedAmount: number;
    };
    salaryVerification?: {
      currency: string;
      deductions: number;
      employeeName: string;
      employerName: string;
      grossSalary: number;
      month: string;
      netSalary: number;
    };
    employerMatchPolicy?: {
      maxMonthlyMatchCap: number;
      maxAnnualMatchCap: number;
      maxSalaryPercentageCap: number;
      matchPercentageOptions: number[];
    };
    latestRecommendation?: any;
    hasDocuments: boolean;
    documents?: any;
  };
}


interface DashboardData {
  programApproval: {
    maxAnnualMatch: number;
    matchPercentage: number;
    status: string;
  };
  currentPeriodProgress: {
    monthlyMatchEarned: number;
    monthlyMatchPending: number;
  };
  retirementProjection: {
    value10Years: number;
    value20Years: number;
    value30Years: number;
  };
  financialHealth: {
    healthScore: number;
    riskLevel: string;
    debtToIncomeRatio: number;
    improvementWithMatch: number;
  };
}


interface CalculateMatchResponse {
  asuId: string;
  dashboardData: DashboardData;
  financialProjections: {
    annualSummary: {
      totalMatchContribution: number;
    };
    loanPayoffProjection: {
      originalTenureYears: number;
    };
    monthlyBreakdown: {
      matchContribution: number;
    };
    taxSavings?: {
      annualTaxBenefit: number;
      lifetimeTaxSavings: number;
    };
  };
}


export default function User_Dashboard_Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [asuId, setAsuId] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [financialProjections, setFinancialProjections] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    console.log('🏠 [DASHBOARD] useEffect triggered');

    // Get ASU ID from session
    const userId = getCurrentUserAsuId();

    if (!userId) {
      console.log('❌ [DASHBOARD] No ASU ID found, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('✅ [DASHBOARD] Retrieved ASU ID:', userId);
    setAsuId(userId);
    loadUserData(userId);
  }, [navigate]);


  const loadUserData = async (userId: string) => {
    console.log('🏠 [DASHBOARD] loadUserData called for ASU ID:', userId);
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Fetch user data
      console.log('🏠 [DASHBOARD] Fetching user data for ASU ID:', userId);
      const userResponse = await fetch(
        `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${userId}`
      );

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const apiResponse: UserData = await userResponse.json();
      console.log('🏠 [DASHBOARD] API Response:', apiResponse);

      // Extract user data from nested structure
      const user = apiResponse.user;
      console.log('🏠 [DASHBOARD] User object:', user);

      setUserData(user);
      setApprovalStatus(user.approvalStatus);

      // Extract user name
      const name = user.loanApplication?.applicantName ||
                   user.salaryVerification?.employeeName ||
                   'User';
      setUserName(name.split(' ')[0]);

      console.log('=== Dashboard Data Loaded ===');
      console.log('ASU ID:', userId);
      console.log('Approval Status:', user.approvalStatus);
      console.log('Has latestRecommendation:', !!user.latestRecommendation);
      console.log('=======================');

      // Step 2: Handle based on approval status
      if (user.approvalStatus === 'pending') {
        console.log('🔄 [DASHBOARD] User status is PENDING');
        if (location.pathname === '/dashboard') {
          console.log('🔄 [DASHBOARD] Redirecting to documents page');
          navigate('/dashboard/documents');
        }
        setIsLoading(false);
        return;
      }

      if (user.approvalStatus === 'rejected') {
        console.log('❌ [DASHBOARD] User status is REJECTED');
        setIsLoading(false);
        return;
      }

      if (user.approvalStatus === 'approved') {
        console.log('✅ [DASHBOARD] User status is APPROVED');

        // Step 3: Check if latestRecommendation exists
        if (user.latestRecommendation) {
          console.log('✅ [DASHBOARD] latestRecommendation exists - using cached data');
          if (user.latestRecommendation.dashboardData) {
            setDashboardData(user.latestRecommendation.dashboardData);
            setFinancialProjections(user.latestRecommendation.financialProjections);
          } else {
            setDashboardData(user.latestRecommendation);
          }
        } else {
          console.log('⚠️ [DASHBOARD] latestRecommendation NOT found - calling calculate-match API');
          await calculateMatch(user);
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error('🔴 [DASHBOARD] Error loading user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      setIsLoading(false);
    }
  };


  const calculateMatch = async (user: any) => {
    try {
      console.log('📊 [DASHBOARD] Calling calculate-match API...');

      const calculateMatchInput = {
        asuId: user.asuId,
        loanApplication: user.loanApplication,
        salaryVerification: user.salaryVerification,
        employerMatchPolicy: user.employerMatchPolicy || {
          maxMonthlyMatchCap: 500,
          maxAnnualMatchCap: 5500,
          maxSalaryPercentageCap: 6.0,
          matchPercentageOptions: [50, 75, 100]
        }
      };

      console.log('📊 [DASHBOARD] Calculate-match input:', calculateMatchInput);

      const calculateResponse = await fetch(
        'https://z1mqi2x7o2.execute-api.us-east-1.amazonaws.com/dev/calculate-match',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(calculateMatchInput)
        }
      );

      if (!calculateResponse.ok) {
        const errorText = await calculateResponse.text();
        console.error('🔴 [DASHBOARD] Calculate-match error response:', errorText);
        throw new Error('Failed to calculate match');
      }

      const calculatedData: CalculateMatchResponse = await calculateResponse.json();
      console.log('✅ [DASHBOARD] Calculate-match response:', calculatedData);

      setDashboardData(calculatedData.dashboardData);
      setFinancialProjections(calculatedData.financialProjections);
    } catch (err) {
      console.error('🔴 [DASHBOARD] Error calculating match:', err);
      throw err;
    }
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-asu-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }


  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-asu-maroon text-white px-6 py-2 rounded-lg font-semibold hover:bg-asu-maroon-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  // Pending status
  if (approvalStatus === 'pending') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}</h1>
        </div>

        <div className="max-w-2xl mx-auto bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Application Pending Review
          </h2>
          <p className="text-gray-700 mb-6">
            Your application for the SECURE 2.0 Student Loan Repayment Match Program is currently under review.
            We'll notify you via email once a decision has been made.
          </p>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-gray-600 mb-2">Application Status</p>
            <p className="text-lg font-semibold text-yellow-600">Pending Review</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Estimated review time: 3-5 business days
          </p>
        </div>
      </div>
    );
  }


  // Rejected status
  if (approvalStatus === 'rejected') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}</h1>
        </div>

        <div className="max-w-2xl mx-auto bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Application Not Approved
          </h2>
          <p className="text-gray-700 mb-6">
            Unfortunately, your application for the SECURE 2.0 Student Loan Repayment Match Program
            was not approved at this time. Please contact HR for more information about the decision
            and potential next steps.
          </p>
          <div className="bg-white rounded-lg p-4 border border-red-200 mb-4">
            <p className="text-sm text-gray-600 mb-2">Application Status</p>
            <p className="text-lg font-semibold text-red-600">Not Approved</p>
          </div>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:hr@asu.edu"
              className="bg-asu-maroon text-white px-6 py-2 rounded-lg font-semibold hover:bg-asu-maroon-dark transition-colors"
            >
              Contact HR
            </a>
          </div>
        </div>
      </div>
    );
  }


  // Approved status - show dashboard
  if (approvalStatus === 'approved' && dashboardData && financialProjections) {
    
    const metrics = [
  {
    icon: TrendingUp,
    title: 'Current Salary',
    value: `$${(userData?.salaryVerification?.netSalary || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo`,
    subtitle: `Gross: $${(userData?.salaryVerification?.grossSalary || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    icon: AlertCircle,
    title: 'Total Debt',
    value: `$${((userData?.loanApplication?.loanAmount || 0) * 0.012).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    subtitle: `${userData?.loanApplication?.interestRate || 0}% interest`,
    bgGradient: 'bg-gradient-to-br from-red-500 to-red-600',
  },
  {
    icon: DollarSign,
    title: 'Annual Match',
    value: `$${dashboardData.programApproval?.maxAnnualMatch?.toFixed(2) || '0'}`,
    subtitle: 'Employer yearly',
    bgGradient: 'bg-gradient-to-br from-green-500 to-green-600',
  },
  {
    icon: DollarSign,
    title: 'Monthly Match',
    value: `$${financialProjections.monthlyBreakdown?.matchContribution?.toFixed(2) || '0'}`,
    subtitle: `${dashboardData.programApproval?.matchPercentage || 0}% match`,
    bgGradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  },
  {
    icon: PiggyBank,
    title: 'Retirement',
    value: `$${Math.round((dashboardData.retirementProjection?.value30Years || 0) / 1000)}K`,
    subtitle: '30-year projection',
    bgGradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    icon: Clock,
    title: 'Loan Payoff',
    value: `${Math.round((financialProjections.loanPayoffProjection?.originalTenureYears || 0) / 12)} yrs`,
    subtitle: 'Est. repayment',
    bgGradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
  },
];



    // Extract AI recommendations from userData
    const aiRecommendations = userData?.latestRecommendation?.recommendation?.recommendations || [];
    const rationale = userData?.latestRecommendation?.recommendation?.rationale || '';
    const alternativeOptions = userData?.latestRecommendation?.recommendation?.alternativeOptions || [];
    const taxBenefits = userData?.latestRecommendation?.recommendation?.taxBenefits || '';

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Here's your financial overview</h1>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Application Approved!</h3>
            <p className="text-sm text-green-700 mt-1">
              Your SECURE 2.0 Student Loan Repayment Match is active. You're earning {dashboardData.programApproval?.matchPercentage || 0}% employer match
              (${financialProjections.monthlyBreakdown?.matchContribution?.toFixed(2) || '0'}/month).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  {metrics.map((metric, index) => (
    <User_Dashboard_MetricCard
      key={index}
      icon={metric.icon}
      title={metric.title}
      value={metric.value}
      subtitle={metric.subtitle}
      bgGradient={metric.bgGradient}
    />
  ))}
</div>



        <User_Dashboard_Timeline
          loanTenureYears={financialProjections.loanPayoffProjection?.originalTenureYears || 0}
          enrollmentDate="2022-10-01"
          currentAge={36}
          retirementAge={65}
        />

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Financial Health Score</h2>
              <p className="text-sm text-gray-600">
                Risk Level: <span className={`font-semibold ${
                  dashboardData.financialHealth?.riskLevel === 'high' ? 'text-red-600' : 
                  dashboardData.financialHealth?.riskLevel === 'medium' ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {dashboardData.financialHealth?.riskLevel?.toUpperCase() || 'N/A'}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-asu-maroon">
                {dashboardData.financialHealth?.healthScore || 0}
              </p>
              <p className="text-sm text-gray-500">out of 100</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-asu-maroon to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${dashboardData.financialHealth?.healthScore || 0}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Debt-to-Income Ratio</p>
              <p className="text-lg font-semibold text-gray-900">
                {dashboardData.financialHealth?.debtToIncomeRatio?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Improvement with Match</p>
              <p className="text-lg font-semibold text-green-600">
                {dashboardData.financialHealth?.improvementWithMatch?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* AI INSIGHTS SECTION - MOVED TO END & DEDUPLICATED */}
        {(aiRecommendations.length > 0 || rationale || alternativeOptions.length > 0) && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
                <p className="text-sm text-gray-600">Personalized recommendations to optimize your financial strategy</p>
              </div>
            </div>

            {/* Why This Match Percentage? */}
            {rationale && (
              <div className="bg-white rounded-lg p-5 border border-purple-200 shadow-sm mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Why {dashboardData.programApproval?.matchPercentage || 0}% Match?</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {rationale}
                </p>
              </div>
            )}

            {/* Personalized Action Items */}
            {aiRecommendations.length > 0 && (
              <div className="bg-white rounded-lg p-5 border border-purple-200 shadow-sm mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-bold text-gray-900">Personalized Recommendations</h3>
                </div>
                <ul className="space-y-3">
                  {aiRecommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alternative Match Options */}
            {alternativeOptions.length > 0 && (
              <div className="bg-white rounded-lg p-5 border border-purple-200 shadow-sm mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Alternative Match Options</h3>
                </div>
                <div className="space-y-3">
                  {alternativeOptions.map((option: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-purple-600">{option.matchPercentage}% Match</span>
                        <span className="text-sm font-semibold text-gray-700">${option.monthlyAmount?.toFixed(2)}/month</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-600 font-medium mb-1">Pros:</p>
                          <p className="text-green-700">{option.pros}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium mb-1">Cons:</p>
                          <p className="text-red-700">{option.cons}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax Benefits */}
            {taxBenefits && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Tax Benefits</h4>
                    <p className="text-sm text-green-800 leading-relaxed">{taxBenefits}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }


  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          No Data Available
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't load your dashboard data. Please try logging in again.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-asu-maroon text-white px-6 py-2 rounded-lg font-semibold hover:bg-asu-maroon-dark transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
