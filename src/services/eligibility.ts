import { EligibilityResult, UploadedDocument } from '../types';

// ============================================
// ELIGIBILITY CHECK API SERVICES
// ============================================

/**
 * Check user eligibility based on uploaded documents
 * TODO: Replace with actual AWS API that processes documents
 */
export const checkEligibility = async (
  userId: string,
  documents: UploadedDocument[]
): Promise<EligibilityResult> => {
  try {
    // TODO: POST to AWS API
    // This API should:
    // 1. Verify documents are authentic
    // 2. Extract data using OCR/document processing
    // 3. Check eligibility criteria
    // 4. Return structured result
    
    // const response = await fetch('https://your-api.com/eligibility/check', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, documentIds: documents.map(d => d.id) })
    // });
    // return await response.json();

    // MOCK IMPLEMENTATION - Simulate processing time
    await simulateProcessing();

    // Check if both required documents are uploaded and verified
    const hasSalarySlip = documents.some(
      doc => doc.documentType === 'salary_slip' && doc.status === 'verified'
    );
    const hasLoanStatement = documents.some(
      doc => doc.documentType === 'loan_statement' && doc.status === 'verified'
    );

    if (!hasSalarySlip || !hasLoanStatement) {
      return {
        eligible: false,
        checks: {
          employment: {
            passed: hasSalarySlip,
            details: hasSalarySlip 
              ? 'Employment verified' 
              : 'Salary slip required for verification',
          },
          loanType: {
            passed: hasLoanStatement,
            details: hasLoanStatement 
              ? 'Loan statement verified' 
              : 'Loan statement required',
          },
          salary: {
            passed: false,
            details: 'Waiting for document verification',
          },
        },
        message: 'Please upload all required documents',
      };
    }

    // MOCK: Simulate successful eligibility with extracted data
    return {
      eligible: true,
      checks: {
        employment: {
          passed: true,
          details: 'Full-time ASU employee verified',
        },
        loanType: {
          passed: true,
          details: 'Qualified federal student loans',
        },
        salary: {
          passed: true,
          details: 'Salary verified and eligible',
        },
      },
      extractedData: {
        annualSalary: 67500,
        monthlyLoanPayment: 425,
        loanBalance: 48000,
        loanType: 'federal',
        loanInterestRate: 5.5,
        loanTermRemaining: 120, // months
      },
      message: 'Congratulations! You are eligible for the program.',
    };
  } catch (error) {
    console.error('Eligibility check error:', error);
    throw new Error('Failed to check eligibility. Please try again.');
  }
};

/**
 * Process documents to extract data (called by backend)
 * This simulates what your backend OCR/processing will do
 */
export const processDocuments = async (
  documentIds: string[]
): Promise<{ success: boolean; extractedData?: any }> => {
  try {
    // TODO: This will be handled by your AWS backend
    // It should use OCR/document AI to extract:
    // - Salary information from pay stubs
    // - Loan details from loan statements
    
    await simulateProcessing();
    
    return {
      success: true,
      extractedData: {
        // Mock extracted data
        annualSalary: 67500,
        monthlyLoanPayment: 425,
        loanBalance: 48000,
      },
    };
  } catch (error) {
    console.error('Document processing error:', error);
    return { success: false };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Simulate document processing time
 */
const simulateProcessing = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 3000));
};
