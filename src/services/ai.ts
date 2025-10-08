import { AIFinancialJourneyData, AIInsight } from '../types';

// ============================================
// AI INSIGHTS API SERVICES
// ============================================

interface AIInsightRequest {
  userId: string;
  annualSalary: number;
  monthlyLoanPayment: number;
  loanBalance: number;
  loanInterestRate?: number;
  loanTermRemaining?: number;
  currentAge?: number;
  retirementAge?: number;
  current401kBalance?: number;
  monthly401kContribution?: number;
}

/**
 * Generate AI-powered financial journey insights
 * TODO: Replace with actual LLM API call
 */
export const generateFinancialJourney = async (
  request: AIInsightRequest
): Promise<AIFinancialJourneyData> => {
  try {
    // TODO: POST to your LLM API endpoint
    // const response = await fetch('https://your-llm-api.com/generate-insights', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(request)
    // });
    // return await response.json();

    // MOCK IMPLEMENTATION - Simulate AI processing
    await simulateAIProcessing();

    const insights = generateMockInsights(request);
    
    return {
      userId: request.userId,
      generatedAt: new Date().toISOString(),
      insights,
      narrative: generateNarrative(request, insights),
      recommendations: generateRecommendations(request),
    };
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate insights. Please try again.');
  }
};

// ============================================
// MOCK INSIGHT GENERATION WITH REAL DATA
// ============================================

const generateMockInsights = (request: AIInsightRequest): AIInsight[] => {
  const currentYear = new Date().getFullYear();
  
  // ✅ REAL DATA CALCULATIONS
  const annualMatch = request.monthlyLoanPayment * 12 * 0.06; // 6% match on actual loan payments
  const avgReturnRate = 0.07; // 7% average annual return
  const loanTermYears = Math.ceil((request.loanTermRemaining || 120) / 12);
  const retirementYears = (request.retirementAge || 65) - (request.currentAge || 30);
  
  // Calculate real 5-year balance
  const fiveYearBalance = calculateFutureValue(annualMatch, 5, avgReturnRate);
  const fiveYearNoMatch = calculateFutureValue((request.monthly401kContribution || 0) * 12, 5, avgReturnRate);
  
  // Calculate real 10-year balance
  const tenYearBalance = calculateFutureValue(annualMatch, 10, avgReturnRate);
  const tenYearNoMatch = calculateFutureValue((request.monthly401kContribution || 0) * 12, 10, avgReturnRate);
  
  // Calculate balance at loan payoff
  const loanPayoffBalance = calculateFutureValue(annualMatch, loanTermYears, avgReturnRate);
  const loanPayoffNoMatch = calculateFutureValue((request.monthly401kContribution || 0) * 12, loanTermYears, avgReturnRate);
  
  // Calculate retirement balance
  const retirementBalance = calculateFutureValue(annualMatch, retirementYears, avgReturnRate);
  const retirementNoMatch = calculateFutureValue((request.monthly401kContribution || 0) * 12, retirementYears, avgReturnRate);
  
  return [
    {
      milestone: '5-year',
      year: currentYear + 5,
      headline: `In 5 years, your retirement account will have ${formatCurrency(fiveYearBalance)}`,
      mainNumber: Math.round(fiveYearBalance),
      explanation: `What this means for you:\n• You'll have paid down ${formatCurrency(request.monthlyLoanPayment * 60)} of your loans\n• ASU contributed ${formatCurrency(annualMatch * 5)} to your retirement (free money!)\n• Your retirement savings will be growing on its own\n• You're ahead of 73% of Americans your age`,
      comparisonWithout: Math.round(fiveYearNoMatch),
      insights: [
        `You'll have paid down ${formatCurrency(request.monthlyLoanPayment * 60)} of your student loans`,
        `ASU will have contributed ${formatCurrency(annualMatch * 5)} in free matching funds`,
        `Your money will be compounding at approximately 7% annually`,
      ],
      emotionalHook: `Without this program? You'd only have ${formatCurrency(fiveYearNoMatch)}. That's ${formatCurrency(fiveYearBalance - fiveYearNoMatch)} more - enough for a nice vacation!`,
    },
    {
      milestone: '10-year',
      year: currentYear + 10,
      headline: `At the 10-year mark, you'll have ${formatCurrency(tenYearBalance)}`,
      mainNumber: Math.round(tenYearBalance),
      explanation: `Your financial situation:\n• Total ASU match earned: ${formatCurrency(annualMatch * 10)}\n• Your contributions: ${formatCurrency(request.monthly401kContribution ? request.monthly401kContribution * 120 : 0)}\n• Compound growth: Working in your favor\n• Remaining loan balance: ${formatCurrency(Math.max(0, request.loanBalance - (request.monthlyLoanPayment * 120)))}`,
      comparisonWithout: Math.round(tenYearNoMatch),
      insights: [
        `${formatCurrency(annualMatch * 10)} in free money from ASU`,
        `Compound interest has generated ${formatCurrency(tenYearBalance - (annualMatch * 10))} in growth`,
        `You're well on your way to financial security`,
      ],
      emotionalHook: `That's ${formatCurrency(tenYearBalance - tenYearNoMatch)} more than without the program - enough for a down payment on a house!`,
    },
    {
      milestone: 'loan-payoff',
      year: currentYear + loanTermYears,
      headline: `🎉 Debt-free in ${loanTermYears} years!`,
      mainNumber: Math.round(loanPayoffBalance),
      explanation: `By ${currentYear + loanTermYears}:\n• $0 in student loan debt\n• ${formatCurrency(annualMatch * loanTermYears)} in ASU match earned during loan period\n• Monthly cash flow increases by ${formatCurrency(request.monthlyLoanPayment)} (your old loan payment)\n• Your retirement account: ${formatCurrency(loanPayoffBalance)}`,
      comparisonWithout: Math.round(loanPayoffNoMatch),
      insights: [
        `You'll be completely debt-free`,
        `Extra ${formatCurrency(request.monthlyLoanPayment)}/month in cash flow`,
        `Can redirect loan payments to retirement or other goals`,
      ],
      emotionalHook: `Imagine what you'll do with that extra ${formatCurrency(request.monthlyLoanPayment * 12)}/year! Vacation fund? Home down payment? Max out 401(k)?`,
    },
    {
      milestone: 'retirement',
      year: request.retirementAge || 65,
      headline: `At ${request.retirementAge || 65}, you could retire with ${formatCurrency(retirementBalance)}`,
      mainNumber: Math.round(retirementBalance),
      explanation: `Breaking it down:\n• ${formatCurrency(annualMatch * retirementYears)} came from ASU match (FREE MONEY)\n• ${formatCurrency(request.monthly401kContribution ? request.monthly401kContribution * 12 * retirementYears : 0)} from your contributions\n• ${formatCurrency(retirementBalance - (annualMatch * retirementYears) - (request.monthly401kContribution ? request.monthly401kContribution * 12 * retirementYears : 0))} from compound growth (money making money)\n\nThat's roughly ${formatCurrency(Math.round(retirementBalance * 0.04 / 12))}/month in retirement income.\nPlus Social Security = Comfortable retirement.`,
      comparisonWithout: Math.round(retirementNoMatch),
      insights: [
        `ASU match contributed ${formatCurrency(annualMatch * retirementYears)} in free money`,
        `Compound growth generated ${formatCurrency(retirementBalance - (annualMatch * retirementYears))}`,
        `You're ${formatCurrency(retirementBalance - retirementNoMatch)} richer just for paying student loans`,
      ],
      emotionalHook: `Without this program? You'd only have ${formatCurrency(retirementNoMatch)}. You're ${formatCurrency(retirementBalance - retirementNoMatch)} richer just for doing what you were already doing!`,
    },
  ];
};

const generateNarrative = (request: AIInsightRequest, insights: AIInsight[]): string => {
  const annualMatch = request.monthlyLoanPayment * 12 * 0.06;
  return `Based on your salary of ${formatCurrency(request.annualSalary)} and loan payments of ${formatCurrency(request.monthlyLoanPayment)}/month, here's your personalized financial journey.\n\nEvery month, ASU matches your loan payments with retirement contributions (${formatCurrency(annualMatch / 12)}/month). This isn't just about saving - it's about building real wealth while handling debt responsibly.\n\nOver your career, this program will contribute ${formatCurrency(annualMatch * ((request.retirementAge || 65) - (request.currentAge || 30)))} in free money to your retirement. The earlier you start, the more compound growth works in your favor.`;
};

const generateRecommendations = (request: AIInsightRequest): string[] => {
  const recommendations = [
    `Maximize your match by ensuring your monthly loan payment of ${formatCurrency(request.monthlyLoanPayment)} qualifies`,
    `Consider increasing 401(k) contributions once loans are paid off in ${Math.ceil((request.loanTermRemaining || 120) / 12)} years`,
    `Review your retirement strategy annually as your salary increases above ${formatCurrency(request.annualSalary)}`,
  ];

  if ((request.currentAge || 30) > 40) {
    recommendations.push(`Take advantage of catch-up contributions after age 50 to accelerate savings`);
  }

  recommendations.push(`Consult with a financial advisor to optimize your full retirement plan`);

  return recommendations;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate future value with compound interest
 * Formula: FV = P × ((1 + r)^n - 1) / r × (1 + r)
 * Where: P = annual contribution, r = return rate, n = years
 */
const calculateFutureValue = (annualContribution: number, years: number, returnRate: number): number => {
  if (annualContribution === 0) return 0;
  
  let balance = 0;
  for (let i = 0; i < years; i++) {
    balance = (balance + annualContribution) * (1 + returnRate);
  }
  return balance;
};

/**
 * Format currency
 */
const formatCurrency = (value: number): string => {
  return `$${Math.round(value).toLocaleString()}`;
};

/**
 * Simulate AI processing delay
 */
const simulateAIProcessing = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds for AI generation
};

/**
 * Format number without currency symbol
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};
