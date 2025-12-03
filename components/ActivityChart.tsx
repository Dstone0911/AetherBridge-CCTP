import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '10 AM', volume: 4000 },
  { name: '11 AM', volume: 3000 },
  { name: '12 PM', volume: 2000 },
  { name: '1 PM', volume: 2780 },
  { name: '2 PM', volume: 1890 },
  { name: '3 PM', volume: 2390 },
  { name: '4 PM', volume: 3490 },
  { name: '5 PM', volume: 6000 },
];

const ActivityChart: React.FC = () => {
  return (
    <div className="h-64 w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h3 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider">CCTP Bridge Volume (24h)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
            itemStyle={{ color: '#818cf8' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
          />
          <Area type="monotone" dataKey="volume" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;