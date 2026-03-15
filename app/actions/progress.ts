"use server";

import { createClient } from '@/lib/supabase/server';
import type { ActionResponse } from '@/lib/types';

export async function getApplicantStats(): Promise<
  ActionResponse<{
    jobs_applied: number;
    interviews_completed: number;
    best_score: number;
    average_score: number;
    resume_score: number | null;
  }>
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data: applications } = await supabase
    .from('applications')
    .select('id, resume_score, created_at')
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false });

  const { data: interviews } = await supabase
    .from('interviews')
    .select('overall_score')
    .eq('applicant_id', user.id)
    .eq('status', 'completed');

  const scores = (interviews ?? []).map((i) => i.overall_score ?? 0).filter(Boolean);
  const best = scores.length > 0 ? Math.max(...scores) : 0;
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const latestResume = applications?.[0]?.resume_score ?? null;

  return {
    data: {
      jobs_applied: applications?.length ?? 0,
      interviews_completed: interviews?.length ?? 0,
      best_score: best,
      average_score: avg,
      resume_score: latestResume ?? null,
    },
    error: null,
  };
}

export async function getApplicantProgress(): Promise<
  ActionResponse<{
    interviews: Array<{
      overall_score: number;
      completed_at: string;
      job_title: string;
      recommendation_label: string;
    }>;
    improvement: number;
    best_score: number;
    average_score: number;
    total_interviews: number;
  }>
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data: rows } = await supabase
    .from('interviews')
    .select('overall_score, completed_at, recommendation_label, job:jobs(title)')
    .eq('applicant_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  const interviews = (rows ?? []).map((r: any) => ({
    overall_score: r.overall_score ?? 0,
    completed_at: r.completed_at ?? '',
    job_title: r.job?.title ?? 'Unknown',
    recommendation_label: r.recommendation_label ?? 'N/A',
  }));

  const scores = interviews.map((i) => i.overall_score);
  const total_interviews = scores.length;
  const best_score = total_interviews > 0 ? Math.max(...scores) : 0;
  const average_score = total_interviews > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / total_interviews) : 0;

  let improvement = 0;
  if (scores.length >= 2) {
    const first = scores[scores.length - 1];
    const last = scores[0];
    improvement = first > 0 ? Math.round(((last - first) / first) * 1000) / 10 : 0;
    improvement = Math.min(999, Math.max(-999, improvement));
  }

  return {
    data: { interviews, improvement, best_score, average_score, total_interviews },
    error: null,
  };
}
