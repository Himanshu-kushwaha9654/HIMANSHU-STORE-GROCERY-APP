import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Home, Carrot, Apple, Milk, Cookie, LayoutGrid, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

// Types
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "veg", label: "Vegetables", icon: Carrot, href: "/category/vegetables" },
  { id: "fruits", label: "Fruits", icon: Apple, href: "/category/fruits" },
  { id: "dairy", label: "Dairy", icon: Milk, href: "/category/dairy" },
  { id: "snacks", label: "Snacks", icon: Cookie, href: "/category/snacks" },
  { id: "rewards", label: "Rewards", icon: Sparkles, href: "/rewards" },
  { id: "all", label: "More", icon: LayoutGrid, href: "/category/all" },
];

export function MacDockNav() {
  const mouseX = useMotionValue(Infinity);
  const [activeTab, setActiveTab] = useState("home");

  return (
    <motion.nav
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-[2rem] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 mx-auto w-fit mt-4 relative z-50"
    >
      {navItems.map((item) => (
        <DockItem 
          key={item.id} 
          item={item} 
          mouseX={mouseX} 
          isActive={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
        />
      ))}
    </motion.nav>
  );
}

function DockItem({ item, mouseX, isActive, onClick }: { item: NavItem, mouseX: any, isActive: boolean, onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  // Measure distance from cursor to center of this element
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Calculate exact width for spacing physics
  const widthSync = useTransform(distance, [-150, 0, 150], [70, 100, 70]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });
  
  // Calculate scale for contents
  const scaleSync = useTransform(distance, [-150, 0, 150], [1, 1.35, 1]);
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <Link to={item.href} className="outline-none block">
      <motion.div
        ref={ref}
        style={{ width }}
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center gap-1.5 h-[70px] rounded-[1.25rem] cursor-pointer outline-none transition-colors duration-300
          ${isActive ? 'bg-primary/5 border border-primary/10' : 'bg-transparent border border-transparent hover:bg-white/50'}
        `}
      >
        <motion.div style={{ scale }} className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
          <item.icon className={`size-5 ${isActive ? 'text-primary' : 'text-slate-500'}`} strokeWidth={isActive ? 2.5 : 2} />
          <span className={`text-[11px] font-bold tracking-tight ${isActive ? 'text-primary' : 'text-slate-600'}`}>
            {item.label}
          </span>
        </motion.div>
        
        {/* Liquid glowing underline */}
        {isActive && (
          <motion.div
            layoutId="dock-indicator"
            className="absolute -bottom-1 w-[40%] h-[3px] bg-primary rounded-full shadow-[0_0_12px_rgba(16,185,129,1)]"
            initial={false}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
}
