import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, X, AlertCircle, Loader } from 'lucide-react';
import { ProcessDocumentsResponse } from '../types';
import { userProfileService } from '../services/userProfileService';

interface SimpleDocumentUploadProps {
  userId: string;
  onDocumentsProcessed: (result: ProcessDocumentsResponse) => void;
}

export default function SimpleDocumentUpload({ userId, onDocumentsProcessed }: SimpleDocumentUploadProps) {
  const [files, setFiles] = useState<{
    loanFile: File | null;
    salaryFile: File | null;
  }>({
    loanFile: null,
    salaryFile: null,
  });
  
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ProcessDocumentsResponse | null>(null);

  const salaryFileRef = useRef<HTMLInputElement>(null);
  const loanFileRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be PDF, JPG, or PNG' };
    }

    return { valid: true };
  };

  const handleFileSelect = (file: File, type: 'loan' | 'salary') => {
    setError(null);

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setFiles(prev => ({
      ...prev,
      [type === 'loan' ? 'loanFile' : 'salaryFile']: file,
    }));
  };

  const handleRemoveFile = (type: 'loan' | 'salary') => {
    setFiles(prev => ({
      ...prev,
      [type === 'loan' ? 'loanFile' : 'salaryFile']: null,
    }));
  };

  const handleUpload = async () => {
    // 🔍 DEBUG: Check userId before upload
    console.log('====== DEBUG: BEFORE UPLOAD ======');
    console.log('📝 User ID:', userId);
    console.log('📝 User ID type:', typeof userId);
    console.log('📝 User ID length:', userId?.length);
    console.log('📝 Is exactly 10 digits?', /^\d{10}$/.test(userId));
    console.log('📝 Loan File:', files.loanFile?.name);
    console.log('📝 Salary File:', files.salaryFile?.name);
    console.log('==================================');

    if (!files.loanFile || !files.salaryFile) {
      setError('Please select both documents');
      return;
    }

    setError(null);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      console.log('📤 Calling uploadAndProcessDocuments with userId:', userId);

      // Call AWS API
      const result = await userProfileService.uploadAndProcessDocuments(
        userId,
        files.loanFile,
        files.salaryFile
      );

      // ✅ DETAILED CONSOLE LOGGING OF EXTRACTED DATA
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║           📄 DOCUMENT EXTRACTION RESULTS                       ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');
      console.log('');
      
      console.log('🎯 PROCESSING SUMMARY:');
      console.log('   Status:', result.status);
      console.log('   Action:', result.action);
      console.log('   Processing Time:', result.processingTime.toFixed(2), 'seconds');
      console.log('   ASU ID:', result.asuId);
      console.log('');
      
      console.log('💰 LOAN APPLICATION DATA:');
      console.log('   Loan Provider:', result.loanApplication.loanProvider);
      console.log('   Applicant Name:', result.loanApplication.applicantName);
      console.log('   Loan Amount:', result.loanApplication.currency, result.loanApplication.loanAmount.toLocaleString());
      console.log('   Sanctioned Amount:', result.loanApplication.currency, result.loanApplication.sanctionedAmount.toLocaleString());
      console.log('   Interest Rate:', result.loanApplication.interestRate + '%');
      console.log('   Loan Tenure:', result.loanApplication.loanTenure, 'years');
      console.log('   Loan Type:', result.loanApplication.loanType);
      console.log('   Application Date:', result.loanApplication.applicationDate);
      console.log('   Disbursement Date:', result.loanApplication.disbursementDate || 'Not disbursed');
      console.log('');
      
      console.log('💵 SALARY VERIFICATION DATA:');
      console.log('   Employer:', result.salaryVerification.employerName);
      console.log('   Employee:', result.salaryVerification.employeeName);
      console.log('   Month:', result.salaryVerification.month);
      console.log('   Gross Salary:', result.salaryVerification.currency, result.salaryVerification.grossSalary.toLocaleString());
      console.log('   Deductions:', result.salaryVerification.currency, result.salaryVerification.deductions.toLocaleString());
      console.log('   Net Salary:', result.salaryVerification.currency, result.salaryVerification.netSalary.toLocaleString());
      console.log('   3-Month Average:', result.salaryVerification.averageSalary3Months 
        ? result.salaryVerification.currency + ' ' + result.salaryVerification.averageSalary3Months.toLocaleString()
        : 'N/A');
      console.log('   Employment Duration:', result.salaryVerification.employmentDuration || 'N/A');
      console.log('');
      
      console.log('📊 CALCULATED PROFILE UPDATES:');
      console.log('   Annual Salary (Monthly * 12):', '$' + result.profileUpdates.salary.toLocaleString());
      console.log('   Total Debt Amount:', '$' + result.profileUpdates.debtAmount.toLocaleString());
      console.log('   Interest Rate:', result.profileUpdates.interestRate + '%');
      console.log('   Repayment Period:', result.profileUpdates.repaymentPeriod, 'years');
      console.log('');
      
      console.log('🔗 DOCUMENT STORAGE URLS:');
      console.log('   Loan Document URL:', result.documents.loanDocUrl);
      console.log('   Salary Document URL:', result.documents.salaryDocUrl);
      console.log('');
      
      console.log('📋 FULL JSON RESPONSE:');
      console.log(JSON.stringify(result, null, 2));
      console.log('');
      
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║        ✅ END OF EXTRACTION RESULTS - SUCCESS                  ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');

      console.log('✅ Upload successful! Result:', result);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('complete');
      setProcessedData(result);

      // Pass result to parent after a brief delay to show success message
      setTimeout(() => {
        onDocumentsProcessed(result);
      }, 2000);

    } catch (err) {
      console.error('❌ Upload failed:', err);
      console.error('❌ Error details:', err instanceof Error ? err.message : 'Unknown error');
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderFilePreview = (
    file: File | null,
    type: 'loan' | 'salary',
    title: string
  ) => {
    return (
      <div className="border-2 border-dashed border-asu-gray-300 rounded-xl p-4 bg-white">
        {!file ? (
          <div className="text-center py-4">
            <FileText className="w-12 h-12 text-asu-gray-400 mx-auto mb-2" />
            <p className="text-sm text-asu-gray-600 mb-3">{title}</p>
            <button
              onClick={() => type === 'loan' ? loanFileRef.current?.click() : salaryFileRef.current?.click()}
              disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              className="inline-flex items-center gap-2 bg-asu-maroon hover:bg-asu-maroon-dark text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </button>
            <input
              ref={type === 'loan' ? loanFileRef : salaryFileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileSelect(selectedFile, type);
              }}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-asu-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-asu-gray-500">{formatFileSize(file.size)}</p>
            </div>
            {uploadStatus === 'idle' && (
              <button
                onClick={() => handleRemoveFile(type)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const bothFilesSelected = files.loanFile && files.salaryFile;
  const canUpload = bothFilesSelected && uploadStatus === 'idle';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-asu-gray-900 mb-3">
          📄 Upload Your Documents
        </h2>
        <p className="text-lg text-asu-gray-600">
          We'll use AI to extract your loan and salary information automatically
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {renderFilePreview(files.loanFile, 'loan', 'Student Loan Statement')}
        {renderFilePreview(files.salaryFile, 'salary', 'Recent Salary Slip')}
      </div>

      {/* Upload Progress */}
      {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
        <div className="bg-white rounded-xl border-2 border-asu-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader className="w-6 h-6 text-asu-maroon animate-spin" />
            <div>
              <p className="font-semibold text-asu-gray-900">
                {uploadStatus === 'uploading' ? 'Uploading documents...' : 'Processing with AI...'}
              </p>
              <p className="text-sm text-asu-gray-600">This may take 10-15 seconds</p>
            </div>
          </div>
          <div className="w-full bg-asu-gray-200 rounded-full h-3">
            <div
              className="bg-asu-maroon h-3 rounded-full transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-asu-gray-600 text-center mt-2">{uploadProgress}%</p>
        </div>
      )}

      {/* Success Message */}
      {uploadStatus === 'complete' && processedData && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-2">
                Documents Processed Successfully!
              </h3>
              <p className="text-green-700 mb-4">
                Extracted data in {processedData.processingTime.toFixed(1)} seconds
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-asu-gray-600 mb-1">Loan Amount</p>
                  <p className="text-lg font-bold text-asu-gray-900">
                    {processedData.loanApplication.currency} {processedData.loanApplication.loanAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-asu-gray-600 mb-1">Monthly Salary</p>
                  <p className="text-lg font-bold text-asu-gray-900">
                    {processedData.salaryVerification.currency} {processedData.salaryVerification.netSalary.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-green-700 mt-4">
                ✓ Verifying eligibility...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {bothFilesSelected && uploadStatus === 'idle' && (
        <button
          onClick={handleUpload}
          disabled={!canUpload}
          className="w-full bg-asu-maroon hover:bg-asu-maroon-dark text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload & Process Documents with AI
        </button>
      )}

      <div className="mt-6 text-center text-xs text-asu-gray-500">
        🔒 Your documents are encrypted and secure. Max file size: 5MB per file.
        <br />
        Supported formats: PDF, JPG, PNG
      </div>
    </div>
  );
}
