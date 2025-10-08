import { useState } from 'react';
import { User, Lock, Bell, Shield, Mail, Phone, MapPin, Save, Eye, EyeOff } from 'lucide-react';
import { getCurrentSession } from '../services/auth';

export default function User_Dashboard_Settings() {
  const session = getCurrentSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy'>('profile');
  
  // Profile state
  const [fullName, setFullName] = useState(session?.profile.fullName || '');
  const [email, setEmail] = useState(session?.profile.email || '');
  const [phone, setPhone] = useState('(480) 965-1234');
  const [address, setAddress] = useState('411 N Central Ave, Phoenix, AZ 85004');
  
  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [documentApproval, setDocumentApproval] = useState(true);
  const [monthlyStatement, setMonthlyStatement] = useState(true);
  const [programUpdates, setProgramUpdates] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Privacy state
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  ];

  const handleSaveProfile = () => {
    alert('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveNotifications = () => {
    alert('Notification preferences saved!');
  };

  const handleSavePrivacy = () => {
    alert('Privacy settings saved!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">
          Manage your profile, security, and notification preferences
        </p>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-asu-maroon text-asu-maroon'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={session?.profile.employeeId || 'N/A'}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-6 py-3 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon-dark transition-colors shadow-md"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Password Requirements:</strong> At least 8 characters, including uppercase, lowercase, number, and special character.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 px-6 py-3 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon-dark transition-colors shadow-md"
                >
                  <Save className="w-5 h-5" />
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Email Notifications</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">All Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive all notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 text-asu-maroon border-gray-300 rounded focus:ring-asu-maroon"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Document Approval Status</p>
                      <p className="text-sm text-gray-600">Notify when documents are approved or rejected</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={documentApproval}
                      onChange={(e) => setDocumentApproval(e.target.checked)}
                      className="w-5 h-5 text-asu-maroon border-gray-300 rounded focus:ring-asu-maroon"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Monthly Statements</p>
                      <p className="text-sm text-gray-600">Receive monthly contribution summaries</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={monthlyStatement}
                      onChange={(e) => setMonthlyStatement(e.target.checked)}
                      className="w-5 h-5 text-asu-maroon border-gray-300 rounded focus:ring-asu-maroon"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Program Updates</p>
                      <p className="text-sm text-gray-600">Important updates about the match program</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={programUpdates}
                      onChange={(e) => setProgramUpdates(e.target.checked)}
                      className="w-5 h-5 text-asu-maroon border-gray-300 rounded focus:ring-asu-maroon"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Receive promotional content and offers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketingEmails}
                      onChange={(e) => setMarketingEmails(e.target.checked)}
                      className="w-5 h-5 text-asu-maroon border-gray-300 rounded focus:ring-asu-maroon"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveNotifications}
                  className="flex items-center gap-2 px-6 py-3 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon-dark transition-colors shadow-md"
                >
                  <Save className="w-5 h-5" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Privacy Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Data Sharing with Partners</p>
                      <p className="text-sm text-gray-600">Allow ASU to share anonymized data with partners</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={dataSharing}
                      onChange={(e) => setDataSharing(e.target.checked)}
                      className="w-5 h-5 text-asu-maroon border-gray-300 rounded focus:ring-asu-maroon"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Analytics Tracking</p>
                      <p className="text-sm text-gray-600">Help improve the platform with usage data</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={analyticsTracking}
                      onChange={(e) => setAnalyticsTracking(e.target.checked)}
                      className="w-5 h-5 text-asu-maroon border-gray-300 rounded focus:ring-asu-maroon"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Account Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900">Download My Data</p>
                    <p className="text-sm text-gray-600">Request a copy of your personal data</p>
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-700">
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm">Permanently delete your account and all data</p>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSavePrivacy}
                  className="flex items-center gap-2 px-6 py-3 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon-dark transition-colors shadow-md"
                >
                  <Save className="w-5 h-5" />
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
