"use client";

import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { useMemo } from "react";

// High-quality SVG Hanko seal generator with procedural patterns
function HankoSeal({
  text,
  subtext,
  color,
  unlocked,
  size = 100,
}: {
  text: string;
  subtext: string;
  color: string;
  unlocked: boolean;
  size?: number;
}) {
  const r = size / 2;
  const cx = r;
  const cy = r;

  // Generate unique pattern based on text
  const patternLines = useMemo(() => {
    const lines = [];
    let seed = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = 12 + (seed % 8);
    for (let i = 0; i < count; i++) {
      const angle = (i * (360 / count) * Math.PI) / 180;
      const length = (r - 20) * (0.4 + (Math.sin(seed + i) * 0.3));
      lines.push({
        x1: cx + length * Math.cos(angle),
        y1: cy + length * Math.sin(angle),
        x2: cx + (r - 18) * Math.cos(angle),
        y2: cy + (r - 18) * Math.sin(angle),
        opacity: 0.2 + (Math.sin(seed * i) * 0.1)
      });
    }
    return lines;
  }, [text, r, cx, cy]);

  if (!unlocked) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <circle cx={cx} cy={cy} r={r - 4} stroke="#2a2a34" strokeWidth="2" fill="none" />
        <circle cx={cx} cy={cy} r={r - 10} stroke="#1a1a22" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fill="#2a2a34"
          fontSize="24"
          fontFamily="monospace"
        >
          🔒
        </text>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {/* Outer double-ring */}
      <circle cx={cx} cy={cy} r={r - 3} stroke={color} strokeWidth="3" fill="none" opacity="0.9" />
      <circle cx={cx} cy={cy} r={r - 8} stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />

      {/* Procedural geometric patterns */}
      {patternLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={color}
          strokeWidth="1"
          opacity={line.opacity}
        />
      ))}

      {/* Decorative tick marks around inner ring */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const x1 = cx + (r - 10) * Math.cos(angle);
        const y1 = cy + (r - 10) * Math.sin(angle);
        const x2 = cx + (r - 12) * Math.cos(angle);
        const y2 = cy + (r - 12) * Math.sin(angle);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={i % 6 === 0 ? 1.5 : 0.5} opacity={0.4} />
        );
      })}

      {/* Inner fill */}
      <circle cx={cx} cy={cy} r={r - 18} fill={color} opacity="0.08" />

      {/* Main text */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill={color}
        fontSize="13"
        fontWeight="900"
        fontFamily="monospace"
        letterSpacing="1"
      >
        {text}
      </text>

      {/* Divider line */}
      <line x1={cx - 20} y1={cy + 4} x2={cx + 20} y2={cy + 4} stroke={color} strokeWidth="1" opacity="0.5" />

      {/* Subtext */}
      <text
        x={cx}
        y={cy + 17}
        textAnchor="middle"
        fill={color}
        fontSize="7"
        fontFamily="monospace"
        letterSpacing="1.5"
        opacity="0.75"
      >
        {subtext.toUpperCase()}
      </text>

      {/* Hanko-style rotation border text path */}
      <defs>
        <path
          id={`arc-${text}`}
          d={`M ${cx - (r - 5.5)},${cy} A ${r - 5.5},${r - 5.5} 0 1,1 ${cx + (r - 5.5)},${cy}`}
        />
      </defs>
      <text fontSize="5.5" fill={color} opacity="0.45" fontFamily="monospace" letterSpacing="2">
        <textPath href={`#arc-${text}`} startOffset="50%" textAnchor="middle">
          ELECTION COMMISSION · INDIA · 2026 ·
        </textPath>
      </text>
    </svg>
  );
}

const badges = [
  {
    id: "first-vote",
    title: "First Vote",
    desc: "Cast your first simulated vote in the EVM Simulator.",
    color: "#E63946",
    subtext: "VOTED",
    unlocked: true,
    category: "Participation",
  },
  {
    id: "civic-scholar",
    title: "Civic Scholar",
    desc: "Read all 5 steps of the Voter Journey.",
    color: "#f59e0b",
    subtext: "SCHOLAR",
    unlocked: true,
    category: "Knowledge",
  },
  {
    id: "constitution-ai",
    title: "AI Counsel",
    desc: "Ask Constitution AI your first question.",
    color: "#22c55e",
    subtext: "COUNSEL",
    unlocked: false,
    category: "AI",
  },
  {
    id: "vvpat-verified",
    title: "VVPAT Verified",
    desc: "Successfully verified your paper audit trail.",
    color: "#3b82f6",
    subtext: "VERIFIED",
    unlocked: false,
    category: "Trust",
  },
  {
    id: "electoral-master",
    title: "Electoral Master",
    desc: "Complete the full Civic Quiz with 100% score.",
    color: "#a855f7",
    subtext: "MASTER",
    unlocked: false,
    category: "Elite",
  },
  {
    id: "quiz-ace",
    title: "Quiz Ace",
    desc: "Answer 10 consecutive civic questions correctly.",
    color: "#06b6d4",
    subtext: "ACE",
    unlocked: false,
    category: "Quiz",
  },
  {
    id: "multilingual",
    title: "Polyglot Voter",
    desc: "Use the platform in 3 different languages.",
    color: "#ec4899",
    subtext: "POLYGLOT",
    unlocked: false,
    category: "Accessibility",
  },
  {
    id: "constituency",
    title: "Ward Champion",
    desc: "Explore your local Maharashtra constituency on the heatmap.",
    color: "#14b8a6",
    subtext: "CHAMPION",
    unlocked: false,
    category: "Local",
  },
];

export default function BadgesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0c] px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Civic Badges
          </div>
          <h1 className="text-4xl font-black text-white">
            Your{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              Hanko
            </span>{" "}
            Seals
          </h1>
          <p className="text-white/40 mt-2 max-w-md text-sm">
            Japanese-inspired stamp certificates earned through your civic engagement.
            Each seal is a unique geometric Hanko mark.
          </p>

          {/* Progress */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 max-w-xs h-2 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: "25%" }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-white/40 text-xs font-mono">2 / 8 Earned</span>
          </div>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {badges.map((badge, i) => (
            <Tilt
              key={badge.id}
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              perspective={1000}
              transitionSpeed={1500}
              scale={1.02}
              gyroscope={true}
              className="group"
            >
              <motion.div
                id={`badge-${badge.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className={`relative flex flex-col items-center gap-4 bg-white/4 border rounded-2xl p-6 transition-all duration-300 h-full ${
                  badge.unlocked
                    ? "border-white/15 hover:border-white/30 hover:bg-white/6 cursor-default shadow-lg"
                    : "border-white/6 opacity-50 hover:opacity-70"
                }`}
              >
                {/* Category chip */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/8 text-white/30 text-[9px] font-mono uppercase tracking-widest">
                  {badge.category}
                </div>

                {/* Hanko seal */}
                <div className={badge.unlocked ? "drop-shadow-[0_0_8px_rgba(230,57,70,0.3)]" : ""}>
                  <HankoSeal
                    text={badge.subtext}
                    subtext={badge.category}
                    color={badge.color}
                    unlocked={badge.unlocked}
                    size={88}
                  />
                </div>

                {/* Info */}
                <div className="text-center">
                  <div
                    className="font-bold text-sm"
                    style={{ color: badge.unlocked ? badge.color : "#4a4a55" }}
                  >
                    {badge.title}
                  </div>
                  <div className="text-white/30 text-[11px] mt-1 leading-relaxed">
                    {badge.desc}
                  </div>
                </div>

                {/* Unlocked indicator */}
                {badge.unlocked && (
                  <div
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest mt-auto"
                    style={{ backgroundColor: badge.color + "20", color: badge.color }}
                  >
                    ✓ Earned
                  </div>
                )}
              </motion.div>
            </Tilt>
          ))}
        </div>
      </div>
    </div>
  );
}
