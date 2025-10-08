import { useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  
  // Special layout for AI Advisor page
  const isAIAdvisor = location.pathname === '/ai-advisor';

  if (isAIAdvisor) {
    // AI Advisor: Fixed height, no scroll, no footer
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    );
  }

  // Normal layout for other pages (with footer)
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
