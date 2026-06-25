/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Map, 
  PlusCircle, 
  BarChart3, 
  Trophy, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  LayoutDashboard,
  Compass,
  RefreshCw,
  TrendingUp,
  Sparkles,
  HeartPlus,
  Sun,
  Moon,
  AlertTriangle,
  BrainCircuit
} from "lucide-react";

import { IssueReport, IssueStatus, IssueSeverity, UserLeaderboard, IssueCategory } from "./types.js";
import { LandingPage } from "./components/LandingPage.jsx";
import { DigitalTwinMap } from "./components/DigitalTwinMap.jsx";
import { IssuesFeed } from "./components/IssuesFeed.jsx";
import { IssueDetailModal } from "./components/IssueDetailModal.jsx";
import { ReportIssueForm } from "./components/ReportIssueForm.jsx";
import { CustomBarChart, CustomSeverityDonut, CustomHealthGauge } from "./components/CustomCharts.jsx";
import { LeaderboardPage } from "./components/LeaderboardPage.jsx";
import { AdminPanel } from "./components/AdminPanel.jsx";
import { ProfileView } from "./components/ProfileView.jsx";
import { AIAgentChatbot } from "./components/AIAgentChatbot.jsx";
import { db, collection, getDocs, setDoc, doc, handleFirestoreError, OperationType } from "./firebase";

type ViewType = "map" | "report" | "analytics" | "leaderboard" | "profile" | "admin";

export default function App() {
  const [role, setRole] = useState<"citizen" | "volunteer" | "admin" | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("map");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // Data State
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserLeaderboard[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<number>(84);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  
  // Form coordinates ping link
  const [clickedMapCoords, setClickedMapCoords] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [showReportForm, setShowReportForm] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("snehar.2536@gmail.com");

  // Authentication & Guest Flow Custom States
  const [initialLandingMode, setInitialLandingMode] = useState<{ role: "citizen" | "volunteer" | "admin"; isSignUp: boolean } | null>(null);
  const [showSignupGuard, setShowSignupGuard] = useState<{ isOpen: boolean; actionName: string } | null>(null);

  const checkGuestAndBlock = (actionName: string): boolean => {
    if (userEmail === "guest@springfield.org") {
      setShowSignupGuard({ isOpen: true, actionName });
      return true;
    }
    return false;
  };

  const handleOpenReportForm = () => {
    if (checkGuestAndBlock("Report a New Civic Incident")) return;
    setShowReportForm(true);
  };

  const handleViewProfile = () => {
    if (checkGuestAndBlock("Access Personal Profile & Badges")) return;
    setActiveView("profile");
  };

  // Redirect guest back to landing page with signup primed
  const handleRedirectToSignup = (targetRole: "citizen" | "volunteer" | "admin" = "citizen") => {
    setRole(null);
    setUserEmail("");
    setInitialLandingMode({ role: targetRole, isSignUp: true });
    setShowSignupGuard(null);
  };

  const handleRedirectToLogin = (targetRole: "citizen" | "volunteer" | "admin" = "citizen") => {
    setRole(null);
    setUserEmail("");
    setInitialLandingMode({ role: targetRole, isSignUp: false });
    setShowSignupGuard(null);
  };

  // Notifications feedback ticker
  const [feedLogs, setFeedLogs] = useState<string[]>([
    "System online. Gunning vector grid Springfield REG-88 indicators."
  ]);

  // Sync server feeds from Firestore with automatic local fallback seeding
  const loadData = async () => {
    try {
      // 1. Fetch Issues from Firestore
      let issuesData: any[] = [];
      let issuesSnap: any = null;
      try {
        const issuesCol = collection(db, "issues");
        issuesSnap = await getDocs(issuesCol);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "issues");
      }
      
      if (issuesSnap && !issuesSnap.empty) {
        issuesData = issuesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setIssues(issuesData);
      } else {
        // Seed from Server
        const issuesRes = await fetch("/api/issues");
        if (issuesRes.ok) {
          issuesData = await issuesRes.json();
          setIssues(issuesData);
          // Save to Firestore so it's durably persisted
          for (const issue of issuesData) {
            try {
              await setDoc(doc(db, "issues", issue.id), issue);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `issues/${issue.id}`);
            }
          }
          console.log("Seeded Firestore issues from local database");
        }
      }

      // 2. Fetch Leaderboard from Firestore
      let leaderboardData: any[] = [];
      let lbSnap: any = null;
      try {
        const lbCol = collection(db, "leaderboard");
        lbSnap = await getDocs(lbCol);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "leaderboard");
      }

      if (lbSnap && !lbSnap.empty) {
        leaderboardData = lbSnap.docs.map(d => d.data() as any);
        setLeaderboard(leaderboardData);
      } else {
        // Seed from Server
        const lRes = await fetch("/api/leaderboard");
        if (lRes.ok) {
          leaderboardData = await lRes.json();
          setLeaderboard(leaderboardData);
          // Save to Firestore
          for (const user of leaderboardData) {
            const path = `leaderboard/${user.id || user.email || Math.random().toString()}`;
            try {
              await setDoc(doc(db, "leaderboard", user.id || user.email || Math.random().toString()), user);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, path);
            }
          }
          console.log("Seeded Firestore leaderboard from local database");
        }
      }

      const analyticsRes = await fetch("/api/analytics");
      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setHealthScore(aData.overallHealthScore);
      }

      const pRes = await fetch("/api/analytics/predictions");
      if (pRes.ok) {
        const pData = await pRes.json();
        setPredictions(pData.predictions || []);
      }
    } catch (err) {
      console.error("Transients fetching feeds from Firestore / Server: ", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnterApp = (selectedRole: "citizen" | "volunteer" | "admin", email: string) => {
    setRole(selectedRole);
    setUserEmail(email);
    setInitialLandingMode(null);
    setActiveView(selectedRole === "admin" ? "admin" : "map");
    setFeedLogs(prev => [...prev, `User logged in: ${email} as ${selectedRole.toUpperCase()}`]);
  };

  const handleSelectIssue = (issueId: string) => {
    setSelectedIssueId(issueId);
  };

  // Upvote / confirm actions
  const handleVoteAction = async (voteType: "upvote" | "confirm" | "flag") => {
    if (checkGuestAndBlock("Cast a Vote / Verify Incident")) return;
    if (!selectedIssueId) return;

    try {
      const res = await fetch(`/api/issues/${selectedIssueId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voteType,
          userEmail
        })
      });

      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(prev => prev.map(i => i.id === selectedIssueId ? updatedIssue : i));
        
        // Save to Firestore for persistent storage
        try {
          await setDoc(doc(db, "issues", selectedIssueId), updatedIssue);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `issues/${selectedIssueId}`);
        }

        let message = `Action synchronized: ${voteType.toUpperCase()} marked to incident ticket.`;
        setFeedLogs(prev => [...prev, message]);
        // reload score index
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Comments logs and re-fetch status
  const handleAddComment = async (text: string) => {
    if (checkGuestAndBlock("Contribute Comment / Logistics Verification")) return;
    if (!selectedIssueId) return;

    try {
      const res = await fetch(`/api/issues/${selectedIssueId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          authorName: role === "admin" ? "Officer Desk" : role === "volunteer" ? "Lead Volunteer" : "Resident Sentinel",
          authorRole: role,
          userEmail
        })
      });

      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(prev => prev.map(i => i.id === selectedIssueId ? updatedIssue : i));
        // Save to Firestore
        try {
          await setDoc(doc(db, "issues", selectedIssueId), updatedIssue);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `issues/${selectedIssueId}`);
        }
        setFeedLogs(prev => [...prev, "New community comment filed to active log thread."]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin and modal worker status override dispatch
  const handleUpdateStatus = async (issueId: string, status: string, detail?: string) => {
    if (checkGuestAndBlock("Modify Incident Workflow Status (Admin/Staff)")) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          detail: detail || `Work crew assigned state changed: ${status}`
        })
      });

      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(prev => prev.map(i => i.id === issueId ? updatedIssue : i));
        
        // Save to Firestore
        try {
          await setDoc(doc(db, "issues", issueId), updatedIssue);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `issues/${issueId}`);
        }

        // If modal was active, sync detail view
        if (selectedIssueId === issueId) {
          setSelectedIssueId(issueId);
        }

        setFeedLogs(prev => [...prev, `Municipal dispatch order confirmed: ${status}`]);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Emergency agentic escalation
  const handleEscalateIncident = async () => {
    if (checkGuestAndBlock("Escalate Incident Ticket")) return;
    if (!selectedIssueId) return;

    try {
      const res = await fetch(`/api/issues/${selectedIssueId}/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(prev => prev.map(i => i.id === selectedIssueId ? updatedIssue : i));
        // Save to Firestore
        try {
          await setDoc(doc(db, "issues", selectedIssueId), updatedIssue);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `issues/${selectedIssueId}`);
        }
        setFeedLogs(prev => [...prev, "🚨 EMERGENCY EXTRADITION SCALING COMPLETED. Directorate dispatched."]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fresh report registry actions
  const handleNewIssueCreated = async (newIssue: IssueReport) => {
    if (checkGuestAndBlock("AI-Assisted Automated Incident Reporting")) return;
    setIssues(prev => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    setFeedLogs(prev => [...prev, `New instance: '${newIssue.title}' logged via vision scanner.`]);
    try {
      await setDoc(doc(db, "issues", newIssue.id), newIssue);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `issues/${newIssue.id}`);
    }
    loadData();
  };

  // Handle coordinates click auto fill
  const handleMapClickCoordsSelect = (lat: number, lng: number, address: string) => {
    if (checkGuestAndBlock("Report Civic Issue via Map Grid Selection")) return;
    setClickedMapCoords({ lat, lng, address });
    setShowReportForm(true);
    setFeedLogs(prev => [...prev, `Grid Coordinates selected: [Lat ${lat}, Lng ${lng}]. Intake primed.`]);
  };

  if (!role) {
    return (
      <LandingPage 
        onEnterApp={handleEnterApp}
        overallHealthScore={healthScore}
        totalIssuesCount={issues.length}
        initialRole={initialLandingMode?.role}
        initialIsSignUp={initialLandingMode?.isSignUp}
        onClearInitialMode={() => setInitialLandingMode(null)}
      />
    );
  }

  const activeIssueObject = issues.find(i => i.id === selectedIssueId) || null;

  // Modern dynamic theme classes
  const bgClass = isDarkMode ? "bg-[#060814] text-slate-100" : "bg-[#f8fafc] text-[#1e293b]";
  const borderClass = isDarkMode ? "border-slate-850" : "border-slate-200";
  const cardClass = isDarkMode ? "bg-slate-950/40 backdrop-blur-lg border border-slate-850 shadow-xl shadow-black/10" : "bg-white border border-slate-200/80 shadow-sm shadow-[#0f172a]/5";
  const textMuted = isDarkMode ? "text-slate-400" : "text-slate-500 font-medium";
  const textTitle = isDarkMode ? "text-white" : "text-slate-800";
  const inputClass = isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900";

  return (
    <div id="master-applet-canvas" className={`min-h-screen ${bgClass} transition-colors duration-300 flex flex-col md:flex-row overflow-x-hidden select-none`}>
      
      {/* 1. LEFT SIDEBAR NAVIGATION DOCK (Desktop Only) */}
      <aside className={`hidden md:flex flex-col w-[260px] ${isDarkMode ? "bg-[#02050e]/95 border-slate-850" : "bg-white border-slate-200 shadow-sm"} border-r h-screen sticky top-0 shrink-0 z-20 p-5 justify-between`}>
        
        <div className="space-y-6">
          {/* Logo Brand Widget */}
          <div 
            onClick={() => setRole(null)}
            className="flex items-center space-x-2.5 cursor-pointer hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow shadow-indigo-900/30">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tighter uppercase leading-none block font-display">COMMUNITY HERO</h1>
              <span className="text-[9px] font-mono tracking-widest text-emerald-500 uppercase font-bold leading-none mt-1 inline-block">SEC Springfield</span>
            </div>
          </div>

          {/* Quick Active Prediction Alert Ticker */}
          <div className={`p-3 rounded-xl border ${borderClass} ${isDarkMode ? "bg-indigo-950/15" : "bg-indigo-50/30"} text-left`}>
            <div className="flex items-center space-x-1.5 text-indigo-400 mb-1">
              <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wide">AI PREDICTIVE INSIGHT</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Monsoon Drainage risk detected (94%). Check "Civic Health".
            </p>
          </div>

          {/* Navigation Links list */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveView("map")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 cursor-pointer ${
                activeView === "map" 
                  ? isDarkMode ? "bg-slate-900 text-white border border-slate-800" : "bg-slate-100 text-slate-900 border border-slate-200/50" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Map className="w-4 h-4 text-blue-500" />
              <span>Digital Twin Map</span>
            </button>

            <button
              onClick={handleOpenReportForm}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 text-slate-400 hover:text-slate-200 cursor-pointer`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              <span>Report Civic Issue</span>
            </button>

            <button
              onClick={() => setActiveView("analytics")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 cursor-pointer ${
                activeView === "analytics" 
                  ? isDarkMode ? "bg-slate-900 text-white border border-slate-800" : "bg-slate-100 text-slate-900 border border-slate-200/50" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-yellow-500" />
              <span>Civic Health & AI</span>
            </button>

            <button
              onClick={() => setActiveView("leaderboard")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 cursor-pointer ${
                activeView === "leaderboard" 
                  ? isDarkMode ? "bg-slate-900 text-white border border-slate-800" : "bg-slate-100 text-slate-900 border border-slate-200/50" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Volunteer Board</span>
            </button>

            <button
              onClick={handleViewProfile}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 cursor-pointer ${
                activeView === "profile" 
                  ? isDarkMode ? "bg-slate-900 text-white border border-slate-800" : "bg-slate-100 text-slate-900 border border-slate-200/50" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-4 h-4 text-[#10B981]" />
              <span>My Profile</span>
            </button>

            {role === "admin" && (
              <button
                onClick={() => setActiveView("admin")}
                className={`w-full text-[#10B981] text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 cursor-pointer ${
                  activeView === "admin" 
                    ? isDarkMode ? "bg-slate-900 text-white border border-slate-800" : "bg-slate-100 text-slate-900 border border-slate-200/50" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Settings className="w-4 h-4 text-purple-500" />
                <span>Admin Operations</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Section: Theme Toggler & Logout */}
        <div className="space-y-4">
          {/* Glassmorphic Dark / Light switch */}
          <div className={`p-1 rounded-xl border ${borderClass} flex items-center justify-between bg-slate-950/20`}>
            <button
              onClick={() => setIsDarkMode(true)}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-2.5 text-[10px] font-bold ${
                isDarkMode ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setIsDarkMode(false)}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-2.5 text-[10px] font-bold ${
                !isDarkMode ? "bg-amber-500 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Light</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-left text-xs pt-3 border-t border-slate-800/20">
            <div className="overflow-hidden">
              <p className={`font-mono text-[9px] font-bold leading-none ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                CURRENT USER
              </p>
              <p className={`font-semibold truncate text-[11px]  ${textTitle}`}>
                {role === "admin" ? "City Admin" : "Citizen Agent"}
              </p>
            </div>

            <button
              onClick={() => setRole(null)}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition hover:bg-slate-900/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* 2. MAIN APPLICATION WORKSPACE WINDOW */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Top Header Bar for Mobile, or general profile status */}
        <header className={`${isDarkMode ? "bg-[#02050e]/80 border-slate-850" : "bg-white border-slate-200 shadow-sm"} border-b px-6 py-4.5 mb-0.5 sticky top-0 z-30 backdrop-blur-md`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3 md:hidden">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
                <Shield className="w-4 h-4" />
              </div>
              <h1 className="text-xs font-black tracking-tighter uppercase leading-none font-display text-slate-100">COMMUNITY HERO</h1>
            </div>

            {/* Quick Live Ticker Notice */}
            <div className={`hidden md:flex items-center space-x-2 truncate text-xs ${textMuted} font-semibold`}>
              <Bell className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{feedLogs[feedLogs.length - 1]}</span>
            </div>

            {/* Top right actions */}
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-1 ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-200/50 border-slate-300/30 text-slate-700"} border rounded font-mono font-bold uppercase text-[9px]`}>
                ROLE: {role}
              </span>

              {/* Mobile theme toggler quick switch */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`md:hidden p-1.5 rounded-lg border ${borderClass} cursor-pointer`}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                onClick={() => setRole(null)}
                className="md:hidden p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition flex items-center space-x-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Workspace core container */}
        <main className="max-w-7xl w-full mx-auto px-6 py-6 flex-1 flex flex-col text-left">
          
          {/* Mobile responsive Quick Nav Tabs bar */}
          <div className="flex md:hidden bg-slate-950/20 border border-slate-800/10 p-1 rounded-xl mb-5 overflow-x-auto gap-1">
            <button
              onClick={() => setActiveView("map")}
              className={`py-1.5 px-3 rounded-lg text-[10px] font-bold shrink-0 transition ${
                activeView === "map" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              Digital Twin Map
            </button>
            <button
              onClick={handleOpenReportForm}
              className="py-1.5 px-3 rounded-lg text-[10px] font-bold shrink-0 text-slate-400"
            >
              Report Issue
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className={`py-1.5 px-3 rounded-lg text-[10px] font-bold shrink-0 transition ${
                activeView === "analytics" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              Civic Health
            </button>
            <button
              onClick={() => setActiveView("leaderboard")}
              className={`py-1.5 px-3 rounded-lg text-[10px] font-bold shrink-0 transition ${
                activeView === "leaderboard" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={handleViewProfile}
              className={`py-1.5 px-3 rounded-lg text-[10px] font-bold shrink-0 transition ${
                activeView === "profile" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              Profile
            </button>
          </div>

          {/* Premium Gradient Hero Section */}
          <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 mb-6 ${
            isDarkMode 
              ? "bg-gradient-to-r from-blue-950/20 via-indigo-950/20 to-[#0e071e]/10 border border-indigo-500/10" 
              : "bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50 border border-blue-100/50"
          }`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono tracking-widest font-black uppercase px-2 py-0.5 rounded ${
                    isDarkMode ? "bg-indigo-950/80 text-indigo-400 border border-indigo-900/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  }`}>
                    Civilian Consensus Grid 
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h2 className={`text-2xl font-black tracking-tight ${textTitle} font-display mt-1`}>
                  Springfield Digital Twin
                </h2>
                <p className={`text-xs max-w-xl leading-relaxed ${textMuted}`}>
                  Predictive civic restoration engine. Combining machine vision automated dispatch, volunteer coordinate mappings, and real-time community transparency.
                </p>
              </div>

              {/* Core numbers widgets */}
              <div className="flex gap-4 shrink-0 font-mono text-left">
                <div className={`${cardClass} p-3 rounded-2xl text-left min-w-[110px]`}>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">TOTAL REPORTS</span>
                  <span className={`text-lg font-black ${textTitle}`}>{issues.length}</span>
                </div>
                <div className={`${cardClass} p-3 rounded-2xl text-left min-w-[110px]`}>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">CIVIC HEALTH</span>
                  <span className="text-lg font-black text-emerald-400">{healthScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Workspace Routing panels */}
          <div className="flex-1 flex flex-col">
            
            {activeView === "map" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
                {/* Left Listing Column Feed */}
                <div className="lg:col-span-4 h-full flex flex-col">
                  <IssuesFeed 
                    issues={issues}
                    selectedIssueId={selectedIssueId}
                    onSelectIssue={handleSelectIssue}
                    onOpenReportForm={handleOpenReportForm}
                  />
                </div>

                {/* Right Map Column digital twin */}
                <div className="lg:col-span-8 h-full min-h-[580px]">
                  <DigitalTwinMap 
                    issues={issues}
                    selectedIssueId={selectedIssueId}
                    onSelectIssue={handleSelectIssue}
                    onMapClickCoordinates={handleMapClickCoordsSelect}
                  />
                </div>
              </div>
            )}

            {activeView === "analytics" && (
              <div className="space-y-6 text-left">
                
                {/* Top analytic cards Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Radial Citizen Gauge */}
                  <div className={`${cardClass} lg:col-span-4 rounded-3xl p-6 flex flex-col justify-center items-center`}>
                    <h3 className={`text-xs font-mono font-black uppercase tracking-wider ${textMuted} mb-2 pb-1.5 w-full text-center border-b ${isDarkMode ? "border-slate-850" : "border-slate-100"}`}>
                      Live Civic Health Score
                    </h3>
                    <CustomHealthGauge score={healthScore} />
                  </div>

                  {/* Charts elements inside modern card layout */}
                  <div className={`${cardClass} lg:col-span-8 rounded-3xl p-6 space-y-6`}>
                    <div>
                      <h3 className={`text-xs font-mono font-black uppercase tracking-wider ${textMuted} border-b ${isDarkMode ? "border-slate-850" : "border-slate-100"} pb-1.5 mb-4`}>
                        Incident severity analysis
                      </h3>
                      <CustomSeverityDonut issues={issues} />
                    </div>

                    <div className={`border-t ${isDarkMode ? "border-slate-850" : "border-slate-100"} pt-5`}>
                      <h3 className={`text-xs font-mono font-black uppercase tracking-wider ${textMuted} border-b ${isDarkMode ? "border-slate-850" : "border-slate-100"} pb-1.5 mb-4`}>
                        Discrepancies category volumes
                      </h3>
                      <CustomBarChart 
                        data={[
                          { label: "Road Health", value: issues.filter(i => i.category === IssueCategory.ROADS).length, color: "bg-blue-600" },
                          { label: "Water Grid", value: issues.filter(i => i.category === IssueCategory.WATER_SUPPLY).length, color: "bg-sky-500" },
                          { label: "Power Grid", value: issues.filter(i => i.category === IssueCategory.ELECTRICITY).length, color: "bg-yellow-500" },
                          { label: "Drainage", value: issues.filter(i => i.category === IssueCategory.DRAINAGE).length, color: "bg-indigo-600" },
                          { label: "Waste Disposal", value: issues.filter(i => i.category === IssueCategory.WASTE_MANAGEMENT).length, color: "bg-emerald-600" }
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* AI TARGET COMPLIANCE: Hotspot Predictive insights panel */}
                <div className={`${cardClass} rounded-3xl p-6`}>
                  <div className="flex items-center space-x-2.5 mb-4 border-b border-indigo-500/10 pb-3">
                    <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <div>
                      <h3 className={`text-sm font-extrabold tracking-tight ${textTitle}`}>
                        AI Hotspot Prediction Engine
                      </h3>
                      <p className={`text-[9px] font-mono ${textMuted} uppercase`}>
                        Live Predictive forecasting calculated via Gemini Telemetry
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    {predictions.map((p, idx) => (
                      <div 
                        key={p.id || idx}
                        className={`relative p-5 rounded-2xl border ${
                          p.riskLevel === "High" 
                            ? isDarkMode ? "bg-red-950/15 border-red-900/30" : "bg-red-50 border-red-200"
                            : isDarkMode ? "bg-indigo-950/10 border-indigo-900/15" : "bg-indigo-50/20 border-indigo-100/75"
                        }`}
                      >
                        {/* Status label banner */}
                        <div className="flex items-center justify-between mb-2 pb-2.5 border-b border-slate-800/10">
                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                            p.riskLevel === "High"
                              ? "bg-red-500/15 text-red-500"
                              : "bg-yellow-500/15 text-yellow-500"
                          }`}>
                            {p.riskLevel} Hazard RISK
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                            CONFIDENCE: {p.confidence}%
                          </span>
                        </div>

                        <h4 className={`text-xs font-black tracking-tight ${textTitle} mb-1 uppercase font-display`}>
                          {p.title}
                        </h4>
                        <p className={`text-[11px] font-bold ${p.riskLevel === "High" ? isDarkMode ? "text-slate-200" : "text-slate-800" : textMuted} leading-relaxed italic mb-4`}>
                          "{p.text}"
                        </p>

                        <div className={`pt-3 border-t ${isDarkMode ? "border-slate-800/40" : "border-slate-200/40"}`}>
                          <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">MUNICIPAL RECOMMENDATION</span>
                          <p className={`text-[10px] ${textMuted} mt-0.5 leading-normal`}>
                            {p.recommendedAction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {activeView === "leaderboard" && (
              <LeaderboardPage leaderboard={leaderboard} />
            )}

            {activeView === "admin" && role === "admin" && (
              <AdminPanel 
                issues={issues}
                onUpdateStatus={handleUpdateStatus}
                onSelectIssue={handleSelectIssue}
              />
            )}

            {activeView === "profile" && (
              <ProfileView 
                userRole={role}
                userEmail={userEmail}
                myIssues={issues.filter(i => i.citizenId === "user_snehar" || i.citizenName === "snehar.2536@gmail.com")}
                weeksTotalSolvedStats={issues.filter(i => i.status === IssueStatus.RESOLVED).length}
              />
            )}

          </div>

        </main>

        {/* Footer info bar */}
        <footer className={`${isDarkMode ? "bg-slate-950 border-slate-850" : "bg-white border-slate-200"} px-6 py-5 border-t mt-12`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-mono text-slate-500">
            <span>SPRINGFIELD CIVIL LEDGER DIGITAL COOP • MUNICIPAL DEPLOYMENT INTEGRATIVE</span>
            <span>PERSISTENT STORAGE ONLINE • CLOUD TELEMETRY SECURED</span>
          </div>
        </footer>

      </div>

      {/* 3. POPUP MODALS DRAWERS */}
      <AnimatePresence>
        {selectedIssueId && activeIssueObject && (
          <IssueDetailModal
            issue={activeIssueObject}
            onClose={() => setSelectedIssueId(null)}
            onVote={handleVoteAction}
            onPostComment={handleAddComment}
            onUpdateStatus={handleUpdateStatus}
            onEscalate={handleEscalateIncident}
            userRole={role}
            userEmail={userEmail}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReportForm && (
          <ReportIssueForm
            onIssueCreated={handleNewIssueCreated}
            onClose={() => {
              setShowReportForm(false);
              setClickedMapCoords(null);
            }}
            clickedCoords={clickedMapCoords}
            userEmail={userEmail}
          />
        )}
      </AnimatePresence>

      <AIAgentChatbot 
        onIssueCreated={handleNewIssueCreated}
        onFocusIssue={(issueId) => {
          setSelectedIssueId(issueId);
          setActiveView("map");
        }}
        userEmail={userEmail}
      />

      {/* 4. GUEST SIGNUP BLOCKER DIALOG */}
      <AnimatePresence>
        {showSignupGuard?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-slate-905 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left"
            >
              {/* Top alert border glow */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              
              <div className="flex items-start space-x-3 mb-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-500 shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight">Ingress Account Required</h3>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider block">Local Server Regulations</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are currently browsing Springfield's digital twin under a <span className="font-bold text-amber-400">Guest Bypass</span>.
                </p>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                  <span className="text-[9px] text-amber-500 font-mono font-bold uppercase block tracking-wider">RESTRICTED WORK OPERATION:</span>
                  <p className="text-xs text-slate-100 font-semibold">{showSignupGuard.actionName}</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Please signup or login as a registered community resident to raise issues, verify reports, or comment.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleRedirectToSignup("citizen")}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center shadow-lg hover:shadow-blue-600/10"
                >
                  <span>Please Sign Up to Continue</span>
                </button>
                <button
                  onClick={() => handleRedirectToLogin("citizen")}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center border border-slate-700"
                >
                  <span>Already have an account? Login</span>
                </button>
                <button
                  onClick={() => setShowSignupGuard(null)}
                  className="w-full py-2 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs rounded-xl transition cursor-pointer text-center"
                >
                  Cancel Guidance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
