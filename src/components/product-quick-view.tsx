import { formatCurrency } from "@/lib/currency";
import * as Dialog from '@radix-ui/react-dialog';
import { X, Minus, Plus, Star, Heart, Clock, ShieldCheck, Leaf, Info } from 'lucide-react';
import type { Product } from '@/lib/enterprise-data';
import { DB } from '@/lib/enterprise-data';
import { useCart } from '@/lib/cart-store';
import { useState } from 'react';

export function ProductQuickView({ product, children }: { product: Product, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);

  const discount = product.compareAt 
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100) 
    : 0;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-[850px] translate-x-[-50%] translate-y-[-50%] bg-white/80 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-[32px] overflow-hidden flex flex-col md:flex-row data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-300 border border-white/50">
          
           {/* Left Image Section */}
           <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-gradient-to-br from-slate-50/50 to-slate-100/50 p-8 flex items-center justify-center">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
              
              <div className="absolute top-6 left-6 flex items-center gap-2">
                 <div className="bg-white/80 backdrop-blur-md text-[#2C2C2E] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50">
                   {DB.brands.findById(product.brandId)?.name || "Fresh Produce"}
                 </div>
                 {product.isOrganic && (
                    <div className="flex items-center gap-1 bg-emerald-100/80 backdrop-blur-md text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-emerald-200/50">
                      <Leaf className="size-3" /> Organic
                    </div>
                 )}
              </div>
           </div>

           {/* Right Content Section */}
           <div className="flex-1 flex flex-col max-h-[85vh] md:max-h-[600px] bg-white/50">
             
             {/* Header */}
             <div className="flex justify-end p-4 shrink-0">
               <Dialog.Close className="rounded-full p-2.5 bg-white/60 hover:bg-white shadow-sm border border-white/50 hover:scale-105 transition-all text-slate-500 hover:text-[#2C2C2E]">
                 <X className="size-5" />
               </Dialog.Close>
             </div>

             {/* Scrollable Details */}
             <div className="flex-1 overflow-y-auto px-8 pb-32 no-scrollbar">
                <h2 className="text-3xl font-bold text-[#2C2C2E] tracking-tight leading-tight">{product.name}</h2>
                <p className="text-sm font-semibold text-slate-500 mt-2">{product.weight} {product.unit}</p>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                   <div className="flex items-center gap-1.5 bg-amber-100 px-2.5 py-1 rounded-lg">
                      <Star className="size-4 text-amber-600" fill="currentColor" />
                      <span className="text-sm font-bold text-amber-700">{product.rating.toFixed(1)}</span>
                   </div>
                   <span className="text-sm font-medium text-slate-400 underline decoration-slate-300 underline-offset-4 cursor-pointer">
                      {product.reviews} reviews
                   </span>
                   <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Clock className="size-4 text-slate-500" />
                      {product.deliveryTime || "8 MINS"}
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-black/5 flex items-end gap-4">
                   <div className="flex flex-col">
                      {product.compareAt && (
                         <span className="text-sm text-slate-400 line-through font-medium">
                            {formatCurrency(product.compareAt)}
                         </span>
                      )}
                      <div className="flex items-center gap-3">
                         <span className="text-3xl font-bold text-[#2C2C2E]">
                            {formatCurrency(product.price)}
                         </span>
                         {discount > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                               {discount}% OFF
                            </span>
                         )}
                      </div>
                   </div>
                </div>

                {/* Additional Details */}
                <div className="mt-8 space-y-4">
                   <h3 className="text-lg font-semibold text-[#2C2C2E]">Product Details</h3>
                   <p className="text-sm text-slate-600 leading-relaxed">
                      {product.description}
                   </p>
                   
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <Info className="size-4 text-blue-500" /> Key Information
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-2">
                         <li className="flex justify-between">
                            <span className="text-slate-400">Brand</span>
                            <span className="font-medium text-[#2C2C2E]">{DB.brands.findById(product.brandId)?.name || "Local Farms"}</span>
                         </li>
                         <li className="flex justify-between">
                            <span className="text-slate-400">Country of Origin</span>
                            <span className="font-medium text-[#2C2C2E]">Local Farms</span>
                         </li>
                         <li className="flex justify-between">
                            <span className="text-slate-400">Storage</span>
                            <span className="font-medium text-[#2C2C2E]">Store in a cool, dry place</span>
                         </li>
                      </ul>
                   </div>
                </div>

                {/* Assurance */}
                <div className="mt-8 flex items-center gap-4 bg-emerald-50/50 backdrop-blur-sm p-5 rounded-2xl border border-emerald-100/50">
                   <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-50">
                      <ShieldCheck className="size-6 text-emerald-500" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-emerald-900">Premium Quality Assurance</span>
                      <span className="text-xs font-semibold text-emerald-700 mt-0.5">100% satisfaction guarantee</span>
                   </div>
                </div>
             </div>

             {/* Sticky Bottom Action Bar */}
             <div className="absolute bottom-0 right-0 w-full md:w-1/2 bg-white/80 backdrop-blur-xl border-t border-slate-100/50 p-6 flex items-center gap-4">
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl ring-1 ring-slate-100/50">
                   <button
                     onClick={() => setQty(q => Math.max(1, q - 1))}
                     className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm font-bold text-slate-700 hover:text-emerald-500 transition-all active:scale-95"
                   >
                     <Minus className="size-5" />
                   </button>
                   <span className="w-8 text-center font-bold text-[#2C2C2E] text-lg">{qty}</span>
                   <button
                     onClick={() => setQty(q => q + 1)}
                     className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm font-bold text-slate-700 hover:text-emerald-500 transition-all active:scale-95"
                   >
                     <Plus className="size-5" />
                   </button>
                </div>
                
                <button
                  onClick={() => {
                    add(product, qty);
                    setOpen(false);
                  }}
                  className="flex-1 bg-emerald-500 text-white h-[64px] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.35)] active:scale-95 text-lg"
                >
                  Add • {formatCurrency((product.price * qty))}
                </button>
             </div>
           </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

