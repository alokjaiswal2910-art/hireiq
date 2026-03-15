"use server";

import { createClient } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/client';
import type { ActionResponse, Interview, InterviewQA, ScoreData, CandidateRanking } from '@/lib/types';

// ─── Generate First Question ──────────────────────────────────────────────────
export async function generateFirstQuestion(
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[]
): Promise<ActionResponse<{ question: string; skill_tested: string; difficulty_level: number }>> {
  const prompt = `
You are a senior technical interviewer for a ${jobTitle} role.

JOB DESCRIPTION: ${jobDescription.slice(0, 600)}
REQUIRED SKILLS: ${requiredSkills.join(', ')}

Generate the FIRST interview question. Start with a medium difficulty conceptual question.
Keep the question to 1-3 sentences so it stays concise.

Return ONLY a valid JSON object with no trailing commas:
{
  "question": "<the interview question>",
  "skill_tested": "<which skill from the required list this tests>",
  "difficulty_level": <integer 4-6>
}
`;

  try {
    const result = await callAI<{ question: string; skill_tested: string; difficulty_level: number }>(
      prompt, { temperature: 0.8, maxOutputTokens: 1024 }
    );
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to generate question' };
  }
}

// ─── Score Answer + Generate Next Question ───────────────────────────────────
export async function scoreAnswerAndAdvance(
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[],
  question: string,
  skillTested: string,
  userAnswer: string,
  questionNumber: number,
  totalQuestions: number,
  previousScores: number[]
): Promise<ActionResponse<ScoreData>> {
  const isFinal = questionNumber >= totalQuestions;
  const avgScore = previousScores.length > 0
    ? Math.round(previousScores.reduce((a, b) => a + b, 0) / previousScores.length)
    : 5;

  // Adaptive difficulty
  const nextDifficulty = avgScore >= 8 ? Math.min(10, avgScore + 1)
    : avgScore <= 4 ? Math.max(1, avgScore - 1)
    : avgScore;

  const prompt = `
You are evaluating a candidate for a ${jobTitle} role.

QUESTION: ${question}
SKILL TESTED: ${skillTested}
CANDIDATE'S ANSWER: ${userAnswer}

${!isFinal ? `
Also generate the next interview question (question ${questionNumber + 1} of ${totalQuestions}).
Target difficulty: ${nextDifficulty}/10. Pick a new skill from: ${requiredSkills.join(', ')}.
Avoid repeating: ${skillTested}.
` : ''}

Return ONLY valid JSON:
{
  "score": <integer 0-10>,
  "relevance_score": <integer 0-10>,
  "depth_score": <integer 0-10>,
  "clarity_score": <integer 0-10>,
  "feedback": "<1-2 sentences of direct actionable feedback to the candidate>",
  "ideal_answer": "<what an excellent answer would cover in 2-4 sentences>",
  "strengths": [<2 short strings>],
  "improvements": [<2 short strings>],
  "next_question": ${isFinal ? 'null' : '"<the next interview question text>"'},
  "next_skill_tested": ${isFinal ? 'null' : '"<primary skill tested by next question>"'},
  "next_difficulty": ${isFinal ? '0' : nextDifficulty},
  "is_final": ${isFinal}
}
`;

  try {
    const result = await callAI<ScoreData>(prompt, { temperature: 0.3, maxOutputTokens: 1024 });

    if (typeof result.score !== 'number' || typeof result.feedback !== 'string') {
      return { data: null, error: 'AI returned an unexpected score shape' };
    }

    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Scoring failed' };
  }
}

// ─── Create Interview Row ─────────────────────────────────────────────────────
export async function createInterview(
  applicationId: string,
  jobId: string
): Promise<ActionResponse<Interview>> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('interviews')
    .insert({ application_id: applicationId, job_id: jobId, applicant_id: user.id, status: 'in_progress' })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Interview, error: null };
}

// ─── Save Q&A Row ────────────────────────────────────────────────────────────
export async function saveInterviewQA(
  interviewId: string,
  questionNumber: number,
  question: string,
  skillTested: string,
  difficultyLevel: number,
  userAnswer: string,
  scoreData: ScoreData
): Promise<ActionResponse<InterviewQA>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('interview_qa')
    .insert({
      interview_id: interviewId,
      question_number: questionNumber,
      question,
      skill_tested: skillTested,
      difficulty_level: difficultyLevel,
      applicant_answer: userAnswer,
      score: scoreData.score,
      relevance_score: scoreData.relevance_score,
      depth_score: scoreData.depth_score,
      clarity_score: scoreData.clarity_score,
      ai_feedback: scoreData.feedback,
      ideal_answer: scoreData.ideal_answer,
      strengths: scoreData.strengths,
      improvements: scoreData.improvements,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as InterviewQA, error: null };
}

// ─── Complete Interview + Calculate Final Scores ──────────────────────────────
export async function completeInterview(
  interviewId: string,
  jobTitle: string,
  requiredSkills: string[]
): Promise<ActionResponse<Interview>> {
  const supabase = await createClient();

  // Fetch all Q&A for this interview
  const { data: qaRows, error: qaError } = await supabase
    .from('interview_qa')
    .select('*')
    .eq('interview_id', interviewId)
    .order('question_number', { ascending: true });

  if (qaError || !qaRows?.length) return { data: null, error: 'No answers found' };

  const scores = qaRows.map(r => r.score ?? 0);
  const relevances = qaRows.map(r => r.relevance_score ?? 0);
  const depths = qaRows.map(r => r.depth_score ?? 0);
  const clarities = qaRows.map(r => r.clarity_score ?? 0);

  const avg = (arr: number[]) => Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
  const overallScore = Math.round(avg(scores) * 10); // Scale to 0-100

  // Build skill_scores map
  const skillScores: Record<string, number[]> = {};
  qaRows.forEach(r => {
    if (r.skill_tested) {
      if (!skillScores[r.skill_tested]) skillScores[r.skill_tested] = [];
      skillScores[r.skill_tested].push(r.score ?? 0);
    }
  });
  const skillScoreMap: Record<string, number> = {};
  Object.entries(skillScores).forEach(([skill, vals]) => {
    skillScoreMap[skill] = Math.round(avg(vals));
  });

  // Generate hiring recommendation via Gemini
  const recommendationLabel: Interview['recommendation_label'] =
    overallScore >= 80 ? 'Strongly Recommend'
    : overallScore >= 65 ? 'Recommend'
    : overallScore >= 50 ? 'Maybe'
    : 'Do Not Recommend';

  const allStrengths = qaRows.flatMap(r => r.strengths ?? []).slice(0, 3);
  const allImprovements = qaRows.flatMap(r => r.improvements ?? []).slice(0, 3);

  const hiringRec = `Candidate scored ${overallScore}/100 for ${jobTitle}. ${recommendationLabel}. Strong in: ${allStrengths[0] ?? 'N/A'}. Needs improvement in: ${allImprovements[0] ?? 'N/A'}.`;

  const { data, error } = await supabase
    .from('interviews')
    .update({
      status: 'completed',
      overall_score: overallScore,
      relevance_avg: avg(relevances),
      depth_avg: avg(depths),
      clarity_avg: avg(clarities),
      strengths: allStrengths,
      improvements: allImprovements,
      hiring_recommendation: hiringRec,
      recommendation_label: recommendationLabel,
      skill_scores: skillScoreMap,
      completed_at: new Date().toISOString(),
    })
    .eq('id', interviewId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Interview, error: null };
}

// ─── Get Interview with Q&A ───────────────────────────────────────────────────
export async function getInterviewWithQA(interviewId: string): Promise<ActionResponse<Interview>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('interviews')
    .select('*, interview_qa(*), job:jobs(id, title, description, required_skills)')
    .eq('id', interviewId)
    .single();

  if (error) return { data: null, error: error.message };
  const interview = data as Interview;
  if (interview.interview_qa && Array.isArray(interview.interview_qa)) {
    interview.interview_qa.sort((a, b) => a.question_number - b.question_number);
  }
  return { data: interview, error: null };
}

// ─── Get Candidate Rankings for a Job ────────────────────────────────────────
export async function getCandidateRankings(jobId: string): Promise<ActionResponse<CandidateRanking[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('interviews')
    .select(`
      id,
      applicant_id,
      overall_score,
      recommendation_label,
      skill_scores,
      strengths,
      applicant:users(full_name)
    `)
    .eq('job_id', jobId)
    .eq('status', 'completed')
    .order('overall_score', { ascending: false });

  if (error) return { data: null, error: error.message };

  const rankings: CandidateRanking[] = (data ?? []).map((r: any, index: number) => {
    const skillScores = r.skill_scores as Record<string, number> ?? {};
    const topSkill = Object.entries(skillScores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
    return {
      interview_id: r.id,
      applicant_id: r.applicant_id,
      full_name: r.applicant?.full_name ?? 'Unknown',
      overall_score: r.overall_score ?? 0,
      recommendation_label: r.recommendation_label ?? 'N/A',
      skill_scores: skillScores,
      strengths: r.strengths ?? [],
      top_skill: topSkill,
      rank: index + 1,
    };
  });

  return { data: rankings, error: null };
}
