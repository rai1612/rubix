import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Timer, User, Settings, LogOut, ChevronDown, BarChart3, BookOpen, Calendar, Box } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

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
    <header className={cn(
      getAdaptiveClasses.background.secondary,
      'shadow-sm border-b border-adaptive-primary h-16 fixed top-0 left-0 right-0 z-50'
    )}>
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Menu toggle button - now available on all screen sizes */}
          <button
            onClick={onMenuClick}
            className={cn(
              'p-2 rounded-lg transition-colors',
              getAdaptiveClasses.text.secondary,
              'hover:bg-adaptive-tertiary'
            )}
            aria-label="Toggle sidebar"
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
              <Timer className="w-5 h-5 text-on-primary" />
            </div>
            <span className={cn(
              'text-xl font-bold hidden sm:block',
              getAdaptiveClasses.text.primary
            )}>
              rubiX
            </span>
          </Link>

          {/* Page title (desktop) */}
          <div className={cn('hidden md:block', getAdaptiveClasses.text.tertiary)}>
            <span className="text-2xl">/</span>
            <span className={cn(
              'ml-2 text-lg font-medium',
              getAdaptiveClasses.text.secondary
            )}>
              {getPageTitle(location.pathname)}
            </span>
          </div>
        </div>


        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Page shortcuts - visible on all screens */}
          <div className="flex items-center space-x-1 mr-2">

            {/* Timer */}
            <Link
              to="/timer"
              className={cn(
                'p-2 rounded-lg transition-colors',
                location.pathname === '/timer' 
                  ? 'bg-primary-100 text-primary-600' 
                  : cn(getAdaptiveClasses.text.secondary, 'hover:bg-adaptive-tertiary'),
              )}
              title="Timer"
            >
              <Timer className="w-5 h-5" />
            </Link>

            {/* Statistics */}
            <Link
              to="/statistics"
              className={cn(
                'p-2 rounded-lg transition-colors',
                location.pathname === '/statistics' 
                  ? 'bg-primary-100 text-primary-600' 
                  : cn(getAdaptiveClasses.text.secondary, 'hover:bg-adaptive-tertiary'),
              )}
              title="Statistics"
            >
              <BarChart3 className="w-5 h-5" />
            </Link>

            {/* Algorithms */}
            <Link
              to="/algorithms"
              className={cn(
                'p-2 rounded-lg transition-colors',
                location.pathname.startsWith('/algorithms') 
                  ? 'bg-primary-100 text-primary-600' 
                  : cn(getAdaptiveClasses.text.secondary, 'hover:bg-adaptive-tertiary'),
              )}
              title="Algorithms"
            >
              <BookOpen className="w-5 h-5" />
            </Link>

            {/* Sessions */}
            <Link
              to="/sessions"
              className={cn(
                'p-2 rounded-lg transition-colors',
                location.pathname === '/sessions' 
                  ? 'bg-primary-100 text-primary-600' 
                  : cn(getAdaptiveClasses.text.secondary, 'hover:bg-adaptive-tertiary'),
              )}
              title="Sessions"
            >
              <Calendar className="w-5 h-5" />
            </Link>

            {/* Visualizer */}
            <Link
              to="/visualizer"
              className={cn(
                'p-2 rounded-lg transition-colors',
                location.pathname === '/visualizer' 
                  ? 'bg-primary-100 text-primary-600' 
                  : cn(getAdaptiveClasses.text.secondary, 'hover:bg-adaptive-tertiary'),
              )}
              title="Visualizer"
            >
              <Box className="w-5 h-5" />
            </Link>
          </div>

          {/* Divider */}
          <div className={cn('w-px h-6 mx-2', getAdaptiveClasses.border.primary)}></div>



          {/* User avatar with dropdown */}
          <div className="relative" data-dropdown-container>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setUserDropdownOpen(!userDropdownOpen);
              }}
              className={cn(
                'flex items-center space-x-2 p-2 rounded-lg transition-colors',
                'hover:bg-adaptive-tertiary'
              )}
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-on-primary-light">
                  {getUserInitials(currentUser)}
                </span>
              </div>
              <span className={cn(
                'text-sm font-medium hidden lg:block',
                getAdaptiveClasses.text.secondary
              )}>
                {getUserDisplayName(currentUser)}
              </span>
              <ChevronDown className={cn(
                'w-4 h-4 hidden lg:block',
                getAdaptiveClasses.text.tertiary
              )} />
            </button>

            {/* Dropdown menu */}
            {userDropdownOpen && (
              <div className={cn(
                'absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-50',
                getAdaptiveClasses.background.secondary,
                getAdaptiveClasses.border.primary,
                'border'
              )}>
                <Link
                  to="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-2 text-sm transition-colors',
                    getAdaptiveClasses.text.secondary,
                    'hover:bg-adaptive-tertiary'
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-2 text-sm transition-colors',
                    getAdaptiveClasses.text.secondary,
                    'hover:bg-adaptive-tertiary'
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <div className="border-t border-adaptive-primary my-1"></div>
                <button
                  onClick={handleLogout}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-2 text-sm w-full text-left transition-colors',
                    'text-error hover:bg-adaptive-tertiary'
                  )}
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
