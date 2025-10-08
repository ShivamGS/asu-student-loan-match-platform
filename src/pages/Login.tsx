import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [asuId, setAsuId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 [LOGIN] Form submitted');

    setError(null);

    // Validation
    if (!asuId.trim()) {
      setError('Please enter your ASU ID');
      return;
    }

    if (!/^\d{10}$/.test(asuId)) {
      setError('ASU ID must be 10 digits');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔵 [LOGIN] Sending login request...');

      // Use the new Lambda endpoint with operation: login
      const response = await fetch(
        'https://jfqtf39dk3.execute-api.us-east-1.amazonaws.com/dev/user-profile',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'login',
            asuId: asuId,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log('📦 [LOGIN] Response:', data);

      if (!response.ok) {
        console.log('🔴 [LOGIN] Login failed:', data.error);
        
        // Handle specific error messages
        if (data.message && data.message.includes('migrate')) {
          setError('Please sign up to set a password for your account.');
        } else {
          setError(data.message || data.error || 'Invalid credentials');
        }
        setIsLoading(false);
        return;
      }

      console.log('✅ [LOGIN] Login successful');

      // Store user session
      const sessionData = {
        asuId: data.asuId,
        approvalStatus: data.approvalStatus || 'action_required',
        userProfile: {
          asuId: data.asuId,
          firstName: data.firstName,
          lastName: data.lastName,
          asuEmail: data.asuEmail,
          approvalStatus: data.approvalStatus || 'action_required',
          salary: 0,
          debtAmount: '',
          interestRate: 0,
          repaymentPeriod: '',
        },
        loginTime: new Date().toISOString(),
      };

      console.log('💾 [LOGIN] Storing session:', sessionData);
      localStorage.setItem('currentSession', JSON.stringify(sessionData));

      // Redirect based on approval status
      const redirectPath =
        data.approvalStatus === 'pending' || data.approvalStatus === 'action_required'
          ? '/dashboard/documents'
          : '/dashboard';

      console.log('🚀 [LOGIN] Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('❌ [LOGIN] Error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Header - Keep existing */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-asu-maroon rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-asu-gold" />
          </div>
          <h1 className="text-3xl font-bold text-asu-maroon mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ASU ID - Keep existing */}
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
              <p className="text-xs text-gray-500 mt-1.5">Enter your 10-digit ASU ID</p>
            </div>

            {/* NEW: Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message - Keep existing */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700">{error}</p>
                  {error.includes('sign up') && (
                    <Link
                      to="/signup"
                      className="text-sm text-red-800 underline font-semibold mt-1 inline-block"
                    >
                      Create an account
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button - Keep existing */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Footer - Keep existing */}
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
