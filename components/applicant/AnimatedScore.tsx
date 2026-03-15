"use client";

import { useState, useEffect } from "react";

interface AnimatedScoreProps {
  score: number;
}

export function AnimatedScore({ score }: AnimatedScoreProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number;
    // 80ms per tick is roughly 0.08 * 10 = 0.8s for a score of 10. Let's make it fixed duration.
    const duration = 1000; 

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.min(Math.floor(easeOut * 10), score)); // Max 10 logically for this component based on instructions
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [score]);

  const color = count >= 8 ? "text-emerald-400" : count >= 5 ? "text-amber-400" : "text-rose-400";

  return (
    <span className={`font-syne font-bold text-2xl ${color}`}>
      {count}/10
    </span>
  );
}
