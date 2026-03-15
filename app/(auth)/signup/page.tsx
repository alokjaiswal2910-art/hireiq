"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FloatingInput } from "@/components/shared/FloatingInput";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { signUp } from "@/app/actions/auth";

type RoleSelection = "recruiter" | "applicant" | null;

export default function SignupPage() {
  const [role, setRole] = useState<RoleSelection>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role) { setError("Please select a role"); return; }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('role', role);

    try {
      const result = await signUp(formData);
      // If we get here, redirect didn't happen → there's an error
      if (result?.error) setError(result.error);
    } catch {
      // redirect() throws NEXT_REDIRECT — this is normal and means success
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.fadeIn}
      className="w-full pt-4"
    >
      <h1 className="font-syne font-bold text-[32px] gradient-text-animated mb-2">
        HireIQ
      </h1>
      <h2 className="font-syne font-bold text-white text-[28px] mb-8">
        Create your account
      </h2>

      {/* Role Selector Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRole("recruiter")}
          animate={{
            borderColor: role === "recruiter" ? "rgba(139, 92, 246, 1)" : "rgba(255, 255, 255, 0.1)",
            backgroundColor: role === "recruiter" ? "rgba(139, 92, 246, 0.1)" : "rgba(255, 255, 255, 0.05)",
          }}
          className="relative cursor-pointer p-5 rounded-2xl border-2 transition-colors flex flex-col items-center text-center"
        >
          {role === "recruiter" && (
            <motion.div layoutId="checkBadge" className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
          <span className="text-[32px] mb-3">🏢</span>
          <h3 className="font-syne font-bold text-white text-sm mb-1">I&#39;m a Recruiter</h3>
          <p className="font-dm-sans text-slate-400 text-xs leading-tight">Post jobs & evaluate candidates</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRole("applicant")}
          animate={{
            borderColor: role === "applicant" ? "rgba(6, 182, 212, 1)" : "rgba(255, 255, 255, 0.1)",
            backgroundColor: role === "applicant" ? "rgba(6, 182, 212, 0.1)" : "rgba(255, 255, 255, 0.05)",
          }}
          className="relative cursor-pointer p-5 rounded-2xl border-2 transition-colors flex flex-col items-center text-center"
        >
          {role === "applicant" && (
            <motion.div layoutId="checkBadge" className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
          <span className="text-[32px] mb-3">👤</span>
          <h3 className="font-syne font-bold text-white text-sm mb-1">I&#39;m looking for a job</h3>
          <p className="font-dm-sans text-slate-400 text-xs leading-tight">Practice interviews & apply</p>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit}>
        <FloatingInput id="name-signup" type="text" name="name" label="Full Name" />
        <FloatingInput id="email-signup" type="email" name="email" label="Email Address" />
        <FloatingInput id="password-signup" type="password" name="password" label="Create Password" />

        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-sm font-dm-sans mb-3 px-1">
            {error}
          </motion.p>
        )}

        <PrimaryButton type="submit" disabled={!role || loading} className="w-full mb-8 mt-2">
          {loading ? "Creating account..." : "Create Account"}
        </PrimaryButton>
      </form>

      <p className="text-center font-dm-sans text-slate-400 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
