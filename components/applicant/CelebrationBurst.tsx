"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ASSETS } from "@/lib/constants";

export function CelebrationBurst() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 w-full h-full z-50 pointer-events-none flex items-center justify-center mix-blend-screen"
        >
          <Image 
            src={ASSETS.animations.celebration} 
            alt="Celebration" 
            fill 
            className="object-cover"
            unoptimized
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
