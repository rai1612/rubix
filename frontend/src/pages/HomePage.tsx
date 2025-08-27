import React from 'react';
import { Link } from 'react-router-dom';
import { Timer, BarChart3, BookOpen, ArrowRight, Target, Trophy, Clock } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-primary-600">rubiX</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          The most effective speedcubing practice platform. Track your progress, 
          learn algorithms, and improve your times with precision timing and detailed analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/timer"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2"
          >
            <Timer className="w-5 h-5" />
            <span>Start Timing</span>
          </Link>
          <Link
            to="/statistics"
            className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2"
          >
            <BarChart3 className="w-5 h-5" />
            <span>View Stats</span>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Solves</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">1,247</p>
          <p className="text-sm text-gray-600">+12 today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Current Ao5</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">15.42</p>
          <p className="text-sm text-green-600">-0.8s from last week</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Personal Best</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">11.24</p>
          <p className="text-sm text-gray-600">Set 3 days ago</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/timer"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Timer className="w-6 h-6 text-primary-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Practice</h3>
            <p className="text-gray-600 text-sm">
              Jump right into a practice session with official scrambles and precision timing.
            </p>
          </Link>

          <Link
            to="/statistics"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Progress</h3>
            <p className="text-gray-600 text-sm">
              Analyze your improvement with detailed statistics and performance trends.
            </p>
          </Link>

          <Link
            to="/algorithms"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Algorithms</h3>
            <p className="text-gray-600 text-sm">
              Learn and practice OLL, PLL, and other algorithm sets with interactive guides.
            </p>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
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
            <h3 className="font-medium text-gray-900 mb-4">Today's Sessions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">Morning Practice</p>
                  <p className="text-sm text-gray-600">25 solves • Avg: 16.42s</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Best: 13.21s</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">Algorithm Practice</p>
                  <p className="text-sm text-gray-600">15 solves • OLL Focus</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Avg: 18.76s</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
