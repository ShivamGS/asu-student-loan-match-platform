import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import User_Dashboard_ApprovalStatus from '../components/User_Dashboard_ApprovalStatus';
import { getCurrentUserAsuId } from '../services/sessionHelper';

interface Document {
  id: string;
  name: string;
  type: 'loan_payment' | 'certification' | 'tax_form' | 'salary_slip' | 'other';
  uploadDate: string;
  status: 'approved' | 'pending' | 'rejected';
  size: string;
  url: string;
}

interface ApiDocument {
  loan?: {
    url: string;
  };
  salary?: {
    url: string;
  };
}

interface ApiResponse {
  success: boolean;
  asuId: string;
  hasDocuments: boolean;
  documents: ApiDocument;
  uploadedAt: string;
}

interface UploadUrlsResponse {
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

export default function User_Dashboard_Documents() {
  const navigate = useNavigate();
  const [loanFile, setLoanFile] = useState<File | null>(null);
  const [salaryFile, setSalaryFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending' | 'action_required' | 'rejected'>('action_required');
  const [asuId, setAsuId] = useState<string | null>(null);

  // Determine UI state based on approval status
  const canUpload = approvalStatus === 'action_required';
  const isViewOnly = approvalStatus === 'pending' || approvalStatus === 'approved';

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const initializeData = () => {
      const userId = getCurrentUserAsuId();
      if (!userId) {
        console.log('❌ [DOCUMENTS] No ASU ID found, redirecting to login');
        navigate('/login');
        return;
      }
      console.log('✅ [DOCUMENTS] Retrieved ASU ID:', userId);
      setAsuId(userId);
      fetchUserDataAndDocuments(userId);
    };

    initializeData();
  }, []); // Empty dependency array - only run once on mount

  const fetchUserDataAndDocuments = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user data to get approval status
      console.log('📄 [DOCUMENTS] Fetching user data for ASU ID:', userId);
      const userResponse = await fetch(
        `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${userId}`
      );

      let currentStatus: 'approved' | 'pending' | 'action_required' | 'rejected' = 'action_required';

      if (userResponse.ok) {
        const userData = await userResponse.json();
        currentStatus = userData.user?.approvalStatus || 'action_required';
        setApprovalStatus(currentStatus);
        console.log('📄 [DOCUMENTS] Approval Status:', currentStatus);
      } else {
        console.log('⚠️ [DOCUMENTS] User data fetch failed, assuming action_required');
      }

      // Fetch documents
      console.log('📄 [DOCUMENTS] Fetching documents for ASU ID:', userId);
      const docsResponse = await fetch(
        `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${userId}/documents`
      );

      if (!docsResponse.ok) {
        console.log('📄 [DOCUMENTS] No documents found or fetch failed');
        setDocuments([]);
        setLoading(false);
        return;
      }

      const data: ApiResponse = await docsResponse.json();
      console.log('📄 [DOCUMENTS] Documents response:', data);

      if (data.success && data.hasDocuments) {
        const fetchedDocs: Document[] = [];

        // Map document status based on approval status
        const documentStatus = currentStatus === 'pending' ? 'pending' :
                             currentStatus === 'approved' ? 'approved' :
                             'pending';

        if (data.documents.loan?.url) {
          fetchedDocs.push({
            id: 'DOC-LOAN-001',
            name: 'Student_Loan_Document.pdf',
            type: 'loan_payment',
            uploadDate: data.uploadedAt || new Date().toISOString(),
            status: documentStatus,
            size: '—',
            url: data.documents.loan.url
          });
        }

        if (data.documents.salary?.url) {
          fetchedDocs.push({
            id: 'DOC-SALARY-001',
            name: 'Salary_Slip.pdf',
            type: 'salary_slip',
            uploadDate: data.uploadedAt || new Date().toISOString(),
            status: documentStatus,
            size: '—',
            url: data.documents.salary.url
          });
        }

        setDocuments(fetchedDocs);
        console.log('📄 [DOCUMENTS] Loaded documents:', fetchedDocs.length);
      } else {
        console.log('📄 [DOCUMENTS] No documents available');
        setDocuments([]);
      }
    } catch (err) {
      console.error('❌ [DOCUMENTS] Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!loanFile || !salaryFile) {
      setError('Please select both Loan Document and Salary Slip');
      return;
    }

    if (!asuId) {
      setError('User session not found. Please log in again.');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      console.log('📤 [DOCUMENTS] Starting upload for ASU ID:', asuId);
      setUploadProgress(10);
      const urlsResponse = await fetch(
        'https://9u5m2hi0s9.execute-api.us-east-1.amazonaws.com/prod/get-upload-urls',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asuId })
        }
      );

      if (!urlsResponse.ok) {
        throw new Error('Failed to get upload URLs');
      }

      const urlsData: UploadUrlsResponse = await urlsResponse.json();
      console.log('📤 [DOCUMENTS] Got upload URLs');
      setUploadProgress(20);

      // Upload loan document
      console.log('📤 [DOCUMENTS] Uploading loan document...');
      const loanUploadResponse = await fetch(urlsData.loanDocument.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': loanFile.type },
        body: loanFile
      });

      if (!loanUploadResponse.ok) {
        throw new Error('Failed to upload loan document');
      }
      console.log('✅ [DOCUMENTS] Loan document uploaded');
      setUploadProgress(50);

      // Upload salary slip
      console.log('📤 [DOCUMENTS] Uploading salary slip...');
      const salaryUploadResponse = await fetch(urlsData.salarySlips.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': salaryFile.type },
        body: salaryFile
      });

      if (!salaryUploadResponse.ok) {
        throw new Error('Failed to upload salary slip');
      }
      console.log('✅ [DOCUMENTS] Salary slip uploaded');
      setUploadProgress(80);

      // Process documents
      console.log('📤 [DOCUMENTS] Processing documents...');
      const processResponse = await fetch(
        'https://9u5m2hi0s9.execute-api.us-east-1.amazonaws.com/prod/process-documents',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            asuId,
            loanDocKey: urlsData.loanDocument.fileKey,
            salarySlipsKey: urlsData.salarySlips.fileKey
          })
        }
      );

      if (!processResponse.ok) {
        throw new Error('Failed to process documents');
      }

      console.log('✅ [DOCUMENTS] Documents processed successfully');
      setUploadProgress(100);
      setUploadSuccess(true);
      setLoanFile(null);
      setSalaryFile(null);

      // Refresh data after successful upload
      setTimeout(() => {
        fetchUserDataAndDocuments(asuId);
        setUploadSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('❌ [DOCUMENTS] Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, fileType: 'loan' | 'salary') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (fileType === 'loan') {
        setLoanFile(file);
      } else {
        setSalaryFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'loan' | 'salary') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fileType === 'loan') {
        setLoanFile(file);
      } else {
        setSalaryFile(file);
      }
    }
  };

  const handleDownload = (doc: Document) => {
    if (doc.url && doc.url !== '#') {
      window.open(doc.url, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'rejected':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'loan_payment':
        return 'Loan Payment Proof';
      case 'salary_slip':
        return 'Salary Slip';
      case 'certification':
        return 'Annual Certification';
      case 'tax_form':
        return 'Tax Form';
      default:
        return 'Other';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asu-maroon mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Management</h1>
        <p className="text-gray-600">
          {canUpload && documents.length === 0 && 'Upload your student loan payment records to get started'}
          {approvalStatus === 'pending' && 'Your documents are under review'}
          {approvalStatus === 'approved' && 'View your document history'}
          {approvalStatus === 'rejected' && 'Review feedback and re-upload documents'}
        </p>
      </div>

      {/* Approval Status Component - Only show if documents exist */}
      {documents.length > 0 && (
        <User_Dashboard_ApprovalStatus
          status={approvalStatus}
          pendingCount={documents.filter(d => d.status === 'pending').length}
          lastApprovedDate={
            approvalStatus === 'approved' && documents.length > 0
              ? formatDate(documents[0].uploadDate)
              : undefined
          }
          onActionClick={() => {
            const uploadSection = document.querySelector('[data-upload-section]');
            if (uploadSection) {
              uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">Documents Uploaded Successfully!</h3>
              <p className="text-sm text-green-800">
                Your documents have been submitted for review. We'll notify you within 2-3 business days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section - Show for action_required users with no documents */}
      {canUpload && documents.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" data-upload-section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Required Documents</h2>

          {/* Loan Document Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Loan Document <span className="text-red-600">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-asu-maroon bg-asu-maroon/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, 'loan')}
            >
              {loanFile ? (
                <div className="flex items-center justify-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-medium">{loanFile.name}</span>
                  <span className="text-sm text-gray-500">
                    ({Math.round(loanFile.size / 1024)} KB)
                  </span>
                  <button
                    onClick={() => setLoanFile(null)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Drag and drop or</p>
                  <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm">
                    Select Loan Document
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'loan')}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Salary Slip Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Salary Slip <span className="text-red-600">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-asu-maroon bg-asu-maroon/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, 'salary')}
            >
              {salaryFile ? (
                <div className="flex items-center justify-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-medium">{salaryFile.name}</span>
                  <span className="text-sm text-gray-500">
                    ({Math.round(salaryFile.size / 1024)} KB)
                  </span>
                  <button
                    onClick={() => setSalaryFile(null)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Drag and drop or</p>
                  <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm">
                    Select Salary Slip
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'salary')}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Accepted formats: PDF, JPG, PNG (Max 10MB per file)
          </p>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Uploading documents...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-asu-maroon h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!loanFile || !salaryFile || uploading}
            className="w-full px-6 py-3 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </button>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Required:</strong> Please upload both your loan document and salary slip.
              Documents are typically reviewed within 2-3 business days.
            </p>
          </div>
        </div>
      )}

      {/* Document Statistics */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Documents</p>
            <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => d.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">This Year</p>
            <p className="text-2xl font-bold text-blue-600">
              {documents.filter(d => {
                const year = new Date(d.uploadDate).getFullYear();
                return year === new Date().getFullYear();
              }).length}
            </p>
          </div>
        </div>
      )}

      {/* Document History - Show if documents exist */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Document History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Document Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Upload Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Size</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {getTypeLabel(doc.type)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(doc.uploadDate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {doc.size}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
