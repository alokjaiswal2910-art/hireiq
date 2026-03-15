"use client";

import { motion } from "framer-motion";
import { DifficultyBar } from "./DifficultyBar";
import { SkillBadge } from "@/components/shared/SkillBadge";

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  difficulty: number;
  skillTested: string;
}

export function QuestionCard({ question, questionNumber, difficulty, skillTested }: QuestionCardProps) {
  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 80, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -80, filter: 'blur(4px)' }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="glass-card p-6 w-full relative overflow-hidden"
    >
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center font-bold text-violet-300 font-syne border border-violet-500/30">
            Q{questionNumber}
          </div>
          <SkillBadge skill={skillTested} type="required" />
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Difficulty</span>
          <DifficultyBar level={difficulty} />
        </div>
      </div>

      {/* Actual Question */}
      <p className="text-white text-lg font-dm-sans font-light leading-relaxed relative z-10">
        {question}
      </p>
    </motion.div>
  );
}
