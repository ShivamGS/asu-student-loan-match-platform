import { useState } from 'react';
import { Calculator as CalcIcon, Download, RefreshCw, Lightbulb } from 'lucide-react';
import { CalculatorInputs, CalculatorResults } from '../types';
import { calculateRetirementMatch, formatCurrency, formatPercent } from '../utils/calculator';

const sampleScenario: CalculatorInputs = {
  annualSalary: 60000,
  monthlyLoanPayment: 400,
  matchPercentage: 6,
  matchCap: 4,
  monthly401kContribution: 200,
};

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    annualSalary: 0,
    monthlyLoanPayment: 0,
    matchPercentage: 6,
    matchCap: 4,
    monthly401kContribution: 0,
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const calculatedResults = calculateRetirementMatch(inputs);
    setResults(calculatedResults);
    setShowResults(true);
  };

  const handleReset = () => {
    setInputs({
      annualSalary: 0,
      monthlyLoanPayment: 0,
      matchPercentage: 6,
      matchCap: 4,
      monthly401kContribution: 0,
    });
    setResults(null);
    setShowResults(false);
  };

  const handleLoadExample = () => {
    setInputs(sampleScenario);
    const calculatedResults = calculateRetirementMatch(sampleScenario);
    setResults(calculatedResults);
    setShowResults(true);
  };

  const handleDownload = () => {
    if (!results) return;

    const content = `
ASU Student Loan Retirement Matching - Calculation Results

INPUTS:
Annual Salary: ${formatCurrency(inputs.annualSalary)}
Monthly Loan Payment: ${formatCurrency(inputs.monthlyLoanPayment)}
ASU Match Rate: ${inputs.matchPercentage}%
Match Cap: ${inputs.matchCap}% of salary
Current Monthly 401(k) Contribution: ${formatCurrency(inputs.monthly401kContribution)}

RESULTS:
Annual Loan Payments: ${formatCurrency(results.annualLoanPayments)}
ASU Match Amount: ${formatCurrency(results.eligibleMatchAmount)}
Your Annual 401(k) Contribution: ${formatCurrency(results.totalEmployeeContribution)}
Total Annual Retirement Contribution: ${formatCurrency(results.eligibleMatchAmount + results.totalEmployeeContribution)}
Match Utilization: ${formatPercent(results.matchUtilizationPercent)}
Projected 10-Year Balance (7% growth): ${formatCurrency(results.projectedBalance10Year)}

Generated on ${new Date().toLocaleDateString()}
ASU Student Loan Retirement Matching Program
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asu-loan-match-calculation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isFormValid = inputs.annualSalary > 0 && inputs.monthlyLoanPayment > 0;

  return (
    <div>
      <section className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <CalcIcon className="h-16 w-16 text-asu-gold mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Calculate Your Match
          </h1>
          <p className="text-xl text-asu-gray-100">
            See how much ASU will contribute to your retirement based on your student loan payments
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asu-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-asu-maroon">Your Information</h2>
                  <button
                    onClick={handleLoadExample}
                    className="flex items-center text-sm text-asu-maroon hover:text-asu-maroon-dark font-medium"
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    See Example
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                      Annual Salary
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-asu-gray-500">$</span>
                      <input
                        type="number"
                        value={inputs.annualSalary || ''}
                        onChange={(e) => handleInputChange('annualSalary', Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:border-asu-maroon focus:outline-none"
                        placeholder="60000"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-asu-gray-500 mt-1">Your annual eligible compensation</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                      Monthly Student Loan Payment
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-asu-gray-500">$</span>
                      <input
                        type="number"
                        value={inputs.monthlyLoanPayment || ''}
                        onChange={(e) => handleInputChange('monthlyLoanPayment', Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:border-asu-maroon focus:outline-none"
                        placeholder="400"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-asu-gray-500 mt-1">Average monthly payment on qualified loans</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                      ASU Match Percentage
                    </label>
                    <select
                      value={inputs.matchPercentage}
                      onChange={(e) => handleInputChange('matchPercentage', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:border-asu-maroon focus:outline-none"
                    >
                      <option value={3}>3%</option>
                      <option value={4}>4%</option>
                      <option value={5}>5%</option>
                      <option value={6}>6%</option>
                    </select>
                    <p className="text-xs text-asu-gray-500 mt-1">Typical match rate is 6%</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                      Match Cap (% of Salary)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.matchCap || ''}
                        onChange={(e) => handleInputChange('matchCap', Number(e.target.value))}
                        className="w-full pr-8 pl-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:border-asu-maroon focus:outline-none"
                        placeholder="4"
                        min="0"
                        max="10"
                        step="0.5"
                      />
                      <span className="absolute right-3 top-3 text-asu-gray-500">%</span>
                    </div>
                    <p className="text-xs text-asu-gray-500 mt-1">Maximum match as percentage of salary (typically 4%)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                      Current Monthly 401(k) Contribution (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-asu-gray-500">$</span>
                      <input
                        type="number"
                        value={inputs.monthly401kContribution || ''}
                        onChange={(e) => handleInputChange('monthly401kContribution', Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:border-asu-maroon focus:outline-none"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-asu-gray-500 mt-1">Your current personal 401(k) contributions</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleCalculate}
                    disabled={!isFormValid}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all ${
                      isFormValid
                        ? 'bg-asu-gold text-asu-maroon hover:bg-yellow-400 shadow-md hover:shadow-lg'
                        : 'bg-asu-gray-300 text-asu-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CalcIcon className="h-5 w-5 mr-2" />
                    Calculate
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-lg font-semibold border-2 border-asu-gray-300 text-asu-gray-700 hover:border-asu-maroon hover:text-asu-maroon transition-all"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="bg-asu-maroon text-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-asu-gold" />
                  Calculator Tips
                </h3>
                <ul className="text-sm space-y-2 text-asu-gray-100">
                  <li>• Enter your base annual salary before taxes</li>
                  <li>• Use your average monthly loan payment amount</li>
                  <li>• The match cap is typically 4% of your salary</li>
                  <li>• Results assume 7% annual investment return</li>
                  <li>• Click "See Example" to view a sample calculation</li>
                </ul>
              </div>
            </div>

            <div>
              {showResults && results ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-asu-maroon">Your Results</h2>
                      <button
                        onClick={handleDownload}
                        className="flex items-center text-sm text-asu-maroon hover:text-asu-maroon-dark font-medium"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-asu-gray-50 rounded-lg p-4">
                        <p className="text-sm text-asu-gray-600 mb-1">Annual Student Loan Payments</p>
                        <p className="text-2xl font-bold text-asu-maroon">{formatCurrency(results.annualLoanPayments)}</p>
                      </div>

                      <div className="bg-asu-gold bg-opacity-20 rounded-lg p-4 border-2 border-asu-gold">
                        <p className="text-sm text-asu-gray-700 mb-1">ASU Annual Match</p>
                        <p className="text-3xl font-bold text-asu-maroon">{formatCurrency(results.eligibleMatchAmount)}</p>
                        <p className="text-xs text-asu-gray-600 mt-1">{formatCurrency(results.monthlyMatchAmount)} per month</p>
                      </div>

                      <div className="bg-asu-gray-50 rounded-lg p-4">
                        <p className="text-sm text-asu-gray-600 mb-1">Your Annual 401(k) Contribution</p>
                        <p className="text-2xl font-bold text-asu-maroon">{formatCurrency(results.totalEmployeeContribution)}</p>
                      </div>

                      <div className="bg-asu-gray-50 rounded-lg p-4">
                        <p className="text-sm text-asu-gray-600 mb-1">Total Annual Retirement Contribution</p>
                        <p className="text-2xl font-bold text-asu-maroon">
                          {formatCurrency(results.eligibleMatchAmount + results.totalEmployeeContribution)}
                        </p>
                      </div>

                      <div className="bg-asu-gray-50 rounded-lg p-4">
                        <p className="text-sm text-asu-gray-600 mb-2">Match Utilization</p>
                        <div className="w-full bg-asu-gray-200 rounded-full h-3 mb-2">
                          <div
                            className="bg-asu-gold h-3 rounded-full transition-all"
                            style={{ width: `${Math.min(results.matchUtilizationPercent, 100)}%` }}
                          />
                        </div>
                        <p className="text-sm font-semibold text-asu-maroon">{formatPercent(results.matchUtilizationPercent)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark text-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold mb-2">10-Year Projection</h3>
                    <p className="text-sm text-asu-gray-100 mb-4">
                      Projected retirement balance with 7% annual growth
                    </p>
                    <p className="text-4xl font-bold text-asu-gold mb-2">
                      {formatCurrency(results.projectedBalance10Year)}
                    </p>
                    <p className="text-sm text-asu-gray-200">
                      Based on combined annual contributions of{' '}
                      {formatCurrency(results.eligibleMatchAmount + results.totalEmployeeContribution)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="font-semibold text-asu-maroon mb-3">Comparison</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-asu-gray-50 rounded-lg">
                        <p className="text-xs text-asu-gray-600 mb-2">Without Match</p>
                        <p className="text-xl font-bold text-asu-gray-700">
                          {formatCurrency(results.totalEmployeeContribution * 10 * 1.07)}
                        </p>
                        <p className="text-xs text-asu-gray-500 mt-1">Your contributions only</p>
                      </div>
                      <div className="text-center p-4 bg-asu-gold bg-opacity-20 rounded-lg border-2 border-asu-gold">
                        <p className="text-xs text-asu-gray-700 mb-2">With ASU Match</p>
                        <p className="text-xl font-bold text-asu-maroon">
                          {formatCurrency(results.projectedBalance10Year)}
                        </p>
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          +{formatCurrency(results.projectedBalance10Year - results.totalEmployeeContribution * 10 * 1.07)} more!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center h-full flex items-center justify-center">
                  <div>
                    <CalcIcon className="h-16 w-16 text-asu-gray-300 mx-auto mb-4" />
                    <p className="text-asu-gray-500 text-lg">
                      Enter your information and click Calculate to see your personalized results
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
