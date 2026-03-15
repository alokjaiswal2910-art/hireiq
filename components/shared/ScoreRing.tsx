"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  className?: string;
}

export function ScoreRing({ score, size = 120, className = "" }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 8;
  const radius = (size / 2) - strokeWidth;
  const circumference = radius * 2 * Math.PI;

  // Color logic
  const getColor = (s: number) => {
    if (s >= 75) return "#10B981"; // Emerald
    if (s >= 50) return "#F59E0B"; // Amber
    return "#F43F5E"; // Rose
  };
  
  const color = getColor(score);
  
  // Calculate offset based on actual animated score instead of target score
  // This allows the ring to fill up simultaneously with the number counting
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let startTimestamp: number;
    const duration = 1500; // 1.5s
    
    // Ease Out Cubic
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      setAnimatedScore(Math.floor(easeOutCubic(progress) * score));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [score]);

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-20"
        style={{ backgroundColor: color }}
      />
      
      <svg
        className="transform -rotate-90 relative z-10"
        width={size}
        height={size}
      >
        {/* Background Track */}
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Progress Ring */}
        <circle
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: 'stroke-dashoffset 0.1s linear' // Smooth out the rAF steps slightly
          }}
          className="drop-shadow-lg"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute flex flex-col items-center justify-center font-syne font-bold z-20">
        <span className="text-3xl text-white" style={{ textShadow: `0 0 10px ${color}40` }}>
          {animatedScore}
        </span>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
          Score
        </span>
      </div>
    </div>
  );
}
