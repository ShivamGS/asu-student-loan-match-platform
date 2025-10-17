import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Hash, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    asuId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    setTimeout(() => {
      // ✅ NO VALIDATION - Accept any credentials
      // Store admin session
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminId', formData.asuId);
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Sign in to access the dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ASU ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                ASU ID *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.asuId}
                  onChange={(e) => {
                    // Only allow numbers and limit to 10 digits
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setFormData({ ...formData, asuId: value });
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  placeholder="1234567890"
                  maxLength={10}
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Enter your 10-digit ASU ID</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                  }}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  placeholder="Enter password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Development Mode: Any credentials will work
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
