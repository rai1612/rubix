import React from 'react';
import { BookOpen, Search, Star, Play } from 'lucide-react';

const AlgorithmsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Algorithms</h1>
        <p className="text-gray-600">
          Learn and practice essential speedcubing algorithms
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search algorithms..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">All Sets</option>
              <option value="oll">OLL</option>
              <option value="pll">PLL</option>
              <option value="f2l">F2L</option>
              <option value="cmll">CMLL</option>
            </select>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm Sets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">57 cases</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">OLL</h3>
          <p className="text-gray-600 text-sm mb-4">
            Orientation of the Last Layer algorithms for creating a cross on top
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-600">24/57 learned</span>
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">21 cases</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">PLL</h3>
          <p className="text-gray-600 text-sm mb-4">
            Permutation of the Last Layer algorithms for solving the final layer
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-600">18/21 learned</span>
            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">41 cases</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">F2L</h3>
          <p className="text-gray-600 text-sm mb-4">
            First Two Layers algorithms for efficient corner-edge pair solving
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-600">12/41 learned</span>
            <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Algorithms */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Popular Algorithms</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View all
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm font-medium text-blue-600">OLL 21</span>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
              <p className="font-mono text-lg text-gray-900 mb-1">R U R' U R U2 R'</p>
              <p className="text-sm text-gray-600">T-shaped OLL case</p>
            </div>
            <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
              <Play className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm font-medium text-green-600">PLL Aa</span>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
              <p className="font-mono text-lg text-gray-900 mb-1">x R' U R D2 R' U' R D2 R2 x'</p>
              <p className="text-sm text-gray-600">Adjacent corner swap</p>
            </div>
            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
              <Play className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm font-medium text-purple-600">F2L #1</span>
              </div>
              <p className="font-mono text-lg text-gray-900 mb-1">R U' R'</p>
              <p className="text-sm text-gray-600">Basic corner-edge pair</p>
            </div>
            <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
              <Play className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmsPage;
