"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { FloatingInput } from "@/components/shared/FloatingInput";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { createJob } from "@/app/actions/jobs";

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement)?.value?.trim();
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement)?.value?.trim();
    const skillsStr = (form.elements.namedItem("skills") as HTMLInputElement)?.value?.trim();
    const experienceLevel = (form.elements.namedItem("experience_level") as HTMLSelectElement)?.value as "junior" | "mid" | "senior";
    const department = (form.elements.namedItem("department") as HTMLInputElement)?.value?.trim();

    if (!title || !description) {
      setError("Title and description are required.");
      setLoading(false);
      return;
    }

    const requiredSkills = skillsStr ? skillsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const res = await createJob(title, description, requiredSkills, experienceLevel ?? "mid", department || undefined);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    router.push("/recruiter/jobs");
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="flex flex-col gap-8 pb-12 max-w-2xl"
    >
      <div>
        <Link href="/recruiter/jobs" className="text-sm text-slate-400 hover:text-white mb-2 inline-block">← Back to Jobs</Link>
        <h1 className="font-syne font-bold text-2xl md:text-3xl text-white">Post New Job</h1>
        <p className="text-slate-400 text-sm mt-1">Create a job posting. Applicants will be able to apply and take AI interviews.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 flex flex-col gap-6">
        <FloatingInput id="title" name="title" label="Job Title" required />
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-400 mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            placeholder="Describe the role and requirements..."
          />
        </div>
        <FloatingInput id="skills" name="skills" label="Required skills (comma-separated)" placeholder="e.g. React, TypeScript, Node.js" />
        <div>
          <label htmlFor="experience_level" className="block text-sm font-medium text-slate-400 mb-2">Experience level</label>
          <select
            id="experience_level"
            name="experience_level"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <FloatingInput id="department" name="department" label="Department (optional)" />
        {error && <p className="text-rose-400 text-sm">{error}</p>}
        <PrimaryButton type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Job"}</PrimaryButton>
      </form>
    </motion.div>
  );
}
