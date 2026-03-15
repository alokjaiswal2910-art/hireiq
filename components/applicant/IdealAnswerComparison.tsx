"use client";

import { motion } from "framer-motion";
import type { ScoreData } from "@/lib/types";

interface IdealAnswerComparisonProps {
  scoreData: ScoreData | null;
  userAnswer: string;
}

export function IdealAnswerComparison({ scoreData, userAnswer }: IdealAnswerComparisonProps) {
  if (!scoreData) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full font-dm-sans">
      
      {/* Left Column: Your Answer */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 25 }}
        className="flex-1 glass-card p-6 flex flex-col gap-4 border-t border-t-white/5"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          <h4 className="text-amber-400 font-syne font-bold text-sm">Your Answer</h4>
        </div>
        
        <p className="text-sm text-slate-300 font-light leading-relaxed italic border-l-2 border-white/10 pl-4 py-1">
          "{userAnswer}"
        </p>

        <div className="mt-4 flex flex-col gap-3 text-sm">
          {scoreData.strengths.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-emerald-400 font-bold font-syne flex items-center gap-1.5">
                <span className="text-base">💪</span> Strong:
              </span>
              <ul className="text-slate-300 pl-6 list-disc opacity-80 space-y-1">
                {scoreData.strengths.map((str, i) => <li key={i}>{str}</li>)}
              </ul>
            </div>
          )}
          
          {scoreData.improvements.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-amber-400 font-bold font-syne flex items-center gap-1.5">
                <span className="text-base">📈</span> Improve:
              </span>
              <ul className="text-slate-300 pl-6 list-disc opacity-80 space-y-1">
                {scoreData.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Right Column: Ideal Answer */}
      <motion.div
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 25 }}
        className="flex-1 glass-card p-6 flex flex-col gap-4 border-l-2 border-l-violet-500 bg-violet-500/[0.02]"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
            <h4 className="text-violet-400 font-syne font-bold text-sm">Ideal Answer</h4>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-syne border border-white/10 px-2 py-0.5 rounded-full">
            AI Generated
          </span>
        </div>
        
        <p className="text-sm text-slate-300 font-light leading-relaxed">
          {scoreData.ideal_answer}
        </p>
      </motion.div>

    </div>
  );
}
