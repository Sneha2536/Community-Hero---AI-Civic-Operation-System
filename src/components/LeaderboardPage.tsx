/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Users, Trophy, Shield, Calendar, Sparkles, Flame, CheckCircle, ListTodo, X, Mail, Star } from "lucide-react";
import { UserLeaderboard } from "../types.js";

interface LeaderboardPageProps {
  leaderboard: UserLeaderboard[];
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ leaderboard }) => {
  const [selectedUserProfile, setSelectedUserProfile] = React.useState<UserLeaderboard | null>(null);
  const [sortBy, setSortBy] = React.useState<"points" | "resolved">("points");

  React.useEffect(() => {
    if (selectedUserProfile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedUserProfile]);

  const sortedLeaderboard = React.useMemo(() => {
    return [...leaderboard].sort((a, b) => {
      if (sortBy === "points") {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return b.verifiedQty - a.verifiedQty; // fallback
      } else {
        if (b.verifiedQty !== a.verifiedQty) {
          return b.verifiedQty - a.verifiedQty;
        }
        return b.points - a.points; // fallback
      }
    });
  }, [leaderboard, sortBy]);
  
  const badgeStyles = [
    { name: "Civic Sentinel", desc: "First 5 validations complete", color: "bg-blue-600/10 text-blue-400 border border-blue-500/20" },
    { name: "Urban Guardian", desc: "Reported critical emergency", color: "bg-red-600/10 text-red-400 border border-red-500/20" },
    { name: "Springfield Steward", desc: "Cleared 2 resolution backlogs", color: "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20" },
    { name: "Municipal Sage", desc: "Over 200 contribution score", color: "bg-purple-600/10 text-purple-400 border border-purple-500/20" }
  ];

  const getRoleEndorsement = (role: string) => {
    const r = role.toLowerCase();
    if (r === "admin") {
      return "High authority administrative status. Oversees digital twins dispatch queue & structural verification indices.";
    }
    if (r === "volunteer") {
      return "Highly active field unit. Spearheads rapid emergency validation & coordinates critical cleanup operations.";
    }
    return "Valued community cornerstone. Drives neighborhood restoration projects & provides crucial first-hand localized telemetry.";
  };

  return (
    <div id="leaderboard-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full relative">
      
      {/* List Column */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
            <div>
              <h3 className="text-sm font-bold text-white leading-none">Springfield Hall of Heroes</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">Gamified Volunteer Contribution Board (Click cards for details)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Segmented Control */}
            <div id="leaderboard-sort-container" className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-850">
              <button
                id="sort-by-points-btn"
                onClick={() => setSortBy("points")}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition duration-150 cursor-pointer ${
                  sortBy === "points"
                    ? "bg-slate-800 text-white shadow-md border border-slate-700/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Impact Score
              </button>
              <button
                id="sort-by-resolved-btn"
                onClick={() => setSortBy("resolved")}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition duration-150 cursor-pointer ${
                  sortBy === "resolved"
                    ? "bg-slate-800 text-white shadow-md border border-slate-700/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Total Resolved
              </button>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-950/20 border border-yellow-500/20 text-yellow-500 rounded-full text-[10px] font-mono font-bold leading-none shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UPDATES REAL-TIME</span>
            </div>
          </div>
        </div>

        {/* Board List */}
        <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {sortedLeaderboard.map((user, idx) => {
            const isTop3 = idx < 3;
            const rankBg = idx === 0 
              ? "bg-yellow-500 text-slate-950" 
              : idx === 1 
              ? "bg-slate-400 text-slate-950" 
              : idx === 2 
              ? "bg-amber-600 text-white" 
              : "bg-slate-800 text-slate-400";

            return (
              <div 
                key={user.id}
                onClick={() => setSelectedUserProfile(user)}
                title={`View profile of ${user.name}`}
                className="p-3.5 sm:p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between transition gap-3 text-left w-full overflow-hidden cursor-pointer group"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  {/* Rank Circle */}
                  <div className={`w-8 h-8 rounded-full font-mono text-xs font-black flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${rankBg}`}>
                    #{idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white leading-tight flex items-center space-x-1.5">
                      <span className="truncate block font-semibold group-hover:text-amber-400 transition" title={user.name}>{user.name}</span>
                      {isTop3 && <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse shrink-0" />}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider truncate">
                      ROLE: {user.role}  • Verified: {user.verifiedQty} tickets
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 sm:border-l sm:border-slate-850/50 sm:pl-4 transition-all">
                  {/* Badges badges */}
                  <div className="flex space-x-1 overflow-hidden">
                    {user.badges.slice(0, 2).map((b, bIdx) => (
                      <span key={bIdx} className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full block text-center truncate max-w-[100px]" title={b}>
                        🏆 {b}
                      </span>
                    ))}
                  </div>

                  <div className="text-right shrink-0 min-w-[100px]">
                    {sortBy === "points" ? (
                      <>
                        <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold leading-none mb-0.5">IMPACT SCORE</span>
                        <span className="text-sm font-black font-mono text-emerald-400">{user.points} pts</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold leading-none mb-0.5">RESOLVED ISSUES</span>
                        <span className="text-sm font-black font-mono text-sky-400">{user.verifiedQty} tickets</span>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Badges reference rail on right */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        
        {/* Badge Legend */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Award className="w-5 h-5 text-blue-500" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hero badge achievements</h4>
          </div>

          <div className="space-y-3.5">
            {badgeStyles.map((badge, idx) => (
              <div key={idx} className="flex space-x-3 text-left">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${badge.color}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white leading-none">{badge.name}</h5>
                  <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2 leading-tight">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500 leading-normal">
            Actions earn multipliers: Upvoting (+5 points), Confirming (+10 points) and resolving active tickets in our digital Twin maps (+15 points).
          </div>
        </div>

      </div>

      {/* Hero Profile Overlap / Details Dialog */}
      <AnimatePresence>
        {selectedUserProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm sm:max-w-md max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
            >
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 border-b border-indigo-500/20 bg-gradient-to-r from-teal-500 via-indigo-600 to-amber-500 z-10" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedUserProfile(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Scrollable central content */}
              <div className="overflow-y-auto p-6 space-y-5 flex-1 min-h-0">
                {/* User Avatar & Name Details */}
                <div className="flex items-center space-x-4 pb-4 border-b border-slate-800/80">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-950 border border-indigo-500/30 font-sans font-black text-white text-xl flex items-center justify-center tracking-tight shadow-md shrink-0">
                    {selectedUserProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[9px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mb-1">
                      Level {selectedUserProfile.level} • {selectedUserProfile.role}
                    </span>
                    <h4 className="text-base font-black text-white tracking-tight truncate leading-tight">
                      {selectedUserProfile.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate flex items-center">
                      <Mail className="w-3 h-3 text-slate-600 mr-1 shrink-0" />
                      {selectedUserProfile.email || "Confidential Secure Mail"}
                    </p>
                  </div>
                </div>

                {/* Grid Metrics Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-2xl text-left">
                    <div className="flex items-center space-x-1 text-emerald-500 mb-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Honor Points</span>
                    </div>
                    <p className="text-lg font-mono font-black text-white">{selectedUserProfile.points} <span className="text-[10px] font-sans font-medium text-slate-400">pts</span></p>
                  </div>

                  <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-2xl text-left">
                    <div className="flex items-center space-x-1 text-amber-500 mb-1">
                      <Flame className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Active Streak</span>
                    </div>
                    <p className="text-lg font-mono font-black text-white">{selectedUserProfile.activeStreak} <span className="text-[10px] font-sans font-medium text-slate-400">days</span></p>
                  </div>

                  <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-2xl text-left">
                    <div className="flex items-center space-x-1 text-sky-500 mb-1">
                      <ListTodo className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Contributions</span>
                    </div>
                    <p className="text-lg font-mono font-black text-white">{selectedUserProfile.contributions} <span className="text-[10px] font-sans font-medium text-slate-400">reports</span></p>
                  </div>

                  <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-2xl text-left">
                    <div className="flex items-center space-x-1 text-indigo-400 mb-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Verifications</span>
                    </div>
                    <p className="text-lg font-mono font-black text-white">{selectedUserProfile.verifiedQty} <span className="text-[10px] font-sans font-medium text-slate-400">actions</span></p>
                  </div>
                </div>

                {/* Endorsement commentary */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl text-left">
                  <span className="text-[8px] text-indigo-400 font-mono font-bold uppercase tracking-widest block mb-1">AI ENDORSEMENT STATEMENT:</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{getRoleEndorsement(selectedUserProfile.role)}</p>
                </div>

                {/* Badges Column */}
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-widest block mb-1.5 flex items-center">
                    <Award className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                    Unlocked Badge Core ({selectedUserProfile.badges.length})
                  </span>
                  
                  {selectedUserProfile.badges.length === 0 ? (
                    <p className="text-[11px] text-slate-500 font-mono bg-slate-950/30 p-2.5 rounded-xl border border-dashed border-slate-800 text-center">No badges acquired in current epoch tier.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {selectedUserProfile.badges.map((b, bIdx) => (
                        <span 
                          key={bIdx} 
                          className="text-[10px] font-mono font-semibold bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 px-2.5 py-1 rounded-xl transition duration-150 inline-block"
                        >
                          🏆 {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Footer Button */}
              <div className="p-4 bg-slate-950/40 border-t border-slate-800/80 shrink-0">
                <button
                  onClick={() => setSelectedUserProfile(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-750 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center shadow-lg"
                >
                  Close Profile Guidance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
