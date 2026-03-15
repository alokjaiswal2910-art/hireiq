"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface PrimaryButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

export function PrimaryButton({ children, className = "", ...props }: PrimaryButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: props.disabled ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      className={`relative group overflow-hidden bg-gradient-to-r from-violet-600 to-violet-500 text-white px-8 py-4 rounded-xl font-medium font-dm-sans disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {!props.disabled && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_forwards] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}
    </motion.button>
  );
}
