"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FloatingInput({ label, id, ...props }: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  // If a value is provided via props or state, it's considered "active"
  const isActive = isFocused || hasValue || props.value;

  return (
    <div className="relative w-full mb-6">
      <motion.label
        htmlFor={id}
        initial={false}
        animate={{
          y: isActive ? -24 : 14,
          scale: isActive ? 0.85 : 1,
          color: isActive ? "#A78BFA" : "#94A3B8", // Violet-400 to slate-400
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute left-4 origin-top-left pointer-events-none z-10 font-dm-sans"
      >
        {label}
      </motion.label>
      <input
        id={id}
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(e.target.value.length > 0);
          props.onBlur?.(e);
        }}
        onChange={(e) => {
          setHasValue(e.target.value.length > 0);
          props.onChange?.(e);
        }}
        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white font-dm-sans focus:outline-none transition-colors duration-200 z-0 relative bg-transparent ${
          isFocused ? "border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.3)]" : "border-white/10"
        } ${props.className || ""}`}
      />
    </div>
  );
}
