import { Outlet } from 'react-router-dom';
import User_Dashboard_Sidebar from './User_Dashboard_Sidebar';
import User_Dashboard_Header from './User_Dashboard_Header';

export default function User_Dashboard_Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <User_Dashboard_Sidebar />

      {/* Main Content */}
      <div className="pl-64 min-h-screen">
        <User_Dashboard_Header />
        
        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
