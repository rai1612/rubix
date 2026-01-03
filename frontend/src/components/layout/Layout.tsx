import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';
import { useTimerContext } from '../../context/TimerContext';

const Layout: React.FC = () => {
  // Get timer context to determine if we should hide header
  const { isMinimalMode } = useTimerContext();
  
  // Initialize sidebar state: closed by default for overlay behavior on all screen sizes
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Close sidebar when clicking outside (for all screen sizes when overlay is present)
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
        // Now close on outside click for all screen sizes since sidebar always overlays
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Initialize sidebar state - closed by default on all screen sizes for overlay behavior
  React.useEffect(() => {
    setSidebarOpen(false); // Closed by default on all screen sizes
  }, []);

  return (
    <div className={cn('min-h-screen', getAdaptiveClasses.background.primary)}>
      {/* Header - hidden in minimal mode (timer solving/inspection) */}
      {!isMinimalMode && (
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
      )}

      <div className="flex">
        {/* Sidebar - hidden in minimal mode */}
        {!isMinimalMode && (
          <div
            ref={sidebarRef}
            className={cn(
              'fixed inset-y-0 left-0 z-40 w-64 shadow-lg transform transition-transform duration-300 ease-in-out',
              getAdaptiveClasses.background.secondary,
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
            style={{ top: '4rem' }} // Account for header height
          >
            <Sidebar onItemClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Overlay - show when sidebar is open (now for all screen sizes) - hidden in minimal mode */}
        {!isMinimalMode && sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
            style={{ top: '4rem' }}
          />
        )}

        {/* Main content */}
        <main 
          className={cn(
            'flex-1 min-h-screen',
            isMinimalMode ? 'pt-0' : 'pt-16' // No top padding in minimal mode
          )}
        >
          <div className={cn(
            'container mx-auto max-w-7xl',
            isMinimalMode ? 'px-0 py-0' : 'px-4 py-6' // No padding in minimal mode
          )}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
