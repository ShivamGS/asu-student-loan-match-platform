import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, AlertCircle, LogIn } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function Login() {
  const navigate = useNavigate();
  const [asuId, setAsuId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 [LOGIN] Form submitted');
    console.log('🔵 [LOGIN] ASU ID entered:', asuId);

    setError(null);

    // Validation
    if (!asuId.trim()) {
      console.log('🔴 [LOGIN] Validation failed: Empty ASU ID');
      setError('Please enter your ASU ID');
      return;
    }

    // Basic ASU ID validation (10 digits)
    if (!/^\d{10}$/.test(asuId)) {
      console.log('🔴 [LOGIN] Validation failed: Invalid format');
      console.log('🔴 [LOGIN] ASU ID length:', asuId.length);
      setError('ASU ID must be 10 digits');
      return;
    }

    console.log('✅ [LOGIN] Validation passed');
    setIsLoading(true);

    try {
      console.log('🔵 [LOGIN] Fetching user profile from API...');
      console.log('🔵 [LOGIN] API URL:', `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${asuId}`);

      // Fetch user profile from API
      const userProfile = await apiService.getUserProfile(asuId);

      console.log('✅ [LOGIN] API Response received');
      console.log('📦 [LOGIN] User Profile:', userProfile);

      if (!userProfile) {
        console.log('🔴 [LOGIN] User profile is null - user not found');
        setError('Account not found. Please sign up first.');
        setIsLoading(false);
        return;
      }

      console.log('✅ [LOGIN] User profile exists');
      console.log('📋 [LOGIN] ASU ID from profile:', userProfile.asuId);
      console.log('📋 [LOGIN] Approval Status:', userProfile.approvalStatus);

      // Store user session with all necessary data
      const sessionData = {
        asuId: userProfile.asuId,
        approvalStatus: userProfile.approvalStatus,
        userProfile: userProfile,
        loginTime: new Date().toISOString(),
      };

      console.log('💾 [LOGIN] Storing session in localStorage...');
      console.log('💾 [LOGIN] Session data:', sessionData);

      localStorage.setItem('currentSession', JSON.stringify(sessionData));

      console.log('✅ [LOGIN] Session stored successfully');

      // Verify session was stored
      const storedSession = localStorage.getItem('currentSession');
      console.log('🔍 [LOGIN] Verifying stored session:', storedSession ? 'Found' : 'NOT FOUND');

      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        console.log('✅ [LOGIN] Stored session ASU ID:', parsedSession.asuId);
        console.log('✅ [LOGIN] Stored session approval status:', parsedSession.approvalStatus);
      }

      console.log('🚀 [LOGIN] Attempting navigation to /dashboard');
      console.log('🚀 [LOGIN] Navigate function:', typeof navigate);

      // Redirect based on approval status
      const redirectPath = userProfile.approvalStatus === 'pending'
        ? '/dashboard/documents'
        : '/dashboard';

      console.log('🚀 [LOGIN] Redirect path based on status:', redirectPath);

      // Try navigation with a small delay to ensure state is updated
      setTimeout(() => {
        console.log('🚀 [LOGIN] Executing navigate to:', redirectPath);
        navigate(redirectPath);
        console.log('✅ [LOGIN] Navigate called successfully');
      }, 100);

    } catch (err) {
      console.error('❌ [LOGIN] Error caught:', err);
      console.error('❌ [LOGIN] Error type:', typeof err);
      console.error('❌ [LOGIN] Error message:', err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ [LOGIN] Error stack:', err instanceof Error ? err.stack : 'No stack trace');

      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  console.log('🔄 [LOGIN] Component rendered, isLoading:', isLoading);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-asu-maroon rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-asu-gold" />
          </div>
          <h1 className="text-3xl font-bold text-asu-maroon mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ASU ID */}
            <div>
              <label htmlFor="asuId" className="block text-sm font-medium text-gray-700 mb-2">
                ASU ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="asuId"
                  value={asuId}
                  onChange={(e) => {
                    console.log('📝 [LOGIN] ASU ID input changed:', e.target.value);
                    setAsuId(e.target.value);
                    setError(null);
                  }}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
                  placeholder="1234567890"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Enter your 10-digit ASU ID
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700">{error}</p>
                  {error.includes('not found') && (
                    <Link to="/signup" className="text-sm text-red-800 underline font-semibold mt-1 inline-block">
                      Create an account
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={() => console.log('🖱️ [LOGIN] Submit button clicked')}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-asu-maroon hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}