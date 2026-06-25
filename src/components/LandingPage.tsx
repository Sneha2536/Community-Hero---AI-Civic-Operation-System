/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, Map, Users, Award, Database, TrendingUp, CheckCircle, ArrowRight, ArrowLeft, Mail, User, Lock, AlertCircle, Loader2, Key } from "lucide-react";
import { auth, googleProvider, signInWithPopup } from "../firebase";

interface LandingPageProps {
  onEnterApp: (role: "citizen" | "volunteer" | "admin", email: string) => void;
  overallHealthScore: number;
  totalIssuesCount: number;
  initialRole?: "citizen" | "volunteer" | "admin" | null;
  initialIsSignUp?: boolean;
  onClearInitialMode?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  overallHealthScore,
  totalIssuesCount,
  initialRole,
  initialIsSignUp,
  onClearInitialMode
}) => {
  const [activeAuthRole, setActiveAuthRole] = useState<"citizen" | "volunteer" | "admin" | null>(
    initialRole !== undefined ? initialRole : null
  );
  const [isSignUp, setIsSignUp] = useState<boolean>(initialIsSignUp !== undefined ? initialIsSignUp : true);
  const [emailInput, setEmailInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialRole !== undefined) {
      setActiveAuthRole(initialRole);
    }
    if (initialIsSignUp !== undefined) {
      setIsSignUp(initialIsSignUp);
    }
  }, [initialRole, initialIsSignUp]);

  const getDemoPrefill = () => {
    if (activeAuthRole === "citizen") return { email: "snehar.2536@gmail.com", name: "Snehar" };
    if (activeAuthRole === "volunteer") return { email: "david.m@springfield.org", name: "David Miller" };
    if (activeAuthRole === "admin") return { email: "emma.w@government.com", name: "Emma Watson" };
    return null;
  };

  const prefill = getDemoPrefill();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        let role: "citizen" | "volunteer" | "admin" = "citizen";
        if (user.email.endsWith("government.com") || user.email.includes("admin")) {
          role = "admin";
        } else if (user.email.endsWith("springfield.org") || user.email.includes("volunteer")) {
          role = "volunteer";
        }
        onEnterApp(role, user.email);
      }
    } catch (err: any) {
      console.error("Google sign in failed:", err);
      setErrorMsg(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (isSignUp && !nameInput.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameInput.trim(),
            email: emailInput.trim(),
            role: activeAuthRole
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          onEnterApp(activeAuthRole!, data.user.email);
        } else {
          setErrorMsg(data.error || "Signup failed. Please try again.");
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailInput.trim(),
            role: activeAuthRole
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          onEnterApp(activeAuthRole!, data.user.email);
        } else {
          setErrorMsg(data.error || "Login failed. Please register if you are new!");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg("Connection to server could not be established. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#070b16] text-white flex flex-col justify-between overflow-x-hidden relative">
      
      {/* Background ambient glowing spheres */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/40 relative z-10 font-sans">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white leading-none block">COMMUNITY HERO</span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">AI Civic Operating System</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
          <span>SPRINGFIELD REG-88</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
      </header>

      {/* Hero Display Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 my-auto">
        <div className="flex-1 space-y-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-950/40 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold leading-none"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-400" />
            <span>AI Hyperlocal Problem Solving Suite v3.5</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white"
          >
            Empower Your City. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 ">
              Solve Issues in Seconds.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm max-w-lg leading-relaxed font-normal"
          >
            Translate reporting into direct collaborative resolution. Our automated AI Agent analyzes images, generates immediate municipal engineering solutions, calculates community impact, and dispatches town authorities under a complete transparent workflow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col space-y-4 pt-3 w-full"
          >
            <AnimatePresence mode="wait">
              {!activeAuthRole ? (
                <motion.div
                  key="role-select"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    SELECT YOUR ACTIVE CIVIC OPERATING ROLE ENTRANCE:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                    <button
                      onClick={() => {
                        setActiveAuthRole("citizen");
                        setIsSignUp(true);
                        setEmailInput("");
                        setNameInput("");
                        setPasswordInput("");
                        setErrorMsg(null);
                      }}
                      className="group relative flex flex-col items-start p-4 text-left bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-2xl transition duration-300 shadow-lg cursor-pointer"
                    >
                      <div className="p-2 bg-blue-600/10 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition duration-300 mb-3">
                        <Award className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-white leading-none">Citizen</h3>
                      <p className="text-[10px] text-slate-400 mt-1 lines-clamp-2">Report issues, upvote validations, &amp; unlock hero level badges.</p>
                    </button>

                    <button
                      onClick={() => {
                        setActiveAuthRole("volunteer");
                        setIsSignUp(true);
                        setEmailInput("");
                        setNameInput("");
                        setPasswordInput("");
                        setErrorMsg(null);
                      }}
                      className="group relative flex flex-col items-start p-4 text-left bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-2xl transition duration-300 shadow-lg cursor-pointer"
                    >
                      <div className="p-2 bg-emerald-600/10 text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition duration-300 mb-3">
                        <Map className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-white leading-none">Volunteer</h3>
                      <p className="text-[10px] text-slate-400 mt-1 lines-clamp-2">Inspect field parameters, upload updates, &amp; lead reports.</p>
                    </button>

                    <button
                      onClick={() => {
                        setActiveAuthRole("admin");
                        setIsSignUp(true);
                        setEmailInput("");
                        setNameInput("");
                        setPasswordInput("");
                        setErrorMsg(null);
                      }}
                      className="group relative flex flex-col items-start p-4 text-left bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl transition duration-300 shadow-lg cursor-pointer"
                    >
                      <div className="p-2 bg-purple-600/10 text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition duration-300 mb-3">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-white leading-none">Municipality Admin</h3>
                      <p className="text-[10px] text-slate-400 mt-1 lines-clamp-2">Manage work ticket status, allocate resources, &amp; issue approvals.</p>
                    </button>
                  </div>
                  
                  <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                    <span>All roles include instant </span>
                    <span className="text-blue-400 font-bold"> Google AI integration</span>
                    <span> &amp; persistent JSON-Database saves.</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="auth-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative"
                >
                  {/* Decorative bar on top */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${
                    activeAuthRole === "citizen" ? "from-blue-600 to-sky-500" :
                    activeAuthRole === "volunteer" ? "from-emerald-600 to-teal-500" :
                    "from-purple-600 to-pink-500"
                  }`} />

                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAuthRole(null);
                        setErrorMsg(null);
                      }}
                      className="inline-flex items-center space-x-1 text-xs text-slate-405 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer text-slate-400"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Roles</span>
                    </button>

                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                      activeAuthRole === "citizen" ? "bg-blue-955/40 text-blue-400 border-blue-500/20" :
                      activeAuthRole === "volunteer" ? "bg-emerald-955/40 text-emerald-400 border-emerald-500/20" :
                      "bg-purple-955/40 text-purple-450 border-purple-500/20"
                    }`}>
                      {activeAuthRole} portal
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    {isSignUp ? "Register Secure Account" : "Access Operating Core"}
                  </h3>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    {isSignUp 
                      ? `Create local credentials to join Springfield as a registered ${activeAuthRole}.`
                      : `Authenticated ingress is required to access ${activeAuthRole} features.`
                    }
                  </p>

                  {/* Error Box */}
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-950/50 border border-red-500/30 text-red-350 p-3 rounded-xl mb-4 text-xs flex items-start space-x-2 text-left text-red-300"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-450 mt-0.5" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
                    {isSignUp && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                          Official Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. David Smith"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                        Secure Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="your.email@springfield.org"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                          Access PIN / Password
                        </label>
                        <span className="text-[9px] text-slate-500 font-mono italic">(Simulated for testing)</span>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>

                    {/* Autofill recommendation banner */}
                    {prefill && (
                      <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl flex flex-col space-y-1.5">
                        <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wide flex items-center space-x-1">
                          <Key className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          <span>Interactive Demo Presets</span>
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Click to instantly auto-fill credentials for this active developer testing user:
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailInput(prefill.email);
                            setNameInput(prefill.name);
                            setPasswordInput("password123");
                            setErrorMsg(null);
                          }}
                          className="self-start inline-flex items-center space-x-1 px-2.5 py-1.5 bg-blue-900/40 text-blue-300 hover:bg-blue-900 border border-blue-500/30 rounded-lg text-[10px] font-mono transition cursor-pointer"
                        >
                          Fill: {prefill.email}
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg mt-2 ${
                        activeAuthRole === "citizen" ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/10 text-white" :
                        activeAuthRole === "volunteer" ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/10 text-white" :
                        "bg-purple-600 hover:bg-purple-700 hover:shadow-purple-600/10 text-white"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>{isSignUp ? "Create Operating License" : "Establish Secure Ingress"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <span className="relative px-3 bg-slate-900 text-[10px] font-mono text-slate-500 uppercase">Or Continue with</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2 cursor-pointer text-slate-200"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.12-4.53-4.53-4.53z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setErrorMsg(null);
                        setEmailInput("");
                        setNameInput("");
                        setPasswordInput("");
                      }}
                      className="text-xs text-slate-400 hover:text-white transition cursor-pointer font-medium underline underline-offset-4 decoration-slate-700 hover:decoration-white"
                    >
                      {isSignUp 
                        ? "Already have an account? Login" 
                        : "Don't have an account? Register / Sign up"
                      }
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Live stability preview widgets on right */}
        <div className="flex-1 w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
          {/* Futuristic city background image overlay */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-transform duration-700 group-hover:scale-105">
            <img
              src="/src/assets/images/futuristic_city_grid_1782402127206.jpg"
              alt="Futuristic Digital City Map"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950" />
          </div>

          <div className="relative z-10">
            <div className="absolute top-4 right-4 text-[10px] bg-slate-950 font-mono px-2 py-0.5 rounded border border-slate-800 text-slate-500">
              SEC-A880
            </div>

            <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#10B981] mb-4 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Springfield Live Real-Time Overview</span>
            </h3>

            <div className="space-y-4">
              
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-mono">STABILITY INDEX</span>
                    <span className="text-sm font-semibold text-white">Community Health</span>
                  </div>
                </div>
                <span className="text-2xl font-black font-mono text-emerald-400">{overallHealthScore}%</span>
              </div>

              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-mono">SPATIAL INDEX</span>
                    <span className="text-sm font-semibold text-white">Active Logs</span>
                  </div>
                </div>
                <span className="text-2xl font-black font-mono text-white">{totalIssuesCount} Active</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-600/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-mono">ENGAGEMENT INDEX</span>
                    <span className="text-sm font-semibold text-white">Voter Participation Rate</span>
                  </div>
                </div>
                <span className="text-2xl font-black font-mono text-yellow-400">82%</span>
              </div>

            </div>

            <div className="mt-8 pt-5 border-t border-slate-800 flex flex-col space-y-3">
              <p className="text-xs text-slate-400 italic font-mono text-center">
                "Transforming local problems into decentralized community achievements."
              </p>
              <button
                onClick={() => {
                  // Enter App instantly without account under Guest Mode
                  onEnterApp("citizen", "guest@springfield.org");
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer hover:shadow-blue-600/20 mt-3 relative overflow-hidden group/btn"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Ingress In-Service Platform (Guest Bypass)</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover/btn:opacity-100 transition duration-300" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 text-xs text-slate-600 font-mono tracking-wider border-t border-slate-800/20 z-10 mt-12 bg-slate-950/30">
        COMMUNITY HERO PROJECT © 2026. PUBLIC DEPLOYMENT INTERACTIVE CORE RUNNING ON CONTAINER PORTS.
      </footer>
    </div>
  );
};
