import React from 'react';
import { Timer, Eye, Palette, Download, Shield } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Customize your cubing experience and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left bg-primary-100 text-primary-700 rounded-lg font-medium">
              <Timer className="w-5 h-5" />
              <span>Timer</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Eye className="w-5 h-5" />
              <span>Display</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
              <span>Data</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Shield className="w-5 h-5" />
              <span>Privacy</span>
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Timer className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Timer Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Time
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="15">15 seconds (WCA standard)</option>
                  <option value="10">10 seconds</option>
                  <option value="5">5 seconds</option>
                  <option value="0">No inspection</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timer Precision
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="precision" value="centiseconds" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Centiseconds (0.01s)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="precision" value="milliseconds" className="mr-2" />
                    <span className="text-sm text-gray-700">Milliseconds (0.001s)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-700">Hold spacebar to start timer</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Show scramble during solve</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-700">Auto-generate new scramble after solve</span>
                </label>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Display Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statistics to Show
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Average of 5 (Ao5)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Average of 12 (Ao12)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Average of 100 (Ao100)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Personal best</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scramble Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="scrambleFormat" value="single" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Single line</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="scrambleFormat" value="multiline" className="mr-2" />
                    <span className="text-sm text-gray-700">Multi-line (5 moves per line)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Download className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
            </div>

            <div className="space-y-4">
              <div>
                <button className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Export All Data
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Download all your solves, sessions, and statistics as a JSON file
                </p>
              </div>

              <div>
                <button className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Import Data
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Import data from other timer applications or previous exports
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Backup Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Auto-backup to cloud</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Daily email backup</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Reset to Defaults
            </button>
            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
