import { getCurrentSession } from '../services/auth';

export default function User_Dashboard_Header() {
  const session = getCurrentSession();
  const firstName = session?.profile.fullName?.split(' ')[0] || 'User';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {firstName}
      </h1>
    </header>
  );
}
