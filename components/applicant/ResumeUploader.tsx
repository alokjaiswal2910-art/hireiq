"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TypingText } from "@/components/shared/TypingText";
import { ASSETS } from "@/lib/constants";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { processAndAnalyzeResume } from "@/app/actions/resume";
import type { ResumeAnalysis } from "@/lib/types";

type UploadState = 'idle' | 'dragging' | 'scanning' | 'scored' | 'error';

interface ResumeUploaderProps {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceLevel: string;
}

export function ResumeUploader({ 
  jobId, 
  jobTitle, 
  jobDescription, 
  requiredSkills, 
  experienceLevel 
}: ResumeUploaderProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanTexts = [
    "Reading your resume...", 
    "Extracting skills...", 
    "Comparing with job requirements...", 
    "Generating AI feedback...",
    "Almost there..."
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === 'idle') setState('dragging');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === 'dragging') setState('idle');
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setState('scanning');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const result = await processAndAnalyzeResume(
        formData,
        jobId,
        jobTitle,
        jobDescription,
        requiredSkills,
        experienceLevel
      );

      if (result.error || !result.data) {
        setErrorMsg(result.error ?? 'Analysis failed');
        setState('error');
        return;
      }

      setAnalysis(result.data.analysis);
      setApplicationId(result.data.applicationId ?? null);
      setState('scored');
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
      setState('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    } else {
      setState('idle');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (state === 'idle') fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setState('idle');
    setFileName('');
    setAnalysis(null);
    setApplicationId(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full flex flex-col gap-6 font-dm-sans relative">
      {/* Success applied popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSuccessPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-8 max-w-sm w-full text-center border-2 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-3xl">
                ✓
              </div>
              <h3 className="font-syne font-bold text-xl text-white mb-2">Successfully applied!</h3>
              <p className="text-slate-400 text-sm mb-6">
                Your resume has been submitted for <span className="text-emerald-400 font-medium">{jobTitle}</span>.
              </p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-medium text-sm border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".pdf,.doc,.docx"
      />

      {/* IDLE & DRAGGING & SCANNING & ERROR STATES */}
      <AnimatePresence mode="wait">
        {state !== 'scored' && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: state === 'dragging' ? 1.02 : 1,
              borderColor: state === 'error' ? "rgba(244, 63, 94, 0.5)" : (state === 'dragging' ? "rgba(139, 92, 246, 1)" : "rgba(255, 255, 255, 0.2)"),
              backgroundColor: state === 'error' ? "rgba(244, 63, 94, 0.05)" : (state === 'dragging' ? "rgba(139, 92, 246, 0.1)" : "rgba(255, 255, 255, 0.02)")
            }}
            exit={{ opacity: 0, scale: 0.95, height: 0, overflow: "hidden", marginTop: 0, marginBottom: 0, padding: 0 }}
            transition={{ duration: 0.2 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`w-full min-h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-colors ${state === 'idle' || state === 'error' ? 'cursor-pointer hover:bg-white/[0.04]' : ''}`}
          >
            {/* IDLE / DRAGGING CONTENT */}
            {(state === 'idle' || state === 'dragging') && (
              <div className="flex flex-col items-center text-center">
                <span className={`text-5xl mb-4 transition-transform ${state === 'dragging' ? 'scale-110 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'opacity-60'}`}>
                  📄
                </span>
                <h3 className={`font-syne font-bold text-lg mb-1 transition-colors ${state === 'dragging' ? 'text-violet-400' : 'text-white'}`}>
                  {state === 'dragging' ? 'Drop to analyze' : 'Drag your resume here'}
                </h3>
                <p className={`text-sm mb-2 transition-colors ${state === 'dragging' ? 'text-violet-300' : 'text-slate-400'}`}>
                  {state === 'dragging' ? 'Release to upload' : 'or click to browse'}
                </p>
                <span className="text-xs text-slate-500/70">
                  PDF, DOC, DOCX up to 10MB
                </span>
              </div>
            )}

            {/* SCANNING CONTENT */}
            {state === 'scanning' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center w-full"
              >
                <div className="relative w-48 h-48 mix-blend-screen opacity-80 mb-4">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                    src={ASSETS.animations.loadingOrb}
                  />
                </div>
                <TypingText 
                  texts={scanTexts} 
                  interval={1200} 
                  className="text-violet-300 font-medium text-sm" 
                />
              </motion.div>
            )}

            {/* ERROR CONTENT */}
            {state === 'error' && (
              <div className="flex flex-col items-center text-center">
                <span className="text-4xl mb-4">⚠️</span>
                <h3 className="font-syne font-bold text-lg mb-1 text-rose-400">Analysis Failed</h3>
                <p className="text-sm mb-6 text-slate-400 max-w-xs">{errorMsg}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                  className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* SCORED STATE */}
        {state === 'scored' && analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            {/* Collapsed File Chip */}
            <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xl">📄</span>
                <span className="text-white font-medium text-sm">{fileName}</span>
                <span className="text-emerald-400 bg-emerald-500/10 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
              </div>
              <button 
                onClick={resetUpload}
                className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Re-upload
              </button>
            </div>

            {/* Top Results Section - Score & Layout */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start w-full">
              
              {/* Score Dial */}
              <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                >
                  <ScoreRing score={analysis.match_score} size={150} />
                </motion.div>
                <span className="mt-4 font-syne font-bold text-white text-lg">Match Score</span>
              </div>

              {/* Skills Columns */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Matched Skills */}
                <div className="flex flex-col glass-card p-5">
                  <h4 className="text-emerald-400 font-bold text-sm mb-4 flex items-center gap-2">
                    <span className="text-lg">✓</span> Matched Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matched_skills && analysis.matched_skills.length > 0 ? (
                      analysis.matched_skills.map((skill, i) => (
                        <SkillBadge key={skill} skill={skill} type="matched" delay={0.4 + (i * 0.1)} />
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No specific matches found</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="flex flex-col glass-card p-5">
                  <h4 className="text-rose-400 font-bold text-sm mb-4 flex items-center gap-2">
                    <span className="text-lg">✗</span> Missing Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_skills && analysis.missing_skills.length > 0 ? (
                      analysis.missing_skills.map((skill, i) => (
                        <SkillBadge key={skill} skill={skill} type="missing" delay={0.9 + (i * 0.1)} />
                      ))
                    ) : (
                      <span className="text-xs text-emerald-500/50 italic">None identified!</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* AI Feedback Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="glass-card p-6 border-l-2 border-l-cyan-500 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-full bg-cyan-500/5 blur-xl pointer-events-none" />
              <h4 className="text-cyan-400 font-bold text-sm mb-3 font-syne flex items-center gap-2 relative z-10">
                <span className="text-lg">💬</span> AI Analysis
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-dm-sans relative z-10">
                {analysis.feedback}
              </p>
            </motion.div>

            {/* Suggestions Card */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="glass-card p-6 border-l-2 border-l-amber-500 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-32 h-full bg-amber-500/5 blur-xl pointer-events-none" />
                <h4 className="text-amber-400 font-bold text-sm mb-3 font-syne flex items-center gap-2 relative z-10">
                  <span className="text-lg">💡</span> Suggestions
                </h4>
                <ul className="text-sm text-slate-300 leading-relaxed font-dm-sans space-y-2 relative z-10">
                  {analysis.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {applicationId && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="pt-4">
                <Link href={`/applicant/interview/${applicationId}`}>
                  <PrimaryButton className="w-full text-sm">Start Mock Interview →</PrimaryButton>
                </Link>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
