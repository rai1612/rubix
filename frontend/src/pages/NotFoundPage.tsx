import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. 
            The cube might have been scrambled!
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Go to Homepage</span>
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go back</span>
            </button>
          </div>
        </div>

        {/* Cube ASCII Art for fun */}
        <div className="mt-12 text-center">
          <pre className="text-xs text-gray-400 font-mono">
{`     ┌───┬───┬───┐
     │ W │ W │ W │
     ├───┼───┼───┤
     │ W │ W │ W │
     ├───┼───┼───┤
     │ W │ W │ W │
┌───┬┴───┼───┼───┤───┬───┐
│ O │ O  │ G │ G │ G │ R │
├───┼────┼───┼───┤───┼───┤
│ O │ O  │ G │ G │ G │ R │
├───┼────┼───┼───┤───┼───┤
│ O │ O  │ G │ G │ G │ R │
├───┼────┼───┼───┤───┼───┤
     │ Y │ Y │ Y │
     ├───┼───┼───┤
     │ Y │ Y │ Y │
     ├───┼───┼───┤
     │ Y │ Y │ Y │
     └───┴───┴───┘`}
          </pre>
          <p className="text-xs text-gray-500 mt-2">
            This cube is solved, unlike this page...
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
