import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { CreateUserProfileRequest } from '../types';

// Add password to the interface
interface SignUpFormData extends CreateUserProfileRequest {
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    asuId: '',
    asuEmail: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Please enter your last name');
      return;
    }
    if (!formData.asuId.trim()) {
      setError('Please enter your ASU ID');
      return;
    }
    if (!formData.asuEmail.trim()) {
      setError('Please enter your ASU email');
      return;
    }
    if (!formData.asuEmail.endsWith('@asu.edu')) {
      setError('Please use your ASU email (@asu.edu)');
      return;
    }
    if (!/^\d{10}$/.test(formData.asuId)) {
      setError('ASU ID must be 10 digits');
      return;
    }
    // Password validation
    if (!formData.password) {
      setError('Please enter a password');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Send signup request with password
      const requestBody = {
        operation: 'signup',
        asuId: formData.asuId,
        asuEmail: formData.asuEmail,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
      };

      const response = await fetch(
        'https://jfqtf39dk3.execute-api.us-east-1.amazonaws.com/dev/user-profile',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.toLowerCase().includes('already exists')) {
          setError('An account with this ASU ID already exists. Please sign in instead.');
          setIsLoading(false);
          return;
        }
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      // Success: store session and redirect
      const sessionData = {
        asuId: formData.asuId,
        approvalStatus: 'action_required',
        userProfile: {
          asuId: formData.asuId,
          approvalStatus: 'action_required',
          salary: 0,
          debtAmount: '',
          interestRate: 0,
          repaymentPeriod: '',
          firstName: formData.firstName,
          lastName: formData.lastName,
          asuEmail: formData.asuEmail,
        },
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('currentSession', JSON.stringify(sessionData));

      navigate('/dashboard/documents', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-gray-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header - Keep existing */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-asu-gold" />
          </div>
          <h1 className="text-4xl font-bold text-asu-gray-900 mb-3">
            Let's Get Your Plan
          </h1>
          <p className="text-lg text-asu-gray-600">
            Quick sign-up to see your accurate retirement projection
          </p>
        </div>

        {/* Trust Indicators - Keep existing */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-center gap-8 text-sm text-asu-gray-600">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-asu-maroon" />
              <span className="font-medium">Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-asu-maroon" />
              <span className="font-medium">30 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-asu-maroon" />
              <span className="font-medium">1,200+ users</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-asu-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First and Last Name - Keep existing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                  placeholder="John"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                  placeholder="Smith"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* ASU ID - Keep existing */}
            <div>
              <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                ASU ID
              </label>
              <input
                type="text"
                value={formData.asuId}
                onChange={(e) => handleInputChange('asuId', e.target.value)}
                className="w-full px-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                placeholder="1234567890"
                maxLength={10}
                disabled={isLoading}
              />
              <p className="text-xs text-asu-gray-500 mt-2">10-digit employee ID</p>
            </div>

            {/* ASU Email - Keep existing */}
            <div>
              <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                ASU Email
              </label>
              <input
                type="email"
                value={formData.asuEmail}
                onChange={(e) => handleInputChange('asuEmail', e.target.value)}
                className="w-full px-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                placeholder="jsmith@asu.edu"
                disabled={isLoading}
              />
            </div>

            {/* NEW: Password Field */}
            <div>
              <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all pr-12"
                  placeholder="At least 8 characters"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-asu-gray-500 hover:text-asu-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-asu-gray-500 mt-2">
                Minimum 8 characters
              </p>
            </div>

            {/* NEW: Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-asu-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all pr-12"
                  placeholder="Re-enter password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-asu-gray-500 hover:text-asu-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message - Keep existing */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-sm text-red-700 font-medium">
                {error}
                {error.toLowerCase().includes('sign in') && (
                  <div>
                    <a href="/login" className="text-asu-maroon hover:underline font-semibold ml-2">
                      Sign in
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button - Keep existing */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-asu-maroon hover:bg-asu-maroon-dark text-white font-bold text-lg py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Profile...</span>
                </>
              ) : (
                <span>Get My Personalized Plan →</span>
              )}
            </button>
          </form>

          {/* Footer - Keep existing */}
          <p className="text-xs text-asu-gray-500 text-center mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-asu-maroon hover:underline font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
