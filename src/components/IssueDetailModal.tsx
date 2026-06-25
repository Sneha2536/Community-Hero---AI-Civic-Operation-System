/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  MapPin, 
  ShieldAlert, 
  Zap, 
  ThumbsUp, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Terminal,
  Activity,
  Award,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  Send,
  AlertOctagon,
  Sparkles
} from "lucide-react";
import { IssueReport, IssueStatus, IssueSeverity, Comment, IssueUrgency } from "../types.js";

interface IssueDetailModalProps {
  issue: IssueReport | null;
  onClose: () => void;
  onVote: (voteType: "upvote" | "confirm" | "flag") => void;
  onPostComment: (text: string) => void;
  onUpdateStatus?: (status: string, description?: string) => void;
  onEscalate?: () => void;
  userRole: "citizen" | "volunteer" | "admin";
  userEmail: string;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onVote,
  onPostComment,
  onUpdateStatus,
  onEscalate,
  userRole,
  userEmail
}) => {
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "workflow" | "comments">("details");
  const [statusVal, setStatusVal] = useState<string>("");

  if (!issue) return null;

  const lifecycleStages = [
    { key: IssueStatus.REPORTED, label: "Reported", description: "Logged on network" },
    { key: IssueStatus.UNDER_VERIFICATION, label: "Under Review", description: "AI Verification" },
    { key: IssueStatus.ASSIGNED, label: "Assigned", description: "Crew Dispatched" },
    { key: IssueStatus.IN_PROGRESS, label: "In Progress", description: "Work Active" },
    { key: IssueStatus.RESOLVED, label: "Resolved", description: "Completed" }
  ];

  const getStageIndex = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.REPORTED: return 0;
      case IssueStatus.UNDER_VERIFICATION: return 1;
      case IssueStatus.ASSIGNED: return 2;
      case IssueStatus.IN_PROGRESS: return 3;
      case IssueStatus.RESOLVED: return 4;
      case IssueStatus.CLOSED: return 4;
      default: return 0;
    }
  };

  const handlePostCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onPostComment(commentText);
    setCommentText("");
  };

  const isResolved = issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED;

  const getSeverityBadgeColor = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL: return "bg-red-500/10 text-red-400 border border-red-500/20";
      case IssueSeverity.HIGH: return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case IssueSeverity.MEDIUM: return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      default: return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.REPORTED: return "text-orange-400 bg-orange-950/40 border border-orange-800";
      case IssueStatus.UNDER_VERIFICATION: return "text-yellow-400 bg-yellow-950/40 border border-yellow-800";
      case IssueStatus.ASSIGNED: return "text-indigo-400 bg-indigo-950/40 border border-indigo-800";
      case IssueStatus.IN_PROGRESS: return "text-blue-400 bg-blue-950/40 border border-blue-800";
      case IssueStatus.RESOLVED: return "text-emerald-400 bg-emerald-950/40 border border-emerald-800";
      case IssueStatus.CLOSED: return "text-slate-400 bg-slate-950/40 border border-slate-800";
    }
  };

  const activeVote = issue.communityVerification.userActions[userEmail] || null;

  return (
    <div id="issue-detail-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-40 overflow-y-auto">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        
        {/* Header toolbar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-lg ${getSeverityBadgeColor(issue.severity)}`}>
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">Incident Workspace</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">Ticket: {issue.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 px-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal tabs */}
        <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-1 flex space-x-3">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 text-xs font-semibold tracking-wider uppercase border-b-2 px-1 transition cursor-pointer ${
              activeTab === "details" ? "border-blue-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Incident Dashboard
          </button>
          <button
            onClick={() => setActiveTab("workflow")}
            className={`py-3 text-xs font-semibold tracking-wider uppercase border-b-2 px-1 transition relative cursor-pointer ${
              activeTab === "workflow" ? "border-blue-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Agentic AI Workflow</span>
            <span className="absolute top-1 bg-blue-600 text-[8px] px-1 font-mono text-white rounded-full ml-1">10</span>
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`py-3 text-xs font-semibold tracking-wider uppercase border-b-2 px-1 transition relative cursor-pointer ${
              activeTab === "comments" ? "border-blue-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Collaborates</span>
            <span className="absolute top-1 bg-slate-800 text-[8px] px-1.5 font-mono text-slate-300 rounded ml-1">
              {issue.comments.length}
            </span>
          </button>
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 space-y-6">
          
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Visual lifecycle progress bar */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    <span>Resolution Lifecycle Progress Tracker</span>
                  </span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20 font-bold">
                    Stage {getStageIndex(issue.status) + 1} of 5: {issue.status}
                  </span>
                </div>

                <div className="relative flex items-center justify-between mt-6 px-2 sm:px-8">
                  {/* Background Progress line */}
                  <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0" />
                  
                  {/* Highlighted active/completed progress line */}
                  <div 
                    className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full z-0 transition-all duration-700 ease-out" 
                    style={{ 
                      width: `${(getStageIndex(issue.status) / 4) * 100}%`,
                      maxWidth: "calc(100% - 64px)"
                    }}
                  />

                  {/* Steps mapping */}
                  {lifecycleStages.map((stage, idx) => {
                    const currentIdx = getStageIndex(issue.status);
                    const isCompleted = idx < currentIdx;
                    const isActive = idx === currentIdx;

                    return (
                      <div key={stage.key} className="flex flex-col items-center relative z-10">
                        {/* Step circle */}
                        <div 
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 font-mono text-[10px] sm:text-xs font-bold border ${
                            isCompleted 
                              ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950" 
                              : isActive 
                              ? "bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/20 shadow-lg shadow-blue-950" 
                              : "bg-slate-900 border-slate-800 text-slate-500"
                          }`}
                        >
                          {isCompleted ? "✔" : idx + 1}
                        </div>

                        {/* Labels */}
                        <div className="text-center mt-2.5 max-w-[65px] sm:max-w-[100px]">
                          <span className={`block text-[10px] sm:text-xs font-bold transition-colors leading-tight ${
                            isActive ? "text-blue-400" : isCompleted ? "text-slate-300" : "text-slate-500"
                          }`}>
                            {stage.label}
                          </span>
                          <span className="hidden sm:block text-[9px] font-mono text-slate-500 mt-0.5 leading-none">
                            {stage.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column Image & Specs */}
              <div className="md:col-span-5 space-y-4">
                {isResolved ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-red-900/40 bg-slate-950 shadow">
                        <img
                          src={issue.imageUrl}
                          alt="Before"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-rose-950/80 backdrop-blur-md text-[9px] font-mono uppercase font-bold text-rose-400 px-2 py-0.5 rounded border border-rose-800/50 shadow">
                          BEFORE (REPORTED)
                        </span>
                      </div>

                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-emerald-900/40 bg-slate-950 shadow">
                        <img
                          src={issue.resolvedImageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800"}
                          alt="After"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-md text-[9px] font-mono uppercase font-bold text-emerald-400 px-2 py-0.5 rounded border border-emerald-850/50 shadow">
                          AFTER (RESOLVED)
                        </span>
                      </div>
                    </div>

                    {issue.impactSummary && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-left">
                        <div className="flex items-center space-x-2 text-emerald-400 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                          <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase">AI Resolution Impact</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-100 leading-relaxed italic">
                          "{issue.impactSummary}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {issue.esclated && (
                      <span className="absolute top-3 left-3 bg-red-600 text-[10px] font-mono uppercase font-bold text-white px-2 py-1 rounded flex items-center space-x-1 border border-red-500 shadow-lg">
                        <Flame className="w-3.5 h-3.5" />
                        <span>ESCALATED</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Score & verification tracker widgets */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">CREDIT INDEX</span>
                      <span className="text-sm font-extrabold text-white">Verification Score</span>
                    </div>
                    <span className="text-3xl font-black font-mono text-blue-500">+{issue.score}</span>
                  </div>

                  {/* Slider or upvoting actions */}
                  <div className="flex flex-col space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">COLLABORATIVE CITIZEN APPROVAL:</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onVote("upvote")}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                          activeVote === "upvote"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                            : "bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Upvote Validity ({issue.communityVerification.upvotes})</span>
                      </button>

                      <button
                        onClick={() => onVote("confirm")}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                          activeVote === "confirm"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/30"
                            : "bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm exists ({issue.communityVerification.confirmedCount})</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 italic mt-1 font-sans text-center">
                      Voting rewards points: upvote (+5 pts), confirm (+5 pts).
                    </p>
                  </div>
                </div>

                {/* Escalation Control */}
                {onEscalate && !issue.esclated && !isResolved && (
                  <button
                    onClick={onEscalate}
                    className="w-full py-3 bg-red-950/40 border border-red-500/20 hover:border-red-500 text-red-500 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer animate-pulse"
                  >
                    <AlertOctagon className="w-4 h-4 text-red-500" />
                    <span>EMERGENCY ESCALATION REPORT</span>
                  </button>
                )}
              </div>

              {/* Right Column Details & Timeline */}
              <div className="md:col-span-7 flex flex-col space-y-5">
                
                {/* Title & Classification */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                    <span className="text-[10px] font-mono font-extrabold uppercase bg-slate-950 border border-slate-850 text-slate-300 px-2 py-0.5 rounded">
                      {issue.category}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold ${getSeverityBadgeColor(issue.severity)}`}>
                      {issue.severity} Severity
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-white leading-tight">
                    {issue.title}
                  </h2>

                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{issue.address}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">INCIDENT ANALYSIS DESCRIPTION:</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-3.5 border border-slate-800/40 rounded-2xl">
                    {issue.description}
                  </p>
                </div>

                {/* AI Impact Scoring Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                    <Terminal className="w-4 h-4 text-blue-500" />
                    <span className="uppercase tracking-wider font-mono">AI Impact Scoring Calculations</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-850/50">
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-slate-500 block">COMMUNITY IMPACT</span>
                      <strong className="text-sm font-mono text-white font-black">{issue.impactScore.communityImpact}/100</strong>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-slate-500 block">SAFETY RISK</span>
                      <strong className="text-sm font-mono text-red-400 font-black">{issue.impactScore.safetyRisk}/100</strong>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-slate-500 block">ENVIRONMENTAL</span>
                      <strong className="text-sm font-mono text-emerald-400 font-black">{issue.impactScore.environmentalImpact}/100</strong>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-slate-500 block">AFFECTED REGIONS</span>
                      <strong className="text-sm font-mono text-yellow-400 font-black">~{issue.impactScore.affectedPopulation} citizens</strong>
                    </div>
                  </div>
                </div>

                {/* Timeline display */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">INCIDENT LOG HISTORICAL TIMELINE:</span>
                  
                  <div className="relative border-l border-slate-800 ml-2.5 pl-5 space-y-4">
                    {issue.timeline.map((entry, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[25.5px] top-1 bg-slate-900 w-3 h-3 rounded-full border border-blue-500/80 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-blue-500" />
                        </span>
                        <div className="flex flex-col space-y-0.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-white text-xs">{entry.status}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{entry.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Status controls override */}
                {userRole === "admin" && onUpdateStatus && (
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col space-y-3">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">MUNICIPAL STATUS WORK ORDER DISPATCH:</span>
                    <div className="flex gap-2">
                      <select
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                        className="bg-slate-900 text-xs text-slate-300 border border-slate-850 focus:border-slate-700 px-3 py-2 rounded-xl focus:outline-none flex-1"
                      >
                        <option value="">Choose dispatch action...</option>
                        {Object.values(IssueStatus).map((stat) => (
                          <option key={stat} value={stat}>{stat}</option>
                        ))}
                      </select>
                      <button
                        disabled={!statusVal}
                        onClick={() => {
                          onUpdateStatus(statusVal, `Administrative dispatch assigned status updated to: ${statusVal}`);
                          setStatusVal("");
                        }}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Dispatch Change
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
          )}

          {activeTab === "workflow" && (
            <div className="space-y-5">
              
              <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-2xl flex items-start space-x-3">
                <Terminal className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Autonomous AI Agency Agent Orchestrators</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This visualizes the live agentic orchestration process that executes immediately on ingestion. Step progress adapts in real-time as local authorities action resource parameters.
                  </p>
                </div>
              </div>

              {/* 10-Step visualizer */}
              <div className="bg-slate-950/30 border border-slate-850/80 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {issue.agentWorkflow.steps.map((step) => {
                    const isActive = step.status === "active";
                    const isCompleted = step.status === "completed";
                    
                    return (
                      <div 
                        key={step.step}
                        className={`p-3.5 rounded-xl border flex space-x-3 transition ${
                          isActive 
                            ? "bg-blue-950/20 border-blue-500 shadow-lg" 
                            : isCompleted 
                            ? "bg-slate-900/60 border-slate-850 opacity-90"
                            : "bg-slate-900/10 border-slate-850/40 opacity-40 select-none"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isActive
                            ? "bg-blue-600 text-white animate-pulse"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {isCompleted ? "✔" : step.step}
                        </div>

                        <div className="flex-1 space-y-0.5 text-left">
                          <span className="text-[10px] text-slate-500 font-mono font-extrabold leading-none block">
                            STEP {step.step} {isActive && "• RUNNING"}
                          </span>
                          <h5 className="text-xs font-bold text-white">{step.title}</h5>
                          <p className="text-[11px] text-slate-400 leading-normal">{step.detail}</p>
                          {isCompleted && step.timestamp !== "Pending" && (
                            <span className="text-[9px] font-mono text-emerald-400 font-semibold block pt-0.5">
                              {new Date(step.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* post resolution reports */}
              {issue.agentWorkflow.resolutionReport && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="uppercase tracking-wider font-mono">Official AI Resolution Post-Mortem Report</span>
                  </div>
                  <p className="text-xs text-emerald-300/80 leading-relaxed font-sans bg-slate-950/55 p-3 rounded-xl border border-emerald-950">
                    {issue.agentWorkflow.resolutionReport}
                  </p>
                </motion.div>
              )}

            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              
              {/* Writecomment Box */}
              <form onSubmit={handlePostCommentSubmit} className="flex space-x-2 items-center bg-slate-950 px-4 py-3 border border-slate-800 rounded-2xl">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ask a question or log a resolution update..."
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-white placeholder-slate-500 w-full"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Comments Feed list */}
              <div className="space-y-3">
                {issue.comments.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">No collaborative chats registered yet. Write the first update.</p>
                  </div>
                ) : (
                  [...issue.comments].reverse().map((com) => {
                    const isAi = com.authorRole === "ai_system";
                    const isAdminCom = com.authorRole === "admin";
                    
                    return (
                      <div 
                        key={com.id}
                        className={`p-3.5 rounded-2xl flex flex-col space-y-1.5 text-left border ${
                          isAi 
                            ? "bg-blue-950/10 border-blue-900/10" 
                            : isAdminCom 
                            ? "bg-purple-950/15 border-purple-900/10"
                            : "bg-slate-900/40 border-slate-850"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white">
                              {com.authorName}
                            </span>
                            <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                              isAi
                                ? "bg-blue-950 text-blue-400"
                                : isAdminCom
                                ? "bg-purple-950 text-purple-400"
                                : "bg-slate-800 text-slate-400"
                            }`}>
                              {com.authorRole === "ai_system" ? "Civic Agent" : com.authorRole}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500">
                            {new Date(com.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {com.text}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </div>

        {/* Foot Control bar */}
        <div className="bg-slate-950/80 px-6 py-4.5 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close Workspace
          </button>
        </div>

      </motion.div>
    </div>
  );
};
