import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, TrendingUp, DollarSign, Users, RefreshCw, Download, Info } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// TypeScript Interfaces
interface InsightsData {
  financialStress: {
    highBurdenCount: number;
    highBurdenPercent: number;
    manageableCount: number;
    moderateCount: number;
    noDebtCount: number;
    totalUsers: number;
  };
  debtToIncome: {
    averageDTI: number;
    above30Count: number;
    above40Count: number;
    distribution: {
      '<10': number;
      '10-20': number;
      '20-30': number;
      '30-40': number;
      '>40': number;
    };
  };
  totalDebt: {
    originalDebt: number;
    remainingDebt: number;
    paidOff: number;
    averageLoan: number;
  };
  interestSavings: {
    highInterestCount: number;
    potentialSavings: number;
    distribution: {
      '<5': number;
      '5-6': number;
      '6-7': number;
      '>7': number;
    };
    averageInterestRate: number;
  };
  roi: {
    annualCost: number;
    retainedEmployees: number;
    turnoverSavings: number;
    roiPercent: number;
  };
}

interface ApiResponse {
  success: boolean;
  insights: InsightsData;
}

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(
        'https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/insights'
      );

      if (response.data.success && response.data.insights) {
        setInsights(response.data.insights);
      } else {
        setError('Failed to fetch insights data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Unable to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1F2E]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !insights) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1F2E]">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-xl mb-4">{error || 'No data available'}</p>
          <button
            onClick={fetchInsights}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const debtBreakdownData = [
    { name: 'Remaining Debt', value: insights.totalDebt.remainingDebt, color: '#EF4444' },
    { name: 'Paid Off', value: insights.totalDebt.paidOff, color: '#10B981' },
  ];

  const dtiDistributionData = [
    { range: '<10%', count: insights.debtToIncome.distribution['<10'] },
    { range: '10-20%', count: insights.debtToIncome.distribution['10-20'] },
    { range: '20-30%', count: insights.debtToIncome.distribution['20-30'] },
    { range: '30-40%', count: insights.debtToIncome.distribution['30-40'] },
    { range: '40%+', count: insights.debtToIncome.distribution['>40'] },
  ];

  const roiComparisonData = [
    { category: 'Annual Cost', amount: insights.roi.annualCost },
    { category: 'Turnover Savings', amount: insights.roi.turnoverSavings },
    { category: 'Net Benefit', amount: insights.roi.turnoverSavings - insights.roi.annualCost },
  ];

  const moderatePercent = ((insights.financialStress.moderateCount / insights.financialStress.totalUsers) * 100).toFixed(1);
  const manageablePercent = ((insights.financialStress.manageableCount / insights.financialStress.totalUsers) * 100).toFixed(1);
  const noDebtPercent = ((insights.financialStress.noDebtCount / insights.financialStress.totalUsers) * 100).toFixed(1);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Insights</h1>
          <p className="text-gray-400 text-sm">Financial insights and program performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchInsights}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Section 1: Charts First - Debt & DTI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debt Breakdown Pie Chart */}
        <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">Total Debt Breakdown</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 w-64 p-2 bg-gray-900 text-xs text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Visualizes total student loan burden, showing how much has been paid off versus what remains outstanding.
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={debtBreakdownData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {debtBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-[#1A1F2E] rounded">
              <p className="text-gray-500 text-xs">Original Debt</p>
              <p className="text-white font-semibold">${(insights.totalDebt.originalDebt / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-2 bg-[#1A1F2E] rounded">
              <p className="text-gray-500 text-xs">Remaining</p>
              <p className="text-red-400 font-semibold">${(insights.totalDebt.remainingDebt / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-2 bg-[#1A1F2E] rounded">
              <p className="text-gray-500 text-xs">Paid Off</p>
              <p className="text-green-400 font-semibold">${(insights.totalDebt.paidOff / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-2 bg-[#1A1F2E] rounded">
              <p className="text-gray-500 text-xs">Avg Loan</p>
              <p className="text-blue-400 font-semibold">${insights.totalDebt.averageLoan.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* DTI Distribution Bar Chart */}
        <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">Debt-to-Income Distribution</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 w-64 p-2 bg-gray-900 text-xs text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Shows what percentage of income goes to debt payments; high DTI (&gt;30%) indicates financial stress and turnover risk.
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dtiDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #374151', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-[#1A1F2E] rounded">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-bold text-lg">{insights.debtToIncome.above30Count}</p>
                <p className="text-gray-500 text-xs">DTI &gt; 30%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#1A1F2E] rounded">
              <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-blue-400 font-bold text-lg">{insights.debtToIncome.averageDTI.toFixed(1)}%</p>
                <p className="text-gray-500 text-xs">Avg DTI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: ROI Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Card */}
        <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">Program ROI</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 w-64 p-2 bg-gray-900 text-xs text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Measures the return on investment of the employer's loan matching program based on retention and turnover savings.
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full">
              <span className="text-3xl font-bold text-green-400">{insights.roi.roiPercent.toFixed(0)}%</span>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Net Benefit</p>
              <p className="text-green-400 font-bold text-2xl">
                ${((insights.roi.turnoverSavings - insights.roi.annualCost) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-[#1A1F2E] rounded">
              <span className="text-gray-400 text-xs">Annual Cost</span>
              <span className="text-white font-semibold text-sm">${(insights.roi.annualCost / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-[#1A1F2E] rounded">
              <span className="text-gray-400 text-xs">Retained</span>
              <span className="text-blue-400 font-semibold text-sm">{insights.roi.retainedEmployees} staff</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-[#1A1F2E] rounded">
              <span className="text-gray-400 text-xs">Savings</span>
              <span className="text-green-400 font-semibold text-sm">${(insights.roi.turnoverSavings / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        {/* ROI Comparison Chart */}
        <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">Cost vs Benefit</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 w-64 p-2 bg-gray-900 text-xs text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Compares program costs against employee retention savings to demonstrate the business case for expansion.
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roiComparisonData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <YAxis type="category" dataKey="category" stroke="#9CA3AF" width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`}
              />
              <Bar dataKey="amount" fill="#10B981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 text-center text-sm p-2 bg-green-500/10 border border-green-500/30 rounded">
            <p className="text-gray-400">
              Every <span className="text-green-400 font-bold">$1 spent</span> returns{' '}
              <span className="text-green-400 font-bold">${(insights.roi.roiPercent / 100 + 1).toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Financial Stress Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Financial Stress Overview</h2>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute right-0 w-64 p-2 bg-gray-900 text-xs text-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Categorizes employees by loan repayment stress level to identify those at highest risk of turnover.
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* High Risk Card */}
          <div className="bg-[#252C3C] border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-400 text-xs font-medium">High Risk</p>
                <h3 className="text-2xl font-bold text-white">{insights.financialStress.highBurdenCount}</h3>
              </div>
              <div className="bg-red-500/10 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <p className="text-red-400 font-bold text-sm">{insights.financialStress.highBurdenPercent.toFixed(1)}%</p>
          </div>

          {/* Moderate Card */}
          <div className="bg-[#252C3C] border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-400 text-xs font-medium">Moderate</p>
                <h3 className="text-2xl font-bold text-white">{insights.financialStress.moderateCount}</h3>
              </div>
              <div className="bg-yellow-500/10 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <p className="text-yellow-400 font-bold text-sm">{moderatePercent}%</p>
          </div>

          {/* Manageable Card */}
          <div className="bg-[#252C3C] border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-400 text-xs font-medium">Manageable</p>
                <h3 className="text-2xl font-bold text-white">{insights.financialStress.manageableCount}</h3>
              </div>
              <div className="bg-green-500/10 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-green-400 font-bold text-sm">{manageablePercent}%</p>
          </div>

          {/* No Debt Card */}
          <div className="bg-[#252C3C] border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-400 text-xs font-medium">No Debt</p>
                <h3 className="text-2xl font-bold text-white">{insights.financialStress.noDebtCount}</h3>
              </div>
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-blue-400 font-bold text-sm">{noDebtPercent}%</p>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">
            <span className="font-bold">{insights.financialStress.highBurdenPercent.toFixed(1)}%</span> of employees are at HIGH
            RISK of turnover due to debt burden
          </p>
        </div>
      </div>

      {/* Section 4: Key Insights */}
      <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Key Insights & Recommendations</h2>
        <div className="space-y-3">
          <div className="flex gap-3 p-3 bg-[#1A1F2E] rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
              <span className="text-red-400 font-bold text-sm">1</span>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">URGENT: High-Stress Employees</h4>
              <p className="text-gray-400 text-xs">
                {insights.financialStress.highBurdenCount} employees need immediate support. Consider counseling or increased matching.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-[#1A1F2E] rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
              <span className="text-yellow-400 font-bold text-sm">2</span>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Monitor High DTI Employees</h4>
              <p className="text-gray-400 text-xs">
                {insights.debtToIncome.above30Count} employees with DTI &gt; 30% should be monitored for support programs.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-[#1A1F2E] rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
              <span className="text-green-400 font-bold text-sm">3</span>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Strong ROI Justifies Expansion</h4>
              <p className="text-gray-400 text-xs">
                {insights.roi.roiPercent.toFixed(0)}% ROI proves effectiveness. Use this to justify budget increase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
