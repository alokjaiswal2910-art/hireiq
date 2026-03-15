"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
}

export function TypingText({ texts, interval = 1500, className = "" }: TypingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          {texts[index]}
        </motion.p>
      </AnimatePresence>
      {/* Invisible placeholder to maintain height */}
      <p className="opacity-0 pointer-events-none">
        {texts.reduce((a, b) => (a.length > b.length ? a : b))}
      </p>
    </div>
  );
}
