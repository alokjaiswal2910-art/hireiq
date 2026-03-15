"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ASSETS, ANIMATION_VARIANTS } from "@/lib/constants";
import { getCandidateRankings } from "@/app/actions/interview";
import { getJobById } from "@/app/actions/jobs";
import { getApplicationsByJob, getApplicationDetailsForRecruiter } from "@/app/actions/applications";
import type { CandidateRanking, Application } from "@/lib/types";

type ApplicantDetail = Awaited<ReturnType<typeof getApplicationDetailsForRecruiter>>["data"];

export default function CandidatesByJobPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [jobTitle, setJobTitle] = useState<string>("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<CandidateRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [applicantDetail, setApplicantDetail] = useState<ApplicantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (selectedAppId) {
      setDetailLoading(true);
      getApplicationDetailsForRecruiter(selectedAppId).then((res) => {
        if (res.data) setApplicantDetail(res.data);
        setDetailLoading(false);
      });
    } else {
      setApplicantDetail(null);
    }
  }, [selectedAppId]);

  useEffect(() => {
    if (!jobId) return;
    Promise.all([
      getJobById(jobId),
      getApplicationsByJob(jobId),
      getCandidateRankings(jobId),
    ]).then(([jobRes, appRes, rankRes]) => {
      if (jobRes.data) setJobTitle(jobRes.data.title);
      if (appRes.data) setApplications(appRes.data);
      if (rankRes.data) setCandidates(rankRes.data);
      setLoading(false);
    });
  }, [jobId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="flex flex-col gap-6 pb-12 w-full font-dm-sans"
    >
      <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/recruiter/jobs" className="text-sm text-slate-400 hover:text-white mb-2 inline-block">← Back to Jobs</Link>
          <h1 className="font-syne font-bold text-2xl md:text-3xl text-white flex items-center gap-3">
            {loading ? "Loading..." : jobTitle || "Candidates"}
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 tracking-widest uppercase font-bold">
              {applications.length} Applications
            </span>
          </h1>
        </div>
      </motion.div>

      {/* Applications — everyone who applied */}
      <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-syne font-bold text-white">Applications</h2>
          <p className="text-slate-400 text-xs mt-0.5">Everyone who applied to this job</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-dm-sans whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500 bg-white/[0.02]">
                <th className="py-4 pl-6 font-syne font-bold">Applicant</th>
                <th className="py-4 px-4 font-syne font-bold">Status</th>
                <th className="py-4 px-4 font-syne font-bold">Resume score</th>
                <th className="py-4 pr-6 font-syne font-bold text-right">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500">Loading...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500">No applications yet.</td></tr>
              ) : (
                applications.map((app) => {
                  const applicant = (app as any).applicant;
                  const name = applicant?.full_name ?? 'Unknown';
                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <Image
                              src={ASSETS.illustrations.avatars[name.charCodeAt(0) % ASSETS.illustrations.avatars.length]}
                              alt={name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-white font-medium text-sm">{name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          app.status === 'interviewing' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {app.resume_score != null ? (
                          <span className="font-syne font-bold text-white">{app.resume_score}%</span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4 pr-6 text-right text-slate-400 text-xs">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Applicant detail modal */}
      <AnimatePresence>
        {(selectedAppId || applicantDetail) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => { setSelectedAppId(null); setApplicantDetail(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <h2 className="font-syne font-bold text-lg text-white">Applicant details</h2>
                <button
                  onClick={() => { setSelectedAppId(null); setApplicantDetail(null); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                  </div>
                ) : applicantDetail ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                        <Image
                          src={applicantDetail.applicant.avatar_url ?? ASSETS.illustrations.avatars[applicantDetail.applicant.full_name.charCodeAt(0) % ASSETS.illustrations.avatars.length]}
                          alt={applicantDetail.applicant.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-syne font-bold text-xl text-white">{applicantDetail.applicant.full_name}</h3>
                        <p className="text-slate-400 text-sm">{applicantDetail.jobTitle}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            applicantDetail.application.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            applicantDetail.application.status === 'interviewing' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {applicantDetail.application.status}
                          </span>
                          {applicantDetail.application.resume_score != null && (
                            <span className="text-white font-syne font-bold text-sm">{applicantDetail.application.resume_score}% match</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Contact</h4>
                      {applicantDetail.applicant.email ? (
                        <a href={`mailto:${applicantDetail.applicant.email}`} className="text-violet-400 hover:text-violet-300 font-medium text-sm break-all">
                          {applicantDetail.applicant.email}
                        </a>
                      ) : (
                        <p className="text-slate-500 text-sm">—</p>
                      )}
                    </div>

                    {applicantDetail.application.resume_feedback && (
                      <div>
                        <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">AI resume feedback</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{applicantDetail.application.resume_feedback}</p>
                      </div>
                    )}

                    {((applicantDetail.application.matched_skills?.length ?? 0) > 0 || (applicantDetail.application.missing_skills?.length ?? 0) > 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Matched skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {(applicantDetail.application.matched_skills ?? []).map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">Missing skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {(applicantDetail.application.missing_skills ?? []).map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {(applicantDetail.application.resume_suggestions?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Suggestions for candidate</h4>
                        <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                          {(applicantDetail.application.resume_suggestions ?? []).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {applicantDetail.application.resume_text && (
                      <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Resume text</h4>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-h-48 overflow-y-auto">
                          <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{applicantDetail.application.resume_text}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interviewed candidates (completed interviews, ranked) */}
      <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-syne font-bold text-white">Interviewed candidates</h2>
          <p className="text-slate-400 text-xs mt-0.5">Ranked by interview score</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-dm-sans whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500 bg-white/[0.02]">
                <th className="py-4 pl-6 font-syne font-bold">Rank</th>
                <th className="py-4 px-4 font-syne font-bold">Candidate</th>
                <th className="py-4 px-4 font-syne font-bold">Overall Score</th>
                <th className="py-4 px-4 font-syne font-bold">Role Fit</th>
                <th className="py-4 px-4 font-syne font-bold">Top Skill</th>
                <th className="py-4 pr-6 font-syne font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500">Loading...</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">No completed interviews for this job yet.</td></tr>
              ) : (
                candidates.map((c, i) => (
                  <motion.tr
                    key={c.interview_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="group hover:bg-white/[0.02]"
                  >
                    <td className="py-4 pl-6">
                      <span className="font-syne font-bold text-xl text-white">#{c.rank ?? i + 1}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                          <Image src={ASSETS.illustrations.avatars[c.full_name.charCodeAt(0) % ASSETS.illustrations.avatars.length]} alt={c.full_name} fill className="object-cover" />
                        </div>
                        <span className="text-white font-medium text-sm">{c.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded border text-xs font-bold w-12 text-center font-syne ${getScoreColor(c.overall_score)}`}>
                        {c.overall_score}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 ${
                        c.overall_score >= 80 ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                      }`}>
                        {c.recommendation_label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/5">{c.top_skill}</span>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <Link
                        href={`/recruiter/candidates/report/${c.interview_id}`}
                        className="text-xs font-bold uppercase tracking-wider text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded transition-colors"
                      >
                        View Full Report
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
