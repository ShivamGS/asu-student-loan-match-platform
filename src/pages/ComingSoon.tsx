import { Link } from 'react-router-dom';
import { Construction, ArrowLeft, Calendar, Bell } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-asu-gray-200 text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-asu-maroon to-asu-maroon-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Construction className="w-12 h-12 text-asu-gold animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-asu-gray-900 mb-4">
            Enrollment Portal Coming Soon
          </h1>

          {/* Description */}
          <p className="text-lg text-asu-gray-600 mb-8 leading-relaxed">
            We're building something amazing! The enrollment portal will be available soon. 
            In the meantime, you can explore your benefits and calculate your potential match.
          </p>

          {/* Features Preview */}
          <div className="bg-asu-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-asu-gray-900 mb-4">
              What's Coming:
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-asu-maroon rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-asu-gray-700">Simple 5-minute enrollment process</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-asu-maroon rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-asu-gray-700">Secure document upload and verification</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-asu-maroon rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-asu-gray-700">Real-time status tracking and updates</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-asu-maroon rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-asu-gray-700">Direct integration with HR systems</p>
              </div>
            </div>
          </div>

          {/* Notification Signup */}
          <div className="bg-gradient-to-r from-asu-gold/10 to-asu-maroon/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-asu-maroon" />
              <h4 className="font-semibold text-asu-gray-900">Get Notified</h4>
            </div>
            <p className="text-sm text-asu-gray-600 mb-4">
              Want to know when enrollment opens? Contact HR Benefits to be added to the notification list.
            </p>
            <a
              href="mailto:benefits@asu.edu?subject=Enrollment Portal Notification Request"
              className="inline-flex items-center justify-center gap-2 bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Notify Me</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              to="/blueprint"
              className="inline-flex items-center justify-center gap-2 bg-asu-gold hover:bg-asu-gold/90 text-asu-maroon font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
            >
              <span>Explore Benefits</span>
            </Link>
          </div>

          {/* Expected Launch */}
          <div className="mt-8 pt-8 border-t border-asu-gray-200">
            <p className="text-sm text-asu-gray-500">
              Expected Launch: <span className="font-semibold text-asu-maroon">Q1 2026</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


