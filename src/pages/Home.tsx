import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, Shield, Clock, ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateRetirementMatch } from '../utils/calculator';
import { CalculatorInputs, CalculatorResults } from '../types';
import PersonalizedInsights from '../components/PersonalizedInsights';
import FAQAccordion from '../components/FAQAccordion';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    annualSalary: 65000,
    monthlyLoanPayment: 400,
    matchPercentage: 6,
    matchCap: 4,
    monthly401kContribution: 0,
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);

  const handleCalculate = () => {
    const calculatedResults = calculateRetirementMatch(inputs);
    setResults(calculatedResults);
  };

  const scrollToInsights = () => {
    const insightsSection = document.getElementById('personalized-insights');
    if (insightsSection) {
      insightsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    setInputs((prev) => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  // Calculate comparison data when results exist - FIXED CALCULATION
  const withoutMatchBalance = results && inputs.monthly401kContribution > 0
    ? (() => {
        const rate = 0.07;
        const years = 10;
        const annualContribution = inputs.monthly401kContribution * 12;
        let balance = 0;
        
        for (let year = 0; year < years; year++) {
          balance = (balance + annualContribution) * (1 + rate);
        }
        
        return balance;
      })()
    : 0;

  const withMatchBalance = results ? results.projectedBalance10Year : 0;
  const difference = withMatchBalance - withoutMatchBalance;
  const percentageIncrease = withoutMatchBalance > 0 ? (difference / withoutMatchBalance) * 100 : 0;

  // Calculate chart data
  const lineChartData = results ? Array.from({ length: 11 }, (_, i) => {
    const year = i;
    const rate = 0.07;
    
    const withoutMatchYearly = inputs.monthly401kContribution * 12;
    const withoutMatchFV = year === 0 ? 0 : withoutMatchYearly * (((1 + rate) ** year - 1) / rate) * (1 + rate);
    
    const withMatchYearly = (inputs.monthly401kContribution * 12) + results.eligibleMatchAmount;
    const withMatchFV = year === 0 ? 0 : withMatchYearly * (((1 + rate) ** year - 1) / rate) * (1 + rate);
    
    return {
      year,
      withoutMatch: Math.round(withoutMatchFV),
      withMatch: Math.round(withMatchFV),
    };
  }) : [];

  // Calculate investment growth for donut chart
  const investmentGrowth = results 
    ? results.projectedBalance10Year - results.totalEmployeeContribution - results.totalEmployerContribution
    : 0;

  const donutChartData = results ? [
    { 
      name: 'Your $', 
      value: results.totalEmployeeContribution, 
      color: '#3B82F6'
    },
    { 
      name: 'ASU Match', 
      value: results.totalEmployerContribution, 
      color: '#FCD34D'
    },
    { 
      name: 'Growth', 
      value: investmentGrowth, 
      color: '#10B981'
    },
  ].filter(item => item.value > 0) : [];

  const insights = [
    {
      icon: TrendingUp,
      title: 'Accelerated Growth',
      description: 'Match contributions compound over time, significantly boosting your retirement savings without requiring additional personal contributions.',
    },
    {
      icon: Shield,
      title: 'No Extra Cost',
      description: 'You\'re already making student loan payments. This program transforms those payments into retirement savings at no additional expense.',
    },
    {
      icon: Clock,
      title: 'Time Advantage',
      description: 'Starting early with matched contributions gives your retirement savings more time to grow through compound interest.',
    },
  ];

  const faqs = [
    {
      question: 'Who is eligible for the Student Loan Match program?',
      answer: 'All full-time ASU employees with qualified federal student loans are eligible. You must be making regular payments on your loans and contributing to the ASU 401(k) plan to receive the match.',
    },
    {
      question: 'How much does ASU match?',
      answer: 'ASU matches 6% of your student loan payments, up to a maximum of 4% of your annual salary. For example, if you pay $400/month in student loans, ASU will contribute $24/month to your 401(k).',
    },
    {
      question: 'Do I need to enroll in the 401(k) separately?',
      answer: 'Yes, you must be enrolled in the ASU 401(k) plan to receive the student loan match. The match is deposited directly into your 401(k) account alongside any regular contributions you make.',
    },
    {
      question: 'What types of student loans qualify?',
      answer: 'Federal student loans, including Direct Loans, FFEL Loans, and Federal Perkins Loans, are eligible. Private student loans and refinanced loans do not qualify for the match program.',
    },
    {
      question: 'How do I prove I\'m making student loan payments?',
      answer: 'You\'ll need to upload proof of payment, such as a recent loan statement or payment confirmation. We verify payments on a quarterly basis to ensure continued eligibility.',
    },
    {
      question: 'Can I change my student loan payment amount?',
      answer: 'Yes, your match will adjust based on your actual monthly payments. If your payment amount changes, simply update your documentation and we\'ll recalculate your match accordingly.',
    },
    {
      question: 'Is the match immediate or does it vest over time?',
      answer: 'The student loan match follows ASU\'s standard vesting schedule. You become fully vested after 3 years of service, meaning the matched funds are 100% yours to keep.',
    },
    {
      question: 'What happens if I pay off my loans early?',
      answer: 'If you pay off your student loans, you can continue contributing to your 401(k) through regular paycheck deductions. The match will end once loan payments stop, but your retirement savings continue to grow.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-gray-50 to-white">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-asu-gold/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-5">
              <Calculator className="w-4 h-4 text-asu-gold" />
              <span className="text-sm font-semibold text-asu-gold">Up to 6% Match Available</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 leading-snug">
              Turn Student Loan Payments Into Retirement Savings
            </h1>
            
            <p className="text-lg text-white/90 leading-relaxed max-w-3xl mx-auto">
              ASU matches your student loan payments with 401(k) contributions—building your retirement while you pay down debt at no extra cost.
            </p>
          </div>
        </div>
      </section>

      {/* CALCULATOR SECTION - ENDS AFTER CHARTS */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Calculator Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-asu-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-asu-maroon rounded-lg flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-asu-gray-900">Quick Calculator</h2>
                  <p className="text-sm text-asu-gray-600">Estimate your retirement match</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Annual Salary */}
                <div>
                  <label className="block text-sm font-medium text-asu-gray-700 mb-2">
                    Annual Salary
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-asu-gray-500">$</span>
                    <input
                      type="number"
                      value={inputs.annualSalary || ''}
                      onChange={(e) => handleInputChange('annualSalary', e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="65,000"
                    />
                  </div>
                </div>

                {/* Monthly Loan Payment */}
                <div>
                  <label className="block text-sm font-medium text-asu-gray-700 mb-2">
                    Monthly Student Loan Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-asu-gray-500">$</span>
                    <input
                      type="number"
                      value={inputs.monthlyLoanPayment || ''}
                      onChange={(e) => handleInputChange('monthlyLoanPayment', e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="400"
                    />
                  </div>
                </div>

                {/* Current 401(k) Contribution */}
                <div>
                  <label className="block text-sm font-medium text-asu-gray-700 mb-2">
                    Current Monthly 401(k) Contribution (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-asu-gray-500">$</span>
                    <input
                      type="number"
                      value={inputs.monthly401kContribution === 0 ? '' : inputs.monthly401kContribution}
                      onChange={(e) => handleInputChange('monthly401kContribution', e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  className="w-full bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Calculate My Match
                </button>

                <p className="text-xs text-asu-gray-500 text-center">
                  Using default match rate of 6% with 4% salary cap
                </p>
              </div>
            </div>

            {/* Right Column - Results with Charts */}
            <div className="space-y-6">
              {results ? (
                <>
                  {/* Comparison Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-asu-gray-100 rounded-xl p-6 border-2 border-asu-gray-300">
                      <div className="text-sm font-medium text-asu-gray-600 mb-2">Without ASU Match</div>
                      <div className="text-2xl font-bold text-asu-gray-900 mb-1">
                        {formatCurrency(withoutMatchBalance)}
                      </div>
                      <div className="text-xs text-asu-gray-500">Total retirement balance in 10 years</div>
                      <div className="text-xs text-asu-gray-400 mt-1">Your contributions only</div>
                    </div>

                    <div className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-xl p-6 border-2 border-asu-maroon shadow-lg">
                      <div className="text-sm font-medium text-white/80 mb-2">With ASU Match</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(withMatchBalance)}
                      </div>
                      <div className="text-xs text-asu-gold mb-1">Total retirement balance in 10 years</div>
                      {withoutMatchBalance > 0 ? (
                        <div className="text-xs text-white/90">
                          +{formatCurrency(difference)} more ({percentageIncrease.toFixed(0)}% increase)
                        </div>
                      ) : (
                        <div className="text-xs text-white/90">
                          {formatCurrency(results.totalEmployerContribution)} ASU contribution
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Charts Section - LAST COMPONENT IN CALCULATOR */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Line Chart - Growth Over Time */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-asu-gray-200">
                      <h3 className="text-lg font-semibold text-asu-gray-900 mb-4">10-Year Growth Projection</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={lineChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="year" 
                            stroke="#6B7280"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Years', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#6B7280' } }}
                          />
                          <YAxis 
                            stroke="#6B7280"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                          />
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #E5E7EB', 
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                            labelFormatter={(label) => `Year ${label}`}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                            iconType="line"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="withoutMatch" 
                            stroke="#9CA3AF" 
                            strokeWidth={2}
                            name="Without Match"
                            dot={{ fill: '#9CA3AF', r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="withMatch" 
                            stroke="#8C1D40" 
                            strokeWidth={3}
                            name="With Match"
                            dot={{ fill: '#8C1D40', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-asu-gray-500 mt-3 text-center">
                        Assumes 7% annual growth rate
                      </p>
                    </div>

                    {/* Donut Chart - Balance Breakdown */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-asu-gray-200">
                      <h3 className="text-lg font-semibold text-asu-gray-900 mb-4">Balance Breakdown (10 Years)</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={donutChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            dataKey="value"
                          >
                            {donutChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #E5E7EB', 
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Legend */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                            <span className="text-xs font-medium text-asu-gray-700">Your $</span>
                          </div>
                          <p className="text-sm font-bold text-asu-gray-900">{formatCurrency(results.totalEmployeeContribution)}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-[#FCD34D]"></div>
                            <span className="text-xs font-medium text-asu-gray-700">ASU Match</span>
                          </div>
                          <p className="text-sm font-bold text-asu-maroon">{formatCurrency(results.totalEmployerContribution)}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                            <span className="text-xs font-medium text-asu-gray-700">Growth</span>
                          </div>
                          <p className="text-sm font-bold text-green-600">{formatCurrency(investmentGrowth)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-asu-gray-50 rounded-xl p-12 border-2 border-dashed border-asu-gray-300 text-center">
                  <Calculator className="w-16 h-16 text-asu-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-asu-gray-900 mb-2">
                    Enter your information and calculate to see results
                  </h3>
                  <p className="text-sm text-asu-gray-600">
                    Your personalized retirement projection will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PERSONALIZED INSIGHTS BANNER & HOW MATCH WORKS - BELOW CALCULATOR */}
      {results && (
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-asu-gold/10 via-asu-gold/5 to-asu-gold/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* LEFT: Personalized Insights Banner */}
              <button
                onClick={scrollToInsights}
                className="group cursor-pointer bg-gradient-to-br from-asu-maroon to-asu-maroon-dark hover:from-asu-maroon-dark hover:to-asu-maroon rounded-xl p-6 shadow-lg border-2 border-asu-maroon transition-all duration-300 hover:shadow-xl text-left"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-asu-gold rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      📊 See Your Personalized Financial Insights
                    </h3>
                    <p className="text-sm text-white/80">
                      Discover what your {formatCurrency(results.eligibleMatchAmount)} annual match means for your future
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <ChevronDown className="w-5 h-5 text-asu-gold animate-bounce" />
                  <span className="text-xs font-semibold text-asu-gold">Scroll to View Details</span>
                </div>
              </button>

              {/* RIGHT: How ASU Match Works */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-asu-gray-200">
                <div className="bg-asu-gold/10 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-asu-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-base">6%</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-asu-gray-900 mb-2">How the ASU Match Works</div>
                      <div className="text-xs text-asu-gray-700 leading-relaxed mb-3">
                        For every dollar you pay toward student loans, ASU contributes 6 cents to your retirement account. Your <span className="font-semibold">{formatCurrency(results.annualLoanPayments)}</span> in annual loan payments earns you <span className="font-semibold text-asu-maroon">{formatCurrency(results.eligibleMatchAmount)}</span> per year in retirement savings through employer matching!
                      </div>
                      <div className="pt-3 border-t border-asu-gold/30 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-asu-gray-500">Your Loan Payments</div>
                          <div className="text-lg font-bold text-asu-gray-900">{formatCurrency(inputs.monthlyLoanPayment)}/month</div>
                        </div>
                        <div>
                          <div className="text-xs text-asu-gray-500">ASU Match</div>
                          <div className="text-lg font-bold text-asu-maroon">{formatCurrency(results.monthlyMatchAmount)}/month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PERSONALIZED INSIGHTS - ONLY SHOWN AFTER CALCULATION */}
      {results && (
        <div id="personalized-insights">
          <PersonalizedInsights 
            results={results} 
            inputs={{
              annualSalary: inputs.annualSalary,
              monthlyLoanPayment: inputs.monthlyLoanPayment,
              monthly401kContribution: inputs.monthly401kContribution,
            }}
          />
        </div>
      )}

      {/* CTA SECTION - ONLY SHOWN AFTER CALCULATION */}
      {results && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-3xl p-12 mb-16 shadow-2xl">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to Start Building Your Retirement?
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Take advantage of <span className="text-asu-gold font-bold">${results.eligibleMatchAmount}</span> per year in employer matching. Get started in less than 10 minutes.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-asu-gold hover:bg-asu-gold/90 text-asu-maroon font-bold text-lg px-8 py-4 rounded-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5" />
                    Get Your Plan
                  </Link>
                  <Link
                    to="/blueprint"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white border-2 border-white/30 font-semibold text-lg px-8 py-4 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                </div>
                
                <p className="text-sm text-white/80">
                  Upload documents, verify eligibility, and see your AI-powered financial journey
                </p>
              </div>
            </div>

            {/* 3 BENEFIT CARDS */}
            <div className="grid md:grid-cols-3 gap-8">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div
                    key={index}
                    className="bg-asu-gray-50 rounded-xl p-6 border border-asu-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 bg-asu-maroon rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-asu-gray-900 mb-3">{insight.title}</h3>
                    <p className="text-asu-gray-600 leading-relaxed">{insight.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asu-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-asu-maroon rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-asu-gold" />
            </div>
            <h2 className="text-3xl font-bold text-asu-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-asu-gray-600">
              Everything you need to know about the Student Loan Match program
            </p>
          </div>

          <FAQAccordion faqs={faqs} />

          {/* Contact CTA */}
          <div className="mt-12 bg-white rounded-xl p-8 border border-asu-gray-200 text-center">
            <h3 className="text-xl font-bold text-asu-gray-900 mb-3">
              Still have questions?
            </h3>
            <p className="text-asu-gray-600 mb-6">
              Our HR team is here to help you understand your options
            </p>
            <a
              href="mailto:benefits@asu.edu"
              className="inline-flex items-center justify-center gap-2 bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Contact HR
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
