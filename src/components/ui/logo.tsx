import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  withText?: boolean;
  withIcon?: boolean;
  layout?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
}

export function Logo({ 
  className, 
  variant = "dark", 
  withText = true,
  withIcon = true,
  layout = "vertical",
  size = "md"
}: LogoProps) {
  const textColor = variant === "dark" ? "text-[#2C2C2E]" : "text-white";
  const hColor = variant === "dark" ? "#0f172a" : "#ffffff";
  const leafColor = "#6ea853";

  // Size mappings
  const iconSizes = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24 md:h-32 md:w-32"
  };

  const textSizes = {
    sm: { main: "text-[18px]", sub: "text-[9px]", gap: "mt-0.5", dash: "w-3" },
    md: { main: "text-[26px]", sub: "text-[12px]", gap: "mt-1", dash: "w-4" },
    lg: { main: "text-[36px] md:text-[50px]", sub: "text-[14px] md:text-[18px]", gap: "mt-2", dash: "w-8 md:w-12" }
  };

  const s = textSizes[size];

  return (
    <div className={cn(
      "flex", 
      layout === "vertical" ? "flex-col items-center justify-center" : "flex-row items-center gap-2.5",
      className
    )}>
      {/* The H Mark */}
      {withIcon && (
        <div className={cn("relative flex items-center justify-center shrink-0", iconSizes[size])}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Left Pillar */}
            <rect x="25" y="15" width="16" height="70" fill={hColor} rx="2" />
            {/* Right Pillar */}
            <rect x="65" y="15" width="16" height="70" fill={hColor} rx="2" />
            
            {/* Crossbar with curve */}
            <path d="M 40 50 L 50 50 C 58 50, 60 45, 65 40 L 65 55 C 60 55, 55 58, 40 58 Z" fill={hColor} />
            
            {/* The Leaf */}
            <path 
              d="M 50 55 C 60 70, 85 60, 90 35 C 75 35, 60 45, 50 55 Z" 
              fill={leafColor} 
              stroke={variant === "dark" ? "#1a3d1a" : "#ffffff"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Leaf Inner Line */}
            <path d="M 52 53 C 65 52, 75 42, 85 38" fill="none" stroke={variant === "dark" ? "#1a3d1a" : "#ffffff"} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {withText && (
        <div className={cn(
          "flex flex-col",
          layout === "vertical" ? "items-center -mt-1" : "items-start justify-center"
        )}>
          <span className={cn("font-sans font-bold tracking-[0.3em] leading-none", s.main, textColor, layout === "vertical" ? "ml-[0.3em]" : "")}>
            HIMANSHU
          </span>
          <div className={cn("flex items-center gap-1.5", s.gap)}>
            {layout === "vertical" && <div className={cn("h-[1px] bg-[#6ea853]", s.dash)}></div>}
            <span className={cn("font-sans font-bold tracking-[0.4em] text-[#6ea853] leading-none", s.sub, layout === "vertical" ? "ml-[0.4em]" : "")}>
              STORE
            </span>
            {layout === "vertical" && <div className={cn("h-[1px] bg-[#6ea853]", s.dash)}></div>}
          </div>
        </div>
      )}
    </div>
  );
}

