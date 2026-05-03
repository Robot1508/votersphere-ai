"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogIn, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/journey",   label: "Journey"   },
  { href: "/evm",       label: "EVM Sim"   },
  { href: "/badges",    label: "Badges"    },
];

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  const handleSignIn = () => {
    // Mock login — toggle state
    setIsLoggedIn(true);
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setShowUserMenu(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0c]/80 backdrop-blur-md"
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="container mx-auto flex h-16 items-center px-4 gap-6">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#E63946] flex items-center justify-center shadow-[0_0_12px_rgba(230,57,70,0.5)]">
            <span className="text-white font-black text-xs">E</span>
          </div>
          <span className="font-bold text-white text-sm hidden sm:block tracking-tight">
            Election<span className="text-red-500">2026</span>
          </span>
        </Link>

        {/* ── Nav Links ── */}
        <div className="flex gap-1 flex-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {link.label}
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/ask"
            id="ask-constitution-btn"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E63946] text-white text-xs font-semibold hover:bg-red-500 transition-all hover:shadow-[0_0_16px_rgba(230,57,70,0.5)]"
          >
            Ask Constitution
          </Link>

          {/* Sign In / User avatar */}
          <AnimatePresence mode="wait">
            {!isLoggedIn ? (
              <motion.button
                key="sign-in"
                id="sign-in-btn"
                onClick={handleSignIn}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold hover:bg-white/15 hover:text-white transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </motion.button>
            ) : (
              <motion.div
                key="user-menu"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                <button
                  id="user-avatar-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E63946]/15 border border-[#E63946]/40 text-white text-xs font-semibold hover:bg-[#E63946]/25 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E63946] flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  Arya
                  <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-44 bg-[#12121a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="text-white text-sm font-semibold">Arya</div>
                        <div className="text-white/30 text-xs">arya@example.in</div>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/badges"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-3 py-2 rounded-lg text-white/60 text-xs hover:bg-white/8 hover:text-white transition-colors"
                        >
                          My Badges
                        </Link>
                        <button
                          id="sign-out-btn"
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 rounded-lg text-red-400 text-xs hover:bg-red-500/10 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
