"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ASSETS, ANIMATION_VARIANTS } from "@/lib/constants";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SecondaryButton } from "@/components/shared/SecondaryButton";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CandidateRanking } from "@/lib/types";

interface StatProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number;
    const duration = 1500;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(easeOutCubic(progress) * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <>{count}</>;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function RecruiterDashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [stats, setStats] = useState<StatProps[]>([
    { label: "Total Applicants", value: 0, icon: "👥", color: "violet" },
    { label: "Interviews Done", value: 0, icon: "🎤", color: "cyan" },
    { label: "Avg Score", value: "0%", icon: "📊", color: "emerald" },
    { label: "Jobs Posted", value: 0, icon: "💼", color: "amber" },
  ]);
  const [recentCandidates, setRecentCandidates] = useState<CandidateRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
      if (profile?.full_name) setUserName(profile.full_name.split(' ')[0]);

      try {
        const { getRecruiterStats, getAllCandidatesRanked } = await import('@/app/actions/recruiter');
        const [statsRes, candidatesRes] = await Promise.all([getRecruiterStats(), getAllCandidatesRanked()]);

        if (statsRes.data) {
          setStats([
            { label: "Total Applicants", value: statsRes.data.total_applications, icon: "👥", color: "violet" },
            { label: "Interviews Done", value: statsRes.data.total_interviews_completed, icon: "🎤", color: "cyan" },
            { label: "Avg Score", value: `${statsRes.data.average_score}%`, icon: "📊", color: "emerald" },
            { label: "Jobs Posted", value: statsRes.data.total_jobs, icon: "💼", color: "amber" },
          ]);
        }
        if (candidatesRes.data) setRecentCandidates(candidatesRes.data.slice(0, 5));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="flex flex-col gap-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="mb-2">
        <h1 className="font-syne font-bold text-3xl md:text-4xl text-white mb-2">
          {getGreeting()}, {userName ?? '...'} 👋
        </h1>
        <p className="font-dm-sans text-slate-400">
          Here's your hiring overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={ANIMATION_VARIANTS.fadeUp}
            className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-colors"
          >
            {/* Soft background glow based on color */}
            {stat.color === 'violet' && <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />}
            {stat.color === 'cyan' && <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />}
            {stat.color === 'emerald' && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />}
            {stat.color === 'amber' && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />}

            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-xl shadow-inner relative z-10">
              {stat.icon}
            </div>
            
            <div className="flex flex-col relative z-10">
              <span className="text-3xl font-syne font-bold text-white mb-1 tracking-tight">
                {typeof stat.value === 'number' ? <AnimatedNumber value={stat.value} /> : stat.value}
              </span>
              <span className="text-sm font-dm-sans text-slate-400">
                {stat.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* Main Table Area (Span 2) */}
        <motion.div 
          variants={ANIMATION_VARIANTS.fadeUp}
          className="lg:col-span-2 glass-card p-6 md:p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-syne font-bold text-xl text-white">Recent Candidates</h2>
            <Link href="/recruiter/candidates" className="text-sm font-dm-sans text-violet-400 hover:text-violet-300 transition-colors">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-dm-sans border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-4 font-medium pl-2">Rank</th>
                  <th className="pb-4 font-medium">Candidate</th>
                  <th className="pb-4 font-medium">Score</th>
                  <th className="pb-4 font-medium">Role Fit</th>
                  <th className="pb-4 font-medium text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-dm-sans">
                      {loading ? "Loading candidates..." : "No candidates evaluated yet."}
                    </td>
                  </tr>
                ) : (
                  recentCandidates.map((row, i) => (
                    <motion.tr 
                      key={row.interview_id}
                      custom={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="hover:bg-white-[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="py-4 pl-2">
                        <div className="w-6 h-6 rounded bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold font-syne border border-violet-500/30">
                          #{i + 1}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10">
                            <Image 
                              src={ASSETS.illustrations.avatars[row.full_name.charCodeAt(0) % ASSETS.illustrations.avatars.length]} 
                              alt={row.full_name} 
                              fill 
                              className="object-cover" 
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-bold">{row.full_name}</span>
                            <span className="text-slate-500 text-xs">{row.top_skill}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-syne font-bold text-white">{row.overall_score}%</div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          row.overall_score >= 80 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : row.overall_score >= 50
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                       }`}>
                          {row.recommendation_label}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <Link href={`/recruiter/candidates/report/${row.interview_id}`}>
                          <button className="text-slate-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Side Actions (Span 1) */}
        <motion.div 
          variants={ANIMATION_VARIANTS.fadeUp}
          className="flex flex-col gap-4"
        >
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-syne font-bold text-lg text-white mb-2">Ready to hire?</h3>
            <p className="font-dm-sans text-sm text-slate-400 mb-6">
              Create a new job posting and let our AI evaluate incoming candidates.
            </p>
            <Link href="/recruiter/jobs/new">
              <PrimaryButton className="w-full text-sm">Post New Job</PrimaryButton>
            </Link>
          </div>

          <div className="glass-card p-6 flex flex-col justify-center">
            <Link href="/recruiter/candidates">
              <SecondaryButton className="w-full text-sm">View All Candidates</SecondaryButton>
            </Link>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
