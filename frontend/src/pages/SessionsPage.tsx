import React, { useEffect, useState } from 'react';
import { Calendar, Clock, BarChart3, Plus } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { formatTime } from '../services/solveService';

const SessionsPage: React.FC = () => {
  const { 
    currentSession, 
    sessionLoading, 
    sessionError, 
    loadOrCreateSession,
    createNewSession,
    endCurrentSession
  } = useSession();

  // Load session data on mount
  useEffect(() => {
    loadOrCreateSession();
  }, [loadOrCreateSession]);

  // Calculate session duration
  const getSessionDuration = (startedAt: string): string => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const handleNewSession = async () => {
    try {
      await createNewSession();
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      await endCurrentSession();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Sessions</h1>
          <p className="text-gray-600">
            Organize your practice and track your improvement over time
          </p>
        </div>
        <button 
          onClick={handleNewSession}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">47</p>
          <p className="text-sm text-gray-600">+3 this week</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Practice Time</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">24h 15m</p>
          <p className="text-sm text-green-600">+2h 30m this week</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Avg Session Length</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">31m</p>
          <p className="text-sm text-gray-600">32 solves average</p>
        </div>
      </div>

      {/* Current Session */}
      {sessionLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : currentSession ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Session</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {currentSession.isActive ? 'Active' : 'Ended'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{currentSession.solveCount || 0}</p>
              <p className="text-sm text-gray-600">Solves</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {currentSession.averageTimeMs ? formatTime(currentSession.averageTimeMs) : '--'}
              </p>
              <p className="text-sm text-gray-600">Average</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {currentSession.bestTimeMs ? formatTime(currentSession.bestTimeMs) : '--'}
              </p>
              <p className="text-sm text-gray-600">Best</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {getSessionDuration(currentSession.startedAt)}
              </p>
              <p className="text-sm text-gray-600">Duration</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Continue Session
            </button>
            <button 
              onClick={handleEndSession}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No active session</p>
            <button 
              onClick={handleNewSession}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start New Session
            </button>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Sessions</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h3 className="font-medium text-gray-900">Morning Practice</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  3x3
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>25 solves</span>
                <span>Avg: 16.42s</span>
                <span>Best: 13.21s</span>
                <span>42 minutes</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today, 9:30 AM</p>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1">
                View Details
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h3 className="font-medium text-gray-900">Algorithm Practice</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  3x3
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>15 solves</span>
                <span>Avg: 18.76s</span>
                <span>Best: 15.43s</span>
                <span>28 minutes</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Yesterday, 7:15 PM</p>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1">
                View Details
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h3 className="font-medium text-gray-900">Speed Session</h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                  3x3
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>50 solves</span>
                <span>Avg: 15.98s</span>
                <span>Best: 12.87s</span>
                <span>1h 15m</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Yesterday, 2:00 PM</p>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1">
                View Details
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            Load More Sessions
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;
