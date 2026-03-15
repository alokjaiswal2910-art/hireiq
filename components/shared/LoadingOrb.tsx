"use client";

import { motion } from "framer-motion";
import { ASSETS } from "@/lib/constants";

interface LoadingOrbProps {
  size?: number;
  className?: string;
}

export function LoadingOrb({ size = 96, className = "" }: LoadingOrbProps) {
  return (
    <div 
      className={`relative mix-blend-screen opacity-90 ${className}`}
      style={{ width: size, height: size }}
    >
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="w-full h-full object-contain"
        style={{ mixBlendMode: 'screen' }}
        src={ASSETS.animations.loadingOrb}
      />
    </div>
  );
}
