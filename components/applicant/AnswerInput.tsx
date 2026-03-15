"use client";

import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

interface AnswerInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function AnswerInput({ value, onChange, onSubmit, disabled = false }: AnswerInputProps) {
  
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  // Let minimum valid char count be 20 as requested
  const isValid = value.trim().length >= 20;

  return (
    <div className="w-full flex flex-col gap-3 font-dm-sans">
      <div className="flex items-center justify-between px-1">
        <label className="text-white font-medium text-sm">Your Answer</label>
        {/* Helper instruction */}
        {!isValid && value.length > 0 && (
          <span className="text-amber-400/80 text-[10px] uppercase tracking-wider font-bold">
            Keep typing (min 20 chars)
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type your response here..."
        className={`w-full p-5 rounded-xl bg-white/5 border text-white placeholder-slate-600 resize-none font-light text-base leading-relaxed outline-none transition-all duration-200 ease-in-out
          ${value.length > 0 ? "border-violet-500/40" : "border-white/10"} 
          focus:border-violet-500/40 focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]
          disabled:opacity-50 disabled:cursor-not-allowed`}
        rows={6}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <span className="text-slate-500 text-xs w-full sm:w-auto text-left">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
        
        <PrimaryButton 
          onClick={onSubmit} 
          disabled={!isValid || disabled}
          className="w-full sm:w-auto"
        >
          Submit Answer →
        </PrimaryButton>
      </div>
    </div>
  );
}
