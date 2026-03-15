"use client";

import Image from "next/image";
import { ASSETS } from "@/lib/constants";
import { PageTransition } from "@/components/global/page-transition";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#08080F]">
      {/* Left Column - Hidden on mobile, 50% width on desktop */}
      <div className="relative hidden lg:flex lg:w-1/2 min-h-screen items-end p-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={ASSETS.backgrounds.loginPanel}
            alt="Authentication Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Right Edge Gradient Fade */}
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-[#08080F] z-10" />
        
        {/* Bottom Dark Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#08080F] to-transparent z-10" />

        {/* Quote Content */}
        <div className="relative z-20 max-w-lg mb-8">
          <h2 className="font-syne font-bold text-2xl text-white leading-snug mb-2">
            "Your next great hire is one interview away."
          </h2>
          <p className="font-dm-sans text-[13px] text-slate-400">
            HireIQ — AI-powered hiring intelligence
          </p>
        </div>
      </div>

      {/* Right Column - Full width on mobile, 50% on desktop */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative z-20 bg-[#08080F]">
        <div className="w-full max-w-md mx-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </div>
    </div>
  );
}
