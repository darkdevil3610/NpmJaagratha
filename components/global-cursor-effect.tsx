"use client";

import { useEffect } from 'react';

import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';

function usePointerMotion() {
  const pointerX = useMotionValue(-2000);
  const pointerY = useMotionValue(-2000);

  useEffect(() => {
    const movePointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    };

    const resetPointer = () => {
      pointerX.set(-2000);
      pointerY.set(-2000);
    };

    window.addEventListener('pointermove', movePointer, { passive: true });
    window.addEventListener('pointerleave', resetPointer);
    window.addEventListener('blur', resetPointer);

    return () => {
      window.removeEventListener('pointermove', movePointer);
      window.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('blur', resetPointer);
    };
  }, [pointerX, pointerY]);

  return { pointerX, pointerY };
}

export function GlobalCursorEffect() {
  const { pointerX, pointerY } = usePointerMotion();
  const { scrollYProgress } = useScroll();

  const cursorX = useSpring(pointerX, { stiffness: 90, damping: 20, mass: 0.4 });
  const cursorY = useSpring(pointerY, { stiffness: 90, damping: 20, mass: 0.4 });

  const topGlowShift = useTransform(scrollYProgress, [0, 1], ['0px', '180px']);
  const bottomGlowShift = useTransform(scrollYProgress, [0, 1], ['0px', '-220px']);
  const gridShift = useTransform(scrollYProgress, [0, 1], ['0px', '260px']);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 h-[42rem] w-[42rem] rounded-full bg-emerald-300/[0.28] blur-[120px]"
        style={{ x: topGlowShift, y: topGlowShift }}
      />
      <motion.div
        className="absolute right-0 top-1/4 h-[34rem] w-[34rem] rounded-full bg-cyan-300/[0.1] blur-[150px]"
        style={{ x: topGlowShift, y: useTransform(scrollYProgress, [0, 1], ['0px', '-160px']) }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-amber-300/[0.22] blur-[120px]"
        style={{ y: bottomGlowShift }}
      />
      <motion.div className="absolute inset-0 opacity-80" style={{ y: gridShift }}>
        <div className="absolute inset-0 grid-overlay opacity-45" />
      </motion.div>
      <motion.div
        className="absolute h-64 w-64 rounded-full border border-emerald-200/70 bg-emerald-300/55 blur-3xl"
        style={{ x: cursorX, y: cursorY }}
      />
    </div>
  );
}