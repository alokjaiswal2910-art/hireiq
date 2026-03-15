"use server";

import { createClient } from '@/lib/supabase/server';
import { getInterviewWithQA } from '@/app/actions/interview';
import { getCandidateRankings } from '@/app/actions/interview';
import type { ActionResponse, CandidateRanking, Interview, InterviewQA } from '@/lib/types';

export async function getRecruiterStats(): Promise<
  ActionResponse<{
    total_jobs: number;
    total_applications: number;
    total_interviews_completed: number;
    average_score: number;
    top_candidate: { name: string; score: number; job_title: string } | null;
  }>
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data: jobs } = await supabase.from('jobs').select('id').eq('recruiter_id', user.id);
  const jobIds = jobs?.map((j) => j.id) ?? [];

  if (jobIds.length === 0) {
    return {
      data: {
        total_jobs: 0,
        total_applications: 0,
        total_interviews_completed: 0,
        average_score: 0,
        top_candidate: null,
      },
      error: null,
    };
  }

  const [appRes, intRes, topRes] = await Promise.all([
    supabase.from('applications').select('id', { count: 'exact', head: true }).in('job_id', jobIds),
    supabase.from('interviews').select('id, overall_score').in('job_id', jobIds).eq('status', 'completed'),
    supabase.from('interviews').select('overall_score, applicant:users(full_name), job:jobs(title)').in('job_id', jobIds).eq('status', 'completed').order('overall_score', { ascending: false }).limit(1).single(),
  ]);

  const total_applications = appRes.count ?? 0;
  const completed = (intRes.data ?? []) as { overall_score?: number }[];
  const total_interviews_completed = completed.length;
  const scores = completed.map((i) => i.overall_score ?? 0).filter(Boolean);
  const average_score = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  let top_candidate: { name: string; score: number; job_title: string } | null = null;
  if (topRes.data && !topRes.error) {
    const t = topRes.data as any;
    top_candidate = {
      name: t.applicant?.full_name ?? 'Unknown',
      score: t.overall_score ?? 0,
      job_title: t.job?.title ?? 'Unknown',
    };
  }

  return {
    data: {
      total_jobs: jobIds.length,
      total_applications,
      total_interviews_completed,
      average_score,
      top_candidate,
    },
    error: null,
  };
}

export async function getAllCandidatesRanked(): Promise<ActionResponse<(CandidateRanking & { job_title?: string })[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data: jobs } = await supabase.from('jobs').select('id, title').eq('recruiter_id', user.id);
  const jobIds = jobs?.map((j) => j.id) ?? [];
  const jobTitles: Record<string, string> = Object.fromEntries((jobs ?? []).map((j) => [j.id, j.title]));

  const all: (CandidateRanking & { job_title?: string })[] = [];
  for (const jobId of jobIds) {
    const { data } = await getCandidateRankings(jobId);
    if (data) {
      const withJob = data.map((c) => ({ ...c, job_title: jobTitles[jobId] }));
      all.push(...withJob);
    }
  }
  all.sort((a, b) => b.overall_score - a.overall_score);
  all.forEach((c, i) => { (c as any).rank = i + 1; });

  return { data: all, error: null };
}

export async function getCandidateFullReport(interviewId: string): Promise<
  ActionResponse<{
    interview: Interview;
    qa: InterviewQA[];
    job: { title: string; description: string };
    applicant: { full_name: string };
    skill_scores: Record<string, number>;
  }>
> {
  const res = await getInterviewWithQA(interviewId);
  if (res.error || !res.data) return { data: null, error: res.error ?? 'Not found' };

  const interview = res.data;
  const qa = (interview.interview_qa ?? []).slice().sort((a, b) => a.question_number - b.question_number);

  const supabase = await createClient();
  const { data: userRow } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', interview.applicant_id)
    .single();

  return {
    data: {
      interview,
      qa,
      job: {
        title: interview.job?.title ?? '',
        description: interview.job?.description ?? '',
      },
      applicant: { full_name: userRow?.full_name ?? 'Unknown' },
      skill_scores: interview.skill_scores ?? {},
    },
    error: null,
  };
}
