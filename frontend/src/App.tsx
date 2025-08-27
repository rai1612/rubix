// React is imported automatically in Vite
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { useEffect, useState } from 'react';

// Layout
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import TimerPage from './pages/TimerPage';
import StatisticsPage from './pages/StatisticsPage';
import AlgorithmsPage from './pages/AlgorithmsPage';
import SessionsPage from './pages/SessionsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Error fallback component
import ErrorFallback from './components/common/ErrorFallback';

// Auth
import { AuthService } from './services/authService';

// Context
import { SessionProvider } from './context/SessionContext';

// Styles
import './index.css';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await AuthService.validateToken();
        setIsAuthenticated(isValid);
      } catch {
        setIsAuthenticated(false);
      }
    };

    if (AuthService.isAuthenticated()) {
      checkAuth();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
                              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <SessionProvider>
                      <Layout />
                    </SessionProvider>
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="timer" element={<TimerPage />} />
                <Route path="statistics" element={<StatisticsPage />} />
                <Route path="algorithms" element={<AlgorithmsPage />} />
                <Route path="sessions" element={<SessionsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </div>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
