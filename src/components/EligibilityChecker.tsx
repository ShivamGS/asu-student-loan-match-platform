import { useState, useEffect } from 'react';
import { Loader, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { EligibilityResult, UploadedDocument } from '../types';
import { checkEligibility } from '../services/eligibility';

interface EligibilityCheckerProps {
  userId: string;
  documents: UploadedDocument[];
  onEligibilityComplete: (result: EligibilityResult) => void;
}

export default function EligibilityChecker({ 
  userId, 
  documents, 
  onEligibilityComplete 
}: EligibilityCheckerProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const steps = [
    { id: 'documents', label: 'Documents received' },
    { id: 'employment', label: 'Verifying employment status' },
    { id: 'loan', label: 'Checking loan qualification' },
    { id: 'salary', label: 'Validating salary information' },
  ];

  // Helper function - defined before useEffect
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'complete';
    if (index === currentStep) return 'processing';
    return 'pending';
  };

  useEffect(() => {
    const runEligibilityCheck = async () => {
      // Simulate step-by-step checking
      setCurrentStep(0);
      await delay(800);
      
      setCurrentStep(1);
      await delay(1000);
      
      setCurrentStep(2);
      await delay(1200);
      
      setCurrentStep(3);
      await delay(1000);

      try {
        const eligibilityResult = await checkEligibility(userId, documents);
        setResult(eligibilityResult);
        setIsChecking(false);
        onEligibilityComplete(eligibilityResult);
      } catch (error) {
        console.error('Eligibility check failed:', error);
        setIsChecking(false);
      }
    };

    runEligibilityCheck();
  }, [userId, documents, onEligibilityComplete]);

  if (isChecking) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-asu-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-asu-gray-900 mb-2">
              Checking Your Eligibility...
            </h2>
            <p className="text-asu-gray-600">
              This will take about 10 seconds
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {status === 'complete' && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {status === 'processing' && (
                      <Loader className="w-6 h-6 text-blue-500 animate-spin" />
                    )}
                    {status === 'pending' && (
                      <div className="w-6 h-6 rounded-full border-2 border-asu-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      status === 'complete' ? 'text-green-700' :
                      status === 'processing' ? 'text-blue-700' :
                      'text-asu-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-asu-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-center text-sm text-asu-gray-600 mt-2">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show result after checking
  if (result) {
    if (result.eligible) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border-2 border-green-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-3">
                🎉 Great News! You're Eligible!
              </h2>
              <p className="text-lg text-green-800 mb-8">
                {result.message || 'You qualify for the ASU Student Loan Retirement Match Program'}
              </p>

              {/* Eligibility Check Details */}
              <div className="bg-white rounded-xl p-6 space-y-4 text-left">
                {Object.entries(result.checks).map(([key, check]) => (
                  <div key={key} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-asu-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-asu-gray-600">{check.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extracted Data Preview */}
              {result.extractedData && (
                <div className="mt-6 bg-asu-gold/10 rounded-xl p-4 border border-asu-gold/30">
                  <p className="text-sm font-semibold text-asu-maroon mb-2">
                    📊 Verified Information:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-asu-gray-600">Annual Salary:</span>
                      <span className="font-semibold text-asu-gray-900 ml-2">
                        ${result.extractedData.annualSalary.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-asu-gray-600">Monthly Loan Payment:</span>
                      <span className="font-semibold text-asu-gray-900 ml-2">
                        ${result.extractedData.monthlyLoanPayment}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <p className="text-green-700 font-medium">
                  Let's see your accurate numbers...
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Ineligible result
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border-2 border-amber-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-amber-900 mb-3">
                Eligibility Check Issues
              </h2>
              <p className="text-lg text-amber-800 mb-8">
                We found some issues that need to be addressed
              </p>

              {/* Issues List */}
              <div className="bg-white rounded-xl p-6 space-y-4 text-left">
                {Object.entries(result.checks).map(([key, check]) => (
                  <div key={key} className="flex items-start gap-3">
                    {check.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium capitalize ${
                        check.passed ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-asu-gray-600">{check.details}</p>
                      {check.recommendation && (
                        <p className="text-sm text-asu-maroon mt-1">
                          💡 {check.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-asu-maroon hover:bg-asu-maroon-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Review Requirements
                </button>
                <button className="bg-white hover:bg-asu-gray-50 text-asu-maroon border-2 border-asu-maroon px-6 py-3 rounded-lg font-semibold transition-colors">
                  Contact HR for Help
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
}
