import React from 'react';
import { CheckCircle, Clock, TrendingUp, BarChart3, Activity, Calendar, Target, Download } from 'lucide-react';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface StatisticsSummaryProps {
  className?: string;
}

export const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({ className = '' }) => {
  const implementedFeatures = [
    {
      icon: TrendingUp,
      title: 'Time Progression Charts',
      description: 'Track your improvement over time with Ao5, Ao12, and individual times',
      status: 'implemented',
      color: getAdaptiveClasses.semantic.info
    },
    {
      icon: BarChart3,
      title: 'Solve Distribution',
      description: 'Visualize your solve time distribution across different ranges',
      status: 'implemented',
      color: getAdaptiveClasses.semantic.success
    },
    {
      icon: Activity,
      title: 'Performance Trends',
      description: 'Advanced analytics with consistency metrics and period comparisons',
      status: 'implemented',
      color: getAdaptiveClasses.text.secondary
    },
    {
      icon: Target,
      title: 'Basic Statistics',
      description: 'Ao5, Ao12, Ao100, personal best, and time breakdowns',
      status: 'implemented',
      color: 'text-indigo-600'
    }
  ];

  const upcomingFeatures = [
    {
      icon: Calendar,
      title: 'Activity Heatmap',
      description: 'GitHub-style calendar showing daily solving activity',
      status: 'planned',
      color: 'text-orange-600'
    },
    {
      icon: Clock,
      title: 'CFOP Step Analysis',
      description: 'Detailed timing breakdown for Cross, F2L, OLL, and PLL steps',
      status: 'planned',
      color: getAdaptiveClasses.semantic.warning
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and track personal goals and milestones',
      status: 'planned',
      color: getAdaptiveClasses.semantic.error
    },
    {
      icon: Download,
      title: 'Data Export/Import',
      description: 'Export your statistics and import data from other timers',
      status: 'planned',
      color: 'text-adaptive-secondary'
    }
  ];

  return (
    <div className={cn('bg-adaptive-tertiary rounded-lg border border-adaptive-primary p-6', className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-adaptive-primary mb-2">
          📊 Statistics Enhancement Summary
        </h3>
        <p className="text-sm text-adaptive-secondary">
          Your statistics page has been upgraded with interactive charts and advanced analytics
        </p>
      </div>

      {/* Implemented Features */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-adaptive-primary mb-3 flex items-center gap-2">
          <CheckCircle className={cn('w-4 h-4', getAdaptiveClasses.semantic.success)} />
          ✅ Newly Implemented
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {implementedFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-start gap-3">
                <feature.icon className={`w-5 h-5 ${feature.color} mt-0.5`} />
                <div>
                  <h5 className="text-sm font-medium text-adaptive-primary">{feature.title}</h5>
                  <p className="text-xs text-adaptive-secondary mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Features */}
      <div>
        <h4 className="text-md font-medium text-adaptive-primary mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600" />
          🚀 Available for Future Implementation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-100 opacity-75">
              <div className="flex items-start gap-3">
                <feature.icon className={`w-5 h-5 ${feature.color} mt-0.5`} />
                <div>
                  <h5 className="text-sm font-medium text-adaptive-primary">{feature.title}</h5>
                  <p className="text-xs text-adaptive-tertiary mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-4 border-t border-adaptive-primary">
        <h4 className="text-sm font-medium text-adaptive-primary mb-2">🎯 How to Use</h4>
        <ul className="text-xs text-adaptive-secondary space-y-1">
          <li>• Use the puzzle type selector (2x2, 3x3, 4x4) to filter statistics</li>
          <li>• Toggle different metrics on charts using the checkboxes</li>
          <li>• Switch between daily, weekly, and monthly views in Performance Trends</li>
          <li>• Hover over chart points for detailed information</li>
          <li>• Charts automatically update when you complete new solves</li>
        </ul>
      </div>
    </div>
  );
};

export default StatisticsSummary;
