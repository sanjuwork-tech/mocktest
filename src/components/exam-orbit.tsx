"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

const answers = ["A", "B", "C"];

export function ExamOrbit() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-.5, .5], [8, -8]), { stiffness: 110, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-.5, .5], [-10, 10]), { stiffness: 110, damping: 18 });

  return (
    <div ref={ref} className="relative mx-auto h-[480px] w-full max-w-[510px] [perspective:1200px]" onPointerMove={(event) => { const box = ref.current?.getBoundingClientRect(); if (!box) return; mx.set((event.clientX - box.left) / box.width - .5); my.set((event.clientY - box.top) / box.height - .5); }} onPointerLeave={() => { mx.set(0); my.set(0); }}>
      <motion.div className="absolute inset-x-7 top-8 rounded-[32px] bg-blue p-1 shadow-[0_35px_90px_rgba(31,94,255,.28)]" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        <div className="exam-dots relative overflow-hidden rounded-[28px] bg-navy p-6 text-white sm:p-8">
          <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-wider"><span><i className="mr-2 inline-block size-2 rounded-full bg-lime shadow-[0_0_0_6px_rgba(184,255,52,.12)]" />IAT Full Mock 06</span><span className="rounded-lg bg-lime px-3 py-2 text-navy">01:42:18</span></div>
          <div className="relative z-10 py-7"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-white/40">Physics · Question 23 of 60</p><h2 className="mt-3 font-display text-[27px] leading-tight">A particle moves in a circle with constant angular velocity. Which graph is correct?</h2></div>
          <div className="relative z-10 space-y-2.5">{answers.map((answer, index) => <motion.div key={answer} className={`flex items-center gap-3 rounded-xl border p-3 text-xs ${index === 1 ? "border-lime bg-lime text-navy" : "border-white/15 text-white/60"}`} animate={index === 1 ? { scale: [1, 1.015, 1] } : {}} transition={{ duration: 2.6, repeat: Infinity }}><span className="grid size-7 place-items-center rounded-full border border-current font-mono text-[9px]">{answer}</span>{["Linear momentum vs. time", "Angular displacement vs. time", "Centripetal force vs. radius"][index]}</motion.div>)}</div>
          <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">{[["74%", "accuracy"], ["46s", "avg. time"], ["+4", "marks"]].map(([value, label]) => <div key={label} className="rounded-xl bg-white/[.07] p-3"><strong className="block font-mono text-base text-lime">{value}</strong><span className="text-[9px] text-white/40">{label}</span></div>)}</div>
        </div>
      </motion.div>
      <motion.div className="absolute -left-1 bottom-14 rounded-xl border border-navy bg-coral px-4 py-3 font-mono text-[10px] font-medium text-white shadow-[5px_5px_0_#071A4D]" animate={{ y: [0, -10, 0], rotate: [-5, -2, -5] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>AIR prediction: 842</motion.div>
      <motion.div className="absolute right-0 top-2 rounded-xl border border-navy bg-white px-4 py-3 font-mono text-[10px] font-medium shadow-[5px_5px_0_#071A4D]" animate={{ y: [0, 9, 0], rotate: [4, 7, 4] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}>+12 marks this week</motion.div>
    </div>
  );
}
