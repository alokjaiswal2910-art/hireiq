"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

function SkeletonBase({ className = "" }: SkeletonProps) {
  return (
    <div 
      className={`bg-white/5 overflow-hidden relative ${className}`}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ translateX: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      />
    </div>
  );
}

export const Skeleton = {
  Card: ({ className = "" }: SkeletonProps) => (
    <SkeletonBase className={`rounded-2xl ${className}`} />
  ),
  Text: ({ className = "" }: SkeletonProps) => (
    <SkeletonBase className={`rounded h-4 ${className}`} />
  ),
  Avatar: ({ className = "" }: SkeletonProps) => (
    <SkeletonBase className={`rounded-full ${className}`} />
  )
};
