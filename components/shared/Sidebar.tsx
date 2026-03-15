"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/actions/auth";

interface UserInfo {
  full_name: string;
  role: 'recruiter' | 'applicant';
  avatar_url: string | null;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) return;
      const { data } = await supabase
        .from('users')
        .select('full_name, role, avatar_url')
        .eq('id', authUser.id)
        .single();
      if (data) setUser(data as UserInfo);
    });
  }, []);

  const isRecruiter = pathname.startsWith("/recruiter");
  const role = isRecruiter ? "recruiter" : "applicant";

  const recruiterLinks = [
    { icon: "📊", label: "Dashboard", href: "/recruiter" },
    { icon: "💼", label: "My Jobs", href: "/recruiter/jobs" },
    { icon: "👥", label: "Candidates", href: "/recruiter/candidates" },
    { icon: "📈", label: "Analytics", href: "/recruiter/analytics" },
  ];

  const applicantLinks = [
    { icon: "🏠", label: "Home", href: "/applicant" },
    { icon: "🔍", label: "Browse Jobs", href: "/applicant/jobs" },
    { icon: "📄", label: "My Resume", href: "/applicant/resume" },
    { icon: "🎯", label: "Interviews", href: "/applicant/interviews" },
    { icon: "📈", label: "My Progress", href: "/applicant/progress" },
  ];

  const links = isRecruiter ? recruiterLinks : applicantLinks;

  const avatarIndex = user?.full_name
    ? user.full_name.charCodeAt(0) % ASSETS.illustrations.avatars.length
    : 0;
  const avatarSrc = user?.avatar_url ?? ASSETS.illustrations.avatars[avatarIndex];
  const displayRole = user?.role ?? role;
  const roleName = displayRole === 'recruiter' ? 'Recruiter' : 'Job Seeker';

  return (
    <div className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0A0A18] border-r border-white/5 hidden lg:flex flex-col z-50">
      
      {/* Top Section */}
      <div className="p-6">
        <Link href="/" className="inline-block mb-8">
          <h1 className="font-syne font-bold text-[22px] gradient-text-animated">
            HireIQ
          </h1>
        </Link>
        
        {/* User Card */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
            <Image 
              src={avatarSrc} 
              alt={user?.full_name ?? 'User'}
              fill 
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-syne font-bold text-white text-sm truncate">
              {user?.full_name ?? '...'}
            </span>
            <div className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mt-1 w-fit ${
              displayRole === 'recruiter'
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" 
                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            }`}>
              {roleName}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto hide-scrollbar">
        {links.map((link) => {
          const isActive = link.href === `/${role}` 
            ? pathname === `/${role}`
            : pathname.startsWith(link.href);

          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors font-dm-sans text-sm ${
                  isActive 
                    ? "bg-violet-500/10 text-violet-300 font-medium" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavBorder"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-violet-500 rounded-r-full"
                  />
                )}
                <span className={`text-lg ${isActive ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : ""}`}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 mt-auto">
        <Link href={`/${role}/settings`}>
          <motion.div
            whileHover={{ x: 2 }}
            className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors font-dm-sans text-sm mb-1"
          >
            <span className="text-lg">⚙️</span>
            <span>Settings</span>
          </motion.div>
        </Link>
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-dm-sans text-sm mb-6 text-left">
          <span className="text-lg">🚪</span>
          <span>Log out</span>
        </button>
        
        <div className="px-3 text-[11px] font-dm-sans text-slate-500/50">
          HireIQ v1.0 <br/>
          Hack & Forge 2026
        </div>
      </div>
    </div>
  );
}
