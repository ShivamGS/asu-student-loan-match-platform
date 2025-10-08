import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface ApprovalStatusProps {
  status: 'approved' | 'pending' | 'action_required' | 'rejected';
  pendingCount?: number;
  lastApprovedDate?: string;
  rejectionReason?: string;
  message?: string;
  onActionClick?: () => void;
}

export default function User_Dashboard_ApprovalStatus({
  status,
  pendingCount = 0,
  lastApprovedDate,
  rejectionReason,
  message,
  onActionClick
}: ApprovalStatusProps) {

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          icon: <CheckCircle className="w-6 h-6" />,
          title: 'All Documents Approved',
          defaultMessage: lastApprovedDate
            ? `Your latest document was approved on ${lastApprovedDate}. You are all set for this month's employer match!`
            : 'All your documents are approved. You are receiving the full employer match benefit.',
          showIndicator: false,
          showButton: false,
          buttonText: '',
          buttonColor: ''
        };

      case 'pending':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: <Clock className="w-6 h-6" />,
          title: 'Documents Under Review',
          defaultMessage: `You have ${pendingCount} document${pendingCount > 1 ? 's' : ''} pending review. We will notify you within 2-3 business days.`,
          showIndicator: true,
          showButton: false,
          buttonText: '',
          buttonColor: ''
        };

      case 'action_required':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-600',
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Action Required',
          defaultMessage: 'Please upload your student loan payment proof to continue receiving employer match benefits.',
          showIndicator: false,
          showButton: true,
          buttonText: 'Upload Document Now',
          buttonColor: 'bg-orange-600 hover:bg-orange-700'
        };

      case 'rejected':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: <XCircle className="w-6 h-6" />,
          title: 'Document Rejected',
          defaultMessage: rejectionReason
            ? `Your document was rejected. Reason: ${rejectionReason}. Please review the feedback and re-upload corrected documents.`
            : 'One or more documents were rejected. Please review the feedback and re-upload corrected documents.',
          showIndicator: false,
          showButton: true,
          buttonText: 'View Feedback & Re-upload',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };

      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Status Unknown',
          defaultMessage: 'Please contact support for assistance.',
          showIndicator: false,
          showButton: false,
          buttonText: '',
          buttonColor: ''
        };
    }
  };

  const config = getStatusConfig();

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick();
    } else {
      // Default behavior: scroll to upload section
      const uploadSection = document.querySelector('[data-upload-section]');
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        <div className={`${config.iconColor} flex-shrink-0`}>
          {config.icon}
        </div>

        <div className="flex-1">
          <h3 className={`text-lg font-bold ${config.textColor} mb-2`}>
            {config.title}
          </h3>

          <p className={`${config.textColor} text-sm leading-relaxed`}>
            {message || config.defaultMessage}
          </p>

          {/* Pending indicator */}
          {config.showIndicator && (
            <div className="mt-4 flex items-center gap-2 text-xs text-yellow-700">
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
              <span className="font-medium">Review in progress...</span>
            </div>
          )}

          {/* Action button */}
          {config.showButton && (
            <button
              onClick={handleActionClick}
              className={`mt-4 px-4 py-2 ${config.buttonColor} text-white rounded-lg transition-colors text-sm font-medium`}
            >
              {config.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
