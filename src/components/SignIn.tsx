"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, User, GraduationCap, Briefcase } from "lucide-react";

const PROFILES = [
  { id: "robot1508",    label: "Developer",      icon: Shield,        color: "text-blue-400" },
  { id: "voter_newbie", label: "First-Time Voter", icon: GraduationCap,   color: "text-green-400" },
  { id: "official_test",label: "Election Official",icon: Briefcase,     color: "text-purple-400" },
  { id: "voter_senior", label: "Senior Citizen",   icon: User,          color: "text-orange-400" },
];

const isDev = process.env.NODE_ENV === "development";
const dummyIds = process.env.NEXT_PUBLIC_DUMMY_USERS?.split(",").map(u => u.trim()) || [];

export function SignIn({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const handleSelectProfile = (id: string) => {
    localStorage.setItem("votersphere_user", id);
    window.dispatchEvent(new Event("storage")); // Trigger sync
    onClose();
  };

  // Filter profiles based on dummyIds if in dev, otherwise return empty
  const activeProfiles = isDev 
    ? PROFILES.filter(p => dummyIds.includes(p.id)) 
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-red-500/10 to-transparent">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isDev ? "Quick Select Profile" : "Sign In"}
                </h2>
                <p className="text-white/40 text-xs mt-1">
                  {isDev ? "Development Multi-Profile Testing" : "Authorized Personnel Only"}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid gap-3">
              {isDev ? (
                activeProfiles.length > 0 ? (
                  activeProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleSelectProfile(profile.id)}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/50 hover:bg-white/10 transition-all group text-left"
                    >
                      <div className={`p-3 rounded-lg bg-white/5 ${profile.color} group-hover:scale-110 transition-transform`}>
                        <profile.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{profile.label}</div>
                        <div className="text-white/30 text-[10px] font-mono mt-0.5">ID: {profile.id}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/40 text-xs italic">
                    No dummy users found in .env.local
                  </div>
                )
              ) : (
                <div className="py-12 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/40 text-xs text-center max-w-[200px]">
                    Production sign-in via Supabase is currently being finalized.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/2 flex items-center justify-center border-t border-white/5">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                {isDev ? "VoterSphere Test Environment" : "VoterSphere Production"}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
