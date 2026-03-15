"use client";

import { motion } from "framer-motion";

interface DifficultyBarProps {
  level: number; // 1 to 10
}

export function DifficultyBar({ level }: DifficultyBarProps) {
  const totalSegments = 10;
  
  // Determine color theme based on level
  let colorClass = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"; // 7-10
  if (level <= 3) {
    colorClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
  } else if (level <= 6) {
    colorClass = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalSegments }).map((_, i) => {
        const isActive = i < level;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
            className={`w-[2px] h-4 rounded-full ${
              isActive ? colorClass : "bg-white/10"
            }`}
          />
        );
      })}
    </div>
  );
}
