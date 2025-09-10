import React from 'react';
import { Timer, User, BarChart3, Play, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface GettingStartedGuideProps {
  isLoggedIn: boolean;
  hasSolves: boolean;
  className?: string;
}

export const GettingStartedGuide: React.FC<GettingStartedGuideProps> = ({
  isLoggedIn,
  hasSolves,
  className = ''
}) => {
  if (isLoggedIn && hasSolves) {
    return null; // Don't show guide if user has data
  }

  return (
    <div className={cn('bg-adaptive-tertiary rounded-lg border border-adaptive-primary p-6', className)}>
      <div className="text-center mb-6">
        <BarChart3 className={cn('w-12 h-12 mx-auto mb-4', getAdaptiveClasses.semantic.info)} />
        <h3 className="text-lg font-semibold text-adaptive-primary mb-2">
          {!isLoggedIn ? '🔐 Login Required' : '🎲 Start Solving!'}
        </h3>
        <p className="text-adaptive-secondary">
          {!isLoggedIn 
            ? 'Log in to access your personal statistics and track your progress'
            : 'Complete some solves to see your statistics and performance analytics'
          }
        </p>
      </div>

      {!isLoggedIn ? (
        // Not logged in - show login guide
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <LogIn className={cn('w-5 h-5', getAdaptiveClasses.semantic.info)} />
              </div>
              <div>
                <h4 className="font-medium text-adaptive-primary mb-1">Login to Your Account</h4>
                <p className="text-sm text-adaptive-secondary mb-3">
                  Access your personal statistics and solve history
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-on-primary text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Go to Login
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className={cn('rounded-full p-2', getAdaptiveClasses.backgroundSemantic.success)}>
                <User className={cn('w-5 h-5', getAdaptiveClasses.semantic.success)} />
              </div>
              <div>
                <h4 className="font-medium text-adaptive-primary mb-1">New User?</h4>
                <p className="text-sm text-adaptive-secondary mb-3">
                  Create an account to start tracking your cube solving progress
                </p>
                <Link
                  to="/login"
                  className={cn('inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors', getAdaptiveClasses.backgroundSemantic.success, 'text-on-primary', 'hover:bg-adaptive-tertiary hover:text-adaptive-primary')}
                >
                  <User className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Logged in but no solves - show timer guide
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className={cn('rounded-full p-2', getAdaptiveClasses.background.tertiary)}>
                <Timer className={cn('w-5 h-5', getAdaptiveClasses.text.secondary)} />
              </div>
              <div>
                <h4 className="font-medium text-adaptive-primary mb-1">Start Timing Your Solves</h4>
                <p className="text-sm text-adaptive-secondary mb-3">
                  Use the timer to record your solve times and build your statistics
                </p>
                <Link
                  to="/timer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-on-primary text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Go to Timer
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.info)}>5+</div>
              <div className="text-xs text-adaptive-secondary">solves for Ao5</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className={cn('text-2xl font-bold', getAdaptiveClasses.semantic.success)}>12+</div>
              <div className="text-xs text-adaptive-secondary">solves for Ao12</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className={cn('text-2xl font-bold', getAdaptiveClasses.text.secondary)}>20+</div>
              <div className="text-xs text-adaptive-secondary">solves for trends</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-adaptive-primary">
        <h4 className="text-sm font-medium text-adaptive-primary mb-2">📊 What You'll Get</h4>
        <ul className="text-xs text-adaptive-secondary space-y-1">
          <li>• Interactive charts showing your improvement over time</li>
          <li>• Solve time distribution analysis</li>
          <li>• Rolling averages (Ao5, Ao12, Ao100)</li>
          <li>• Performance trends and consistency metrics</li>
          <li>• Personal best tracking and milestones</li>
        </ul>
      </div>
    </div>
  );
};

export default GettingStartedGuide;
