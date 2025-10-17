import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#1A1F2E] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
