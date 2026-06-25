/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Award, ListTodo, FileText, Download, Shield, Clock, Compass, Activity, Sparkles, CheckCircle2 } from "lucide-react";
import { IssueReport, UserLeaderboard } from "../types.js";

interface ProfileViewProps {
  userRole: "citizen" | "volunteer" | "admin";
  userEmail: string;
  myIssues: IssueReport[];
  weeksTotalSolvedStats: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userRole,
  userEmail,
  myIssues,
  weeksTotalSolvedStats
}) => {
  const [showMemo, setShowMemo] = useState<boolean>(false);
  const [memoLog, setMemoLog] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate official local government brief memorandum summary!
  const generateMemoReport = async () => {
    setIsGenerating(true);
    setMemoLog("");
    try {
      const res = await fetch("/api/weekly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      if (!res.ok) throw new Error("Weekly report API failed");
      const data = await res.json();
      setMemoLog(data.report);
      setShowMemo(true);
    } catch (err) {
      console.error(err);
      alert("Error generating administrative PDF memo brief.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="citizen-profile-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      
      {/* Profile Sidebar */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        
        {/* User Stats Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left">
          {/* Ambient overlay */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center space-x-3.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-lg font-black font-mono shadow-md">
              {userEmail[0].toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-none">{userEmail.split("@")[0]}</h4>
              <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                Rank: {userRole === "admin" ? "Municipal Overseer" : userRole === "volunteer" ? "Lead Inspector" : "Civic Champion"}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-850">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Verification Credit Score:</span>
              <span className="font-mono font-bold text-emerald-400">145 pts</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Logged Tickets quantity:</span>
              <span className="font-mono font-bold text-white">{myIssues.length} submissions</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Springfield District:</span>
              <span className="font-mono font-bold text-slate-300">Oakwood (Sector 3)</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-850 flex flex-col space-y-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 block">UNLOCKED ACHIEVEMENT SHIELDS</span>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-[10px] bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1.5 rounded-xl block text-center font-mono font-bold">
                🏆 Civic Guard
              </span>
              <span className="text-[10px] bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1.5 rounded-xl block text-center font-mono font-bold">
                🥇 Spotter
              </span>
            </div>
          </div>
        </div>

        {/* Action center memo compilation launcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="uppercase tracking-wider font-mono">Administrative Reports center</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal text-left">
            Request an official, AI-compiled PDF Municipal Memorandum Brief detailing ongoing resolutions, density factors, and impact logs.
          </p>

          <button
            onClick={generateMemoReport}
            disabled={isGenerating}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
          >
            {isGenerating ? (
              <span className="animate-spin text-white">⚙</span>
            ) : (
              <Download className="w-3.5 h-3.5 text-white" />
            )}
            <span>Retrieve AI Government Brief</span>
          </button>
        </div>

      </div>

      {/* Main content submissions logs & Compiled Brief Display */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        
        <AnimatePresence>
          {showMemo && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-8 shadow-2xl relative font-sans text-left"
            >
              <button
                onClick={() => setShowMemo(false)}
                className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-900 transition hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>

              {/* Memorandum Branding */}
              <div className="border-b-4 border-slate-900 pb-5 mb-6 text-center sm:text-left">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-black tracking-tighter uppercase font-mono">TOWNSHIP OF SPRINGFIELD</h2>
                    <p className="text-[11px] font-mono font-bold tracking-widest text-slate-500">MUNICIPAL ENGINEERING DEPARTMENT OFFICE</p>
                  </div>
                  <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 font-mono font-extrabold uppercase rounded">
                    ADMIN-BRIEF v3.5
                  </span>
                </div>
              </div>

              {/* Memo Meta Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-250 text-xs font-mono">
                <div>
                  <span className="font-extrabold block text-slate-400 uppercase leading-none mb-1">MEMORANDUM FOR:</span>
                  <span className="font-bold text-slate-900">MUNICIPAL PUBLIC WORKS DIRECTORATE</span>
                </div>
                <div>
                  <span className="font-extrabold block text-slate-400 uppercase leading-none mb-1">COMPILED BY:</span>
                  <span className="font-bold text-blue-600">AUTONOMOUS CIVIC HERO AGENCY MODEL v1.0</span>
                </div>
                <div>
                  <span className="font-extrabold block text-slate-400 uppercase leading-none mb-1">DATE OF RETRIEVAL:</span>
                  <span className="font-bold text-slate-900">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div>
                  <span className="font-extrabold block text-slate-400 uppercase leading-none mb-1">SUBJECT MATTER INDEX:</span>
                  <span className="font-bold text-slate-950 uppercase border-b border-dashed border-slate-900 pb-0.5">TOWNSHIP WIDE WORK TICKET DENSITY LOGS</span>
                </div>
              </div>

              {/* Memo AI Content (Formatted precisely like a local government memo) */}
              <div className="py-6 space-y-4 text-xs leading-relaxed font-serif text-slate-800">
                <p className="whitespace-pre-line">{memoLog}</p>
              </div>

              {/* Printable Button Trigger */}
              <div className="border-t border-slate-200 pt-5 flex justify-end">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold font-mono flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Memo Brief to PDF</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* My logged cases */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 text-left">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ListTodo className="w-5 h-5 text-blue-500" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">My Logged cases History</h4>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {myIssues.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">You haven't logged any incidents yet. Get started in Report Issue form.</p>
              </div>
            ) : (
              myIssues.map((issue) => (
                <div key={issue.id} className="p-3.5 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-2xl flex justify-between items-center gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-white leading-none">{issue.title}</h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider">
                      {issue.category} • Status: {issue.status}
                    </p>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                    +{issue.score} index
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
