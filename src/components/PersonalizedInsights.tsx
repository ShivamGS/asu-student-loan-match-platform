import { Sparkles, TrendingUp, Zap, Target, DollarSign } from 'lucide-react';
import { CalculatorResults } from '../types';

interface PersonalizedInsightsProps {
  results: CalculatorResults;
  inputs: {
    annualSalary: number;
    monthlyLoanPayment: number;
    monthly401kContribution: number;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function PersonalizedInsights({ results, inputs }: PersonalizedInsightsProps) {
  // Calculate personalized metrics
  const monthlyMatch = results.monthlyMatchAmount;
  const yearlyMatch = results.eligibleMatchAmount;
  const tenYearTotal = results.projectedBalance10Year;
  const twentyYearProjection = results.projectedBalance10Year * 2.5; // Rough 20-year estimate
  const matchUtilization = results.matchUtilizationPercent;
  
  // Calculate what they could buy with the match
  const coffeesPerMonth = Math.floor(monthlyMatch / 5); // $5 coffee
  const dinnerOutsPerMonth = Math.floor(monthlyMatch / 40); // $40 dinner

  // Generate 5 tailored insights
  const insights = [
    {
      icon: DollarSign,
      title: `That's ${formatCurrency(monthlyMatch)} in Free Money Every Month`,
      description: `You're already paying ${formatCurrency(inputs.monthlyLoanPayment)}/month on loans. Now ASU gives you ${formatCurrency(monthlyMatch)} back each month—that's like getting ${coffeesPerMonth} free coffees or ${dinnerOutsPerMonth} free dinners monthly, just for doing what you're already doing!`,
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: TrendingUp,
      title: `${formatCurrency(tenYearTotal)} in Just 10 Years`,
      description: `Your ${formatCurrency(yearlyMatch)} annual match grows to ${formatCurrency(tenYearTotal)} in 10 years through compound interest. By year 20? You could be looking at ${formatCurrency(twentyYearProjection)}. That's real wealth building while you pay down debt.`,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Zap,
      title: 'Zero Extra Effort Required',
      description: `You don't have to change your budget or make additional contributions. You're already making loan payments. This program literally turns your existing debt payments into retirement assets—it's automatic wealth building.`,
      color: 'from-asu-maroon to-asu-maroon-dark',
    },
    {
      icon: Target,
      title: matchUtilization < 80 
        ? `You Could Get Even More! (Currently Using ${matchUtilization.toFixed(0)}%)`
        : `You're Maximizing Your Match! (${matchUtilization.toFixed(0)}% Utilized)`,
      description: matchUtilization < 80
        ? `You're only using ${matchUtilization.toFixed(0)}% of your available match. If you can increase your loan payments slightly, ASU will match more. Every extra dollar you pay toward loans = 6 cents in your retirement account.`
        : `You're getting the maximum possible match! You're using ${matchUtilization.toFixed(0)}% of your available benefit. That's smart money management—you're maximizing every dollar.`,
      color: matchUtilization < 80 ? 'from-amber-500 to-orange-600' : 'from-green-500 to-teal-600',
    },
    {
      icon: Sparkles,
      title: 'Your Future Self Will Thank You',
      description: `Starting retirement savings now—even while paying loans—puts you ahead of 70% of Americans. The ${formatCurrency(results.eligibleMatchAmount)} you get this year compounds over decades. Miss this opportunity and you're essentially turning down free money.`,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-asu-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-asu-gold/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-asu-maroon" />
            <span className="text-sm font-semibold text-asu-maroon">Personalized for You</span>
          </div>
          <h2 className="text-4xl font-bold text-asu-gray-900 mb-4">
            Here's What This Means for Your Financial Future
          </h2>
          <p className="text-xl text-asu-gray-600 max-w-3xl mx-auto">
            Based on your numbers, here's why this program is a game-changer for you
          </p>
        </div>

        {/* Insights Grid */}
        <div className="space-y-6 max-w-5xl mx-auto">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-asu-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${insight.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-asu-gray-900 mb-3">
                      {insight.title}
                    </h3>
                    <p className="text-lg text-asu-gray-700 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
