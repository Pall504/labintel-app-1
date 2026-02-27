/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicalTrial } from '../types';

interface TrialContactModalProps {
  trial: ClinicalTrial;
  onClose: () => void;
}

export const TrialContactModal: React.FC<TrialContactModalProps> = ({ trial, onClose }) => {
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: `I am interested in participating in the clinical trial: ${trial.name}. Please provide more information regarding eligibility and next steps.`
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ink/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-accent/10"
      >
        <div className="p-8 bg-accent text-white flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold mb-2">Contact Research Team</h3>
            <p className="text-sm opacity-80 font-medium">{trial.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {isSent ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h4 className="text-xl font-bold mb-2">Inquiry Sent!</h4>
              <p className="text-ink/60 text-sm">The research team will contact you shortly.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                  <Mail className="text-accent" size={20} />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-40">Email</p>
                    <p className="text-sm font-bold">{trial.contact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                  <MapPin className="text-accent" size={20} />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-40">Location</p>
                    <p className="text-sm font-bold">{trial.location}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase opacity-40 ml-1">Your Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-bg/50 border border-line/10 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent/20 outline-none"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase opacity-40 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-bg/50 border border-line/10 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent/20 outline-none"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase opacity-40 ml-1">Message</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-bg/50 border border-line/10 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent/20 outline-none resize-none"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-accent/20"
                >
                  <Send size={18} />
                  Send Inquiry
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
