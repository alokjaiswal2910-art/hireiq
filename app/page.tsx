"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ASSETS, ANIMATION_VARIANTS } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full bg-[#08080F] overflow-x-hidden">
      
      {/* ======================= SECTION 1: HERO ======================= */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Layer 1: Bottom */}
        <div className="absolute inset-0 z-0">
          <Image
            src={ASSETS.backgrounds.hero}
            alt="Neural Background"
            fill
            className="object-cover opacity-30"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#08080F_100%)]" />
        </div>

        {/* Layer 2: Particles WebM */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ mixBlendMode: "screen" }}
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-45 pointer-events-none"
        >
          <source src={ASSETS.animations.particles} type="video/webm" />
        </video>

        {/* Layer 3: Fade Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#08080F] to-transparent z-0 pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col items-start max-w-2xl">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Powered by Gemini 2.5 Flash
            </motion.div>

            {/* Headline */}
            <h1 className="flex flex-col md:flex-row flex-wrap font-syne text-5xl md:text-[80px] font-bold leading-tight mb-6 gap-x-4">
              <motion.span
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
                className="text-white"
              >
                AI-Powered
              </motion.span>
              <motion.span
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.55 }}
                className="gradient-text-animated"
              >
                Hiring
              </motion.span>
              <motion.span
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.7 }}
                className="text-white"
              >
                Intelligence
              </motion.span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-lg text-slate-400 font-dm-sans mb-10"
            >
              Stop guessing. Start knowing.
            </motion.p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/signup?role=recruiter">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative group overflow-hidden bg-gradient-to-r from-violet-600 to-violet-500 text-white px-8 py-4 rounded-xl font-medium"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    I'm a Recruiter
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_forwards] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                </motion.div>
              </Link>
              <Link href="/signup?role=applicant">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-8 py-4 rounded-xl font-medium text-center"
                >
                  Find a Job
                </motion.div>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex items-center gap-8 divider-x divider-white/10"
            >
              <div className="flex flex-col">
                <span className="font-syne text-3xl font-bold text-white">47+</span>
                <span className="text-sm text-slate-400">Companies</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="font-syne text-3xl font-bold text-white">2.3k</span>
                <span className="text-sm text-slate-400">Interviews</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="font-syne text-3xl font-bold text-white">94%</span>
                <span className="text-sm text-slate-400">Accuracy</span>
              </div>
            </motion.div>
          </div>

          {/* AI Robot 3D Asset */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:block relative w-[320px] h-[320px] glow-violet rounded-full"
          >
            <Image
              src={ASSETS.models3d.avatarStatic}
              alt="AI Interviewer"
              fill
              className="object-contain drop-shadow-2xl"
              priority
              sizes="320px"
            />
          </motion.div>
        </div>
      </section>

      {/* ======================= SECTION 2: FEATURES ======================= */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-32 overflow-hidden">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={ANIMATION_VARIANTS.fadeUp}
          className="gradient-text-animated text-center font-syne text-[40px] font-bold mb-16"
        >
          Everything you need to hire smarter
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { img: ASSETS.illustrations.featInterview, title: "AI Interviews", desc: "Role-specific adaptive questions that get harder as you perform better" },
            { img: ASSETS.illustrations.featResume, title: "Resume Scoring", desc: "Instant skill gap analysis matched against the exact job description" },
            { img: ASSETS.illustrations.featRanking, title: "Smart Ranking", desc: "Auto-ranked leaderboard — your top candidates surface instantly" },
            { img: ASSETS.illustrations.featRadar, title: "Skill Analysis", desc: "Radar charts showing strengths and weaknesses per candidate" },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }
              } as any}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass-card flex flex-col items-center text-center p-6 rounded-2xl cursor-pointer"
            >
              <div className="relative w-full h-32 mb-6 focus:outline-none overflow-hidden rounded-lg">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="w-full h-full relative">
                  <Image src={feat.img} alt={feat.title} fill className="object-contain" loading="lazy" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold font-syne text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-dm-sans">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======================= SECTION 3: DASHBOARDS SPLIT ======================= */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-16 overflow-hidden mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recruiter Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={ANIMATION_VARIANTS.fadeUp}
            className="glass-card rounded-3xl p-8 relative flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-500" />
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🏢</span>
              <span className="font-syne font-bold tracking-widest text-violet-400 text-sm">FOR ORGANIZATIONS</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow font-dm-sans text-slate-200">
              {['LinkedIn & GitHub profile analysis', 'AI Fit Score 0–100 per candidate', 'Auto-ranked applicant leaderboard', 'Strengths & weaknesses report'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-violet-500 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup?role=recruiter" className="mt-auto">
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-4 font-medium transition-colors">
                Post a Job →
              </button>
            </Link>
          </motion.div>

          {/* Applicant Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={ANIMATION_VARIANTS.fadeUp}
            className="glass-card rounded-3xl p-8 relative flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400" />
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">👤</span>
              <span className="font-syne font-bold tracking-widest text-cyan-400 text-sm">FOR JOB SEEKERS</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow font-dm-sans text-slate-200">
              {['Resume scoring vs job description', 'AI adaptive mock interviews', 'Ideal answer comparison', 'Skill radar & progress tracker'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup?role=applicant" className="mt-auto">
              <button className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl py-4 font-medium transition-colors">
                Start Practicing →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ======================= SECTION 4: FOOTER ======================= */}
      <footer className="w-full border-t border-white/5 py-8 px-6 bg-[#040408]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-dm-sans text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-syne font-bold text-white text-lg tracking-tight">HireIQ</span>
          </div>
          <div className="text-center">
            Built with Gemini 2.5 Flash · Supabase · Next.js 15
          </div>
          <div>
            Hack & Forge 2026
          </div>
        </div>
      </footer>

    </main>
  );
}
