"use client";

import { motion } from "framer-motion";
import { AnimatedScore } from "./AnimatedScore";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import type { ScoreData } from "@/lib/types";

interface ScoreRevealProps {
  scoreData: ScoreData | null;
}

function MiniBar({ score }: { score: number }) {
  const percentage = (score / 10) * 100;
  const color = score >= 8 ? "bg-emerald-500" : score >= 5 ? "bg-amber-500" : "bg-rose-500";
  
  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-3">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className={`h-full ${color}`}
      />
    </div>
  );
}

export function ScoreReveal({ scoreData }: ScoreRevealProps) {
  if (!scoreData) return null;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="w-full glass-card p-6 md:p-8 relative overflow-hidden"
    >
      {/* Background glow tied to score score */}
      <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full opacity-10 pointer-events-none ${
        scoreData.score >= 8 ? "bg-emerald-500" : scoreData.score >= 5 ? "bg-amber-500" : "bg-rose-500"
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 relative z-10">
        <h3 className="font-syne font-bold text-white text-xl flex items-center gap-2">
          ✨ Answer Evaluated
        </h3>
        <div className={`px-4 py-1.5 rounded-full font-bold text-sm tracking-wider font-syne ${
          scoreData.score >= 8 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
          scoreData.score >= 5 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : 
          "bg-rose-500/20 text-rose-400 border border-rose-500/30"
        }`}>
          {scoreData.score}/10 Overall
        </div>
      </div>

      {/* Subscores Grid */}
      <div className="grid grid-cols-3 gap-4 md:gap-8 relative z-10">
        
        {/* Relevance */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center text-center"
        >
          <AnimatedScore score={scoreData.relevance_score} />
          <span className="text-xs text-slate-400 font-dm-sans uppercase tracking-wider mt-1">Relevance</span>
          <MiniBar score={scoreData.relevance_score} />
        </motion.div>

        {/* Depth */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center text-center border-l border-r border-white/5 px-2"
        >
          <AnimatedScore score={scoreData.depth_score} />
          <span className="text-xs text-slate-400 font-dm-sans uppercase tracking-wider mt-1">Technical Depth</span>
          <MiniBar score={scoreData.depth_score} />
        </motion.div>

        {/* Clarity */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <AnimatedScore score={scoreData.clarity_score} />
          <span className="text-xs text-slate-400 font-dm-sans uppercase tracking-wider mt-1">Clarity</span>
          <MiniBar score={scoreData.clarity_score} />
        </motion.div>

      </div>
    </motion.div>
  );
}
