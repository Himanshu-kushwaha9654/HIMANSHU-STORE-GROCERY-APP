import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageCircle, Apple, CalendarDays, ChefHat, Scale, ShoppingCart, X, Send, Mic } from "lucide-react";
import { useSearchStore } from "@/lib/search-store";
import { aiService } from "@/lib/api/ai-service";
import { TypingIndicator } from "./ui/typing-indicator";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AiShoppingModal() {
  const { isAiShoppingOpen, setIsAiShoppingOpen } = useSearchStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAiShoppingOpen) {
        setIsAiShoppingOpen(false);
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isAiShoppingOpen, setIsAiShoppingOpen]);

  useEffect(() => {
    if (isAiShoppingOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isAiShoppingOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const prompts = [
    { text: "Plan a healthy weekly meal", icon: <Apple className="size-5" /> },
    { text: "Budget shopping for $50", icon: <Scale className="size-5" /> },
    { text: "Suggest a pasta recipe", icon: <ChefHat className="size-5" /> },
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const assistantMsgId = (Date.now() + 1).toString();
    const initialAiMsg: Message = { id: assistantMsgId, role: "assistant", content: "" };
    
    setMessages(prev => [...prev, newUserMsg, initialAiMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      if (!aiService.isReady()) {
         throw new Error("AI_NOT_CONFIGURED");
      }

      await aiService.streamMessage(text, (chunkText) => {
        setIsTyping(false);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMsgId ? { ...msg, content: chunkText } : msg
          )
        );
      });
      
    } catch (error: any) {
      console.error("AI Error:", error);
      setIsTyping(false);
      
      let errorMsg = "I'm having a little trouble connecting right now. Please try again later.";
      if (error.message === "AI_NOT_CONFIGURED") {
        errorMsg = "AI service is not configured. Please add your Gemini API key to .env.local to enable smart assistance.";
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: errorMsg } : msg
        )
      );
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate stopping recording after a few seconds
      setTimeout(() => {
        setIsRecording(false);
        handleSend("Can you recommend some fresh organic produce?");
      }, 3000);
    }
  };

  return (
    <AnimatePresence>
      {isAiShoppingOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 bg-slate-900/20"
            onClick={() => setIsAiShoppingOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full h-[85vh] sm:h-auto sm:max-h-[85vh] sm:max-w-md bg-white/70 backdrop-blur-3xl sm:rounded-[32px] rounded-t-[32px] shadow-[0_0_40px_rgba(0,0,0,0.1)] ring-1 ring-white/60 overflow-hidden flex flex-col"
            style={{ willChange: "transform" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 pb-4 border-b border-white/20 bg-white/40">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2C2C2E] tracking-tight leading-none">Grocery AI</h2>
                  <span className="text-xs text-slate-500 font-medium">Premium Concierge</span>
                </div>
              </div>
              <button 
                onClick={() => setIsAiShoppingOpen(false)}
                className="p-2 rounded-full bg-white/50 hover:bg-white/80 text-slate-500 transition-colors shadow-sm"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 scroll-smooth"
            >
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center mt-8 mb-4 space-y-6"
                >
                  <div className="size-16 rounded-full bg-gradient-to-tr from-indigo-100 to-pink-100 flex items-center justify-center text-purple-500 mb-2 ring-8 ring-white/50">
                    <MessageCircle className="size-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2C2C2E] mb-2">How can I help you today?</h3>
                    <p className="text-sm text-slate-500 max-w-[250px] mx-auto">Ask me to plan meals, find deals, or suggest recipes based on what's in store.</p>
                  </div>
                  
                  <div className="w-full flex flex-col gap-2 mt-4">
                    {prompts.map((prompt, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        onClick={() => handleSend(prompt.text)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/60 border border-white hover:border-purple-200 shadow-sm text-left transition-all"
                      >
                        <div className="text-purple-500">
                          {prompt.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{prompt.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={cn(
                      "flex w-full",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm",
                        msg.role === "user"
                          ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-br-sm"
                          : "bg-white/80 border border-white/40 text-slate-700 rounded-bl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex justify-start"
                  >
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/40 border-t border-white/20 pb-safe">
              <div className="relative flex items-end gap-2 bg-white/60 rounded-3xl p-2 ring-1 ring-slate-200/50 shadow-inner focus-within:ring-purple-300 focus-within:bg-white/90 transition-all">
                <div className="flex-1 max-h-32 overflow-y-auto min-h-[44px] flex items-center px-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(inputValue);
                      }
                    }}
                    placeholder="Ask anything..."
                    className="w-full bg-transparent border-none outline-none text-[15px] text-[#2C2C2E] placeholder:text-slate-400"
                  />
                </div>
                
                <div className="flex items-center gap-1">
                  <AnimatePresence mode="popLayout">
                    {inputValue.trim() ? (
                      <motion.button
                        key="send"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => handleSend(inputValue)}
                        className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-purple-500 text-white shadow-md hover:bg-purple-600 transition-colors"
                      >
                        <Send className="size-5 ml-1" />
                      </motion.button>
                    ) : (
                      <motion.button
                        key="mic"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={toggleRecording}
                        className={cn(
                          "relative flex size-[44px] shrink-0 items-center justify-center rounded-full transition-all duration-300 shadow-sm",
                          isRecording 
                            ? "bg-rose-500 text-white" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        {isRecording && (
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-rose-400"
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                        <Mic className="size-5 relative z-10" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">AI Assistant can make mistakes</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
