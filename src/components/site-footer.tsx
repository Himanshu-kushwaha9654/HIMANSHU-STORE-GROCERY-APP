import { Mail, ArrowRight, Leaf } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-[#0a1f15] px-4 py-16 sm:px-6">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[40%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] -left-[10%] w-[30%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 mx-auto grid max-w-[1750px] w-[96%] gap-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Column */}
        <div className="space-y-6 lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              HIMANSHU STORE<span className="text-emerald-500">.</span>
            </span>
          </Link>
          <p className="max-w-[28ch] text-sm leading-relaxed text-emerald-100/70">
            The modern way to stock your kitchen. Sustainable, local produce
            delivered in under 15 minutes.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-100/70 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-white/5">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-100/70 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-white/5">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-100/70 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-white/5">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>

        {/* Platform Links */}
        <div className="space-y-6">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Platform
          </h4>
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <a className="text-emerald-100/70 hover:text-white hover:translate-x-1 transition-all" href="#">Our Farmers</a>
            <a className="text-emerald-100/70 hover:text-white hover:translate-x-1 transition-all" href="#">Delivery Zones</a>
            <a className="text-emerald-100/70 hover:text-white hover:translate-x-1 transition-all" href="#">Partner with Us</a>
            <a className="text-emerald-100/70 hover:text-white hover:translate-x-1 transition-all" href="#">Help Center</a>
          </nav>
        </div>

        {/* Company Links */}
        <div className="space-y-6">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Company
          </h4>
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <a className="text-emerald-100/70 hover:text-white hover:translate-x-1 transition-all" href="#">About Us</a>
            <a className="text-emerald-100/70 hover:text-white hover:translate-x-1 transition-all" href="#">Careers</a>
            <a className="text-emerald-100/70 hover:text-white hover:translate-x-1 transition-all" href="#">Press</a>
            <a className="text-emerald-100/70 hover:text-white hover:translate-x-1 transition-all" href="#">Contact</a>
          </nav>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-6 lg:col-span-1">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Newsletter
          </h4>
          <p className="text-sm text-emerald-100/70">
            Seasonal recipes and exclusive flash deals in your inbox.
          </p>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-emerald-100/40" />
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                className="h-12 w-full rounded-xl bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-emerald-100/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-500 transition-shadow backdrop-blur-md"
              />
            </div>
            <button
              type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:bg-emerald-400 hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Join Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-16 flex max-w-[1750px] w-[96%] flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
        <p className="text-xs text-emerald-100/50">
          © {new Date().getFullYear()} Himanshu Store. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-xs text-emerald-100/50 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-emerald-100/50 hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
