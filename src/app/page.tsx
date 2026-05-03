"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";

// Dynamically import the 3D scene (SSR disabled — Three.js needs the browser)
const EVMScene = dynamic(() => import("@/components/EVMScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
    </div>
  ),
});

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden bg-[#0a0a0c]">

      {/* ── Background gradient ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      {/* ── Main hero layout ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 px-6 py-16 gap-12 max-w-7xl mx-auto w-full">

        {/* Left — text */}
        <motion.div
          className="flex-1 flex flex-col gap-6 max-w-xl"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-widest w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Maharashtra 2026
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
            Know Your{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              Vote.
            </span>
            <br />
            Shape the{" "}
            <span className="text-white/60">Future.</span>
          </h1>

          <p className="text-lg text-white/50 leading-relaxed max-w-md">
            An immersive election literacy platform — explore the M3 EVM in 3D,
            simulate your ballot, earn civic badges, and understand Indian democracy
            like never before.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/evm"
              className="px-6 py-3 rounded-full bg-[#E63946] text-white font-semibold text-sm hover:bg-red-500 transition-all hover:shadow-[0_0_24px_rgba(230,57,70,0.5)] active:scale-95"
            >
              Try EVM Simulator →
            </Link>
            <Link
              href="/journey"
              className="px-6 py-3 rounded-full border border-white/20 text-white/70 font-semibold text-sm hover:border-white/50 hover:text-white transition-all"
            >
              View Journey
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 pt-4 border-t border-white/10">
            {[
              { value: "97.8Cr", label: "Registered Voters" },
              { value: "M3 EVM", label: "Latest Generation" },
              { value: "100%", label: "VVPAT Verified" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-xl font-black text-white">{stat.value}</span>
                <span className="text-xs text-white/40 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — 3D Canvas */}
        <motion.div
          className="flex-1 w-full max-w-lg h-[420px] lg:h-[520px] relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        >
          {/* Glow backdrop behind canvas */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-900/20 to-transparent blur-2xl" />
          <div className="relative w-full h-full">
            <EVMScene />
          </div>
          {/* Caption */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs font-mono tracking-widest">
            M3 EVM · DRAG TO ROTATE
          </div>
        </motion.div>
      </div>

      {/* ── Feature chips row ── */}
      <motion.div
        className="relative z-10 flex items-center justify-center gap-4 flex-wrap pb-12 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {[
          "Interactive EVM Simulation",
          "3D Voter Journey",
          "Civic Badges",
          "Constitution AI",
        ].map((feat) => (
          <span
            key={feat}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium backdrop-blur-sm"
          >
            {feat}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
