import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, MessageSquare, Settings, LogOut, GraduationCap, User, BarChart3, Receipt, HelpCircle } from 'lucide-react';
import { getCurrentUserAsuId, clearSession } from '../services/sessionHelper';

export default function User_Dashboard_Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('User');
  const [asuId, setAsuId] = useState<string | null>(null);

  useEffect(() => {
    const userId = getCurrentUserAsuId();
    if (!userId) {
      console.log('❌ [SIDEBAR] No ASU ID found, redirecting to login');
      navigate('/login');
      return;
    }
    setAsuId(userId);
    fetchUserStatus(userId);
  }, [navigate]);

  // Polling interval to check for status updates (every 10 seconds)
  useEffect(() => {
    if (!asuId) return;

    const interval = setInterval(() => {
      console.log('🔄 [SIDEBAR] Polling for status update...');
      fetchUserStatus(asuId, true); // Silent refresh
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [asuId]);

  const fetchUserStatus = async (userId: string, silent: boolean = false) => {
    try {
      if (!silent) {
        console.log('📊 [SIDEBAR] Fetching user status for ASU ID:', userId);
      }

      // Use the dedicated status endpoint
      const statusResponse = await fetch(
        `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${userId}/status`
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const newStatus = statusData.approvalStatus || 'action_required';

        // Only update if status has changed
        if (newStatus !== approvalStatus) {
          console.log('📊 [SIDEBAR] Status updated:', approvalStatus, '→', newStatus);
          setApprovalStatus(newStatus);

          // If status changed from action_required to pending, refresh the page
          if (approvalStatus === 'action_required' && newStatus === 'pending') {
            console.log('🔄 [SIDEBAR] Documents uploaded! Refreshing page...');
            window.location.reload();
          }
        }
      }

      // Fetch full user data for the name (only on initial load)
      if (!silent) {
        const userResponse = await fetch(
          `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${userId}`
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const name = userData.user?.loanApplication?.applicantName ||
                       userData.user?.salaryVerification?.employeeName ||
                       'User';
          setUserName(name.split(' ')[0]);
        }
      }
    } catch (error) {
      console.error('❌ [SIDEBAR] Error fetching user status:', error);
      if (!silent) {
        setApprovalStatus('action_required');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSignOut = () => {
    clearSession();
    navigate('/login');
  };

  // Define navigation based on approval status
  const getNavigation = () => {
    if (approvalStatus === 'approved') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
        { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
        { name: 'Documents', href: '/dashboard/documents', icon: FileText },
        { name: 'Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
        { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    } else if (approvalStatus === 'pending') {
      return [
        { name: 'Documents', href: '/dashboard/documents', icon: FileText },
        { name: 'Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
        { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    } else if (approvalStatus === 'rejected') {
      return [
        { name: 'Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
        { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    } else {
      return [
        { name: 'Documents', href: '/dashboard/documents', icon: FileText },
        { name: 'Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
        { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    }
  };

  const navigation = getNavigation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex items-center justify-center z-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-asu-maroon"></div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-asu-maroon rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-asu-gold" />
          </div>
          <span className="font-bold text-gray-900 text-lg">ASU Benefits</span>
        </Link>
      </div>

      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-600 truncate">
              ASU ID: {asuId}
            </p>
          </div>
        </div>

        {approvalStatus && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              approvalStatus === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : approvalStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : approvalStatus === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {approvalStatus === 'approved' && '✓ Approved'}
              {approvalStatus === 'pending' && '⏳ Pending Review'}
              {approvalStatus === 'rejected' && '✗ Not Approved'}
              {approvalStatus === 'action_required' && '⚠ Action Required'}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-asu-maroon text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}

        {approvalStatus === 'action_required' && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-800 font-medium mb-1">
              ⚠ Action Required
            </p>
            <p className="text-xs text-orange-700">
              Please upload your documents to get started with the SECURE 2.0 program.
            </p>
          </div>
        )}

        {approvalStatus === 'pending' && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800 font-medium mb-1">
              ⏳ Application Under Review
            </p>
            <p className="text-xs text-yellow-700">
              Your documents are being reviewed. We'll notify you within 2-3 business days.
            </p>
          </div>
        )}

        {approvalStatus === 'rejected' && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-800 font-medium mb-1">
              📋 Application Not Approved
            </p>
            <p className="text-xs text-red-700">
              Contact support for more information about your application status.
            </p>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
