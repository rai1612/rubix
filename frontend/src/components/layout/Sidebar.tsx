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
  Clock,
  Box,
} from 'lucide-react';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';
import { useTodayStats } from '../../hooks/useTodayStats';

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
  const { stats: todayStats, isLoading: isLoadingStats } = useTodayStats();

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
    {
      to: '/visualizer',
      icon: Box,
      label: 'Visualizer',
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
    <div className={cn('h-full flex flex-col', getAdaptiveClasses.background.secondary)}>
      {/* Main navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-6">
          <h2 className={cn(
            'text-xs font-semibold uppercase tracking-wider mb-3',
            getAdaptiveClasses.text.tertiary
          )}>
            Practice
          </h2>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? cn('bg-primary-100 border-r-2 border-primary-600', getAdaptiveClasses.textOnPrimary.light)
                        : cn(getAdaptiveClasses.text.secondary, 'hover:bg-adaptive-tertiary hover:text-adaptive-primary')
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      'ml-auto bg-primary-100 text-xs px-2 py-1 rounded-full',
                      getAdaptiveClasses.textOnPrimary.light
                    )}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick stats section */}
        <div className={cn('mb-6 p-4 rounded-lg', getAdaptiveClasses.background.tertiary)}>
          <h3 className={cn(
            'text-xs font-semibold uppercase tracking-wider mb-3',
            getAdaptiveClasses.text.tertiary
          )}>
            Today
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className={cn('w-4 h-4', getAdaptiveClasses.text.tertiary)} />
                <span className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Solves</span>
              </div>
              <span className={cn('text-sm font-medium', getAdaptiveClasses.text.primary)}>
                {isLoadingStats ? '...' : (todayStats?.solveCount ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className={cn('w-4 h-4', getAdaptiveClasses.text.tertiary)} />
                <span className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Avg</span>
              </div>
              <span className={cn('text-sm font-medium', getAdaptiveClasses.text.primary)}>
                {isLoadingStats ? '...' : (todayStats?.averageTime ?? '--')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className={cn('w-4 h-4', getAdaptiveClasses.text.tertiary)} />
                <span className={cn('text-sm', getAdaptiveClasses.text.secondary)}>Best</span>
              </div>
              <span className={cn(
                'text-sm font-medium',
                isLoadingStats ? getAdaptiveClasses.text.primary : 'text-success'
              )}>
                {isLoadingStats ? '...' : (todayStats?.bestTime ?? '--')}
              </span>
            </div>
          </div>
        </div>

        {/* Account section */}
        <div>
          <h2 className={cn(
            'text-xs font-semibold uppercase tracking-wider mb-3',
            getAdaptiveClasses.text.tertiary
          )}>
            Account
          </h2>
          <ul className="space-y-1">
            {secondaryNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? cn('bg-primary-100', getAdaptiveClasses.textOnPrimary.light)
                        : cn(getAdaptiveClasses.text.secondary, 'hover:bg-adaptive-tertiary hover:text-adaptive-primary')
                    )
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
      <div className={cn('p-4 border-t', getAdaptiveClasses.border.primary)}>
        <div className={cn('text-xs text-center', getAdaptiveClasses.text.tertiary)}>
          <p>rubiX v0.1.0</p>
          <p className="mt-1">
            <span className="text-success">●</span> Online
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
