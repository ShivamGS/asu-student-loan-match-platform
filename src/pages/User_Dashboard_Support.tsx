import { Mail, Phone, ExternalLink, HelpCircle, FileText, MapPin, Clock } from 'lucide-react';

export default function User_Dashboard_Support() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Support & Help</h1>
        <p className="text-gray-600">
          Get assistance with your retirement benefits and student loan match program
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Support */}
        <a
          href="mailto:benefits@asu.edu"
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-asu-maroon transition-colors">
                Email Support
              </h3>
              <p className="text-gray-600 mb-3">
                Send us an email and we will get back to you within 1 business day
              </p>
              <p className="text-asu-maroon font-medium">benefits@asu.edu</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-asu-maroon transition-colors" />
          </div>
        </a>

        {/* Phone Support */}
        <a
          href="tel:+14809653768"
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-asu-maroon transition-colors">
                Call Support
              </h3>
              <p className="text-gray-600 mb-3">
                Speak directly with a benefits specialist during office hours
              </p>
              <p className="text-asu-maroon font-medium">(480) 965-3768</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-asu-maroon transition-colors" />
          </div>
        </a>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
        <div className="space-y-3">
          <button
            onClick={() => window.open('/how-it-works', '_blank')}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View FAQs</p>
                <p className="text-sm text-gray-600">Common questions and answers</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-asu-maroon transition-colors" />
          </button>

          <button
            onClick={() => alert('User guide download coming soon!')}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Download User Guide</p>
                <p className="text-sm text-gray-600">Complete program documentation</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-asu-maroon transition-colors" />
          </button>
        </div>
      </div>

      {/* Office Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Office Information</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 mb-1">Office Hours</p>
              <p className="text-gray-600">Monday - Friday</p>
              <p className="text-gray-600">8:00 AM - 5:00 PM MST</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 mb-1">Location</p>
              <p className="text-gray-600">University Services Building</p>
              <p className="text-gray-600">411 N Central Ave</p>
              <p className="text-gray-600">Phoenix, AZ 85004</p>
            </div>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Common Issues</h2>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-1">Document Upload Issues</p>
            <p className="text-sm text-gray-600">
              Make sure your file is in PDF, JPG, or PNG format and under 10MB. Clear your browser cache if issues persist.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-1">Missing Employer Match</p>
            <p className="text-sm text-gray-600">
              Employer match appears 2-3 business days after document approval. Check the Documents page for approval status.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-1">Login Problems</p>
            <p className="text-sm text-gray-600">
              Use your ASU credentials. If you forgot your password, use the ASU password reset tool or contact IT support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
