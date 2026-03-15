"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface SecondaryButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

export function SecondaryButton({ children, className = "", ...props }: SecondaryButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: props.disabled ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      className={`bg-transparent border border-white/20 hover:bg-white/5 text-white px-8 py-4 rounded-xl font-medium text-center font-dm-sans disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
