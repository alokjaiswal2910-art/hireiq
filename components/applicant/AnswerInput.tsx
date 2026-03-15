"use client";

import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

interface AnswerInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onSkip?: () => void;
  disabled?: boolean;
}

export function AnswerInput({ value, onChange, onSubmit, onSkip, disabled = false }: AnswerInputProps) {
  
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isValid = value.trim().length >= 20;

  return (
    <div className="w-full flex flex-col gap-3 font-dm-sans">
      <div className="flex items-center justify-between px-1">
        <label className="text-white font-medium text-sm">Your Answer</label>
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
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              disabled={disabled}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip question →
            </button>
          )}
          <PrimaryButton 
            onClick={() => onSubmit()} 
            disabled={!isValid || disabled}
            className="flex-1 sm:flex-initial"
          >
            Submit Answer →
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
