"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const JourneyScene = dynamic(() => import("@/components/JourneyScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
    </div>
  ),
});

const steps = [
  {
    num: "01",
    title: "Voter Registration (Form 6)",
    desc: "Enroll your name in the electoral rolls by submitting Form 6 online at voters.eci.gov.in or at your local Electoral Registration Officer (ERO) office.",
  },
  {
    num: "02",
    title: "NVSP Verification",
    desc: "The NVSP portal processes your application. Check your status online. Upon approval, an EPIC (Voter ID card) is dispatched to your registered address.",
  },
  {
    num: "03",
    title: "Collect EPIC Card",
    desc: "Your Elector's Photo Identity Card arrives. Keep it safe — it is the primary ID accepted at polling booths and is proof of voter registration.",
  },
  {
    num: "04",
    title: "Visit Polling Booth",
    desc: "On election day, visit the polling booth assigned to your constituency. Show your EPIC or any of the 12 alternative approved IDs at the entry.",
  },
  {
    num: "05",
    title: "Cast Your Vote",
    desc: "Press the red button next to your chosen candidate on the Ballot Unit. An unmistakable long beep confirms your vote has been recorded.",
  },
  {
    num: "06",
    title: "Verify VVPAT Receipt",
    desc: "The VVPAT prints a paper slip visible for 7 seconds. Confirm it matches your choice before it drops into the sealed ballot box. Your democratic act is complete.",
  },
];

export default function JourneyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0c] flex flex-col">

      {/* ── Sticky 3D canvas + scrollable content ── */}
      <div
        id="journey-scroll-container"
        className="relative flex-1 overflow-y-auto"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        {/* Sticky 3D canvas */}
        <div className="sticky top-0 w-full h-[55vh] z-0 pointer-events-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-transparent to-[#0a0a0c] pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-transparent to-[#0a0a0c] pointer-events-none z-10" />
          {/* Red ambient glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[180px] bg-red-600/8 blur-[80px] rounded-full pointer-events-none" />
          <JourneyScene />
        </div>

        {/* Scrollable content pulls camera through milestones */}
        <div className="relative z-10 -mt-[10vh]">

          {/* Page title */}
          <div className="px-6 pb-8 max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Voter Journey · Scroll to Explore
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-2">
                From{" "}
                <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                  Form 6
                </span>{" "}
                to Receipt
              </h1>
              <p className="text-white/40 text-base max-w-xl">
                Scroll down to move the camera through all 6 milestones of the Indian voting process.
                The 3D path lights up as you progress.
              </p>
            </motion.div>
          </div>

          {/* Step cards — one per milestone, each advances the camera */}
          <div className="max-w-7xl mx-auto w-full px-6 pb-32">
            <div className="flex flex-col gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ amount: 0.3 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="relative flex gap-5 bg-white/4 border border-white/10 rounded-2xl p-6 hover:border-red-500/30 hover:bg-white/6 transition-all duration-300 max-w-2xl"
                >
                  {/* Step number */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                      <span className="text-red-400 font-black text-sm font-mono">{step.num}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 bg-gradient-to-b from-red-500/30 to-transparent min-h-[32px]" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1.5">
                    <h3 className="text-white font-bold text-base leading-snug">{step.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}

              {/* Final CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl flex items-center gap-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-sm">✓</span>
                </div>
                <div>
                  <div className="text-white font-bold">Your vote is recorded & verified.</div>
                  <p className="text-white/40 text-sm mt-0.5">
                    Now try the{" "}
                    <a href="/evm" className="text-red-400 hover:text-red-300 underline underline-offset-2">
                      EVM Simulator →
                    </a>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
