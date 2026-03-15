"use client";

import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";

export default function RecruiterSettingsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.staggerContainer} className="flex flex-col gap-6 pb-12">
      <h1 className="font-syne font-bold text-2xl text-white">Settings</h1>
      <p className="text-slate-400 text-sm">Account settings (placeholder).</p>
    </motion.div>
  );
}
