"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface SalesDataItem {
  productName: string;
  quantitySold: number;
  revenue: number;
  date: Date | null;
}

interface SalesDashboardProps {
  salesData: SalesDataItem[];
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ salesData }) => {
  const [topProducts, setTopProducts] = useState<SalesDataItem[]>([]);
  const [lowProducts, setLowProducts] = useState<SalesDataItem[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);

  const [productSummaries, setProductSummaries] = useState<
  { productName: string; quantitySold: number; revenue: number }[]
>([]);

  useEffect(() => {
     // 🧠 Group quantities and revenues by productName
  const productMap = new Map<string, { quantitySold: number; revenue: number }>();
  for (const item of salesData) {
    const prev = productMap.get(item.productName) || { quantitySold: 0, revenue: 0 };
    productMap.set(item.productName, {
      quantitySold: prev.quantitySold + item.quantitySold,
      revenue: prev.revenue + item.revenue,
    });
  }

  // 🔄 Convert to array for sorting
  const aggregatedProducts = Array.from(productMap.entries()).map(([productName, data]) => ({
    productName,
    quantitySold: data.quantitySold,
    revenue: data.revenue,
    date: null,
  }));

  // 🔝 Sort for top and low
  const sorted = [...aggregatedProducts].sort((a, b) => b.quantitySold - a.quantitySold);
  setTopProducts(sorted.slice(0, 3));
  setLowProducts(sorted.slice(-3));
  setProductSummaries(sorted); //
  // 📈 Group revenue by date
  const grouped = salesData.reduce((acc: Record<string, number>, curr) => {
    if (curr.date instanceof Date && !isNaN(curr.date.getTime())) {
      const formatted = format(curr.date, "yyyy-MM-dd");
      acc[formatted] = (acc[formatted] || 0) + curr.revenue;
    }
    return acc;
  }, {});

  const revenueList = Object.entries(grouped)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  setRevenueData(revenueList);
  }, [salesData]);

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Total Revenue + Charts */}
        <div className="md:col-span-2 space-y-6">
          {/* Total Revenue */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-xl font-semibold mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600 mb-2">
              SAR {totalRevenue.toFixed(2)}
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <XAxis dataKey="date" tick={{ fill: '#888' }}/>
                <Tooltip contentStyle={{ borderRadius: 8, backgroundColor: '#fff', border: 'none' }} />
                <Line
                  type="basis"
                  dataKey="revenue"
                  dot={false}
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
  
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best-Selling */}
            <div className="bg-white p-4 shadow rounded">
              <h3 className="text-lg font-semibold mb-3">Best-Selling Products</h3>
              <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topProducts}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0.3} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="productName" tick={false} axisLine={false} />
                <YAxis tick={{ fill: '#888' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantitySold" fill="url(#greenGradient)" barSize={40} radius={[4, 4, 0, 0]} />
            </BarChart>
              </ResponsiveContainer>
            </div>
  
            {/* Least-Selling */}
            <div className="bg-white p-4 shadow rounded">
              <h3 className="text-lg font-semibold mb-3">Least-Selling Products</h3>
              <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={lowProducts}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                <defs>
                    <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0.3} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="productName" tick={false} axisLine={false} />
                <YAxis tick={{ fill: '#888' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantitySold" fill="url(#redGradient)" barSize={40} radius={[4, 4, 0, 0]} />
            </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
  
        {/* Menu Sales */}
        <div className="bg-white p-4 shadow rounded h-fit max-h-[605px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Menu Sales</h3>
          <div className="space-y-2">
            {productSummaries.map((item, index) => (
              <div
                key={index}
                className="flex justify-between border-b pb-1 text-sm"
              >
                <span className="truncate w-2/3">{item.productName}</span>
                <span className="font-semibold text-green-600">
                  SAR {item.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;