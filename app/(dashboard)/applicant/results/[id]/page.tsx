"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from "recharts";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { CelebrationBurst } from "@/components/applicant/CelebrationBurst";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SecondaryButton } from "@/components/shared/SecondaryButton";
import { getInterviewWithQA } from "@/app/actions/interview";
import type { Interview, InterviewQA } from "@/lib/types";

export default function InterviewResultsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await getInterviewWithQA(interviewId);
      if (res.data) setInterview(res.data);
      setLoading(false);
    }
    fetchData();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080F] flex items-center justify-center font-dm-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-slate-400">Processing evaluation results...</span>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-[#08080F] flex items-center justify-center font-dm-sans text-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Results Not Found</h2>
          <PrimaryButton onClick={() => router.push('/applicant')}>Return to Dashboard</PrimaryButton>
        </div>
      </div>
    );
  }

  const overallScore = interview.overall_score || 0;
  
  const radarData = Object.entries(interview.skill_scores || {}).map(([skill, score]) => ({
    skill,
    score,
    fullMark: 10
  }));

  // Fallback radar if no skill scores
  const finalRadarData = radarData.length > 0 ? radarData : [
    { skill: "Relevance", score: interview.relevance_avg || 0, fullMark: 10 },
    { skill: "Depth", score: interview.depth_avg || 0, fullMark: 10 },
    { skill: "Clarity", score: interview.clarity_avg || 0, fullMark: 10 },
  ];

  const strengths = interview.strengths || [];
  const improvements = interview.improvements || [];
  const qaHistory = (interview.interview_qa || []).slice().sort((a, b) => a.question_number - b.question_number);

  return (
    <>
      <CelebrationBurst />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={ANIMATION_VARIANTS.staggerContainer}
        className="flex flex-col gap-8 pb-12 w-full max-w-5xl mx-auto"
      >
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mt-4 mb-4"
        >
          <h1 className="font-syne font-bold text-3xl md:text-4xl text-white mb-2">
            Interview Complete! 🎉
          </h1>
          <p className="font-dm-sans text-slate-400 text-sm">
             Evaluation for <span className="text-violet-400 font-bold">{interview.job?.title}</span>
          </p>
        </motion.div>

        {/* Final Score Card */}
        <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-10 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <ScoreRing score={overallScore} size={160} />
          <span className="mt-6 mb-4 font-syne font-bold text-slate-300 text-sm uppercase tracking-widest">
            Overall performance
          </span>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1 }}
            className={`px-6 py-2 rounded-full font-bold text-[10px] tracking-widest uppercase border ${
              overallScore >= 70 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
              overallScore >= 50 ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
              "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}
          >
            {interview.recommendation_label || 'Evaluation Complete'}
          </motion.div>
        </motion.div>

        {/* Two Column Layout: Radar + Text Feedback */}
        <div className="flex flex-col lg:flex-row gap-6 w-full font-dm-sans">
          
          {/* Left: Skill Radar Chart */}
          <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="w-full lg:w-1/2 glass-card p-6 flex flex-col h-[400px]">
             <h3 className="font-syne font-bold text-white text-sm uppercase tracking-widest mb-6">Competency Breakdown</h3>
             <div className="flex-1 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={finalRadarData}>
                   <PolarGrid stroke="rgba(255,255,255,0.08)" />
                   <PolarAngleAxis dataKey="skill" tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "inherit" }} />
                   <Radar 
                     name="Score" 
                     dataKey="score" 
                     stroke="#7C3AED" 
                     fill="#7C3AED" 
                     fillOpacity={0.2} 
                     dot={{ r: 4, fill: "#A78BFA" }}
                     animationBegin={600}
                     animationDuration={1500}
                   />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
          </motion.div>

          {/* Right: Strengths & Improvements */}
          <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="w-full lg:w-1/2 flex flex-col gap-6">
             
             {/* Strengths */}
             <div className="glass-card p-6 flex flex-col gap-4 flex-1">
               <h3 className="font-syne font-bold text-emerald-400 text-xs uppercase tracking-widest flex items-center gap-2">
                 <span className="text-xl">💪</span> Key Strengths
               </h3>
               <ul className="flex flex-col gap-3">
                 {strengths.length > 0 ? strengths.map((s, i) => (
                   <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (i * 0.1) }}
                      className="flex items-start gap-3 text-sm text-slate-300"
                   >
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     {s}
                   </motion.li>
                 )) : <li className="text-slate-500 italic text-sm">No significant strengths identified yet.</li>}
               </ul>
             </div>

             {/* Improvements */}
             <div className="glass-card p-6 flex flex-col gap-4 flex-1">
               <h3 className="font-syne font-bold text-amber-400 text-xs uppercase tracking-widest flex items-center gap-2">
                 <span className="text-xl">📈</span> Growth Areas
               </h3>
               <ul className="flex flex-col gap-3">
                 {improvements.length > 0 ? improvements.map((s, i) => (
                   <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + (i * 0.1) }}
                      className="flex items-start gap-3 text-sm text-slate-300"
                   >
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                     {s}
                   </motion.li>
                 )) : <li className="text-slate-500 italic text-sm">No major improvement areas noted.</li>}
               </ul>
             </div>

          </motion.div>
        </div>

        {/* AI Recommendation Banner */}
        <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="w-full glass-card p-6 border-l-2 border-l-violet-500 bg-violet-500/[0.04]">
          <div className="flex items-center gap-2 mb-3">
             <span className="text-xl">🤖</span>
             <h3 className="font-syne font-bold text-violet-400 text-[10px] uppercase tracking-widest">Executive AI Summary</h3>
          </div>
          <p className="font-dm-sans text-sm text-slate-300 italic leading-relaxed pl-7">
            "{interview.hiring_recommendation || 'Evaluation summary is being finalized by the AI core.'}"
          </p>
        </motion.div>

        {/* Q&A Breakdown */}
        <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="w-full flex flex-col gap-4 mt-4">
           <h2 className="font-syne font-bold text-xl text-white mb-2">Detailed performance</h2>
           
           <div className="flex flex-col gap-3">
             {qaHistory.length > 0 ? qaHistory.map((qa, i) => (
               <details key={i} className="group glass-card overflow-hidden">
                 <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-white/[0.02] transition-colors">
                   <div className="flex items-center gap-4 flex-1 pr-4">
                     <span className="font-syne font-bold text-slate-500 text-xs">Q{qa.question_number}</span>
                     <span className="text-white text-sm font-medium line-clamp-1">{qa.question}</span>
                   </div>
                   <div className="flex items-center gap-4 shrink-0">
                     <span className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                        (qa.score || 0) >= 8 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                        (qa.score || 0) >= 5 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                        "bg-rose-500/10 text-rose-400 border-rose-500/20"
                     }`}>
                       {qa.score}/10
                     </span>
                     <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </div>
                 </summary>
                 <div className="p-5 border-t border-white/5 bg-[#08080F]/50 flex flex-col md:flex-row gap-6">
                   <div className="flex-1 flex flex-col gap-2 border-l-2 border-amber-500/30 pl-4 py-1">
                     <span className="text-[10px] text-amber-500 uppercase font-bold tracking-widest font-syne">Your Answer</span>
                     <p className="text-sm text-slate-300 italic">"{qa.applicant_answer}"</p>
                   </div>
                   <div className="flex-1 flex flex-col gap-2 border-l-2 border-violet-500/30 pl-4 py-1">
                     <span className="text-[10px] text-violet-400 uppercase font-bold tracking-widest font-syne">Ideal Answer</span>
                     <p className="text-sm text-slate-300">{qa.ideal_answer}</p>
                   </div>
                 </div>
               </details>
             )) : <div className="text-slate-500 italic py-8 text-center glass-card">No Q&A history found for this session.</div>}
           </div>
        </motion.div>

        {/* Bottom Actions */}
        <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
           <SecondaryButton onClick={() => router.push('/applicant')}>Try Another Mock Interview</SecondaryButton>
           <PrimaryButton onClick={() => router.push('/applicant')}>Return to Dashboard</PrimaryButton>
        </motion.div>

      </motion.div>
    </>
  );
}
