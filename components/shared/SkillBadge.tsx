"use client";

import { motion } from "framer-motion";

interface SkillBadgeProps {
  skill: string;
  type: 'matched' | 'missing' | 'required';
  delay?: number;
}

export function SkillBadge({ skill, type, delay = 0 }: SkillBadgeProps) {
  const styles = {
    matched: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300",
    missing: "bg-rose-500/10 border border-rose-500/30 text-rose-300",
    required: "bg-violet-500/10 border border-violet-500/30 text-violet-300"
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: delay 
      }}
      className={`px-3 py-1.5 rounded-lg text-xs font-dm-sans font-medium shadow-inner ${styles[type]}`}
    >
      {skill}
    </motion.span>
  );
}
