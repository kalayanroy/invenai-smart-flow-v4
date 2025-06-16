
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, TrendingUp, Zap } from 'lucide-react';

const insights = [
  {
    title: 'Demand Prediction Accuracy',
    value: 94,
    description: 'AI model accuracy for demand forecasting',
    icon: Target,
    color: 'blue'
  },
  {
    title: 'Cost Savings This Month',
    value: 87,
    description: '$42,000 saved through AI optimization',
    icon: TrendingUp,
    color: 'green'
  },
  {
    title: 'Automated Orders',
    value: 76,
    description: '76% of orders processed automatically',
    icon: Zap,
    color: 'purple'
  },
];

const recommendations = [
  {
    priority: 'High',
    title: 'Electronics Category Surge Detected',
    description: 'AI predicts 35% increase in electronics demand next month due to seasonal trends. Recommend increasing orders by 25%.',
    action: 'Adjust procurement',
    confidence: 92
  },
  {
    priority: 'Medium',
    title: 'Supplier Performance Alert',
    description: 'Supplier "TechCorp" showing declining delivery performance. Consider activating backup suppliers.',
    action: 'Review suppliers',
    confidence: 87
  },
  {
    priority: 'Low',
    title: 'Warehouse Layout Optimization',
    description: 'AI suggests relocating fast-moving items closer to dispatch area. Potential 15% efficiency gain.',
    action: 'Optimize layout',
    confidence: 78
  },
];

export const AIInsights = () => {
  return (
    <div className="space-y-6">
      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.title} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {insight.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${insight.color}-100`}>
                  <Icon className={`h-4 w-4 text-${insight.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">{insight.value}%</div>
                <Progress value={insight.value} className="mb-2" />
                <p className="text-sm text-gray-500">{insight.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>AI Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-sm text-gray-500">
                      {rec.confidence}% confidence
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  {rec.action} →
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
