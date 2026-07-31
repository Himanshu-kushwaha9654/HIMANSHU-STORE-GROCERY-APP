import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, Star, Truck, Leaf, ArrowRight } from "lucide-react";
import { AuthService } from "@/lib/services/auth-service";
import { lovable } from "@/integrations/lovable/index";
import { motion, AnimatePresence } from "framer-motion";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Himanshu Store" },
      { name: "description", content: "Sign in or create your Himanshu Store account to shop fresh groceries." },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(80),
  loginId: z.string().trim().min(5, "Email or Mobile Number is required").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .max(72),
});

const signInSchema = z.object({
  loginId: z.string().trim().min(5, "Email or Mobile Number is required").max(255),
  password: z.string().min(1, "Password required").max(72),
});

function FloatingGroceries({ mouseX, mouseY }: { mouseX: number, mouseY: number }) {
  const items = [
    { emoji: "🍎", size: "text-5xl", top: "15%", left: "15%", delay: 0, duration: 8, speed: 40 },
    { emoji: "🥬", size: "text-7xl", top: "60%", left: "8%", delay: 1, duration: 10, speed: 60 },
    { emoji: "🍊", size: "text-5xl", top: "25%", left: "85%", delay: 2, duration: 9, speed: 30 },
    { emoji: "🥛", size: "text-6xl", top: "75%", left: "75%", delay: 0.5, duration: 11, speed: 50 },
    { emoji: "🥖", size: "text-6xl", top: "12%", left: "65%", delay: 1.5, duration: 12, speed: 45 },
    { emoji: "☕", size: "text-4xl", top: "85%", left: "30%", delay: 3, duration: 7, speed: 35 },
    // Added more veggies
    { emoji: "🥦", size: "text-5xl", top: "40%", left: "12%", delay: 0.2, duration: 9, speed: 35 },
    { emoji: "🍅", size: "text-6xl", top: "80%", left: "50%", delay: 1.2, duration: 11, speed: 40 },
    { emoji: "🥕", size: "text-5xl", top: "30%", left: "45%", delay: 2.5, duration: 8, speed: 55 },
    { emoji: "🫑", size: "text-5xl", top: "50%", left: "90%", delay: 0.8, duration: 10, speed: 45 },
    { emoji: "🧅", size: "text-4xl", top: "15%", left: "40%", delay: 1.8, duration: 9, speed: 30 },
    { emoji: "🥒", size: "text-6xl", top: "65%", left: "35%", delay: 3.2, duration: 12, speed: 50 },
    { emoji: "🥑", size: "text-5xl", top: "45%", left: "60%", delay: 2.1, duration: 8, speed: 38 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {items.map((item, i) => {
        // Calculate smooth parallax offset
        const xOffset = (mouseX - 0.5) * item.speed;
        const yOffset = (mouseY - 0.5) * item.speed;

        return (
          <motion.div
            key={i}
            className={`absolute ${item.size} drop-shadow-2xl filter`}
            style={{ top: item.top, left: item.left }}
            animate={{
              x: xOffset,
              y: [yOffset, yOffset - 20, yOffset],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              y: { duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: item.delay },
              rotate: { duration: item.duration * 1.5, repeat: Infinity, ease: "easeInOut", delay: item.delay },
              x: { type: "spring", stiffness: 40, damping: 20 },
            }}
          >
            {item.emoji}
          </motion.div>
        );
      })}
    </div>
  );
}

function Badge({ icon, text, delay }: { icon: React.ReactNode, text: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, x: 5 }}
      className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl w-fit shadow-lg cursor-default group"
    >
      <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
        {icon}
      </div>
      <span className="text-white font-bold tracking-wide">{text}</span>
    </motion.div>
  );
}

function AuthPage() {
  const search = useSearch({ from: "/login" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [fullName, setFullName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirectTo = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/";

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const session = AuthService.getSession();
    if (session) {
      if (session.role === "ADMIN") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: redirectTo });
      }
    }
  }, [navigate, redirectTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ fullName, loginId, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const session = await AuthService.authenticate(parsed.data.loginId, parsed.data.password, parsed.data.fullName);
        toast.success("Welcome to Himanshu Store!");
        
        if (session.role === "ADMIN") navigate({ to: "/admin" });
        else navigate({ to: redirectTo });
      } else {
        const parsed = signInSchema.safeParse({ loginId, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const session = await AuthService.authenticate(parsed.data.loginId, parsed.data.password);
        toast.success("Signed in");
        
        if (session.role === "ADMIN") navigate({ to: "/admin" });
        else navigate({ to: redirectTo });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      navigate({ to: redirectTo });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleForgot() {
    if (!loginId || loginId.length < 5) {
      toast.error("Enter your email or mobile above first");
      return;
    }
    toast.success("Check your email for a reset link");
  }

  return (
    <div className="min-h-screen w-full flex bg-[#F9F7F4] font-sans selection:bg-emerald-200">
      
      {/* Left side - 58% Desktop, 45% Tablet Hero */}
      <div className="hidden md:flex md:w-[45%] lg:w-[58%] relative overflow-hidden items-center justify-center bg-emerald-950">
        
        {/* Cinematic Parallax Background */}
        <motion.div 
          className="absolute inset-0 scale-110"
          animate={{
            x: (mousePos.x - 0.5) * -40,
            y: (mousePos.y - 0.5) * -40,
            scale: 1.05
          }}
          transition={{ type: "spring", stiffness: 30, damping: 25 }}
        >
          {/* Using a bright modern kitchen background with wooden countertop */}
          <img 
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" 
            alt="Beautiful modern kitchen with groceries" 
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient overlay to ensure text readability while keeping the bright vibe */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-transparent mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-emerald-900/20"></div>
        </motion.div>
        
        <FloatingGroceries mouseX={mousePos.x} mouseY={mousePos.y} />

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-2xl px-12 lg:px-20 mt-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl inline-flex mb-8 border border-white/20 shadow-xl">
                <span className="text-2xl font-bold tracking-tighter text-white">himanshu<span className="text-emerald-400">store</span></span>
              </div>

              <h1 className="text-5xl lg:text-[4.5rem] font-bold text-white leading-[1.05] mb-6 tracking-tight drop-shadow-xl">
                Fresh Groceries,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-100">
                  Delivered Faster.
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-emerald-50/90 font-medium max-w-lg leading-relaxed mb-10 drop-shadow-md">
                Shop from over 5,000+ premium grocery products with lightning-fast delivery, fresh quality, and unbeatable prices.
              </p>

              <div className="flex flex-col gap-4">
                <Badge icon={<Truck className="size-5 text-emerald-300" />} text="10 Minute Delivery" delay={0.5} />
                <Badge icon={<Leaf className="size-5 text-emerald-300" />} text="100% Farm Fresh" delay={0.6} />
                <Badge icon={<Star className="size-5 text-amber-300" />} text="Trusted by Thousands" delay={0.7} />
              </div>
            </motion.div>
        </div>
      </div>

      {/* Right side - Form (100% Mobile, 55% Tablet, 42% Desktop) */}
      <div className="w-full md:w-[55%] lg:w-[42%] flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto">
        
        {/* Mobile Header Banner */}
        <div className="md:hidden w-full relative h-[240px] rounded-[2rem] overflow-hidden mb-8 shadow-xl mt-4 shrink-0">
           <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Groceries" />
           <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 to-emerald-800/40"></div>
           <div className="absolute bottom-6 left-6 z-10 pr-6">
             <h1 className="text-3xl font-bold text-white leading-tight mb-2 tracking-tight">
               Fresh Groceries,<br/><span className="text-emerald-300">Delivered Faster.</span>
             </h1>
             <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
               <Star className="size-3 text-amber-300" /> Trusted by 2M+ users
             </div>
           </div>
        </div>

        {/* Floating Glassmorphism Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 45 }}
          className="w-full max-w-[420px] bg-white/70 backdrop-blur-2xl p-8 lg:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white relative z-10"
        >
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-[#2C2C2E] mb-3">
              {mode === "signup" ? "Create an account" : "Welcome Back 👋"}
            </h2>
            <p className="text-slate-500 font-medium">
              {mode === "signup" ? "Start shopping fresh groceries in seconds." : "Enter your details to access your account."}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold h-14 rounded-2xl border border-slate-200 shadow-sm transition-colors disabled:opacity-60 mb-6 group"
          >
            {googleLoading ? <Loader2 className="size-5 animate-spin" /> : <GoogleIcon />}
            <span className="group-hover:text-[#2C2C2E] transition-colors">Continue with Google</span>
          </motion.button>

          <div className="relative flex items-center py-4 mb-2">
            <div className="flex-grow border-t border-slate-200/80"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">OR</span>
            <div className="flex-grow border-t border-slate-200/80"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-bold text-slate-700 px-1 uppercase tracking-wide">Full Name</label>
                  <Field icon={<UserIcon className="size-5" />}>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent text-[15px] font-semibold outline-none placeholder:text-slate-400 text-[#2C2C2E]"
                      autoComplete="name"
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 px-1 uppercase tracking-wide">Email or Mobile Number</label>
              <Field icon={<Mail className="size-5" />}>
                <input
                  type="text"
                  placeholder="you@example.com or +91..."
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-transparent text-[15px] font-semibold outline-none placeholder:text-slate-400 text-[#2C2C2E]"
                  autoComplete="username"
                  required
                />
              </Field>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                {mode === "signin" && (
                  <button type="button" onClick={handleForgot} className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline transition-colors">
                    Forgot Password
                  </button>
                )}
              </div>
              <Field icon={<Lock className="size-5" />}>
                <input
                  type="password"
                  placeholder={mode === "signup" ? "Create a password (8+ chars)" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-[15px] font-semibold outline-none placeholder:text-slate-400 text-[#2C2C2E]"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                />
              </Field>
            </div>

            {mode === "signin" && (
              <div className="flex items-center gap-2 px-1 py-2">
                <input type="checkbox" id="remember" className="rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 w-4 h-4 cursor-pointer" />
                <label htmlFor="remember" className="text-sm font-semibold text-slate-600 cursor-pointer select-none">Remember Me</label>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold h-14 rounded-2xl shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.4)] transition-all disabled:opacity-60 overflow-hidden relative group"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-white/20 skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>
              
              <span className="relative z-10 flex items-center gap-2">
                {submitting ? <Loader2 className="size-5 animate-spin" /> : null}
                {mode === "signup" ? "Create Account" : "Sign In"}
                {!submitting && <ArrowRight className="size-5 opacity-80" />}
              </span>
            </motion.button>
          </form>

          <p className="mt-8 text-center text-[15px] font-medium text-slate-500">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              {mode === "signup" ? "Sign in" : "Create Account"}
            </button>
          </p>
          
          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to Store
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {/* Animated glowing border effect */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-emerald-400 to-teal-400 rounded-[18px] blur-[6px] opacity-0 group-focus-within:opacity-40 transition-opacity duration-500"></div>
      
      <div className="relative flex h-14 items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm px-4 border border-slate-200/80 focus-within:border-emerald-500/50 focus-within:bg-white transition-all shadow-sm">
        <span className="text-slate-400 group-focus-within:text-emerald-500 transition-colors">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.2 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.6-4.8 7.3l7.4 5.8c4.3-4 6.8-9.9 6.8-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.7 2.3-8.5 2.3-6.3 0-11.6-3.7-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

