'use client';

// Adapted from React Bits' BlurText component (MIT + Commons Clause).
// https://github.com/DavidHDev/react-bits/tree/main/src/ts-tailwind/TextAnimations/BlurText
import { MotionConfig, motion } from 'motion/react';
import { useMemo } from 'react';

type Props = { text: string; className?: string; delay?: number; duration?: number };

export function BlurText({ text, className = '', delay = 75, duration = 0.55 }: Props) {
  const words = useMemo(() => text.split(/\s+/), [text]);
  return <MotionConfig reducedMotion="user"><span className={`blur-text ${className}`}><span className="sr-only">{text}</span>{words.map((word, i) => <motion.span aria-hidden="true" className="blur-word" key={`${word}-${i}`} initial={{ opacity: 0, y: 22, filter: 'blur(9px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration, delay: i * delay / 1000, ease: [0.33, 1, 0.68, 1] }}>{word}{i < words.length - 1 ? ' ' : ''}</motion.span>)}</span></MotionConfig>;
}
