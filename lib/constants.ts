export const COLORS = {
  background: '#08080F',
  card: '#0F0F1E',
  primary: '#7C3AED',
  secondary: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#F43F5E',
  textPrimary: '#F1F5F9',
  textMuted: '#94A3B8',
  border: 'rgba(255,255,255,0.06)',
};

export const ASSETS = {
  backgrounds: {
    hero: '/assets/backgrounds/hero-bg.jpeg',
    loginPanel: '/assets/backgrounds/login-panel-bg.jpeg',
  },
  illustrations: {
    featInterview: '/assets/illustrations/feat-interview.jpeg',
    featResume: '/assets/illustrations/feat-resume.jpeg',
    featRanking: '/assets/illustrations/feat-ranking.jpeg',
    featRadar: '/assets/illustrations/feat-radar.jpeg',
    emptyCandidates: '/assets/illustrations/empty-candidates.jpeg',
    avatars: [
      '/assets/illustrations/avatar-1.jpeg',
      '/assets/illustrations/avatar-2.png',
      '/assets/illustrations/avatar-3.png',
      '/assets/illustrations/avatar-4.png',
      '/assets/illustrations/avatar-5.png',
      '/assets/illustrations/avatar-6.png',
    ],
  },
  models3d: {
    avtar: '/assets/3d/avtar.glb',
    trophy: '/assets/3d/trophy-3d.glb',
    aiBrain: '/assets/3d/ai-brain.glb',
    
    // Fallbacks
    avatarStatic: '/assets/3d/avatar-static.png',
  },
  animations: {
    loadingOrb: '/assets/animations/loading-orb.webm',
    scanAnimation: '/assets/animations/loading-orb.webm',
    particles: '/assets/animations/particles.webm',
    celebration: '/assets/animations/celebration.gif',
    avatarTalking: '/assets/animations/avatar-talking.webm',
  },
};

export const ANIMATION_VARIANTS: any = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  }
};
