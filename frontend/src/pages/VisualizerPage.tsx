import React, { useState } from 'react';
import CubeVisualizer from '../components/visualizer/CubeVisualizer';
import { cn, getAdaptiveClasses } from '../utils/appearanceUtils';

const VisualizerPage: React.FC = () => {
  const [algorithm, setAlgorithm] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={cn('text-3xl font-bold', getAdaptiveClasses.text.primary)}>
            🎲 3D Cube Visualizer
          </h1>
          <p className={cn('text-lg mt-2', getAdaptiveClasses.text.secondary)}>
            Visualize Rubik's cube algorithms in 3D with WCA standard colors and notation
          </p>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className={cn(
              'bg-white rounded-lg shadow-lg p-6 space-y-4',
              getAdaptiveClasses.background.primary
            )}>
              <h2 className={cn('text-xl font-semibold mb-4', getAdaptiveClasses.text.primary)}>
                Controls
              </h2>
              
              {/* Algorithm Input */}
              <div>
                <label 
                  htmlFor="algorithm" 
                  className={cn('block text-sm font-medium mb-2', getAdaptiveClasses.text.secondary)}
                >
                  Algorithm (WCA Notation)
                </label>
                <input
                  type="text"
                  id="algorithm"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  placeholder="R U R' U' R U R' F' R U R' U' R' F R"
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    getAdaptiveClasses.background.primary,
                    getAdaptiveClasses.text.primary
                  )}
                />
              </div>

              {/* Quick Algorithm Buttons */}
              <div className="space-y-2">
                <h3 className={cn('text-sm font-medium', getAdaptiveClasses.text.secondary)}>
                  Quick Algorithms
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: 'T-Perm', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
                    { name: 'J-Perm', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
                    { name: 'Sune', algorithm: "R U R' U R U2 R'" },
                    { name: 'Anti-Sune', algorithm: "R U2 R' U' R U' R'" },
                    { name: 'H-Perm', algorithm: "M2 U M2 U2 M2 U M2" },
                    { name: 'U-Perm', algorithm: "R U' R U R U R U' R' U' R2" }
                  ].map((alg) => (
                    <button
                      key={alg.name}
                      onClick={() => setAlgorithm(alg.algorithm)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-xs rounded-md',
                        'bg-gray-100 hover:bg-gray-200 transition-colors',
                        getAdaptiveClasses.text.secondary
                      )}
                    >
                      {alg.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notation Help */}
              <div className={cn(
                'mt-6 p-4 rounded-lg text-xs',
                getAdaptiveClasses.background.tertiary
              )}>
                <h3 className={cn('font-semibold mb-2', getAdaptiveClasses.text.primary)}>
                  WCA Notation
                </h3>
                <div className={cn('space-y-1', getAdaptiveClasses.text.secondary)}>
                  <div><strong>Basic:</strong> F R U L B D</div>
                  <div><strong>Counter:</strong> F' R' U' L' B' D'</div>
                  <div><strong>Double:</strong> F2 R2 U2 L2 B2 D2</div>
                  <div><strong>Wide:</strong> Fw Rw Uw Lw Bw Dw</div>
                  <div><strong>Slice:</strong> M E S</div>
                  <div><strong>Rotation:</strong> x y z</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Visualizer */}
          <div className="lg:col-span-3">
            <div className={cn(
              'bg-white rounded-lg shadow-lg overflow-hidden',
              getAdaptiveClasses.background.primary
            )}>
              <CubeVisualizer algorithm={algorithm} />
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={cn(
            'bg-white rounded-lg p-6 shadow-md',
            getAdaptiveClasses.background.primary
          )}>
            <h3 className={cn('text-lg font-semibold mb-2', getAdaptiveClasses.text.primary)}>
              Interactive 3D View
            </h3>
            <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>
              Rotate, zoom, and explore the cube from any angle. Click and drag to rotate, scroll to zoom.
            </p>
          </div>
          
          <div className={cn(
            'bg-white rounded-lg p-6 shadow-md',
            getAdaptiveClasses.background.primary
          )}>
            <h3 className={cn('text-lg font-semibold mb-2', getAdaptiveClasses.text.primary)}>
              WCA Standard Colors
            </h3>
            <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>
              Official World Cube Association color scheme with proper face mapping and realistic appearance.
            </p>
          </div>
          
          <div className={cn(
            'bg-white rounded-lg p-6 shadow-md',
            getAdaptiveClasses.background.primary
          )}>
            <h3 className={cn('text-lg font-semibold mb-2', getAdaptiveClasses.text.primary)}>
              Complete Notation Support
            </h3>
            <p className={cn('text-sm', getAdaptiveClasses.text.secondary)}>
              Full WCA notation including basic moves, wide turns, slice moves, and cube rotations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerPage;
