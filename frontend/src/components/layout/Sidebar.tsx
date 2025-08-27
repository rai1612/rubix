import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Timer, 
  BarChart3, 
  BookOpen, 
  Calendar, 
  Settings,
  User,
  Target,
  Trophy,
  Clock
} from 'lucide-react';

interface SidebarProps {
  onItemClick?: () => void;
}

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string | number;
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navItems: NavItem[] = [
    {
      to: '/',
      icon: Home,
      label: 'Home',
    },
    {
      to: '/timer',
      icon: Timer,
      label: 'Timer',
    },
    {
      to: '/statistics',
      icon: BarChart3,
      label: 'Statistics',
    },
    {
      to: '/algorithms',
      icon: BookOpen,
      label: 'Algorithms',
    },
    {
      to: '/sessions',
      icon: Calendar,
      label: 'Sessions',
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      to: '/profile',
      icon: User,
      label: 'Profile',
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Settings',
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Main navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Practice
          </h2>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick stats section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Today
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Solves</span>
              </div>
              <span className="text-sm font-medium text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Avg</span>
              </div>
              <span className="text-sm font-medium text-gray-900">16.42</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Best</span>
              </div>
              <span className="text-sm font-medium text-green-600">13.21</span>
            </div>
          </div>
        </div>

        {/* Account section */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Account
          </h2>
          <ul className="space-y-1">
            {secondaryNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>rubiX v0.1.0</p>
          <p className="mt-1">
            <span className="text-green-500">●</span> Online
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
