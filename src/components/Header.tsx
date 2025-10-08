import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Sparkles, LogIn, Bot } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Eligibility', href: '/eligibility' },
  { name: 'AI Advisor', href: '/ai-advisor' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-asu-maroon shadow-md sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-asu-gold p-2 rounded">
                <GraduationCap className="h-6 w-6 text-asu-maroon" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm sm:text-base leading-tight">
                  ASU Benefits
                </span>
                <span className="text-asu-gold text-xs leading-tight">
                  Student Loan Match
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive(item.href)
                      ? 'bg-asu-maroon-dark text-asu-gold'
                      : 'text-white hover:bg-asu-maroon-dark hover:text-asu-gold'
                  }`}
                >
                  {item.name === 'AI Advisor' && <Bot className="w-4 h-4" />}
                  {item.name}
                </Link>
              ))}
              
              {/* Get Your Plan Button */}
              <Link
                to="/signup"
                className={`ml-3 flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-md hover:shadow-lg ${
                  isActive('/signup')
                    ? 'bg-asu-gold text-asu-maroon'
                    : 'bg-asu-gold hover:bg-asu-gold/90 text-asu-maroon'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Your Plan</span>
              </Link>

              {/* Sign In Button - Green, on the right */}
              <Link
                to="/login"
                className={`ml-2 flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-md hover:shadow-lg ${
                  isActive('/login')
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-asu-maroon-dark hover:text-asu-gold transition-colors"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-3">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'bg-asu-maroon-dark text-asu-gold'
                      : 'text-white hover:bg-asu-maroon-dark hover:text-asu-gold'
                  }`}
                >
                  {item.name === 'AI Advisor' && <Bot className="w-5 h-5" />}
                  {item.name}
                </Link>
              ))}
              
              {/* Get Your Plan Button - Mobile */}
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                  isActive('/signup')
                    ? 'bg-asu-gold text-asu-maroon'
                    : 'bg-asu-gold hover:bg-asu-gold/90 text-asu-maroon'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Your Plan</span>
              </Link>

              {/* Sign In Button - Mobile (Green) */}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                  isActive('/login')
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
