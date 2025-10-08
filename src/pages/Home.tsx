import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, Shield, Clock, ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
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

  // Calculate comparison data when results exist
  const withoutMatchBalance = results
    ? results.totalEmployeeContribution * 10 * 1.07
    : 0;
  const withMatchBalance = results ? results.projectedBalance10Year : 0;
  const difference = withMatchBalance - withoutMatchBalance;
  const percentageIncrease = withoutMatchBalance > 0 ? (difference / withoutMatchBalance) * 100 : 0;

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

      {/* CALCULATOR SECTION */}
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

            {/* Right Column - Results */}
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
                      <div className="text-xs text-asu-gray-500">Your contributions only</div>
                    </div>

                    <div className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-xl p-6 border-2 border-asu-maroon shadow-lg">
                      <div className="text-sm font-medium text-white/80 mb-2">With ASU Match</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(withMatchBalance)}
                      </div>
                      {withoutMatchBalance > 0 ? (
                        <div className="text-xs text-asu-gold">
                          +{formatCurrency(difference)} more ({percentageIncrease.toFixed(0)}% increase)
                        </div>
                      ) : (
                        <div className="text-xs text-asu-gold">
                          +{formatCurrency(difference)} in free money
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-asu-gray-200 space-y-4">
                    <div className="pb-4 border-b border-asu-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-asu-maroon mb-1">
                            Free Money from ASU
                          </div>
                          <div className="text-xs text-asu-gray-600 leading-relaxed">
                            ASU contributes this amount to your 401(k) based on your student loan payments
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-asu-maroon">
                            {formatCurrency(results.eligibleMatchAmount)}
                          </div>
                          <div className="text-xs text-asu-gray-500 mt-1">
                            {formatCurrency(results.monthlyMatchAmount)}/month
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pb-4 border-b border-asu-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-asu-gray-900 mb-1">
                            Your Student Loan Payments
                          </div>
                          <div className="text-xs text-asu-gray-600 leading-relaxed">
                            Total amount you're paying toward loans per year
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-asu-gray-900">
                            {formatCurrency(results.annualLoanPayments)}
                          </div>
                          <div className="text-xs text-asu-gray-500 mt-1">
                            {formatCurrency(results.annualLoanPayments / 12)}/month
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-asu-gold/10 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-asu-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-sm">6%</span>
                        </div>
                        <div className="text-xs text-asu-gray-700 leading-relaxed">
                          <span className="font-semibold">How the match works:</span> For every dollar you pay toward student loans, ASU contributes 6 cents to your retirement account. So your {formatCurrency(results.annualLoanPayments)} in loan payments earns you {formatCurrency(results.eligibleMatchAmount)} in free retirement savings!
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

      {/* SCROLL TEASER BANNER - ONLY SHOWN AFTER CALCULATION */}
      {results && (
        <div className="relative py-8 bg-gradient-to-r from-asu-gold/10 via-asu-gold/5 to-asu-gold/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={scrollToInsights}
              className="w-full group cursor-pointer bg-white hover:bg-asu-gray-50 rounded-2xl p-6 shadow-lg border-2 border-asu-gold/30 hover:border-asu-gold transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Sparkles className="w-7 h-7 text-asu-gold animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-asu-gray-900 mb-1">
                      📊 See Your Personalized Financial Insights
                    </h3>
                    <p className="text-sm text-asu-gray-600">
                      Discover what your {formatCurrency(results.eligibleMatchAmount)} annual match means for your future
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 animate-bounce">
                  <ChevronDown className="w-8 h-8 text-asu-maroon" />
                  <span className="text-xs font-semibold text-asu-maroon">Scroll Down</span>
                </div>
              </div>
            </button>
          </div>
        </div>
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
                  Don't leave <span className="text-asu-gold font-bold">${results.eligibleMatchAmount}</span> per year on the table. Get started in less than 10 minutes.
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
