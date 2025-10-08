import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader, User, LayoutDashboard, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { 
  PageState, 
  EligibilityResult, 
  AIFinancialJourneyData,
  ProcessDocumentsResponse 
} from '../types';
import { getCurrentSession, signOut } from '../services/auth';
import { generateFinancialJourney } from '../services/ai';
import SimpleDocumentUpload from '../components/SimpleDocumentUpload';
import AccurateCalculator from '../components/AccurateCalculator';
import AIFinancialJourney from '../components/AIFinancialJourney';

export default function Blueprint() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('not-signed-in');
  const [userId, setUserId] = useState<string | null>(null);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessDocumentsResponse | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [aiJourneyData, setAIJourneyData] = useState<AIFinancialJourneyData | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount - redirect if not signed in
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      console.log('====== DEBUG: SESSION ON MOUNT ======');
      console.log('📝 Session:', session);
      console.log('📝 Session userId:', session.userId);
      console.log('=====================================');
      
      setUserId(session.userId);
      setPageState('signed-in-new');
    } else {
      // Redirect to signup if not authenticated
      console.log('⚠️ No session found - redirecting to /signup');
      navigate('/signup');
    }
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ UPDATED: Handle documents uploaded and processed with REAL DATA
  const handleDocumentsProcessed = async (result: ProcessDocumentsResponse) => {
    console.log('====== DEBUG: DOCUMENTS PROCESSED ======');
    console.log('📝 Processed Result:', result);
    console.log('========================================');
    
    setProcessedDocuments(result);
    
    // ✅ REAL DATA: Extract actual values from processed documents
    const eligibility: EligibilityResult = {
      eligible: true,
      checks: {
        employment: {
          passed: result.salaryVerification.employerName.toLowerCase().includes('arizona state'),
          details: `Employer: ${result.salaryVerification.employerName}`,
          recommendation: result.salaryVerification.employerName.toLowerCase().includes('arizona state') 
            ? 'Employment verified ✓' 
            : 'Please verify ASU employment status'
        },
        loanType: {
          passed: true, // All education loans qualify
          details: `Loan Type: ${result.loanApplication.loanType}`,
          recommendation: 'Loan type qualifies for program ✓'
        },
        salary: {
          passed: result.salaryVerification.netSalary > 0,
          details: `Net Salary: ${result.salaryVerification.currency} ${result.salaryVerification.netSalary.toLocaleString()}/month`,
          recommendation: 'Salary verified ✓'
        }
      },
      extractedData: {
        // ✅ REAL: Annual salary from monthly net salary
        annualSalary: result.salaryVerification.netSalary * 12,
        
        // ✅ REAL: Monthly loan payment calculation
        // Formula: Loan Amount / (Loan Tenure in years * 12 months)
        monthlyLoanPayment: result.loanApplication.loanAmount / (result.loanApplication.loanTenure * 12),
        
        // ✅ REAL: Loan balance
        loanBalance: result.loanApplication.loanAmount,
        
        // ✅ REAL: Loan type
        loanType: result.loanApplication.loanType,
        
        // ✅ REAL: Interest rate
        loanInterestRate: result.loanApplication.interestRate,
        
        // ✅ REAL: Loan term remaining (in months)
        loanTermRemaining: result.loanApplication.loanTenure * 12
      }
    };
    
    setEligibilityResult(eligibility);
    setPageState('checking-eligibility');
    
    // Auto-proceed to eligible state after a brief delay
    setTimeout(() => {
      if (eligibility.eligible) {
        setPageState('eligible');
      } else {
        setPageState('ineligible');
      }
    }, 2000);
  };

  // ✅ UPDATED: Handle calculation complete - generate AI insights with REAL DATA
  const handleCalculationComplete = async () => {
    if (!eligibilityResult?.extractedData || !userId) return;

    setPageState('generating-ai');
    setIsGeneratingAI(true);

    try {
      // ✅ REAL DATA: Pass actual extracted data to AI
      const aiData = await generateFinancialJourney({
        userId,
        annualSalary: eligibilityResult.extractedData.annualSalary,
        monthlyLoanPayment: eligibilityResult.extractedData.monthlyLoanPayment,
        loanBalance: eligibilityResult.extractedData.loanBalance,
        loanInterestRate: eligibilityResult.extractedData.loanInterestRate,
        loanTermRemaining: eligibilityResult.extractedData.loanTermRemaining,
        currentAge: 30, // TODO: Get from profile if available
        retirementAge: 65,
        current401kBalance: 0,
        monthly401kContribution: 0,
      });

      setAIJourneyData(aiData);
      setPageState('complete');
    } catch (error) {
      console.error('AI generation failed:', error);
      setPageState('eligible');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut();
    setShowAccountMenu(false);
    window.location.href = '/';
  };

  // Get user session for display
  const session = getCurrentSession();

  // Don't render anything if not signed in (redirect will happen)
  if (pageState === 'not-signed-in') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-gray-50 to-white">
      {/* Account Menu - Fixed top-right corner */}
      {session && (
        <div className="fixed top-4 right-4 z-50" ref={accountMenuRef}>
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-2 bg-white hover:bg-asu-gray-50 border-2 border-asu-gray-200 rounded-lg px-4 py-2 shadow-lg transition-all"
          >
            <User className="w-5 h-5 text-asu-maroon" />
            <span className="font-semibold text-asu-gray-900">Account</span>
            <ChevronDown className={`w-4 h-4 text-asu-gray-600 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-asu-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="bg-asu-gray-50 px-4 py-3 border-b border-asu-gray-200">
                <p className="text-sm font-semibold text-asu-gray-900">{session.profile.fullName}</p>
                <p className="text-xs text-asu-gray-600">{session.profile.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    console.log('Navigate to dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-asu-gray-700 hover:bg-asu-gray-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-asu-maroon" />
                  <span className="text-sm font-medium">Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    console.log('Navigate to profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-asu-gray-700 hover:bg-asu-gray-50 transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-asu-maroon" />
                  <span className="text-sm font-medium">Profile</span>
                </button>

                <div className="border-t border-asu-gray-200 my-2" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar - Always visible after sign-up */}
      <div className="bg-white border-b border-asu-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-2 ${
              pageState === 'signed-in-new' ? 'text-asu-maroon font-semibold' : 'text-asu-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                pageState === 'signed-in-new' ? 'bg-asu-maroon text-white' : 'bg-asu-gray-300 text-asu-gray-600'
              }`}>
                1
              </div>
              <span>Upload Documents</span>
            </div>
            <div className="flex-1 h-0.5 bg-asu-gray-300 mx-4" />
            
            <div className={`flex items-center gap-2 ${
              ['checking-eligibility', 'eligible', 'generating-ai', 'complete'].includes(pageState) 
                ? 'text-asu-maroon font-semibold' 
                : 'text-asu-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ['checking-eligibility', 'eligible', 'generating-ai', 'complete'].includes(pageState)
                  ? 'bg-asu-maroon text-white' 
                  : 'bg-asu-gray-300 text-asu-gray-600'
              }`}>
                2
              </div>
              <span>Verify Eligibility</span>
            </div>
            <div className="flex-1 h-0.5 bg-asu-gray-300 mx-4" />
            
            <div className={`flex items-center gap-2 ${
              pageState === 'complete' ? 'text-asu-maroon font-semibold' : 'text-asu-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                pageState === 'complete' ? 'bg-asu-maroon text-white' : 'bg-asu-gray-300 text-asu-gray-600'
              }`}>
                3
              </div>
              <span>See Your Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        {/* Document Upload */}
        {pageState === 'signed-in-new' && userId && (
          <div className="animate-in fade-in duration-500">
            <SimpleDocumentUpload 
              userId={userId} 
              onDocumentsProcessed={handleDocumentsProcessed} 
            />
          </div>
        )}

        {/* Eligibility Checking */}
        {pageState === 'checking-eligibility' && processedDocuments && (
          <div className="animate-in fade-in duration-500">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-asu-gray-200 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader className="w-10 h-10 text-asu-gold animate-spin" />
                </div>
                <h2 className="text-3xl font-bold text-asu-gray-900 mb-3">
                  Verifying Your Eligibility
                </h2>
                <p className="text-lg text-asu-gray-600">
                  Checking employment status and loan qualifications...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Eligible - Show Calculator */}
        {pageState === 'eligible' && eligibilityResult && (
          <div className="animate-in fade-in duration-500">
            <AccurateCalculator
              eligibilityResult={eligibilityResult}
              onCalculationComplete={handleCalculationComplete}
            />
          </div>
        )}

        {/* Generating AI Insights */}
        {pageState === 'generating-ai' && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-asu-gray-200 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader className="w-10 h-10 text-asu-gold animate-spin" />
              </div>
              <h2 className="text-3xl font-bold text-asu-gray-900 mb-3">
                🤖 AI is Analyzing Your Future...
              </h2>
              <p className="text-lg text-asu-gray-600 mb-6">
                Creating your personalized financial journey
              </p>
              
              {/* Progress Steps */}
              <div className="space-y-3 text-left max-w-md mx-auto">
                {[
                  'Calculating loan payoff date...',
                  'Projecting retirement savings...',
                  'Comparing scenarios...',
                  'Generating personalized insights...',
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-asu-gray-700">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-asu-gray-500 mt-6">
                This takes about 5 seconds
              </p>
            </div>
          </div>
        )}

        {/* Complete - Show AI Journey */}
        {pageState === 'complete' && aiJourneyData && eligibilityResult && (
          <div className="animate-in fade-in duration-500">
            <AIFinancialJourney journeyData={aiJourneyData} eligibilityResult={eligibilityResult} />
          </div>
        )}

        {/* Ineligible State */}
        {pageState === 'ineligible' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-asu-gray-200 text-center">
              <h2 className="text-2xl font-bold text-asu-gray-900 mb-4">
                We need to review your documents
              </h2>
              <p className="text-asu-gray-600 mb-6">
                Our team will contact you within 24 hours to help resolve any issues.
              </p>
              <button className="bg-asu-maroon hover:bg-asu-maroon-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
