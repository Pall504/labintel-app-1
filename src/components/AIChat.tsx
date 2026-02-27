/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, LabReport } from '../types';
import { chatWithAIStream } from '../services/geminiService';

interface AIChatProps {
  report: LabReport;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ report, messages, setMessages, onClose }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      let assistantContent = "";
      const stream = chatWithAIStream(input, report, messages);
      
      // Add a placeholder for the assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      for await (const chunk of stream) {
        assistantContent += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
          return updated;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="flex flex-col h-[650px] w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(255,107,0,0.2)] border border-accent/10 overflow-hidden"
    >
      <div className="p-8 bg-gradient-to-br from-accent to-orange-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
            <Bot size={28} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight">LabIntel Assistant</h3>
            <div className="flex items-center gap-2 opacity-80">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <p className="text-[10px] uppercase font-bold tracking-widest">Real-time AI Active</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-full transition-all active:scale-90">
          <X size={24} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FDF7F2]/50 custom-scrollbar">
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-accent text-white' : 'bg-white text-accent border border-accent/10'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-tr-none' 
                  : 'bg-white text-ink rounded-tl-none border border-accent/5'
              }`}>
                {msg.content || (isLoading && idx === messages.length - 1 ? <Loader2 size={16} className="animate-spin opacity-50" /> : "")}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-accent/5">
        <div className="relative flex items-center gap-3">
          <div className="absolute left-4 text-accent opacity-40">
            <Sparkles size={18} />
          </div>
          <input
            type="text"
            placeholder="Ask anything about your health report..."
            className="flex-1 bg-accent/5 border border-accent/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-4 ring-accent/10 outline-none transition-all placeholder:text-accent/30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-accent text-white p-4 rounded-2xl hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale shadow-lg shadow-accent/20"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center mt-4 opacity-30 font-bold uppercase tracking-tighter">
          AI can make mistakes. Consult a doctor for medical advice.
        </p>
      </div>
    </motion.div>
  );
};
