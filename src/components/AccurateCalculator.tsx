import { TrendingUp, FileCheck, Calculator } from 'lucide-react';
import { EligibilityResult } from '../types';
import { calculateRetirementMatch } from '../utils/calculator';

interface AccurateCalculatorProps {
  eligibilityResult: EligibilityResult;
  quickEstimate?: {
    annualMatch: number;
    tenYearBalance: number;
  };
  onCalculationComplete: () => void;
}

export default function AccurateCalculator({ 
  eligibilityResult, 
  quickEstimate,
  onCalculationComplete 
}: AccurateCalculatorProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!eligibilityResult.extractedData) {
    return null;
  }

  const { annualSalary, monthlyLoanPayment } = eligibilityResult.extractedData;

  // Calculate accurate match using verified data
  const verifiedCalculation = calculateRetirementMatch({
    annualSalary,
    monthlyLoanPayment,
    matchPercentage: 6,
    matchCap: 4,
    monthly401kContribution: 0,
  });

  // Calculate differences if we have quick estimate
  const hasComparison = quickEstimate !== undefined;
  const matchDifference = hasComparison 
    ? verifiedCalculation.eligibleMatchAmount - quickEstimate.annualMatch 
    : 0;
  const balanceDifference = hasComparison 
    ? verifiedCalculation.projectedBalance10Year - quickEstimate.tenYearBalance 
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-asu-gray-900 mb-3">
          Your Verified Retirement Match
        </h2>
        <p className="text-lg text-asu-gray-600">
          Based on your actual salary and loan data from verified documents
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Quick Estimate Card (if available) */}
        {hasComparison && quickEstimate && (
          <div className="bg-asu-gray-100 rounded-xl p-6 border-2 border-asu-gray-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-asu-gray-300 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-asu-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-asu-gray-900">Quick Estimate</h3>
                <p className="text-xs text-asu-gray-600">From home page</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-asu-gray-600 mb-1">Annual Match</p>
                <p className="text-2xl font-bold text-asu-gray-900">
                  {formatCurrency(quickEstimate.annualMatch)}
                </p>
              </div>
              <div>
                <p className="text-sm text-asu-gray-600 mb-1">10-Year Balance</p>
                <p className="text-xl font-bold text-asu-gray-900">
                  {formatCurrency(quickEstimate.tenYearBalance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verified Match Card */}
        <div className={`bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-xl p-6 border-2 border-asu-maroon shadow-xl ${
          !hasComparison ? 'md:col-span-2' : ''
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-asu-gold rounded-lg flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Verified Match ✓</h3>
              <p className="text-xs text-white/80">From your documents</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-white/80 mb-1">Annual Match</p>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(verifiedCalculation.eligibleMatchAmount)}
              </p>
              {hasComparison && matchDifference !== 0 && (
                <p className="text-sm text-asu-gold mt-1 flex items-center gap-1">
                  {matchDifference > 0 ? '+' : ''}{formatCurrency(Math.abs(matchDifference))} 
                  {matchDifference > 0 ? ' more!' : ' less'}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-white/80 mb-1">10-Year Balance</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(verifiedCalculation.projectedBalance10Year)}
              </p>
              {hasComparison && balanceDifference !== 0 && (
                <p className="text-sm text-asu-gold mt-1 flex items-center gap-1">
                  {balanceDifference > 0 ? '+' : ''}{formatCurrency(Math.abs(balanceDifference))} 
                  {balanceDifference > 0 ? ' better!' : ' difference'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Callout */}
      {hasComparison && (matchDifference > 0 || balanceDifference > 0) && (
        <div className="bg-gradient-to-r from-asu-gold/20 to-asu-gold/10 border-2 border-asu-gold/50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-asu-gold rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-asu-gray-900 mb-2">
                💡 Your actual match is better than the quick estimate!
              </h4>
              <p className="text-asu-gray-700">
                Based on your verified salary of <span className="font-semibold">{formatCurrency(annualSalary)}</span> and 
                monthly loan payment of <span className="font-semibold">{formatCurrency(monthlyLoanPayment)}</span>, 
                you'll receive <span className="font-semibold text-asu-maroon">{formatCurrency(matchDifference)} more per year</span> than 
                initially estimated. That's real money in your retirement account!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-asu-gray-200">
        <h3 className="text-xl font-bold text-asu-gray-900 mb-6">
          📊 Detailed Breakdown
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="pb-4 border-b border-asu-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-asu-gray-600">Verified Annual Salary</span>
                <span className="font-semibold text-asu-gray-900">{formatCurrency(annualSalary)}</span>
              </div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <FileCheck className="w-3 h-3" />
                From paystub verification
              </p>
            </div>

            <div className="pb-4 border-b border-asu-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-asu-gray-600">Monthly Loan Payment</span>
                <span className="font-semibold text-asu-gray-900">{formatCurrency(monthlyLoanPayment)}</span>
              </div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <FileCheck className="w-3 h-3" />
                From loan statement
              </p>
            </div>

            <div className="pb-4 border-b border-asu-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-asu-gray-600">Annual Loan Payments</span>
                <span className="font-semibold text-asu-gray-900">
                  {formatCurrency(verifiedCalculation.annualLoanPayments)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="pb-4 border-b border-asu-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-asu-gray-600">ASU Match Rate</span>
                <span className="font-semibold text-asu-maroon">6%</span>
              </div>
            </div>

            <div className="pb-4 border-b border-asu-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-asu-gray-600">Monthly Match</span>
                <span className="font-semibold text-asu-maroon">
                  {formatCurrency(verifiedCalculation.monthlyMatchAmount)}
                </span>
              </div>
            </div>

            <div className="pb-4 border-b border-asu-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-asu-gray-600">Annual Match</span>
                <span className="font-semibold text-asu-maroon text-lg">
                  {formatCurrency(verifiedCalculation.eligibleMatchAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Explanation */}
        <div className="mt-6 bg-asu-gold/10 rounded-lg p-4 border border-asu-gold/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-asu-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white font-bold text-sm">6%</span>
            </div>
            <div className="text-sm text-asu-gray-700 leading-relaxed">
              <span className="font-semibold">How your verified match works:</span> ASU contributes 6% of your 
              loan payments ({formatCurrency(verifiedCalculation.annualLoanPayments)}) directly to your 401(k). 
              That's {formatCurrency(verifiedCalculation.eligibleMatchAmount)} per year in free retirement savings 
              based on your actual verified information!
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onCalculationComplete}
            className="bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl text-lg"
          >
            See Your Full Financial Journey →
          </button>
          <p className="text-sm text-asu-gray-600 mt-3">
            Discover what this means for your 5, 10, and 20-year financial future
          </p>
        </div>
      </div>
    </div>
  );
}
