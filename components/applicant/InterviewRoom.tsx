"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AIAvatar } from "@/components/3d/AIAvatar";
import { QuestionCard } from "./QuestionCard";
import { AnswerInput } from "./AnswerInput";
import { ScoreReveal } from "./ScoreReveal";
import { IdealAnswerComparison } from "./IdealAnswerComparison";
import { TypingText } from "@/components/shared/TypingText";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { ASSETS } from "@/lib/constants";
import { 
  createInterview, 
  generateFirstQuestion, 
  scoreAnswerAndAdvance, 
  saveInterviewQA, 
  completeInterview 
} from "@/app/actions/interview";
import type { ScoreData } from "@/lib/types";

type InterviewPhase = 'initializing' | 'question' | 'submitting' | 'scored' | 'complete' | 'error';

interface InterviewRoomProps {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  onProgressUpdate: (current: number, total: number, difficulty: number, focus: string) => void;
}

export function InterviewRoom({
  applicationId,
  jobId,
  jobTitle,
  jobDescription,
  requiredSkills,
  onProgressUpdate
}: InterviewRoomProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<InterviewPhase>('initializing');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  
  const [questionNumber, setQuestionNumber] = useState(1);
  const totalQuestions = 6;
  
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  
  const [answer, setAnswer] = useState('');
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState('');
  const [lastScore, setLastScore] = useState<ScoreData | null>(null);
  const [previousScores, setPreviousScores] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const [loadingText, setLoadingText] = useState("Securing your interview session...");

  // 1. Initialize Interview
  useEffect(() => {
    async function init() {
      try {
        // Create the interview record
        const interviewRes = await createInterview(applicationId, jobId);
        if (interviewRes.error) throw new Error(interviewRes.error);
        setInterviewId(interviewRes.data!.id);

        // Generate the first question
        setLoadingText("AI Interviewer is preparing for your session...");
        const firstQRes = await generateFirstQuestion(jobTitle, jobDescription, requiredSkills);
        if (firstQRes.error) throw new Error(firstQRes.error);

        const q = firstQRes.data!;
        setCurrentQuestion(q.question);
        setCurrentSkill(q.skill_tested);
        setCurrentDifficulty(q.difficulty_level);
        
        onProgressUpdate(1, totalQuestions, q.difficulty_level, q.skill_tested);
        setPhase('question');
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to start interview");
        setPhase('error');
      }
    }
    init();
  }, [applicationId, jobId, jobTitle, jobDescription, requiredSkills, onProgressUpdate]);

  const handleSubmit = async (overrideAnswer?: string) => {
    const textToSubmit = overrideAnswer !== undefined ? overrideAnswer : answer;
    if (textToSubmit.trim().length < 10 && !overrideAnswer) return;
    if (!interviewId) return;

    setPhase('submitting');
    
    try {
      // 2. Score Answer + Generate Next
      const scoreRes = await scoreAnswerAndAdvance(
        jobTitle,
        jobDescription,
        requiredSkills,
        currentQuestion,
        currentSkill,
        textToSubmit.trim() || "Candidate skipped this question.",
        questionNumber,
        totalQuestions,
        previousScores
      );

      if (scoreRes.error || !scoreRes.data) throw new Error(scoreRes.error || "Scoring failed");

      const sd = scoreRes.data;
      setLastScore(sd);
      setPreviousScores(prev => [...prev, sd.score]);

      // 3. Save current QA to database (use the text we actually submitted)
      const submittedText = textToSubmit.trim() || "Candidate skipped this question.";
      await saveInterviewQA(
        interviewId,
        questionNumber,
        currentQuestion,
        currentSkill,
        currentDifficulty,
        submittedText,
        sd
      );

      setLastSubmittedAnswer(submittedText);
      setPhase('scored');
    } catch (err: any) {
      setErrorMsg(err.message || "Submission failed");
      setPhase('error');
    }
  };

  const nextQuestion = async () => {
    if (questionNumber >= totalQuestions) {
      setPhase('submitting');
      setLoadingText("Finalizing your assessment...");
      try {
        await completeInterview(interviewId!, jobTitle, requiredSkills);
        router.push(`/applicant/results/${interviewId}`);
      } catch (err: any) {
        setErrorMsg("Failed to finalize interview results.");
        setPhase('error');
      }
    } else {
      if (!lastScore?.next_question) {
        setErrorMsg("Next question generation failed.");
        setPhase('error');
        return;
      }

      const nextNum = questionNumber + 1;
      setQuestionNumber(nextNum);
      setCurrentQuestion(lastScore.next_question);
      setCurrentSkill(lastScore.next_skill_tested || "Diverse Skills");
      setCurrentDifficulty(lastScore.next_difficulty || currentDifficulty);
      setAnswer('');
      setLastScore(null);

      onProgressUpdate(
        nextNum, 
        totalQuestions, 
        lastScore.next_difficulty || currentDifficulty, 
        lastScore.next_skill_tested || "Diverse Skills"
      );
      setPhase('question');
    }
  };

  const loadingTexts = [
    "Evaluating your answer...", 
    "Checking technical depth...",
    "Generating ideal response...", 
    "Preparing feedback...",
    "Adjusting interview difficulty..."
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      
      {/* PHASE: INITIALIZING / SUBMITTING */}
      <AnimatePresence mode="wait">
        {(phase === 'initializing' || phase === 'submitting') && (
          <motion.div
            key="phase-loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 gap-8"
          >
            <div className="relative w-24 h-24 mix-blend-screen opacity-90">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-contain"
                src={ASSETS.animations.loadingOrb}
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <TypingText texts={phase === 'initializing' ? [loadingText] : loadingTexts} interval={1500} className="text-violet-300 font-syne font-bold" />
              <p className="text-slate-500 text-xs font-dm-sans">This may take a few seconds as Gemini analyzes the context.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE: QUESTION */}
      <AnimatePresence mode="wait">
        {phase === 'question' && (
          <motion.div
            key="phase-question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              <div className="flex flex-col items-center gap-2 pt-2">
                <AIAvatar isTalking={false} />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-syne">
                  AI Interviewer
                </span>
              </div>
              
              <div className="flex-1 w-full relative z-10">
                <QuestionCard 
                  key={questionNumber}
                  question={currentQuestion}
                  questionNumber={questionNumber}
                  difficulty={currentDifficulty}
                  skillTested={currentSkill}
                />
              </div>
            </div>

            <AnswerInput 
              value={answer}
              onChange={setAnswer}
              onSubmit={() => handleSubmit()}
              onSkip={() => handleSubmit("Candidate skipped this question.")}
              disabled={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE: SCORED */}
      <AnimatePresence mode="wait">
        {phase === 'scored' && lastScore && (
          <motion.div
            key="phase-scored"
            className="flex flex-col gap-8"
          >
            <ScoreReveal scoreData={lastScore} />
            <IdealAnswerComparison scoreData={lastScore} userAnswer={lastSubmittedAnswer} />
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="glass-card p-5 border-l-2 border-l-cyan-500 flex items-start gap-4"
            >
              <div className="text-2xl mt-0.5">💬</div>
              <p className="text-sm text-slate-300 leading-relaxed font-dm-sans">
                {lastScore.feedback}
              </p>
              {lastSubmittedAnswer === "Candidate skipped this question." && (
                <p className="text-xs text-slate-500 italic mt-2">You skipped this question.</p>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex justify-end mt-4"
            >
              <PrimaryButton onClick={nextQuestion}>
                {questionNumber === totalQuestions ? "Review Final Results →" : "Next Question →"}
              </PrimaryButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE: ERROR */}
      <AnimatePresence>
        {phase === 'error' && (
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass-card p-12 flex flex-col items-center text-center gap-4 border border-rose-500/20"
          >
             <div className="text-5xl mb-2">⚠️</div>
             <h2 className="font-syne font-bold text-2xl text-white">Oops! Connection Lost</h2>
             <p className="text-slate-400 max-w-md">{errorMsg}</p>
             <PrimaryButton onClick={() => window.location.reload()} className="mt-4">
               Resume Interview
             </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
