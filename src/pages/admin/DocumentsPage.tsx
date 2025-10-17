import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, FileText, CheckCircle, XCircle, Eye, Download, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

interface LoanApplication {
  loanAmount: number;
  currency: string;
  interestRate: number;
  loanTenure: number;
  sanctionedAmount?: number;
}

interface DocumentInfo {
  bucket?: string;
  uploadedAt?: string;
  salaryDocKey?: string;
  salaryDocUrl?: string;
  loanDocKey?: string;
  loanDocUrl?: string;
}

interface User {
  asuId: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  asuEmail?: string;
  approvalStatus: string;
  loanApplication: LoanApplication;
  hasDocuments?: boolean;
  salary?: number;
  dtiRatio?: number;
  financialStressLevel?: string;
  createdAt: string;
  updatedAt: string;
  documents?: DocumentInfo;
}

interface UsersApiResponse {
  success: boolean;
  count: number;
  users: User[];
}

// Currency conversion helper
const convertToUSD = (amount: number, currency: string): number => {
  const conversionRates: { [key: string]: number } = {
    'USD': 1,
    'EUR': 1.08,
    'GBP': 1.27,
    'CAD': 0.73,
    'AUD': 0.65,
    'INR': 0.012,
  };
  return amount * (conversionRates[currency?.toUpperCase()] || 1);
};

export default function DocumentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docsFilter, setDocsFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<UsersApiResponse>(
        'https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users'
      );

      if (response.data.success && response.data.users) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper function to get display name
  const getUserName = (user: User): string => {
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return 'Unknown';
  };

  // Helper function to get email
  const getUserEmail = (user: User): string => {
    return user.email || user.asuEmail || 'N/A';
  };

  // API call to update approval status
  const updateApprovalStatus = async (asuId: string, status: 'approved' | 'rejected') => {
    try {
      setActionLoading(true);
      await axios.post(
        `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${asuId}/approval`,
        { approvalStatus: status }
      );
      alert(`User ${status} successfully!`);
      fetchUsers();
    } catch (err) {
      console.error('Error updating approval status:', err);
      alert(`Failed to update approval status.`);
    } finally {
      setActionLoading(false);
      setSelectedUser(null);
    }
  };

  // Function to handle document download
  const handleDownload = (url: string, fileName: string) => {
    if (!url) {
      alert('Document URL not available');
      return;
    }

    // Open the URL in a new tab or trigger download
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate counts
  const pendingCount = users.filter((u) => u.approvalStatus === 'pending').length;
  const approvedCount = users.filter((u) => u.approvalStatus === 'approved').length;
  const rejectedCount = users.filter((u) => u.approvalStatus === 'rejected').length;

  // Filter users: only show pending or approved, prioritize pending
  const filteredUsers = users
    .filter((user) => {
      // Only show pending or approved users
      const isPendingOrApproved = user.approvalStatus === 'pending' || user.approvalStatus === 'approved';
      if (!isPendingOrApproved) return false;

      // Apply status filter
      if (statusFilter !== 'all' && user.approvalStatus !== statusFilter) return false;

      // Apply document filter
      if (docsFilter === 'with' && !user.hasDocuments) return false;
      if (docsFilter === 'without' && user.hasDocuments) return false;

      // Apply search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const name = getUserName(user).toLowerCase();
        const email = getUserEmail(user).toLowerCase();
        const asuId = user.asuId?.toLowerCase() || '';

        return name.includes(search) || email.includes(search) || asuId.includes(search);
      }

      return true;
    })
    .sort((a, b) => {
      // Prioritize pending users first
      if (a.approvalStatus === 'pending' && b.approvalStatus !== 'pending') return -1;
      if (a.approvalStatus !== 'pending' && b.approvalStatus === 'pending') return 1;

      // Then sort by updated date (most recent first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1F2E]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading documents...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1F2E]">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Document Review</h1>
          <p className="text-gray-400">Review and approve user documents</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#252C3C] border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Pending Review</p>
              <h3 className="text-3xl font-bold text-white">{pendingCount}</h3>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#252C3C] border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Approved</p>
              <h3 className="text-3xl font-bold text-white">{approvedCount}</h3>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#252C3C] border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Rejected</p>
              <h3 className="text-3xl font-bold text-white">{rejectedCount}</h3>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or ASU ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1A1F2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1A1F2E] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          {/* Documents Filter */}
          <div className="w-full md:w-48">
            <select
              value={docsFilter}
              onChange={(e) => setDocsFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1A1F2E] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Documents</option>
              <option value="with">With Documents</option>
              <option value="without">Without Documents</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#252C3C] border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1A1F2E]">
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-4 px-6">ASU ID</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-4 px-6">Name</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-4 px-6">Email</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-4 px-6">Loan Amount</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-4 px-6">Status</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-4 px-6">Documents</th>
                <th className="text-left text-gray-400 text-xs font-semibold uppercase py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const loanAmount = user.loanApplication?.loanAmount || 0;
                  const currency = user.loanApplication?.currency || 'USD';
                  const loanAmountUSD = convertToUSD(loanAmount, currency);

                  return (
                    <tr key={user.asuId} className="border-t border-gray-700/50 hover:bg-[#1A1F2E] transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-300 font-mono">{user.asuId}</td>
                      <td className="py-4 px-6 text-sm text-white font-medium">{getUserName(user)}</td>
                      <td className="py-4 px-6 text-sm text-gray-400">{getUserEmail(user)}</td>
                      <td className="py-4 px-6 text-sm text-white font-semibold">${loanAmountUSD.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.approvalStatus === 'approved'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : user.approvalStatus === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {user.approvalStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {user.hasDocuments ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 text-xs font-semibold">Available</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">No documents</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Counter */}
      {filteredUsers.length > 0 && (
        <div className="text-center text-gray-400 text-sm">
          Showing {filteredUsers.length} of {users.filter(u => u.approvalStatus === 'pending' || u.approvalStatus === 'approved').length} users
        </div>
      )}

      {/* Review Modal */}
      {selectedUser && (
        <ReviewModal
          user={selectedUser}
          actionLoading={actionLoading}
          onClose={() => setSelectedUser(null)}
          onApprove={() => updateApprovalStatus(selectedUser.asuId, 'approved')}
          onReject={() => updateApprovalStatus(selectedUser.asuId, 'rejected')}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

// Review Modal Component
function ReviewModal({
  user,
  onClose,
  onApprove,
  onReject,
  actionLoading,
  onDownload,
}: {
  user: User;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  actionLoading: boolean;
  onDownload: (url: string, fileName: string) => void;
}) {
  const loanAmount = user.loanApplication?.loanAmount || 0;
  const currency = user.loanApplication?.currency || 'USD';
  const loanAmountUSD = convertToUSD(loanAmount, currency);

  const getUserName = (u: User): string => {
    if (u.name) return u.name;
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    if (u.firstName) return u.firstName;
    return 'Unknown';
  };

  const getUserEmail = (u: User): string => {
    return u.email || u.asuEmail || 'N/A';
  };

  // Get risk level with color
  const getRiskLevelColor = (level?: string) => {
    if (!level) return 'bg-gray-500/10 text-gray-400 border-gray-500/30';

    switch (level.toLowerCase()) {
      case 'high':
      case 'high risk':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'manageable':
      case 'low':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  // Get document URLs - CORRECT FIELD NAMES: loanDocUrl and salaryDocUrl
  const loanDocUrl = user.documents?.loanDocUrl;
  const salaryDocUrl = user.documents?.salaryDocUrl;
  const uploadedAt = user.documents?.uploadedAt;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#252C3C] border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#252C3C] border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Review User Details</h2>
            <p className="text-gray-400 text-sm mt-1">ASU ID: {user.asuId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1A1F2E] rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Full Name</p>
              <p className="text-white font-semibold">{getUserName(user)}</p>
            </div>
            <div className="bg-[#1A1F2E] rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Email</p>
              <p className="text-white font-semibold">{getUserEmail(user)}</p>
            </div>
            <div className="bg-[#1A1F2E] rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Loan Amount (USD)</p>
              <p className="text-white font-semibold text-xl">${loanAmountUSD.toLocaleString()}</p>
            </div>
            <div className="bg-[#1A1F2E] rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Annual Salary</p>
              <p className="text-white font-semibold text-xl">
                {user.salary ? `$${user.salary.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            <div className="bg-[#1A1F2E] rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Interest Rate</p>
              <p className="text-white font-semibold">
                {user.loanApplication?.interestRate ? `${user.loanApplication.interestRate}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-[#1A1F2E] rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Loan Tenure</p>
              <p className="text-white font-semibold">
                {user.loanApplication?.loanTenure ? `${user.loanApplication.loanTenure} months` : 'N/A'}
              </p>
            </div>
            <div className="bg-[#1A1F2E] rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-1">DTI Ratio</p>
              <p className="text-white font-semibold">
                {user.dtiRatio ? `${user.dtiRatio.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-[#1A1F2E] rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Risk Level</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskLevelColor(user.financialStressLevel)}`}>
                {user.financialStressLevel || 'N/A'}
              </span>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-[#1A1F2E] rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Uploaded Documents</h3>
            {user.hasDocuments ? (
              <div className="space-y-3">
                {/* Loan Agreement */}
                {loanDocUrl && (
                  <div className="flex items-center justify-between p-3 bg-[#252C3C] rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium text-sm">Loan Agreement.pdf</p>
                        <p className="text-gray-500 text-xs">
                          Uploaded on {uploadedAt ? new Date(uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDownload(loanDocUrl, 'Loan_Agreement.pdf')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}

                {/* Salary Slip */}
                {salaryDocUrl && (
                  <div className="flex items-center justify-between p-3 bg-[#252C3C] rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium text-sm">Salary Slip.pdf</p>
                        <p className="text-gray-500 text-xs">
                          Uploaded on {uploadedAt ? new Date(uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDownload(salaryDocUrl, 'Salary_Slip.pdf')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}

                {!loanDocUrl && !salaryDocUrl && (
                  <p className="text-gray-400 text-center py-8">No document URLs available</p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No documents uploaded</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-[#252C3C] border-t border-gray-700 p-6 flex gap-4">
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            {actionLoading ? 'Processing...' : 'Reject'}
          </button>
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {actionLoading ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}
