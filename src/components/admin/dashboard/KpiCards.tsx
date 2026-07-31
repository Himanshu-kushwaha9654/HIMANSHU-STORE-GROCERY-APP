import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, IndianRupee, ShoppingCart, Users, PackageCheck } from "lucide-react";

interface KpiData {
  title: string;
  value: number;
  isCurrency?: boolean;
  growth: number;
  sparklineData: { value: number }[];
  icon: React.ReactNode;
  color: string;
}

const KPIS: KpiData[] = [
  {
    title: "Today's Revenue",
    value: 124500,
    isCurrency: true,
    growth: 14.5,
    color: "#10b981", // emerald
    icon: <IndianRupee className="size-5 text-emerald-600" />,
    sparklineData: [40, 30, 45, 55, 40, 65, 80],
  },
  {
    title: "Today's Orders",
    value: 845,
    growth: 8.2,
    color: "#3b82f6", // blue
    icon: <ShoppingCart className="size-5 text-blue-600" />,
    sparklineData: [20, 25, 20, 35, 40, 30, 45],
  },
  {
    title: "Active Customers",
    value: 12450,
    growth: 12.4,
    color: "#8b5cf6", // purple
    icon: <Users className="size-5 text-purple-600" />,
    sparklineData: [100, 120, 115, 140, 135, 150, 180],
  },
  {
    title: "Delivered Orders",
    value: 812,
    growth: -2.1,
    color: "#f59e0b", // amber
    icon: <PackageCheck className="size-5 text-amber-600" />,
    sparklineData: [80, 70, 75, 60, 65, 55, 50],
  }
];

function AnimatedCounter({ value, isCurrency }: { value: number, isCurrency?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500; // 1.5s
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * (value - startValue) + startValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  const formatted = isCurrency 
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(count)
    : new Intl.NumberFormat('en-IN').format(count);

  return <span>{formatted}</span>;
}

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {KPIS.map((kpi, idx) => {
        const isPositive = kpi.growth >= 0;
        
        return (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5, type: "spring" }}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="text-sm font-bold text-slate-400 mb-1">{kpi.title}</div>
                <div className="text-3xl font-black text-slate-800 tracking-tight">
                  <AnimatedCounter value={kpi.value} isCurrency={kpi.isCurrency} />
                </div>
              </div>
              <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center">
                {kpi.icon}
              </div>
            </div>

            <div className="flex items-end justify-between relative z-10">
              <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isPositive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                {Math.abs(kpi.growth)}%
                <span className="text-slate-400 font-medium ml-1">vs last week</span>
              </div>
            </div>

            {/* Sparkline Background */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpi.sparklineData.map(v => ({ value: v }))}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={kpi.color} 
                    strokeWidth={3} 
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
