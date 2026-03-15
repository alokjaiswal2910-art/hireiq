"use server";

import { callGemini } from '@/lib/gemini/client';
import { extractTextFromBuffer } from '@/lib/resume/parser';
import { applyToJob, saveResumeAnalysis } from '@/app/actions/applications';
import type { ActionResponse, ResumeAnalysis } from '@/lib/types';

export async function processAndAnalyzeResume(
  formData: FormData,
  jobId: string,
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[],
  experienceLevel: string
): Promise<ActionResponse<{ analysis: ResumeAnalysis; applicationId?: string }>> {
  const file = formData.get('resume') as File;
  if (!file) return { data: null, error: 'No resume file provided' };

  try {
    if (file.size > 10 * 1024 * 1024) return { data: null, error: 'File too large (max 10MB)' };
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resumeText = await extractTextFromBuffer(buffer);

    const analysisResponse = await analyzeResume(
      resumeText,
      jobTitle,
      jobDescription,
      requiredSkills,
      experienceLevel
    );

    if (analysisResponse.error || !analysisResponse.data) {
      return { data: null, error: analysisResponse.error ?? 'Failed to analyze resume' };
    }

    // 3. Create Application & Save Analysis
    const appResponse = await applyToJob(jobId, undefined, resumeText);
    let applicationId: string | undefined;

    if (appResponse.data) {
      applicationId = appResponse.data.id;
      await saveResumeAnalysis(appResponse.data.id, analysisResponse.data);
    } else if (appResponse.error && !appResponse.error.includes('Already applied')) {
      return { data: null, error: appResponse.error };
    } else {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: existing } = await supabase.from('applications').select('id').eq('job_id', jobId).eq('applicant_id', user?.id).single();
      if (existing?.id) {
        applicationId = existing.id;
        await saveResumeAnalysis(existing.id, analysisResponse.data);
      }
    }

    return { data: { analysis: analysisResponse.data, applicationId }, error: null };
  } catch (err) {
    console.error("Resume processing error:", err);
    return { data: null, error: err instanceof Error ? err.message : 'Processing failed' };
  }
}

export async function analyzeResume(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[],
  experienceLevel: string
): Promise<ActionResponse<ResumeAnalysis>> {
  const prompt = `
You are an expert technical recruiter. Analyze this resume against the job. You must respond with exactly one valid JSON object and nothing else. No markdown, no code fences, no explanation. Use double quotes for all keys and string values.

JOB TITLE: ${jobTitle}
EXPERIENCE LEVEL: ${experienceLevel}
REQUIRED SKILLS: ${requiredSkills.join(', ')}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Respond with ONLY this JSON structure (valid JSON, double quotes only):
{"match_score": <0-100 integer>, "matched_skills": ["skill1","skill2"], "missing_skills": ["skill1"], "experience_fit": "strong|moderate|weak", "feedback": "<2-3 sentences>", "suggestions": ["suggestion1","suggestion2"]}

Scoring: 70+ = strong, 40-69 = moderate, below 40 = weak.
`;

  try {
    const result = await callGemini<ResumeAnalysis>(prompt, { temperature: 0.3, maxOutputTokens: 2048 });

    if (
      typeof result.match_score !== 'number' ||
      !Array.isArray(result.matched_skills) ||
      !Array.isArray(result.missing_skills) ||
      !['strong', 'moderate', 'weak'].includes(result.experience_fit) ||
      typeof result.feedback !== 'string' ||
      !Array.isArray(result.suggestions)
    ) {
      return { data: null, error: 'Gemini returned an unexpected resume analysis shape' };
    }

    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Resume analysis failed' };
  }
}
