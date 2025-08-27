import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Timer, User, Settings, Bell, LogOut, ChevronDown } from 'lucide-react';
import { AuthService } from '../../services/authService';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load current user on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load current user:', error);
        // User will be redirected by ProtectedRoute if auth fails
      }
    };

    loadCurrentUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userDropdownOpen && !target.closest('[data-dropdown-container]')) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Home';
      case '/timer':
        return 'Timer';
      case '/statistics':
        return 'Statistics';
      case '/algorithms':
        return 'Algorithms';
      case '/sessions':
        return 'Sessions';
      case '/settings':
        return 'Settings';
      case '/profile':
        return 'Profile';
      default:
        return 'rubiX';
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const getUserInitials = (user: any) => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username ? user.username.slice(0, 2).toUpperCase() : 'U';
  };

  const getUserDisplayName = (user: any) => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'User';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              rubiX
            </span>
          </Link>

          {/* Page title (desktop) */}
          <div className="hidden md:block text-gray-400">
            <span className="text-2xl">/</span>
            <span className="ml-2 text-lg font-medium text-gray-700">
              {getPageTitle(location.pathname)}
            </span>
          </div>
        </div>

        {/* Center section - Search (future) */}
        <div className="flex-1 max-w-lg mx-4 hidden lg:block">
          {/* Search bar placeholder */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search algorithms, sessions..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <button
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <Link
            to="/settings"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Profile"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* User avatar with dropdown */}
          <div className="hidden sm:block relative" data-dropdown-container>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setUserDropdownOpen(!userDropdownOpen);
              }}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-800">
                  {getUserInitials(currentUser)}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden lg:block">
                {getUserDisplayName(currentUser)}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden lg:block" />
            </button>

            {/* Dropdown menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  to="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
