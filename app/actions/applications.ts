"use server";

import { createClient } from '@/lib/supabase/server';
import type { ActionResponse, Application, ResumeAnalysis, User } from '@/lib/types';

export async function applyToJob(
  jobId: string,
  resumeUrl?: string,
  resumeText?: string
): Promise<ActionResponse<Application>> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('applicant_id', user.id)
    .single();

  if (existing) return { data: null, error: 'Already applied to this job' };

  const { data, error } = await supabase
    .from('applications')
    .insert({ job_id: jobId, applicant_id: user.id, status: 'applied', resume_url: resumeUrl, resume_text: resumeText })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Application, error: null };
}

export async function getApplicationsByJob(jobId: string): Promise<ActionResponse<Application[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('applications')
    .select('*, applicant:users(id, full_name, avatar_url)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as Application[], error: null };
}

export async function getApplicationsByApplicant(): Promise<ActionResponse<Application[]>> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('applications')
    .select('*, job:jobs(id, title, description, required_skills, experience_level)')
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as Application[], error: null };
}

export async function saveResumeAnalysis(
  applicationId: string,
  analysis: ResumeAnalysis
): Promise<ActionResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('applications')
    .update({
      resume_score: analysis.match_score,
      matched_skills: analysis.matched_skills,
      missing_skills: analysis.missing_skills,
      resume_feedback: analysis.feedback,
      resume_suggestions: analysis.suggestions,
      status: 'interviewing',
    })
    .eq('id', applicationId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: Application['status']
): Promise<ActionResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from('applications').update({ status }).eq('id', applicationId);
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

/** Full application + applicant details for recruiter (only if they own the job). */
export async function getApplicationDetailsForRecruiter(
  applicationId: string
): Promise<
  ActionResponse<{
    application: Application & { applicant?: User; job?: { title: string } };
    applicant: { full_name: string; avatar_url?: string | null; email?: string | null };
    jobTitle: string;
  }>
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data: app, error: appError } = await supabase
    .from('applications')
    .select('*, applicant:users(id, full_name, avatar_url), job:jobs(id, title, recruiter_id)')
    .eq('id', applicationId)
    .single();

  if (appError || !app) return { data: null, error: appError?.message ?? 'Application not found' };

  const job = app.job as { recruiter_id?: string } | undefined;
  if (job?.recruiter_id !== user.id) return { data: null, error: 'Not authorized to view this application' };

  const applicant = app.applicant as { full_name?: string; avatar_url?: string | null } | undefined;
  return {
    data: {
      application: app as Application & { applicant?: User; job?: { title: string } },
      applicant: {
        full_name: applicant?.full_name ?? 'Unknown',
        avatar_url: applicant?.avatar_url ?? null,
        email: null as string | null,
      },
      jobTitle: (app.job as { title?: string })?.title ?? 'Job',
    },
    error: null,
  };
}
