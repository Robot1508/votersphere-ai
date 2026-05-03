"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Users, CheckCircle, Clock, Award, TrendingUp, Zap, Shield
} from "lucide-react";

// Grain texture CSS injected as a data-URI style
const grainStyle: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "128px 128px",
};

function GlassCard({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-white/10 overflow-hidden group transition-all duration-300 hover:border-white/20 ${className}`}
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      }}
    >
      {/* Grain overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-60" style={grainStyle} />

      {/* Accent glow */}
      {accent && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at top left, ${accent}15, transparent 60%)` }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

const phases = [
  { num: 1, label: "Phase 1", region: "Vidarbha · Marathwada", date: "15 Apr", done: true },
  { num: 2, label: "Phase 2", region: "North MH · Konkan", date: "22 Apr", done: true },
  { num: 3, label: "Phase 3", region: "Pune · Mumbai", date: "29 Apr", done: false },
];

const stats = [
  { value: "288", label: "Assembly Constituencies", icon: MapPin, color: "#E63946" },
  { value: "9.7Cr", label: "MH Registered Voters", icon: Users, color: "#3b82f6" },
  { value: "67.8%", label: "Avg. Voter Turnout", icon: TrendingUp, color: "#22c55e" },
  { value: "M3", label: "EVM Generation", icon: Shield, color: "#f59e0b" },
];

export default function DashboardPage() {
  // Live credits fetched from PostgreSQL-backed API (Req 14.1, 14.2, 14.3)
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/credits?userId=robot1508")
      .then(r => r.json())
      .then(data => setCredits(data.credits ?? 0))
      .catch(() => setCredits(null));
  }, []);
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0c] px-4 py-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Live Dashboard
          </div>
          <h1 className="text-4xl font-black text-white">
            Maharashtra{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              2026
            </span>
          </h1>
          <p className="text-white/40 mt-2 text-sm">Elections overview, civic stats, and your literacy progress</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

          {/* Stats row */}
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <GlassCard accent={stat.color} className="p-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: stat.color + "18", border: `1px solid ${stat.color}35` }}
                >
                  <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Phase timeline — spans 2 cols */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <GlassCard className="p-6" accent="#E63946">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-white font-bold text-lg">Election Phases</div>
                  <div className="text-white/30 text-xs mt-0.5">Maharashtra Legislative Assembly 2026</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
                  Result: 04 May
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {phases.map((phase, i) => (
                  <div key={phase.num} className="flex items-center gap-4">
                    {/* Step number */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                      style={
                        phase.done
                          ? { background: "#E6394620", border: "1px solid #E6394650", color: "#E63946" }
                          : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
                      }
                    >
                      {phase.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-sm ${phase.done ? "text-white" : "text-white/40"}`}>
                          {phase.label} · {phase.region}
                        </span>
                        <span className={`text-xs font-mono ${phase.done ? "text-red-400" : "text-white/25"}`}>
                          {phase.date}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1 bg-white/8 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                          initial={{ width: 0 }}
                          animate={{ width: phase.done ? "100%" : i === phases.length - 1 ? "35%" : "0%" }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Result countdown card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <GlassCard className="p-6 flex flex-col h-full" accent="#f59e0b">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Result Day</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                <div className="text-5xl font-black text-white">04</div>
                <div className="text-xl font-bold text-yellow-400">May 2026</div>
                <div className="text-white/30 text-xs mt-1">Counting begins 8:00 AM IST</div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-white/30 text-xs">All 288 seats to be declared</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Civic Credits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <GlassCard className="p-6" accent="#22c55e">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-green-400" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Civic Credits</span>
              </div>
              <div className="text-4xl font-black text-white mb-1">
                {credits === null ? (
                  <span className="text-white/30 text-2xl">—</span>
                ) : credits}
              </div>
              <div className="text-white/30 text-xs mb-4">
                {credits === null ? "Loading…" : "pts · robot1508"}
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((credits ?? 0) / 1000) * 100, 100)}%` }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                />
              </div>
              <div className="text-white/25 text-[10px] mt-1.5 font-mono">
                {credits === null ? "" : `${Math.max(0, 1000 - credits)} pts to Gold tier`}
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <GlassCard className="p-6" accent="#a855f7">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Quick Actions</span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Try EVM Simulator", href: "/evm", color: "#E63946" },
                  { label: "View Journey", href: "/journey", color: "#3b82f6" },
                  { label: "Earn Badges", href: "/badges", color: "#a855f7" },
                ].map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/4 border border-white/8 hover:bg-white/8 hover:border-white/15 transition-all group"
                  >
                    <span className="text-white/60 text-xs group-hover:text-white transition-colors">{action.label}</span>
                    <span className="text-white/25 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                  </a>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* EVM Fun Fact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <GlassCard className="p-6" accent="#E63946">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Did You Know?</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                The M3 EVM can store up to{" "}
                <span className="text-red-400 font-bold">2,000 votes</span> and operates
                independently of any network — making it physically impossible to hack remotely.
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-white/25 text-[10px] font-mono">Source: Election Commission of India · Art. 324</div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
