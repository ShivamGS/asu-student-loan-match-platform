import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Calendar, Trophy, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { AIFinancialJourneyData, EligibilityResult } from '../types';

interface AIFinancialJourneyProps {
  journeyData: AIFinancialJourneyData;
  eligibilityResult: EligibilityResult;
}

export default function AIFinancialJourney({ journeyData, eligibilityResult }: AIFinancialJourneyProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>('5-year');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case '5-year': return Calendar;
      case '10-year': return TrendingUp;
      case 'loan-payoff': return Trophy;
      case 'retirement': return DollarSign;
      default: return Sparkles;
    }
  };

  const getMilestoneColor = (type: string) => {
    switch (type) {
      case '5-year': return 'from-blue-500 to-indigo-600';
      case '10-year': return 'from-purple-500 to-pink-600';
      case 'loan-payoff': return 'from-green-500 to-emerald-600';
      case 'retirement': return 'from-amber-500 to-orange-600';
      default: return 'from-asu-maroon to-asu-maroon-dark';
    }
  };

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestone(expandedMilestone === milestoneId ? null : milestoneId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-asu-gold/20 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-5 h-5 text-asu-maroon animate-pulse" />
          <span className="text-sm font-semibold text-asu-maroon">AI-Powered Insights</span>
        </div>
        <h2 className="text-4xl font-bold text-asu-gray-900 mb-4">
          Your Personalized Financial Journey
        </h2>
        <p className="text-xl text-asu-gray-600 max-w-3xl mx-auto">
          {journeyData.narrative}
        </p>
      </div>

      {/* Timeline Visual */}
      <div className="hidden md:block mb-12">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-amber-500" />
          
          {/* Timeline Dots */}
          <div className="relative flex justify-between">
            {journeyData.insights.map((insight, index) => {
              const Icon = getMilestoneIcon(insight.milestone);
              return (
                <div key={insight.milestone} className="flex flex-col items-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getMilestoneColor(insight.milestone)} rounded-full flex items-center justify-center shadow-lg z-10 cursor-pointer transform hover:scale-110 transition-transform`}
                    onClick={() => toggleMilestone(insight.milestone)}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs font-semibold text-asu-gray-900">{insight.year}</p>
                    <p className="text-xs text-asu-gray-600 whitespace-nowrap">
                      {insight.milestone === '5-year' && '5 Years'}
                      {insight.milestone === '10-year' && '10 Years'}
                      {insight.milestone === 'loan-payoff' && 'Debt Free'}
                      {insight.milestone === 'retirement' && 'Retirement'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Milestone Cards */}
      <div className="space-y-6 mb-12">
        {journeyData.insights.map((insight) => {
          const Icon = getMilestoneIcon(insight.milestone);
          const isExpanded = expandedMilestone === insight.milestone;

          return (
            <div
              key={insight.milestone}
              className="bg-white rounded-2xl shadow-lg border-2 border-asu-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Card Header - Always Visible */}
              <button
                onClick={() => toggleMilestone(insight.milestone)}
                className="w-full p-6 flex items-center justify-between hover:bg-asu-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${getMilestoneColor(insight.milestone)} rounded-xl flex items-center justify-center shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-asu-gray-900">
                      {insight.headline}
                    </h3>
                    <p className="text-sm text-asu-gray-600">Year {insight.year}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-6 h-6 text-asu-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-asu-gray-400" />
                )}
              </button>

              {/* Card Content - Expandable */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-asu-gray-200">
                  <div className="pt-6">
                    {/* Main Number */}
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-asu-maroon mb-2">
                        {insight.milestone === 'loan-payoff' 
                          ? '🎉 Debt Free!' 
                          : formatCurrency(insight.mainNumber)
                        }
                      </div>
                      <p className="text-asu-gray-600">
                        {insight.milestone === 'loan-payoff' 
                          ? 'No more student loan payments!' 
                          : 'Retirement Account Balance'
                        }
                      </p>
                    </div>

                    {/* Explanation */}
                    <div className="bg-asu-gray-50 rounded-xl p-6 mb-6">
                      <p className="text-asu-gray-700 whitespace-pre-line leading-relaxed">
                        {insight.explanation}
                      </p>
                    </div>

                    {/* Key Insights */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {insight.insights.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 bg-white border border-asu-gray-200 rounded-lg p-4">
                          <div className="w-2 h-2 bg-asu-maroon rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-asu-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>

                    {/* Comparison */}
                    {insight.comparisonWithout > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm text-green-700 font-medium mb-1">Without ASU Match</p>
                            <p className="text-2xl font-bold text-green-900">
                              {formatCurrency(insight.comparisonWithout)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-700 font-medium mb-1">With ASU Match</p>
                            <p className="text-2xl font-bold text-green-900">
                              {formatCurrency(insight.mainNumber)}
                            </p>
                          </div>
                        </div>
                        <div className="bg-green-600 h-2 rounded-full" />
                        <p className="text-sm text-green-700 font-semibold mt-3 text-center">
                          You're {formatCurrency(insight.mainNumber - insight.comparisonWithout)} ahead with the program! 🚀
                        </p>
                      </div>
                    )}

                    {/* Emotional Hook */}
                    <div className="bg-gradient-to-r from-asu-gold/20 to-asu-maroon/10 border-2 border-asu-gold/50 rounded-xl p-6">
                      <p className="text-lg font-semibold text-asu-gray-900 text-center">
                        {insight.emotionalHook}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-asu-gray-200 mb-8">
        <h3 className="text-2xl font-bold text-asu-gray-900 mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-asu-gold" />
          Smart Recommendations for You
        </h3>
        <div className="space-y-4">
          {journeyData.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-asu-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-asu-maroon rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{index + 1}</span>
              </div>
              <p className="text-asu-gray-700 pt-1">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-2xl p-12 text-center text-white shadow-2xl">
        <h3 className="text-3xl font-bold mb-4">
          Ready to Secure Your Financial Future?
        </h3>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          You've seen your personalized journey. Now let's make it happen. 
          Enroll today and start receiving your {formatCurrency(eligibilityResult.extractedData?.monthlyLoanPayment ? eligibilityResult.extractedData.monthlyLoanPayment * 12 * 0.06 : 0)}/year match.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/enroll"
            className="inline-flex items-center justify-center bg-asu-gold hover:bg-asu-gold/90 text-asu-gray-900 font-bold text-lg px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            🎯 Enroll in Program Now
          </Link>
          <button className="bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-8 py-4 rounded-lg border-2 border-white/30 transition-all">
            📅 Schedule HR Meeting
          </button>
        </div>
        <p className="text-sm text-white/70 mt-6">
          ✓ Takes 5 minutes to complete  •  ✓ Start receiving match next pay period  •  ✓ 100% employer-funded
        </p>
      </div>
    </div>
  );
}
