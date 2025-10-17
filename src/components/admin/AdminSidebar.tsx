import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, Headphones, Megaphone } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Documents', path: '/admin/documents', icon: FileText },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Support', path: '/admin/support', icon: Headphones },
  { name: 'Broadcast', path: '/admin/broadcast', icon: Megaphone },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-asu-maroon min-h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">ASU Admin</h1>
        <p className="text-sm text-gray-300 mt-1">Benefits Portal</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-asu-gold border-l-4 border-asu-gold'
                        : 'text-white hover:bg-white/5 hover:text-asu-gold'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
