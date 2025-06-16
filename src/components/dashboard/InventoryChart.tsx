
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const demandData = [
  { month: 'Jan', actual: 2400, predicted: 2200, optimal: 2300 },
  { month: 'Feb', actual: 1398, predicted: 1400, optimal: 1350 },
  { month: 'Mar', actual: 9800, predicted: 9500, optimal: 9600 },
  { month: 'Apr', actual: 3908, predicted: 4000, optimal: 3950 },
  { month: 'May', actual: 4800, predicted: 4700, optimal: 4750 },
  { month: 'Jun', actual: 3800, predicted: 3900, optimal: 3850 },
];

const categoryData = [
  { category: 'Electronics', stock: 4500, reorder: 1200 },
  { category: 'Clothing', stock: 3200, reorder: 800 },
  { category: 'Home & Garden', stock: 2800, reorder: 600 },
  { category: 'Sports', stock: 1900, reorder: 400 },
  { category: 'Books', stock: 1500, reorder: 300 },
];

export const InventoryChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Demand Forecasting */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>AI Demand Forecasting</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">AI Powered</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Actual Demand"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="AI Prediction"
              />
              <Line 
                type="monotone" 
                dataKey="optimal" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Optimal Stock"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stock Levels by Category */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Stock Levels by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#3b82f6" name="Current Stock" />
              <Bar dataKey="reorder" fill="#ef4444" name="Reorder Point" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
