// ============================================================
// HireIQ — All TypeScript types (canonical schema)
// ============================================================

export type UserRole = 'recruiter' | 'applicant'

export interface User {
  id: string
  role: UserRole
  full_name: string
  email?: string | null
  avatar_url?: string
  created_at: string
}

export interface Job {
  id: string
  recruiter_id: string
  title: string
  description: string
  required_skills: string[]
  experience_level: 'junior' | 'mid' | 'senior'
  department?: string
  created_at: string
  // Joined
  recruiter?: User
}

export interface Application {
  id: string
  job_id: string
  applicant_id: string
  status: 'applied' | 'interviewing' | 'completed' | 'rejected'
  resume_url?: string
  resume_text?: string
  resume_score?: number
  matched_skills?: string[]
  missing_skills?: string[]
  resume_feedback?: string
  resume_suggestions?: string[]
  created_at: string
  // Joined
  job?: Job
  applicant?: User
}

export interface Interview {
  id: string
  application_id: string
  applicant_id: string
  job_id: string
  status: 'in_progress' | 'completed'
  overall_score?: number
  relevance_avg?: number
  depth_avg?: number
  clarity_avg?: number
  strengths?: string[]
  improvements?: string[]
  hiring_recommendation?: string
  recommendation_label?: 'Strongly Recommend' | 'Recommend' | 'Maybe' | 'Do Not Recommend'
  skill_scores?: Record<string, number>
  completed_at?: string
  created_at: string
  // Joined
  interview_qa?: InterviewQA[]
  job?: Job
}

export interface InterviewQA {
  id: string
  interview_id: string
  question_number: number
  question: string
  skill_tested?: string
  difficulty_level: number
  applicant_answer?: string
  score?: number
  relevance_score?: number
  depth_score?: number
  clarity_score?: number
  ai_feedback?: string
  ideal_answer?: string
  strengths?: string[]
  improvements?: string[]
  created_at: string
}

export interface ScoreData {
  score: number
  relevance_score: number
  depth_score: number
  clarity_score: number
  feedback: string
  ideal_answer: string
  strengths: string[]
  improvements: string[]
  next_question: string | null
  next_skill_tested: string | null
  next_difficulty: number
  is_final: boolean
}

export interface ResumeAnalysis {
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
  experience_fit: 'strong' | 'moderate' | 'weak'
  feedback: string
  suggestions: string[]
}

export interface CandidateRanking {
  interview_id: string
  applicant_id: string
  full_name: string
  overall_score: number
  recommendation_label: string
  skill_scores: Record<string, number>
  strengths: string[]
  top_skill: string
  rank?: number
}

// ─── Server action response shape ────────────────────────────────────────────
export type ActionResponse<T = null> =
  | { data: T; error: null }
  | { data: null; error: string }
