// API service for user profile and document upload

const USER_PROFILE_API = 'https://jfqtf39dk3.execute-api.us-east-1.amazonaws.com/dev/user-profile';
const DOCUMENT_API_BASE = 'https://9u5m2hi0s9.execute-api.us-east-1.amazonaws.com/prod';

export interface CreateUserProfileRequest {
  asuId: string;
  asuEmail: string;
  firstName: string;
  lastName: string;
  debtAmount?: string;
  salary?: string;
  repaymentPeriod?: string;
  interestRate?: string;
}

export interface CreateUserProfileResponse {
  message: string;
  asuId: string;
  error?: string;
}

export interface GetUploadUrlsRequest {
  asuId: string;
}

export interface GetUploadUrlsResponse {
  asuId: string;
  loanDocument: {
    uploadUrl: string;
    fileKey: string;
  };
  salarySlips: {
    uploadUrl: string;
    fileKey: string;
  };
  bucket: string;
  expiresIn: number;
}

export interface ProcessDocumentsRequest {
  asuId: string;
  loanDocKey: string;
  salarySlipsKey: string;
}

export interface ProcessDocumentsResponse {
  asuId: string;
  status: string;
  action: string;
  processingTime: number;
  loanApplication: {
    loanProvider: string;
    applicantName: string;
    sanctionedAmount: number;
    loanAmount: number;
    currency: string;
    interestRate: number;
    loanTenure: number;
    loanType: string;
    applicationDate: string;
    disbursementDate: string | null;
  };
  salaryVerification: {
    employerName: string;
    employeeName: string;
    month: string;
    grossSalary: number;
    deductions: number;
    netSalary: number;
    currency: string;
    averageSalary3Months: number | null;
    employmentDuration: string | null;
  };
  profileUpdates: {
    debtAmount: number;
    interestRate: number;
    salary: number;
    repaymentPeriod: number;
  };
  documents: {
    loanDocUrl: string;
    salaryDocUrl: string;
  };
}

class UserProfileService {
  // Create user profile
  async createUserProfile(data: CreateUserProfileRequest): Promise<CreateUserProfileResponse> {
    try {
      const response = await fetch(USER_PROFILE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user profile');
      }

      return result;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Step 1: Get upload URLs
  async getUploadUrls(asuId: string): Promise<GetUploadUrlsResponse> {
    try {
      const response = await fetch(`${DOCUMENT_API_BASE}/get-upload-urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asuId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get upload URLs');
      }

      return result;
    } catch (error) {
      console.error('Error getting upload URLs:', error);
      throw error;
    }
  }

  // Step 2: Upload file to S3
  async uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/pdf',
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file to S3');
      }
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  // Step 3: Process documents
  async processDocuments(data: ProcessDocumentsRequest): Promise<ProcessDocumentsResponse> {
    try {
      const response = await fetch(`${DOCUMENT_API_BASE}/process-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process documents');
      }

      return result;
    } catch (error) {
      console.error('Error processing documents:', error);
      throw error;
    }
  }

  // Complete document upload flow
  async uploadAndProcessDocuments(
    asuId: string,
    loanFile: File,
    salaryFile: File
  ): Promise<ProcessDocumentsResponse> {
    try {
      // Step 1: Get upload URLs
      const uploadUrls = await this.getUploadUrls(asuId);

      // Step 2: Upload files to S3
      await Promise.all([
        this.uploadFileToS3(uploadUrls.loanDocument.uploadUrl, loanFile),
        this.uploadFileToS3(uploadUrls.salarySlips.uploadUrl, salaryFile),
      ]);

      // Step 3: Process documents
      const result = await this.processDocuments({
        asuId,
        loanDocKey: uploadUrls.loanDocument.fileKey,
        salarySlipsKey: uploadUrls.salarySlips.fileKey,
      });

      return result;
    } catch (error) {
      console.error('Error in complete upload flow:', error);
      throw error;
    }
  }

  // ✅ NEW METHOD: Auto-update profile after document processing
  /**
   * Updates user profile with data extracted from documents
   */
  async updateProfileFromDocumentData(
    asuId: string,
    asuEmail: string,
    firstName: string,
    lastName: string,
    processedData: ProcessDocumentsResponse
  ): Promise<CreateUserProfileResponse> {
    try {
      const { profileUpdates } = processedData;
      
      return await this.createUserProfile({
        asuId,
        asuEmail,
        firstName,
        lastName,
        debtAmount: `$${profileUpdates.debtAmount.toLocaleString()}`,
        salary: `$${profileUpdates.salary.toLocaleString()}`,
        repaymentPeriod: `${profileUpdates.repaymentPeriod} years`,
        interestRate: `${profileUpdates.interestRate}%`,
      });
    } catch (error) {
      console.error('Error updating profile from document data:', error);
      throw error;
    }
  }
}

export const userProfileService = new UserProfileService();
