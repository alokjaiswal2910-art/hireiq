"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { InterviewRoom } from "@/components/applicant/InterviewRoom";
import { DifficultyBar } from "@/components/applicant/DifficultyBar";
import { PageTransition } from "@/components/global/page-transition";
import { createClient } from "@/lib/supabase/client";
import type { Job, Application } from "@/lib/types";

export default function InterviewPage() {
  const params = useParams();
  const applicationId = params.id as string;
  
  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  
  // These will be synced from InterviewRoom via some local state if needed, 
  // but for now we'll just use the IDs to start. 
  // InterviewRoom will handle internal progress.
  const [progress, setProgress] = useState({ current: 1, total: 6, difficulty: 5, focus: "General Technical" });

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: appData } = await supabase
        .from('applications')
        .select('*, job:jobs(*)')
        .eq('id', applicationId)
        .single();
      
      if (appData) {
        setApplication(appData);
        setJob(appData.job);
      }
      setLoading(false);
    }
    fetchData();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080F] flex items-center justify-center font-dm-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-slate-400">Securing interview channel...</span>
        </div>
      </div>
    );
  }

  if (!application || !job) {
    return (
      <div className="min-h-screen bg-[#08080F] flex items-center justify-center font-dm-sans">
        <div className="text-center">
          <h2 className="text-2xl font-syne font-bold text-white mb-2">Interview Not Found</h2>
          <p className="text-slate-400 mb-6">We couldn't find the application record for this interview.</p>
          <Link href="/applicant">
            <button className="px-6 py-2 rounded-xl bg-violet-600 text-white font-bold">Return to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = (progress.current / progress.total) * 100;

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col font-dm-sans w-full">
      
      {/* Sticky Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#0A0A18]/90 backdrop-blur-md border-b border-white/5 z-50 flex flex-col justify-end">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 h-full flex items-center justify-between">
          
          {/* Left Context */}
          <div className="flex items-center gap-4">
            <Link href="/applicant" className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
               <span className="text-lg leading-none mb-0.5">←</span> Back
            </Link>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-white font-syne font-bold text-sm hidden sm:block">{job.title}</span>
          </div>

          {/* Center Title */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-slate-300 text-sm font-medium tracking-wide">
              Question {progress.current} of {progress.total}
            </span>
          </div>
          
          {/* Right Empty Spacer */}
          <div className="w-20" />

        </div>
        
        {/* Progress Bar Line */}
        <div className="w-full h-[3px] bg-white/10 relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-600 to-cyan-400"
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>

      {/* Main Layout Body */}
      <div className="flex-1 flex w-full pt-16">
        
        {/* Center Content */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-8 lg:p-12 pb-32 w-full mt-4">
          <PageTransition>
             <InterviewRoom 
              applicationId={application.id}
              jobId={job.id}
              jobTitle={job.title}
              jobDescription={job.description}
              requiredSkills={job.required_skills}
              onProgressUpdate={(curr, total, diff, focus) => setProgress({ current: curr, total, difficulty: diff, focus })}
             />
          </PageTransition>
        </main>

        {/* Right Sidebar (Stats & History) - Desktop Only */}
        <aside className="hidden xl:flex w-[280px] shrink-0 border-l border-white/5 bg-white/[0.01] p-6 flex-col gap-8 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
           
           <h3 className="font-syne font-bold text-white text-lg border-b border-white/10 pb-4">
             Interview Profile
           </h3>

           <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Difficulty Calibration</span>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-3">
                   <DifficultyBar level={progress.difficulty} />
                   <span className={`${progress.difficulty >= 8 ? 'text-amber-400' : 'text-emerald-400'} text-[10px] font-bold uppercase tracking-wider`}>
                    Level {progress.difficulty} ({progress.difficulty >= 8 ? 'Hard' : progress.difficulty >= 5 ? 'Medium' : 'Easy'})
                   </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Current Focus</span>
                <div className="px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-bold uppercase tracking-wider text-center">
                  {progress.focus}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold pb-2 border-b border-white/10">Progress Summary</span>
                <div className="flex items-center gap-3 text-xs text-slate-400 italic">
                   Dynamic evaluation in progress. Results will be calculated upon completion.
                </div>
              </div>
           </div>
        </aside>

      </div>
    </div>
  );
}
