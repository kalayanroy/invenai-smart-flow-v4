
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';

const alerts = [
  {
    id: 1,
    type: 'critical',
    title: 'Stock Out Alert',
    message: 'Garden Watering Can (SKU003) is out of stock',
    time: '5 min ago',
    action: 'Reorder Now'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Low Stock Warning',
    message: 'Cotton T-Shirt Blue has 12 units left',
    time: '15 min ago',
    action: 'Review Stock'
  },
  {
    id: 3,
    type: 'info',
    title: 'AI Prediction',
    message: 'Electronics demand will increase 35% next month',
    time: '1 hour ago',
    action: 'View Details'
  },
  {
    id: 4,
    type: 'success',
    title: 'Order Completed',
    message: 'Purchase order PO-2024-001 delivered successfully',
    time: '2 hours ago',
    action: 'Mark Complete'
  },
];

const upcomingTasks = [
  {
    task: 'Cycle count - Electronics section',
    due: 'Today, 3:00 PM',
    priority: 'High'
  },
  {
    task: 'Supplier review meeting',
    due: 'Tomorrow, 10:00 AM',
    priority: 'Medium'
  },
  {
    task: 'Monthly inventory report',
    due: 'Dec 30, 2024',
    priority: 'Low'
  },
];

export const AlertsPanel = () => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Smart Alerts</span>
            <Badge variant="secondary">{alerts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`border-l-4 p-3 rounded-r-lg ${getAlertColor(alert.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{task.task}</h4>
                  <p className="text-xs text-gray-500">{task.due}</p>
                </div>
                <Badge 
                  variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
