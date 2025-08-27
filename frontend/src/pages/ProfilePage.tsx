import React from 'react';
import { Calendar, Award, Target, TrendingUp } from 'lucide-react';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">
          Manage your account and view your cubing achievements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-800">DU</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Demo User</h2>
              <p className="text-gray-600">demo@rubix.local</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Member since</p>
                  <p className="text-sm text-gray-600">January 2024</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Preferred Method</p>
                  <p className="text-sm text-gray-600">CFOP</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Level</p>
                  <p className="text-sm text-gray-600">Intermediate</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">First Sub-20</p>
                  <p className="text-sm text-gray-600">19.87s • 3 days ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">100 Solves</p>
                  <p className="text-sm text-gray-600">Completed last week</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Consistent Practice</p>
                  <p className="text-sm text-gray-600">7 days streak</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Algorithm Master</p>
                  <p className="text-sm text-gray-600">50 algorithms learned</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Records */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">3x3x3 Cube</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Single</span>
                    <span className="font-medium">11.24s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ao5</span>
                    <span className="font-medium">13.82s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ao12</span>
                    <span className="font-medium">14.95s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ao100</span>
                    <span className="font-medium">15.89s</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">2x2x2 Cube</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Single</span>
                    <span className="font-medium">2.87s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ao5</span>
                    <span className="font-medium">4.12s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ao12</span>
                    <span className="font-medium">4.85s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ao100</span>
                    <span className="font-medium">5.23s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-sm text-gray-600">Total Solves</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">24h 15m</p>
                <p className="text-sm text-gray-600">Practice Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">47</p>
                <p className="text-sm text-gray-600">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">18</p>
                <p className="text-sm text-gray-600">Days Active</p>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="Demo User"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="demo@rubix.local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Solving Method
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="cfop">CFOP</option>
                  <option value="roux">Roux</option>
                  <option value="zz">ZZ</option>
                  <option value="petrus">Petrus</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Save Changes
                </button>
                <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
