import { Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear admin authentication
    localStorage.removeItem('adminAuth');
    // Clear any other admin-related data
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    // Redirect to home page
    navigate('/');
  };

  return (
    <header className="bg-[#252C3C] border-b border-gray-700 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search documents, users, reports..."
            className="w-full pl-10 pr-4 py-2 bg-[#1A1F2E] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asu-gold focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <button className="relative p-2 hover:bg-[#1A1F2E] rounded-lg transition-colors">
          <Bell size={22} className="text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-asu-gold rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-600">
          <div className="text-right">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-asu-maroon flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 hover:bg-red-900/20 rounded-lg transition-colors group"
          title="Logout"
        >
          <LogOut size={20} className="text-gray-300 group-hover:text-red-400" />
        </button>
      </div>
    </header>
  );
}
