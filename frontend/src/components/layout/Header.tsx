import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-600">Habit Tracker</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {user?.name || 'User'}
            </span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
