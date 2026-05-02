'use client';

import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-medical-blue"
        />
        
        {/* Inner Symbol */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-5xl text-medical-navy"
        >
          ⚕
        </motion.div>
        
        {/* Pulsing Glow */}
        <div className="absolute inset-0 bg-medical-blue/20 rounded-full blur-2xl animate-pulse -z-10" />
      </div>
      
      <div className="absolute bottom-10 flex flex-col items-center">
        <p className="text-medical-navy font-bold tracking-widest text-sm uppercase">CMS Platform</p>
        <p className="text-slate-400 text-xs mt-1">Securing Health Infrastructure</p>
      </div>
    </div>
  );
}
