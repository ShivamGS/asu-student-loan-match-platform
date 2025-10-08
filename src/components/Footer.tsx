import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-asu-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-asu-gold">Contact HR Benefits</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-asu-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">480-965-3365</p>
                  <p className="text-xs text-asu-gray-400">Monday - Friday, 8am - 5pm MST</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-asu-gold mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:benefits@asu.edu"
                  className="text-sm hover:text-asu-gold transition-colors"
                >
                  benefits@asu.edu
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-asu-gold mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  University Services Building
                  <br />
                  Tempe, AZ 85287
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-asu-gold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.asu.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-asu-gold transition-colors"
                >
                  ASU Main Website
                </a>
              </li>
              <li>
                <a
                  href="https://cfo.asu.edu/hr-benefits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-asu-gold transition-colors"
                >
                  HR Benefits Portal
                </a>
              </li>
              <li>
                <a
                  href="https://www.asu.edu/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-asu-gold transition-colors"
                >
                  Campus Maps
                </a>
              </li>
              <li>
                <a
                  href="https://www.asu.edu/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-asu-gold transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-asu-gold">About This Program</h3>
            <p className="text-sm text-asu-gray-300 mb-4">
              The Student Loan Retirement Matching program helps ASU employees build retirement
              savings while paying down their student loans. ASU matches qualified student loan
              payments with contributions to your 401(k) retirement account.
            </p>
            <p className="text-xs text-asu-gray-400">
              This tool is for informational purposes only and does not constitute financial advice.
              Please consult with ASU HR Benefits for official program details.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-asu-gray-700 text-center">
          <p className="text-sm text-asu-gray-400">
            &copy; {new Date().getFullYear()} Arizona State University. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
