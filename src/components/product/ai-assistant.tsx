import { Sparkles, ArrowRight, BotMessageSquare } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/enterprise-data";

interface AIAssistantProps {
  product: Product;
}

export function AIAssistant({ product }: AIAssistantProps) {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const prompts = [
    "Is this healthy?",
    "Can diabetics eat this?",
    "Protein content?",
    "Recipe ideas",
  ];

  const handleQuery = (text: string) => {
    setQuery(text);
    setIsTyping(true);
    setResponse(null);
    
    // Simulate backend AI processing
    setTimeout(() => {
      setIsTyping(false);
      setResponse(`This is a simulated AI response for "${text}" regarding ${product.name}. When the Spring Boot REST API is connected, this will return real insights from Gemini.`);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] p-8 border border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-indigo-500">
        <BotMessageSquare className="size-40" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-md">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2C2C2E]">Ask AI Assistant</h3>
            <p className="text-sm text-indigo-600/80 font-medium">Powered by Gemini</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => handleQuery(p)}
              className="px-4 py-2 rounded-full bg-white border border-indigo-100 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-all active:scale-95"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && query && handleQuery(query)}
            placeholder={`Ask anything about ${product.name}...`}
            className="flex-1 bg-white rounded-2xl px-6 py-4 border border-indigo-100 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-[#2C2C2E] font-medium placeholder:text-slate-400"
          />
          <button 
            onClick={() => query && handleQuery(query)}
            disabled={!query}
            className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
          >
            <ArrowRight className="size-5" />
          </button>
        </div>

        <AnimatePresence>
          {(isTyping || response) && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm"
            >
              {isTyping ? (
                <div className="flex items-center gap-2 text-indigo-500">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="size-2 rounded-full bg-current"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="size-2 rounded-full bg-current"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="size-2 rounded-full bg-current"
                  />
                  <span className="ml-2 text-sm font-medium">AI is thinking...</span>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-slate-700 leading-relaxed font-medium flex gap-3"
                >
                  <Sparkles className="size-5 text-indigo-500 shrink-0 mt-0.5" />
                  {response}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
