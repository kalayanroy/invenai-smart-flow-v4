
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';

const metrics = [
  {
    title: 'Total Products',
    value: '12,847',
    change: '+5.2%',
    trend: 'up',
    icon: Package,
    color: 'blue'
  },
  {
    title: 'Low Stock Items',
    value: '23',
    change: '-12%',
    trend: 'down',
    icon: AlertTriangle,
    color: 'orange'
  },
  {
    title: 'Inventory Value',
    value: '$2.4M',
    change: '+8.1%',
    trend: 'up',
    icon: DollarSign,
    color: 'green'
  },
  {
    title: 'Monthly Orders',
    value: '1,456',
    change: '+15.3%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'purple'
  },
];

export const MetricsOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === 'up';
        
        return (
          <Card key={metric.title} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                <Icon className={`h-4 w-4 text-${metric.color}-600`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="flex items-center space-x-1 mt-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
