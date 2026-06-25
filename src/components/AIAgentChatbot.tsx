/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { ChatMessage, IssueReport, IssueSeverity } from "../types.js";

interface AIAgentChatbotProps {
  onIssueCreated?: (newIssue: IssueReport) => void;
  onFocusIssue?: (issueId: string) => void;
  userEmail?: string;
}

export const AIAgentChatbot: React.FC<AIAgentChatbotProps> = ({
  onIssueCreated,
  onFocusIssue,
  userEmail
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "bot",
      text: "Hello! I am your autonomous **AI Civic Agent**. I help you log municipal issues, locate critical hazards, or review resolution timelines naturally.\n\nTry telling me: *'There's water leaking on Lincoln Way'* or ask *'Show all critical problems'*.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest bubbles
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Lock body scroll and prevent background touch scroll chaining when chatbot is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      
      const preventDefault = (e: TouchEvent) => {
        const chatbot = document.getElementById("ai-agent-chatbot-root");
        if (chatbot && !chatbot.contains(e.target as Node)) {
          e.preventDefault();
        }
      };

      document.addEventListener("touchmove", preventDefault, { passive: false });
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener("touchmove", preventDefault);
      };
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user_" + Date.now(),
      sender: "user",
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const chatPayload = [...messages, userMsg].map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: chatPayload,
          userEmail: userEmail || "snehar.2536@gmail.com"
        })
      });

      if (!res.ok) {
        throw new Error("Chat api failed");
      }

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: "bot_" + Date.now(),
        sender: "bot",
        text: data.reply,
        timestamp: new Date().toISOString(),
        type: data.type,
        metadata: data.metadata
      };

      setMessages(prev => [...prev, botMsg]);

      // If a report was automatically registered, trigger frontend state reload!
      if (data.type === "report_created" && data.metadata?.issue) {
        if (onIssueCreated) {
          onIssueCreated(data.metadata.issue);
        }
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: "err_" + Date.now(),
          sender: "bot",
          text: "I encountered a transient connection issue. Please make sure the dev server is active and try again in a few moments.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMarkdownMessage = (text: string) => {
    // Basic bold processor
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const getSeverityColor = (sev: IssueSeverity) => {
    switch (sev) {
      case IssueSeverity.CRITICAL: return "bg-red-500/10 text-red-400 border border-red-500/20";
      case IssueSeverity.HIGH: return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case IssueSeverity.MEDIUM: return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      default: return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  return (
    <div id="ai-agent-chatbot-root" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-none max-w-full">
      
      {/* Floating Chat Trigger Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer relative pointer-events-auto"
          >
            <Bot className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="absolute -top-1.5 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[10px] items-center justify-center text-white font-mono font-bold">1</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[calc(100vh-100px)] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>AI Civic Operating Agent</span>
                    <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                  </h4>
                  <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest leading-none mt-1">● AUTONOMOUS SOLVER SERVICE</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 px-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Feed Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 scrollbar-thin scrollbar-thumb-slate-800 space-y-4 bg-[#0a0f1d]">
              {messages.map((msg, index) => {
                const isBot = msg.sender === "bot";
                return (
                  <div key={msg.id || index} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                    <div className={`flex items-start space-x-2 max-w-[85%] ${isBot ? "" : "flex-row-reverse space-x-reverse"}`}>
                      {isBot && (
                        <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] shrink-0 font-bold border border-slate-700 text-blue-400">
                          AI
                        </div>
                      )}
                      
                      <div className="flex flex-col space-y-2">
                        {/* Bubble */}
                        <div className={`rounded-2xl px-4 py-2.5 text-xs text-slate-200 leading-relaxed ${
                          isBot 
                            ? "bg-slate-800 border border-slate-700/50 rounded-tl-none" 
                            : "bg-blue-600 text-white rounded-tr-none"
                        }`}>
                          <p className="whitespace-pre-line">{parseMarkdownMessage(msg.text)}</p>
                        </div>

                        {/* Conversational creation indicators */}
                        {isBot && msg.type === "report_created" && msg.metadata?.issue && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] font-mono leading-none font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>TICKET CREATED SUCCESSFULLY</span>
                            </div>

                            <div className="border border-slate-800 bg-slate-900 rounded-lg p-2.5 relative overflow-hidden">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${getSeverityColor(msg.metadata.issue.severity)} font-bold`}>
                                  {msg.metadata.issue.severity}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 font-bold">
                                  ID: {msg.metadata.issueId}
                                </span>
                              </div>
                              <h5 className="text-[11px] font-bold text-white leading-snug">{msg.metadata.issue.title}</h5>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{msg.metadata.issue.address}</p>
                            </div>

                            {onFocusIssue && (
                              <button
                                onClick={() => onFocusIssue(msg.metadata.issueId)}
                                className="w-full py-1.5 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-bold rounded-lg transition text-center cursor-pointer"
                              >
                                View Live Map Location
                              </button>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-700 text-blue-400">
                      AI
                    </div>
                    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3 flex space-x-1.5 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Form */}
            <form onSubmit={handleSendMessage} className="bg-slate-950 p-4 border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your issue naturally..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 disabled:hover:bg-blue-600 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
