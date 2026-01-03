import React from 'react';
import { Link } from 'react-router-dom';
import { Timer, BarChart3, BookOpen, ArrowRight, Target, Trophy, Clock, AlertCircle, LogIn } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { cn, getAdaptiveClasses } from '../utils/appearanceUtils';

const HomePage: React.FC = () => {
  const { stats, todaySessions, isLoading, error, isAuthenticated, refreshDashboard } = useDashboard();

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-4xl md:text-6xl font-bold text-adaptive-primary mb-4">
            Welcome to <span className="text-primary-600">rubiX</span>
          </h1>
          <p className="text-xl text-adaptive-secondary mb-8 max-w-3xl mx-auto">
            The most effective speedcubing practice platform. Track your progress, 
            learn algorithms, and improve your times with precision timing and detailed analytics.
          </p>
          <div className={cn('border rounded-lg p-6 max-w-md mx-auto', getAdaptiveClasses.backgroundSemantic.info, 'border-info')}>
            <LogIn className={cn('w-8 h-8 mx-auto mb-4', getAdaptiveClasses.semantic.info)} />
            <h3 className={cn('text-lg font-semibold mb-2', getAdaptiveClasses.semantic.info)}>Sign in to get started</h3>
            <p className={cn('mb-4', getAdaptiveClasses.semantic.info)}>Log in to access your personal dashboard, track your progress, and view your statistics.</p>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-on-primary px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-adaptive-primary mb-4">
          Welcome to <span className="text-primary-600">rubiX</span>
        </h1>
        <p className="text-xl text-adaptive-secondary mb-8 max-w-3xl mx-auto">
          The most effective speedcubing practice platform. Track your progress, 
          learn algorithms, and improve your times with precision timing and detailed analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/timer"
            className="bg-primary-600 hover:bg-primary-700 text-on-primary px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2"
          >
            <Timer className="w-5 h-5" />
            <span>Start Timing</span>
          </Link>
          <Link
            to="/statistics"
            className="bg-white hover:bg-gray-50 text-adaptive-primary border border-gray-300 px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2"
          >
            <BarChart3 className="w-5 h-5" />
            <span>View Stats</span>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Error State */}
        {error && (
          <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className={cn('w-5 h-5', getAdaptiveClasses.semantic.error)} />
              <p className={getAdaptiveClasses.semantic.error}>Failed to load dashboard data: {error}</p>
              <button
                onClick={refreshDashboard}
                className={cn('ml-2 underline hover:opacity-80', getAdaptiveClasses.semantic.error)}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !stats && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </>
        )}

        {/* Real Data */}
        {stats && !isLoading && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={cn('p-2 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                  <Clock className={cn('w-6 h-6', getAdaptiveClasses.semantic.info)} />
                </div>
                <h3 className="text-lg font-semibold text-adaptive-primary">Total Solves</h3>
              </div>
              <p className="text-3xl font-bold text-adaptive-primary mb-2">
                {stats.totalSolves.toLocaleString()}
              </p>
              <p className="text-sm text-adaptive-secondary">
                +{stats.todaySolves} today
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={cn('p-2 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                  <Target className={cn('w-6 h-6', getAdaptiveClasses.semantic.success)} />
                </div>
                <h3 className="text-lg font-semibold text-adaptive-primary">Current Ao5</h3>
              </div>
              <p className="text-3xl font-bold text-adaptive-primary mb-2">
                {stats.currentAo5}
              </p>
              <p className="text-sm text-adaptive-secondary">
                {stats.currentAo5 === '--' ? 'Complete 5 solves to see' : 'Average of 5'}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={cn('p-2 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                  <Trophy className={cn('w-6 h-6', getAdaptiveClasses.semantic.warning)} />
                </div>
                <h3 className="text-lg font-semibold text-adaptive-primary">Personal Best</h3>
              </div>
              <p className="text-3xl font-bold text-adaptive-primary mb-2">
                {stats.personalBest}
              </p>
              <p className="text-sm text-adaptive-secondary">
                {stats.personalBest === '--' ? 'Complete your first solve' : 'All-time best'}
              </p>
            </div>
          </>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-adaptive-primary mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/timer"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Timer className="w-6 h-6 text-primary-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-adaptive-tertiary group-hover:text-adaptive-secondary transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-adaptive-primary mb-2">Start Practice</h3>
            <p className="text-adaptive-secondary text-sm">
              Jump right into a practice session with official scrambles and precision timing.
            </p>
          </Link>

          <Link
            to="/statistics"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                <BarChart3 className={cn('w-6 h-6', getAdaptiveClasses.semantic.success)} />
              </div>
              <ArrowRight className="w-5 h-5 text-adaptive-tertiary group-hover:text-adaptive-secondary transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-adaptive-primary mb-2">View Progress</h3>
            <p className="text-adaptive-secondary text-sm">
              Analyze your improvement with detailed statistics and performance trends.
            </p>
          </Link>

          <Link
            to="/algorithms"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-lg', getAdaptiveClasses.background.tertiary)}>
                <BookOpen className={cn('w-6 h-6', getAdaptiveClasses.semantic.info)} />
              </div>
              <ArrowRight className="w-5 h-5 text-adaptive-tertiary group-hover:text-adaptive-secondary transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-adaptive-primary mb-2">Study Algorithms</h3>
            <p className="text-adaptive-secondary text-sm">
              Learn and practice OLL, PLL, and other algorithm sets with interactive guides.
            </p>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-adaptive-primary">Recent Activity</h2>
          <Link
            to="/sessions"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center space-x-1"
          >
            <span>View all sessions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="font-medium text-adaptive-primary mb-4">Today's Sessions</h3>
            
            {/* Loading state for sessions */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
                        <div className="h-3 bg-gray-200 rounded w-12 ml-auto"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Real data or empty state */}
            {!isLoading && (
              <div className="space-y-4">
                {todaySessions.length > 0 ? (
                  todaySessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-adaptive-primary">{session.name}</p>
                          {session.isActive && (
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', getAdaptiveClasses.backgroundSemantic.success, getAdaptiveClasses.semantic.success)}>
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-adaptive-secondary">
                          {session.solveCount} solve{session.solveCount !== 1 ? 's' : ''} 
                          {session.averageTime !== '--' && ` • Avg: ${session.averageTime}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-adaptive-primary">
                          {session.bestTime !== '--' ? `Best: ${session.bestTime}` : 'No solves yet'}
                        </p>
                        <p className="text-xs text-adaptive-tertiary">{session.timeAgo}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-adaptive-tertiary mx-auto mb-2" />
                    <p className="text-adaptive-secondary">No sessions today yet</p>
                    <p className="text-sm text-adaptive-tertiary">Start timing to create your first session!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
