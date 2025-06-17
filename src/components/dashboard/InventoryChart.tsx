
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProducts } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';

export const InventoryChart = () => {
  const { products } = useProducts();
  const isMobile = useIsMobile();

  // Prepare data for charts
  const stockData = products.slice(0, isMobile ? 6 : 10).map(product => ({
    name: isMobile ? product.name.substring(0, 8) + '...' : product.name,
    fullName: product.name,
    stock: product.current_stock,
    reorderLevel: product.reorder_level
  }));

  const categoryData = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + product.current_stock;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
      {/* Stock Levels Chart */}
      <Card>
        <CardHeader>
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>
            Current Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <BarChart data={stockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={isMobile ? 10 : 12}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 40}
              />
              <YAxis fontSize={isMobile ? 10 : 12} />
              <Tooltip 
                labelFormatter={(label, payload) => {
                  const item = stockData.find(d => d.name === label);
                  return item ? item.fullName : label;
                }}
                formatter={(value, name) => [value, name === 'stock' ? 'Current Stock' : 'Reorder Level']}
              />
              <Bar dataKey="stock" fill="#3B82F6" name="stock" />
              <Bar dataKey="reorderLevel" fill="#EF4444" name="reorderLevel" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>
            Stock by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  isMobile 
                    ? `${percent > 5 ? name.substring(0, 4) : ''}` 
                    : `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={isMobile ? 80 : 100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, `${name} Stock`]} />
            </PieChart>
          </ResponsiveContainer>
          {isMobile && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
