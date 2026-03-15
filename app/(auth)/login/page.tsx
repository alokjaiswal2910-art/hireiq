"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FloatingInput } from "@/components/shared/FloatingInput";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { signIn } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      // redirect() throws NEXT_REDIRECT — success
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.fadeIn}
      className="w-full"
    >
      <h1 className="font-syne font-bold text-[32px] gradient-text-animated mb-2">
        HireIQ
      </h1>
      <h2 className="font-syne font-bold text-white text-[28px] mb-1">
        Welcome back
      </h2>
      <p className="font-dm-sans text-slate-400 text-sm mb-8">
        Sign in to your account
      </p>

      <form onSubmit={handleSubmit}>
        <motion.div
          animate={shake ? { x: [0, -8, 8, -8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <FloatingInput id="email-login" type="email" name="email" label="Email Address" />
          <FloatingInput id="password-login" type="password" name="password" label="Password" />
        </motion.div>

        <div className="w-full flex justify-end mb-6 -mt-2">
          <Link href="#" className="font-dm-sans text-violet-400 text-sm hover:text-violet-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-sm font-dm-sans mb-3 px-1">
            {error}
          </motion.p>
        )}

        <PrimaryButton type="submit" disabled={loading} className="w-full mb-8">
          {loading ? "Signing in..." : "Sign In"}
        </PrimaryButton>
      </form>

      <div className="flex items-center justify-center mb-8">
        <div className="h-px bg-white/10 flex-grow" />
        <span className="px-4 text-slate-500 font-dm-sans text-sm">— or —</span>
        <div className="h-px bg-white/10 flex-grow" />
      </div>

      <p className="text-center font-dm-sans text-slate-400 text-sm">
        Don&#39;t have an account?{" "}
        <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}
