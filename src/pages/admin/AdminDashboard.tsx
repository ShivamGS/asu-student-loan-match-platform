import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CheckCircle, TrendingDown, DollarSign, FileCheck, Clock, ArrowRight, AlertTriangle, TrendingUp, RefreshCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoanApplication {
  loanAmount: number;
  currency: string;
  interestRate?: number;
  loanTenure?: number;
  applicantName?: string;
  sanctionedAmount?: number;
}

interface User {
  asuId: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  asuEmail?: string;
  approvalStatus: string;
  loanApplication: LoanApplication;
  hasDocuments?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InsightsData {
  financialStress: {
    highBurdenCount: number;
    highBurdenPercent: number;
    manageableCount: number;
    moderateCount: number;
    noDebtCount: number;
    totalUsers: number;
  };
  roi: {
    annualCost: number;
    retainedEmployees: number;
    turnoverSavings: number;
    roiPercent: number;
  };
}

interface UsersApiResponse {
  success: boolean;
  count: number;
  users: User[];
}

interface InsightsApiResponse {
  success: boolean;
  insights: InsightsData;
}

// Currency conversion helper
const convertToUSD = (amount: number, currency: string): number => {
  const conversionRates: { [key: string]: number } = {
    'USD': 1,
    'EUR': 1.08,
    'GBP': 1.27,
    'CAD': 0.73,
    'AUD': 0.65,
    'INR': 0.012,
  };

  return amount * (conversionRates[currency?.toUpperCase()] || 1);
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch both users and insights data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, insightsResponse] = await Promise.all([
        axios.get<UsersApiResponse>(
          'https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users'
        ),
        axios.get<InsightsApiResponse>(
          'https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/insights'
        ),
      ]);

      if (usersResponse.data.success && usersResponse.data.users) {
        setUsers(usersResponse.data.users);
      }

      if (insightsResponse.data.success && insightsResponse.data.insights) {
        setInsights(insightsResponse.data.insights);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1F2E]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !insights) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1F2E]">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-xl mb-4">{error || 'No data available'}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate metrics from API data
  const totalUsers = insights.financialStress.totalUsers || 0;

  // Employees Enrolled: Count of users with approvalStatus = 'approved'
  const enrolledUsers = users.filter((u) => u.approvalStatus === 'approved').length;
  const enrollmentRate = totalUsers > 0 ? ((enrolledUsers / totalUsers) * 100).toFixed(1) : '0.0';

  // Enrolled Employees Debt: Sum of loanApplication.loanAmount (converted to USD) for approved users
  const enrolledUsersDebt = users
    .filter((u) => u.approvalStatus === 'approved')
    .reduce((sum, user) => {
      const loanAmount = user.loanApplication?.loanAmount || 0;
      const currency = user.loanApplication?.currency || 'USD';
      return sum + convertToUSD(loanAmount, currency);
    }, 0);

  const asuContribution = insights.roi.annualCost || 0;

  // Document queue metrics based on approvalStatus
  const urgentReviews = users.filter((u) => u.approvalStatus === 'pending').length;
  const awaitingDocs = users.filter((u) => u.approvalStatus === 'action_required').length;
  const approvedUsers = users.filter((u) => u.approvalStatus === 'approved').length;

  // Financial stress metrics from insights API
  const highRisk = insights.financialStress.highBurdenCount || 0;
  const moderate = insights.financialStress.moderateCount || 0;
  const manageable = insights.financialStress.manageableCount || 0;
  const noDebt = insights.financialStress.noDebtCount || 0;
  const highRiskPercent = insights.financialStress.highBurdenPercent || 0;

  // ROI metrics from insights API
  const roiPercent = insights.roi.roiPercent || 0;
  const retainedEmployees = insights.roi.retainedEmployees || 0;
  const turnoverSavings = insights.roi.turnoverSavings || 0;
  const netBenefit = turnoverSavings - asuContribution;

  // Get recent users sorted by updatedAt (most recent first)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  // Helper function to get display name
  const getUserName = (user: User): string => {
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return 'Unknown';
  };

  // Helper function to get email
  const getUserEmail = (user: User): string => {
    return user.email || user.asuEmail || 'N/A';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Employees */}
        <div className="bg-[#252C3C] border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition-all relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-sm font-medium mb-2">Total Employees</p>
              <h3 className="text-white text-3xl font-bold mb-2">{totalUsers.toLocaleString()}</h3>
              <p className="text-gray-500 text-xs">All ASU staff</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          {/* Info Icon - Bottom Right */}
          <div className="absolute bottom-4 right-4 group">
            <Info className="w-4 h-4 text-gray-500 cursor-help hover:text-gray-400 transition-colors" />
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
              Total number of ASU staff members in the system, regardless of enrollment status.
            </div>
          </div>
        </div>

        {/* Card 2: Employees Enrolled */}
        <div className="bg-[#252C3C] border border-green-500/30 rounded-xl p-6 hover:border-green-500/50 transition-all relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-sm font-medium mb-2">Employees Enrolled</p>
              <h3 className="text-white text-3xl font-bold mb-2">{enrolledUsers.toLocaleString()}</h3>
              <p className="text-green-400 text-xs font-semibold">{enrollmentRate}% enrollment rate</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          {/* Info Icon - Bottom Right */}
          <div className="absolute bottom-4 right-4 group">
            <Info className="w-4 h-4 text-gray-500 cursor-help hover:text-gray-400 transition-colors" />
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
              Number of employees with approved status who are actively participating in the loan matching program.
            </div>
          </div>
        </div>

        {/* Card 3: Enrolled Employees Debt */}
        <div className="bg-[#252C3C] border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-sm font-medium mb-2">Enrolled Employees Debt</p>
              <h3 className="text-white text-3xl font-bold mb-2">
                ${(enrolledUsersDebt / 1000).toFixed(0)}K
              </h3>
              <p className="text-gray-500 text-xs">Total debt of {enrolledUsers} enrolled</p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          {/* Info Icon - Bottom Right */}
          <div className="absolute bottom-4 right-4 group">
            <Info className="w-4 h-4 text-gray-500 cursor-help hover:text-gray-400 transition-colors" />
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
              Total outstanding student loan debt (in USD) for all enrolled employees participating in the matching program.
            </div>
          </div>
        </div>

        {/* Card 4: ASU Contribution */}
        <div className="bg-[#252C3C] border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/50 transition-all relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-sm font-medium mb-2">ASU Annual Contribution</p>
              <h3 className="text-white text-3xl font-bold mb-2">${(asuContribution / 1000000).toFixed(1)}M</h3>
              <p className="text-gray-500 text-xs">To loan matching program</p>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          {/* Info Icon - Bottom Right */}
          <div className="absolute bottom-4 right-4 group">
            <Info className="w-4 h-4 text-gray-500 cursor-help hover:text-gray-400 transition-colors" />
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
              Total annual cost of ASU's contribution to the student loan matching program for all enrolled employees.
            </div>
          </div>
        </div>
      </div>


      {/* Employee Financial Health Overview */}
      <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">Employee Financial Health</h2>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-500 cursor-help" />
                <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
                  Categorizes employees by loan repayment stress level to identify those at highest risk of turnover due to financial burden.
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Breakdown by financial stress level</p>
          </div>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
          >
            View Analytics
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Risk Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* High Risk */}
          <div className="bg-[#1A1F2E] border border-red-500/30 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-1">High Risk</p>
                <h4 className="text-white text-2xl font-bold">{highRisk}</h4>
              </div>
              <div className="bg-red-500/20 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${Math.min(highRiskPercent, 100)}%` }}
                />
              </div>
              <span className="text-red-400 font-bold text-sm">{highRiskPercent.toFixed(1)}%</span>
            </div>
          </div>

          {/* Moderate */}
          <div className="bg-[#1A1F2E] border border-yellow-500/30 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Moderate</p>
                <h4 className="text-white text-2xl font-bold">{moderate}</h4>
              </div>
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${totalUsers > 0 ? Math.min(((moderate / totalUsers) * 100), 100) : 0}%` }}
                />
              </div>
              <span className="text-yellow-400 font-bold text-sm">
                {totalUsers > 0 ? ((moderate / totalUsers) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>

          {/* Manageable */}
          <div className="bg-[#1A1F2E] border border-green-500/30 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Manageable</p>
                <h4 className="text-white text-2xl font-bold">{manageable}</h4>
              </div>
              <div className="bg-green-500/20 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${totalUsers > 0 ? Math.min(((manageable / totalUsers) * 100), 100) : 0}%` }}
                />
              </div>
              <span className="text-green-400 font-bold text-sm">
                {totalUsers > 0 ? ((manageable / totalUsers) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>

          {/* No Debt */}
          <div className="bg-[#1A1F2E] border border-blue-500/30 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-1">No Debt</p>
                <h4 className="text-white text-2xl font-bold">{noDebt}</h4>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${totalUsers > 0 ? Math.min(((noDebt / totalUsers) * 100), 100) : 0}%` }}
                />
              </div>
              <span className="text-blue-400 font-bold text-sm">
                {totalUsers > 0 ? ((noDebt / totalUsers) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 text-sm">
              <span className="font-bold">{highRisk} employees ({highRiskPercent.toFixed(1)}%)</span> are at HIGH RISK of turnover due to financial stress.
              <span className="text-red-400 font-semibold"> Immediate intervention recommended.</span>
            </p>
          </div>
        </div>
      </div>

      {/* ROI (Left) + Document Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: ROI Summary */}
        <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-bold text-white">Return on Investment</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-500 cursor-help" />
              <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
                Measures the return on investment (ROI) of the employer's loan matching program based on retention and turnover savings.
              </div>
            </div>
          </div>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/10 rounded-full mb-4">
              <span className="text-4xl font-bold text-green-400">{roiPercent.toFixed(0)}%</span>
            </div>
            <p className="text-gray-400 text-sm">ROI This Year</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[#1A1F2E] rounded-lg">
              <span className="text-gray-400 text-sm">Annual Cost</span>
              <span className="text-white font-semibold">${(asuContribution / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#1A1F2E] rounded-lg">
              <span className="text-gray-400 text-sm">Retained Employees</span>
              <span className="text-blue-400 font-semibold">{retainedEmployees} staff</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#1A1F2E] rounded-lg">
              <span className="text-gray-400 text-sm">Turnover Savings</span>
              <span className="text-green-400 font-semibold">${(turnoverSavings / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <span className="text-gray-300 text-sm font-semibold">Net Benefit</span>
              <span className="text-green-400 font-bold text-lg">${(netBenefit / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        {/* Right: Document Review Queue */}
        <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Document Review Queue</h3>
              <p className="text-gray-400 text-sm">Users waiting for approval</p>
            </div>
            <button
              onClick={() => navigate('/admin/documents')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Urgent Reviews */}
            <div className="bg-[#1A1F2E] border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{urgentReviews}</p>
                  <p className="text-red-400 text-xs font-semibold">Urgent Reviews</p>
                </div>
              </div>
            </div>

            {/* Awaiting Docs */}
            <div className="bg-[#1A1F2E] border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{awaitingDocs}</p>
                  <p className="text-yellow-400 text-xs font-semibold">Awaiting Docs</p>
                </div>
              </div>
            </div>

            {/* Approved */}
            <div className="bg-[#1A1F2E] border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{approvedUsers}</p>
                  <p className="text-green-400 text-xs font-semibold">Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Users</h2>
          <button
            onClick={() => navigate('/admin/documents')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-3 px-4">ASU ID</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-3 px-4">Name</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-3 px-4">Email</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-3 px-4">Loan Amount</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-3 px-4">Status</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-3 px-4">Documents</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => {
                  const loanAmount = user.loanApplication?.loanAmount || 0;
                  const currency = user.loanApplication?.currency || 'USD';
                  const loanAmountUSD = convertToUSD(loanAmount, currency);

                  return (
                    <tr key={user.asuId} className="border-b border-gray-700/50 hover:bg-[#1A1F2E] transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-300 font-mono">{user.asuId || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-white font-medium">{getUserName(user)}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">{getUserEmail(user)}</td>
                      <td className="py-3 px-4 text-sm text-white font-semibold">
                        ${loanAmountUSD.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.approvalStatus === 'approved'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : user.approvalStatus === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                              : user.approvalStatus === 'action_required'
                              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {user.approvalStatus || 'unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.hasDocuments ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <span className="text-gray-500 text-xs">No docs</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
