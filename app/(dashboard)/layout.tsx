"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/shared/Sidebar";
import { PageTransition } from "@/components/global/page-transition";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col lg:flex-row w-full font-dm-sans">
      
      {/* Fixed Sidebar (Desktop only) */}
      <Sidebar />
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full bg-[#0A0A18] border-b border-white/5 p-4 flex items-center justify-between z-40 sticky top-0">
        <h1 className="font-syne font-bold text-xl gradient-text-animated">
          HireIQ
        </h1>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle navigation"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen 
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] z-50"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[260px] min-h-screen w-full relative">
        <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-10 w-full">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

    </div>
  );
}

