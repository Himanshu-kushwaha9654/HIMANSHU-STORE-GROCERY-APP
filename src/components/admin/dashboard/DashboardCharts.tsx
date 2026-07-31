import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { motion } from 'framer-motion';

const REVENUE_DATA = [
  { name: 'Mon', revenue: 40000, orders: 240 },
  { name: 'Tue', revenue: 30000, orders: 139 },
  { name: 'Wed', revenue: 20000, orders: 980 },
  { name: 'Thu', revenue: 27800, orders: 390 },
  { name: 'Fri', revenue: 18900, orders: 480 },
  { name: 'Sat', revenue: 23900, orders: 380 },
  { name: 'Sun', revenue: 34900, orders: 430 },
];

const CATEGORY_DATA = [
  { name: 'Vegetables', sales: 4000 },
  { name: 'Fruits', sales: 3000 },
  { name: 'Dairy', sales: 2000 },
  { name: 'Snacks', sales: 2780 },
  { name: 'Beverages', sales: 1890 },
];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      
      {/* Revenue Chart (Spans 2 columns) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 lg:col-span-2 flex flex-col h-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Revenue Overview</h3>
          <select className="text-sm font-bold bg-slate-50 border-none outline-none text-slate-600 rounded-lg px-3 py-2 cursor-pointer">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                tickFormatter={(value) => `₹${value / 1000}k`}
                dx={-10}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                itemStyle={{ color: '#10b981' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Category Chart (Spans 1 column) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 flex flex-col h-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Top Categories</h3>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} 
                width={80}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                formatter={(value: number) => [value.toLocaleString(), 'Sales']}
              />
              <Bar 
                dataKey="sales" 
                fill="#3b82f6" 
                radius={[0, 4, 4, 0]} 
                barSize={24}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}
