"use server";

import { createClient } from '@/lib/supabase/server';
import type { ActionResponse, Job } from '@/lib/types';

export async function createJob(
  title: string,
  description: string,
  requiredSkills: string[],
  experienceLevel: 'junior' | 'mid' | 'senior',
  department?: string
): Promise<ActionResponse<Job>> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('jobs')
    .insert({ recruiter_id: user.id, title, description, required_skills: requiredSkills, experience_level: experienceLevel, department })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Job, error: null };
}

export async function getJobs(): Promise<ActionResponse<Job[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('*, recruiter:users(id, full_name, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as Job[], error: null };
}

export async function getJobById(id: string): Promise<ActionResponse<Job>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('*, recruiter:users(id, full_name, avatar_url)')
    .eq('id', id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Job, error: null };
}

export async function getJobsByRecruiter(): Promise<ActionResponse<Job[]>> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('recruiter_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as Job[], error: null };
}

export async function deleteJob(jobId: string): Promise<ActionResponse<true>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const { error } = await supabase.from('jobs').delete().eq('id', jobId).eq('recruiter_id', user.id);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

export async function updateJob(
  jobId: string,
  updates: Partial<Pick<Job, 'title' | 'description' | 'required_skills' | 'experience_level' | 'department'>>
): Promise<ActionResponse<Job>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'Not authenticated' };

  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.required_skills !== undefined) payload.required_skills = updates.required_skills;
  if (updates.experience_level !== undefined) payload.experience_level = updates.experience_level;
  if (updates.department !== undefined) payload.department = updates.department;

  const { data, error } = await supabase
    .from('jobs')
    .update(payload)
    .eq('id', jobId)
    .eq('recruiter_id', user.id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Job, error: null };
}
