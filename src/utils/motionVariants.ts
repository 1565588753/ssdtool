import { type Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
  })
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

export const cardHover = {
  rest: { y: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  hover: {
    y: -6,
    boxShadow: '0 16px 48px rgba(99,102,241,0.15)',
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.97, transition: { duration: 0.1 } }
};

export const buttonGlowHover: Variants = {
  rest: { boxShadow: '0 0 0 rgba(99,102,241,0)' },
  hover: {
    boxShadow: '0 0 24px rgba(99,102,241,0.4)',
    transition: { duration: 0.3 }
  }
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};