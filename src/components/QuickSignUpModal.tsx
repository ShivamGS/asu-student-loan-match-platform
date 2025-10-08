import { useState } from 'react';
import { X, Lock, Zap, CheckCircle } from 'lucide-react';
import { CreateUserProfileRequest } from '../types';
import { quickSignUp } from '../services/auth';

interface QuickSignUpModalProps {
  onSignUpSuccess: (profileData: CreateUserProfileRequest) => void;
  onDismiss?: () => void;
  allowDismiss?: boolean;
}

export default function QuickSignUpModal({ 
  onSignUpSuccess, 
  onDismiss,
  allowDismiss = false 
}: QuickSignUpModalProps) {
  const [formData, setFormData] = useState<CreateUserProfileRequest>({
    asuId: '',
    asuEmail: '',
    firstName: '',
    lastName: '',
  });
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

    // ASU email validation
    if (!formData.asuEmail.endsWith('@asu.edu')) {
      setError('Please use your ASU email (@asu.edu)');
      return;
    }

    // ASU ID validation (10 digits)
    if (!/^\d{10}$/.test(formData.asuId)) {
      setError('ASU ID must be 10 digits');
      return;
    }

    setIsLoading(true);

    try {
      // Create session locally first
      await quickSignUp({
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.asuEmail,
        employeeId: formData.asuId,
      });

      // Pass the complete profile data to parent component
      // Parent will handle AWS profile creation
      onSignUpSuccess(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserProfileRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user types
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in duration-300">
        {/* Dismiss button (optional) */}
        {allowDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-asu-gray-400 hover:text-asu-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-asu-gold" />
          </div>
          <h2 className="text-3xl font-bold text-asu-gray-900 mb-2">
            Let's Get Your Plan
          </h2>
          <p className="text-asu-gray-600">
            Quick sign-up to see your accurate retirement projection
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="bg-asu-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-6 text-sm text-asu-gray-600">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-asu-maroon" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-asu-maroon" />
              <span>30 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-asu-maroon" />
              <span>1,200+ users</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-asu-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                placeholder="John"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-asu-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                placeholder="Smith"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* ASU ID */}
          <div>
            <label className="block text-sm font-medium text-asu-gray-700 mb-2">
              ASU ID
            </label>
            <input
              type="text"
              value={formData.asuId}
              onChange={(e) => handleInputChange('asuId', e.target.value)}
              className="w-full px-4 py-3 border border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
              placeholder="1234567890"
              maxLength={10}
              disabled={isLoading}
            />
            <p className="text-xs text-asu-gray-500 mt-1">10-digit employee ID</p>
          </div>

          {/* ASU Email */}
          <div>
            <label className="block text-sm font-medium text-asu-gray-700 mb-2">
              ASU Email
            </label>
            <input
              type="email"
              value={formData.asuEmail}
              onChange={(e) => handleInputChange('asuEmail', e.target.value)}
              className="w-full px-4 py-3 border border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
              placeholder="jsmith@asu.edu"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <span>Get Started →</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-asu-gray-500 text-center mt-6">
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
