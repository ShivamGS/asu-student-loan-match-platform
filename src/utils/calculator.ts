import { CalculatorInputs, CalculatorResults } from '../types';

export function calculateRetirementMatch(inputs: CalculatorInputs): CalculatorResults {
  const { annualSalary, monthlyLoanPayment, matchPercentage, matchCap, monthly401kContribution } = inputs;

  const annualLoanPayments = monthlyLoanPayment * 12;

  const maxMatchAmount = annualSalary * (matchCap / 100);

  const potentialMatch = annualLoanPayments * (matchPercentage / 100);

  const eligibleMatchAmount = Math.min(potentialMatch, maxMatchAmount);

  const totalASUContribution = eligibleMatchAmount;

  const monthlyMatchAmount = eligibleMatchAmount / 12;

  const totalEmployeeContribution = monthly401kContribution * 12;

  const matchUtilizationPercent = maxMatchAmount > 0
    ? (eligibleMatchAmount / maxMatchAmount) * 100
    : 0;

  const totalAnnualContribution = totalASUContribution + totalEmployeeContribution;
  const projectedBalance10Year = calculateFutureValue(
    totalAnnualContribution,
    0.07,
    10
  );

  return {
    annualLoanPayments,
    eligibleMatchAmount,
    totalASUContribution,
    totalEmployeeContribution,
    projectedBalance10Year,
    monthlyMatchAmount,
    matchUtilizationPercent,
  };
}

function calculateFutureValue(
  annualContribution: number,
  annualReturnRate: number,
  years: number
): number {
  let balance = 0;

  for (let year = 0; year < years; year++) {
    balance = (balance + annualContribution) * (1 + annualReturnRate);
  }

  return balance;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
