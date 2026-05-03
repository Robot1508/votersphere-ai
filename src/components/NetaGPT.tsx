"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Scale, ChevronDown, ChevronUp, Loader2, Lightbulb, BookOpen, ExternalLink, Newspaper } from "lucide-react";

type Article = { id: string; title: string; excerpt: string; fullText?: string };
type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  articles?: Article[];
};

// ── Constitutional knowledge base ───────────────────────────────────────────
const ART_324: Article = {
  id: "Art. 324",
  title: "Superintendence, direction and control of elections",
  excerpt: "The superintendence, direction and control of elections to Parliament, State Legislatures, and the offices of President and Vice-President is vested in the Election Commission of India.",
  fullText: "Article 324. (1) The superintendence, direction and control of the preparation of the electoral rolls for, and the conduct of, all elections to Parliament and to the Legislature of every State and of elections to the offices of President and Vice-President held under this Constitution shall be vested in a Commission (referred to in this Constitution as the Election Commission).\n\n(2) The Election Commission shall consist of the Chief Election Commissioner and such number of other Election Commissioners, if any, as the President may from time to time fix...\n\n(5) Subject to the provisions of any law made by Parliament, the conditions of service and tenure of office of the Election Commissioners and the Regional Commissioners shall be such as the President may by rule determine."
};
const ART_326: Article = {
  id: "Art. 326",
  title: "Elections on the basis of adult suffrage",
  excerpt: "Elections to the House of the People and to the Legislative Assemblies of States shall be on the basis of adult suffrage — every citizen aged 18+ shall be entitled to vote.",
  fullText: "Article 326. The elections to the House of the People and to the Legislative Assembly of every State shall be on the basis of adult suffrage; that is to say, every person who is a citizen of India and who is not less than eighteen years of age on such date as may be fixed in that behalf by or under any law made by the appropriate Legislature and is not otherwise disqualified under this Constitution or any law made by the appropriate Legislature on the ground of non-residence, unsoundness of mind, crime or corrupt or illegal practice, shall be entitled to be registered as a voter at any such election."
};

const constitutionDB: Record<string, Article[]> = {
  vote:      [ART_326, { id: "Art. 325", title: "No Religious Disqualification", excerpt: "No person shall be ineligible for inclusion in any electoral roll on grounds only of religion, race, caste or sex." }],
  evm:       [ART_324, { id: "Sec. 61A RPA", title: "EVM Authorisation", excerpt: "Section 61A of the Representation of the People Act, 1951 empowers the ECI to use voting machines in any or all constituencies." }],
  election:  [ART_324, ART_326, { id: "Art. 327", title: "Parliament's Power", excerpt: "Parliament may by law make provision with respect to all matters relating to, or in connection with, elections to either House of Parliament." }],
  candidate: [{ id: "Art. 84", title: "Parliament Qualification", excerpt: "Candidate for Lok Sabha must be ≥25 yrs; Rajya Sabha ≥30 yrs; citizen of India; not holding office of profit." }, { id: "Art. 173", title: "State Legislature", excerpt: "Candidate for State Legislature must be a citizen of India with the requisite age." }],
  nota:      [{ id: "Art. 19(1)(a)", title: "Freedom of Expression", excerpt: "NOTA upheld as an expression of the right to speech — PUCL v. Union of India (2013). A NOTA vote is counted but does not confer victory." }],
  vvpat:     [ART_324, { id: "ECI Circular 2019", title: "VVPAT Mandate", excerpt: "The ECI mandates VVPAT units nationwide since 2019. Slips are visible for exactly 7 seconds before dropping into a sealed ballot box." }],
  default:   [ART_324],
};

// Exported for unit tests — must have >= 5 distinct entries (Req 11.2)
export const mockHeadlines = [
  "Baramati records 64.2% turnout in bye-election polling day.",
  "ECI deploys AI-powered monitoring for Maharashtra Phase 3.",
  "Supreme Court dismisses plea to halt VVPAT verification expansion.",
  "New digital EPIC card downloads cross 10 million in MH.",
  "MLC poll results expected to be announced on May 4th.",
  "Model Code of Conduct lifted in 12 districts after Phase 2 completion.",
];

// ── Components ───────────────────────────────────────────────────────────────

// Exported for unit tests
export { ART_324, ART_326 };

function ConstitutionReader({ article, onClose }: { article: Article; onClose: () => void }) {
  // Escape key closes the modal (Req 10.4)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
      onClick={onClose}                          // backdrop click closes (Req 10.4)
      role="dialog"
      aria-modal="true"
      aria-labelledby="constitution-reader-title"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="max-w-2xl w-full rounded-lg shadow-2xl p-10 overflow-y-auto max-h-[80vh] border-8 border-double border-[#d4cfb9] relative"
        style={{
          background: "#fdfcf7",                 // parchment colour (Req 10.3)
          fontFamily: "'Crimson Text', Georgia, serif", // serif typeface (Req 10.3)
        }}
        onClick={(e) => e.stopPropagation()}     // prevent backdrop close on content click
      >
        <button
          onClick={onClose}
          aria-label="Close constitution reader"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center mb-8">
          <div className="text-[#8b4513] text-sm uppercase tracking-widest font-bold mb-2">The Constitution of India</div>
          <h2
            id="constitution-reader-title"
            className="text-3xl font-bold text-slate-900 border-b-2 border-[#d4cfb9] pb-4 inline-block"
          >
            {article.id}
          </h2>
        </div>
        <div className="text-lg leading-relaxed text-slate-800 space-y-6">
          <p className="font-bold text-xl italic">{article.title}</p>
          <p className="whitespace-pre-wrap text-justify">
            {article.fullText ?? article.excerpt}
          </p>
        </div>
        <div className="mt-12 pt-6 border-t border-[#d4cfb9] flex justify-between items-center text-sm text-slate-500">
          <span>Official Legal Text</span>
          <span>Part XV · Elections</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Exported for unit tests — duration >= 25s (Req 11.3)
export const TICKER_DURATION = 30;

function LiveTicker() {
  return (
    <div className="bg-red-950/40 border-b border-white/5 py-1.5 overflow-hidden flex items-center">
      <div className="px-3 flex items-center gap-1.5 text-red-400 shrink-0 border-r border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        <Newspaper className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Live Feed</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: TICKER_DURATION, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap flex gap-12"
        >
          {mockHeadlines.map((h, i) => (
            <span key={i} className="text-white/50 text-[10px] font-medium">{h}</span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function NetaGPT() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste! I'm Neta-GPT. I've highlighted key Constitutional Articles for you. Click on any reference to read the full official text in my library.",
      articles: constitutionDB.default,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [articlesOpen, setArticlesOpen] = useState(true);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const latestArticles =
    messages.filter((m) => m.role === "assistant" && m.articles?.length).at(-1)?.articles ?? [];

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages, open]);

  const handleSend = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: q };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    
    // Simple response mapping for demo
    let reply = "I can help with that. Article 324 is particularly relevant here.";
    let articles = [ART_324];
    
    if (q.toLowerCase().includes("vote") || q.toLowerCase().includes("326")) {
      reply = "The right to vote is established under Article 326. It ensures adult suffrage for all citizens over 18.";
      articles = [ART_326];
    }
    
    setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "assistant", text: reply, articles }]);
    setLoading(false);
  };

  return (
    <>
      {/* ── Floating trigger ── */}
      <motion.button
        id="neta-gpt-trigger"
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#E63946] text-white shadow-[0_4px_24px_rgba(230,57,70,0.5)] font-semibold text-sm hover:bg-red-500 transition-all ${open ? "hidden" : "flex"}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Ask Neta-GPT</span>
      </motion.button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="neta-gpt-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-h-[650px] flex flex-col rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8)] border border-white/10"
            style={{ backdropFilter: "blur(32px)", background: "rgba(10,10,14,0.96)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 bg-[#E63946] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-black text-sm uppercase tracking-wide">Neta-GPT</div>
                  <div className="text-white/60 text-[10px] mt-0.5 font-bold">Constitutional Master AI</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <LiveTicker />

            {/* Articles Bar */}
            {latestArticles.length > 0 && (
              <div className="shrink-0 border-b border-white/10 bg-white/2">
                <button
                  onClick={() => setArticlesOpen(!articlesOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Legal Citations</span>
                  </div>
                  {articlesOpen ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                </button>
                <AnimatePresence>
                  {articlesOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 flex flex-col gap-2">
                        {latestArticles.map((art) => (
                          <button
                            key={art.id}
                            onClick={() => setReadingArticle(art)}
                            className="text-left group bg-white/5 rounded-xl p-3 border border-white/5 hover:border-red-500/50 hover:bg-white/8 transition-all"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-red-500 text-[10px] font-black">{art.id}</span>
                              <ExternalLink className="w-3 h-3 text-white/10 group-hover:text-red-500 transition-colors" />
                            </div>
                            <div className="text-white/80 text-[11px] font-bold mb-1">{art.title}</div>
                            <p className="text-white/30 text-[10px] line-clamp-2 leading-relaxed">{art.excerpt}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.role === "user" ? "bg-[#E63946] text-white shadow-lg" : "bg-white/5 text-white/80 border border-white/10"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold px-2">
                  <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                  ANALYZING CONSTITUTIONAL PRECEDENT...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about your rights, Art. 324, EVMs..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-500/50 transition-all pr-12"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1.5 w-9 h-9 rounded-lg bg-[#E63946] text-white flex items-center justify-center hover:bg-red-500 transition-colors disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {readingArticle && (
          <ConstitutionReader article={readingArticle} onClose={() => setReadingArticle(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
