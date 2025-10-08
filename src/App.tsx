import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import User_Dashboard_Layout from './components/User_Dashboard_Layout';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Eligibility from './pages/Eligibility';
import Blueprint from './pages/Blueprint';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ComingSoon from './pages/ComingSoon';
import AIAdvisor from './pages/AIAdvisor';
import User_Dashboard_Home from './pages/User_Dashboard_Home';
import User_Dashboard_Analytics from './pages/User_Dashboard_Analytics';
import User_Dashboard_Transactions from './pages/User_Dashboard_Transactions';
import User_Dashboard_Documents from './pages/User_Dashboard_Documents';
import User_Dashboard_Chatbot from './pages/User_Dashboard_Chatbot';
import User_Dashboard_Support from './pages/User_Dashboard_Support'; // ← NEW
import User_Dashboard_Settings from './pages/User_Dashboard_Settings';
import { isAuthenticated } from './services/auth';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Header + Footer Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/eligibility" element={<Eligibility />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/enroll" element={<ComingSoon />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
        </Route>

        {/* Protected Dashboard Routes - Sidebar Layout */}
        <Route 
          element={
            <ProtectedRoute>
              <User_Dashboard_Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<User_Dashboard_Home />} />
          <Route path="/dashboard/analytics" element={<User_Dashboard_Analytics />} />
          <Route path="/dashboard/transactions" element={<User_Dashboard_Transactions />} />
          <Route path="/dashboard/documents" element={<User_Dashboard_Documents />} />
          <Route path="/dashboard/chatbot" element={<User_Dashboard_Chatbot />} />
          <Route path="/dashboard/support" element={<User_Dashboard_Support />} /> {/* ← NEW */}
          <Route path="/dashboard/settings" element={<User_Dashboard_Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
