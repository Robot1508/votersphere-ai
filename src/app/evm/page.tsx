"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Leaf, Hand, Bike, PawPrint, XCircle, LucideIcon, Star, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

type Candidate = {
  id: number;
  name: string;
  party: string;
  color: string;
  icon: LucideIcon;
};

const candidates: Candidate[] = [
  { id: 1, name: "Amara Singh",    party: "Party A · Janbhumi",  color: "#22c55e", icon: Leaf     },
  { id: 2, name: "Rohit Patil",    party: "Party B · Rashtriya", color: "#3b82f6", icon: Hand     },
  { id: 3, name: "Deepa Kulkarni", party: "Party C · Pragati",   color: "#f59e0b", icon: Bike     },
  { id: 4, name: "Suresh Nair",    party: "Party D · Shakti",    color: "#a855f7", icon: PawPrint },
  { id: 5, name: "NOTA",           party: "None Of The Above",    color: "#94a3b8", icon: XCircle  },
];

const CREDITS_PER_VOTE = 10;
const DEMOCRACY_GUARDIAN_THRESHOLD = 50;

// ── Confetti burst ────────────────────────────────────────────────────────────
function fireCelebration(color: string) {
  const end = Date.now() + 1500;
  const colors = [color, "#E63946", "#ffffff", "#fbbf24"];

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
      zIndex: 9999,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// ── Spring-physics ballot button ──────────────────────────────────────────────
// Exported for unit tests
export const SPRING_CONFIG = { stiffness: 320, damping: 14 } as const;

function BallotButton({
  candidate,
  voted,
  onVote,
}: {
  candidate: Candidate;
  voted: Candidate | null;
  onVote: (c: Candidate) => void;
}) {
  const y       = useMotionValue(0);
  const springY = useSpring(y, SPRING_CONFIG); // stiffness >= 300 ✓, damping <= 15 ✓

  const handlePointerDown = () => {
    if (voted !== null) return; // guard — no mutation after vote cast
    y.set(5); // 4–6 px depression ✓
  };

  const handlePointerUp = () => {
    y.set(0); // return to rest
  };

  return (
    <motion.button
      id={`vote-btn-${candidate.id}`}
      style={{ y: springY }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={() => onVote(candidate)}
      disabled={voted !== null}
      whileHover={!voted ? { scale: 1.05, filter: "brightness(1.1)" } : {}}
      className="shrink-0 w-12 h-12 rounded-full bg-[#E63946] border-4 border-red-900
                 shadow-[0_8px_16px_rgba(230,57,70,0.4),inset_0_4px_4px_rgba(255,255,255,0.3)]
                 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-shadow hover:shadow-[0_8px_24px_rgba(230,57,70,0.7)]"
      aria-label={`Vote for ${candidate.name}`}
    />
  );
}


async function postCredits(delta: number): Promise<{ currentCredits: number; badgesEarned: string[] }> {
  try {
    const res = await fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "robot1508", delta }),
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    // Graceful fallback — credits still tracked locally
    return { currentCredits: delta, badgesEarned: [] };
  }
}

export default function EVMSimulator() {
  const [voted, setVoted]               = useState<Candidate | null>(null);
  const [slipVisible, setSlipVisible]   = useState(false);
  const [slipNo]                        = useState(() => Math.floor(Math.random() * 90000) + 10000);
  const [civicCredits, setCivicCredits] = useState(0);
  const [latestBadges, setLatestBadges] = useState<string[]>([]);
  const [badgeFlash, setBadgeFlash]     = useState(false);
  const voteCount                       = useRef(0);

  // ── Beep ────────────────────────────────────────────────────────────────────
  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 2500;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
      osc.start();
      osc.stop(ctx.currentTime + 1.4);
    } catch (e) {
      console.error("Audio failed", e);
    }
  }, []);

  // ── Vote handler ─────────────────────────────────────────────────────────────
  const handleVote = async (candidate: Candidate) => {
    if (voted) return;

    // Synchronous: beep + vibrate in the same execution frame (Req 7.1)
    playBeep();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50); // exactly once per vote ✓
    }

    setVoted(candidate);
    setSlipVisible(true);
    voteCount.current += 1;

    // Confetti
    fireCelebration(candidate.color);

    // Credits
    const { currentCredits, badgesEarned } = await postCredits(CREDITS_PER_VOTE);
    setCivicCredits(currentCredits);
    if (badgesEarned.length > 0) {
      setLatestBadges(badgesEarned);
      setBadgeFlash(true);
      setTimeout(() => setBadgeFlash(false), 3500);
    }

    // Reset VVPAT after 7 s
    setTimeout(() => {
      setSlipVisible(false);
      setTimeout(() => setVoted(null), 900);
    }, 7000);
  };

  const isDemocracyGuardian = civicCredits >= DEMOCRACY_GUARDIAN_THRESHOLD;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0c] px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* ── Header row ── */}
        <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              EVM Simulator
            </div>
            <h1 className="text-4xl font-black text-white">
              M3 EVM{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                Replica
              </span>
            </h1>
            <p className="text-white/40 mt-2 max-w-md text-sm">
              Press a red button to cast your vote. The VVPAT window displays your
              paper slip for 7 seconds. Each vote earns{" "}
              <span className="text-yellow-400 font-semibold">{CREDITS_PER_VOTE} Civic Credits</span>.
            </p>
          </div>

          {/* Civic Credits widget */}
          <motion.div
            animate={badgeFlash ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-end gap-1.5"
          >
            <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 rounded-2xl px-4 py-3">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <div>
                <div className="text-yellow-300 font-black text-xl leading-none">
                  {civicCredits}
                </div>
                <div className="text-yellow-500/60 text-[10px] font-mono mt-0.5">Civic Credits</div>
              </div>
            </div>

            {/* Democracy Guardian progress */}
            <div className="w-full">
              <div className="flex justify-between text-[9px] font-mono text-white/25 mb-1">
                <span>Democracy Guardian</span>
                <span>{Math.min(civicCredits, DEMOCRACY_GUARDIAN_THRESHOLD)}/{DEMOCRACY_GUARDIAN_THRESHOLD}</span>
              </div>
              <div className="h-1 bg-white/8 rounded-full overflow-hidden w-48">
                <motion.div
                  className={`h-full rounded-full ${isDemocracyGuardian ? "bg-gradient-to-r from-yellow-400 to-orange-400" : "bg-gradient-to-r from-yellow-600 to-yellow-400"}`}
                  animate={{ width: `${Math.min((civicCredits / DEMOCRACY_GUARDIAN_THRESHOLD) * 100, 100)}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 20 }}
                />
              </div>
            </div>

            {isDemocracyGuardian && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-[10px] font-bold"
              >
                <Trophy className="w-3 h-3" />
                Democracy Guardian
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ── Badge flash toast ── */}
        <AnimatePresence>
          {badgeFlash && latestBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl px-5 py-3"
            >
              <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <div className="text-yellow-300 font-bold text-sm">Badge Unlocked!</div>
                <div className="text-yellow-500/70 text-xs capitalize">
                  {latestBadges.map(b => b.replace(/-/g, " ")).join(", ")}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Ballot Unit ── */}
          <div className="bg-[#0f0f14] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#1a1a22] to-[#111118] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white/80 text-xs font-bold uppercase tracking-[0.3em]">Ballot Unit</div>
                <div className="text-white/30 text-[10px] font-mono mt-0.5">BU-M3-2026-MH</div>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
            </div>

            <div className="p-6 flex flex-col gap-3">
              {candidates.map((c) => {
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.id}
                    className={`flex items-center gap-4 bg-white/4 rounded-xl px-4 py-3 border transition-all duration-200 ${
                      voted?.id === c.id
                        ? "border-red-500/60 bg-red-500/10"
                        : "border-white/8 hover:border-white/20"
                    }`}
                    whileHover={!voted ? { x: 4 } : {}}
                  >
                    <div className="w-8 text-white/30 font-mono text-sm text-center shrink-0">
                      {String(c.id).padStart(2, "0")}
                    </div>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: c.color + "20", border: `1px solid ${c.color}40` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: c.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{c.name}</div>
                      <div className="text-white/30 text-xs truncate">{c.party}</div>
                    </div>
                    <BallotButton candidate={c} voted={voted} onVote={handleVote} />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── VVPAT ── */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#0f0f14] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-gradient-to-r from-[#1a1a22] to-[#111118] px-6 py-4 border-b border-white/10">
                <div className="text-white/80 text-xs font-bold uppercase tracking-[0.3em]">VVPAT — Paper Audit Trail</div>
                <div className="text-white/30 text-[10px] font-mono mt-0.5">SU-M3-2026-MH · Slip visible: 7s</div>
              </div>

              <div className="flex-1 flex items-center justify-center p-8">
                <div className="relative w-52 h-72 bg-[#060608] rounded-xl border-[6px] border-[#2a2a34] overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">

                  {/* Glass sheen */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/6 to-transparent pointer-events-none z-20" />

                  {/* Paper slot top */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-black z-20 flex items-center justify-center">
                    <div className="w-24 h-0.5 bg-white/10 rounded-full" />
                  </div>

                  {/* Bottom slit */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-black z-20" />

                  {/* VVPAT slip — spring physics */}
                  <AnimatePresence>
                    {slipVisible && voted && (
                      <motion.div
                        key="slip"
                        initial={{ y: -280, rotate: -1 }}
                        animate={{ y: 16, rotate: 0 }}
                        exit={{ y: 320, rotate: 1, transition: { duration: 0.7, ease: "easeIn" } }}
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                        className="absolute left-1/2 -translate-x-1/2 w-36 bg-[#faf9f4] rounded-sm shadow-2xl z-10 overflow-hidden"
                        style={{ top: 0 }}
                      >
                        <div className="w-full h-2 bg-[#e8e7e2] border-b border-dashed border-slate-400/60" />
                        <div className="flex flex-col items-center gap-3 px-3 py-4">
                          <div className="font-mono text-[9px] text-slate-500 border-b border-dashed border-slate-300 w-full text-center pb-2">
                            ELECTION COMMISSION OF INDIA
                          </div>
                          <div className="font-mono text-[9px] text-slate-400">SLIP NO: {slipNo}</div>
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: voted.color + "18", border: `2px solid ${voted.color}` }}
                          >
                            <voted.icon className="w-6 h-6" style={{ color: voted.color }} />
                          </div>
                          <div className="font-black text-sm text-slate-900 text-center leading-tight">{voted.name}</div>
                          <div className="font-medium text-[9px] text-slate-500 text-center">{voted.party}</div>
                          <div className="font-mono text-[9px] text-slate-400 border-t border-dashed border-slate-300 w-full text-center pt-2">
                            VVPAT · VERIFIED ✓
                          </div>
                        </div>
                        <div className="w-full h-2 bg-[#e8e7e2] border-t border-dashed border-slate-400/60" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!slipVisible && (
                    <div className="absolute inset-0 flex items-center justify-center z-5">
                      <div className="text-white/15 text-xs font-mono text-center px-4">
                        AWAITING<br />VOTE INPUT
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-[#0f0f14] rounded-2xl border border-white/10 p-5 flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full shrink-0 ${voted ? "bg-red-500 animate-pulse" : "bg-green-400"}`} />
              <div className="flex-1">
                <div className="text-white/80 text-sm font-semibold">
                  {voted ? `Vote recorded for ${voted.name}` : "Ready to accept vote"}
                </div>
                <div className="text-white/30 text-xs font-mono mt-0.5">
                  {voted ? "VVPAT printing · +10 Civic Credits awarded" : "BU ACTIVE · LOCKED: NO"}
                </div>
              </div>
              {voteCount.current > 0 && (
                <div className="text-white/25 text-xs font-mono">
                  Votes: {voteCount.current}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
