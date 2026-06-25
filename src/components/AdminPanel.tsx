/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Hammer, Users, RefreshCw, Layers, CheckCircle, AlertTriangle, Play, ChevronRight } from "lucide-react";
import { IssueReport, IssueStatus, IssueSeverity } from "../types.js";

interface AdminPanelProps {
  issues: IssueReport[];
  onUpdateStatus: (issueId: string, status: string, detail?: string) => void;
  onSelectIssue: (issueId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  issues,
  onUpdateStatus,
  onSelectIssue
}) => {
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [targetStatus, setTargetStatus] = useState<string>("");

  const unresolved = issues.filter(i => i.status !== IssueStatus.RESOLVED && i.status !== IssueStatus.CLOSED);
  const criticalCount = issues.filter(i => i.severity === IssueSeverity.CRITICAL && i.status !== IssueStatus.RESOLVED).length;

  return (
    <div id="admin-panel-workspace" className="space-y-6 w-full">
      
      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 text-left">
          <div className="p-2 bg-purple-650/10 text-purple-400 rounded-xl">
            <Shield className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold">Pending Backlog</span>
            <span className="text-xl font-black font-mono text-white">{unresolved.length} tickets</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 text-left">
          <div className="p-2 bg-red-650/10 text-red-400 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold">Active Critical Severity</span>
            <span className="text-xl font-black font-mono text-red-400">{criticalCount} urgent</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 text-left">
          <div className="p-2 bg-emerald-650/10 text-emerald-400 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold">Resolved Closure Rate</span>
            <span className="text-xl font-black font-mono text-white">
              {Math.round(((issues.length - unresolved.length) / (issues.length || 1)) * 100)}%
            </span>
          </div>
        </div>

      </div>

      {/* Main Work Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Hammer className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-bold text-white leading-none">Desk Officer Dispatch Operations</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">Review validation scoring indexes &amp; assign crews</p>
            </div>
          </div>
        </div>

        {/* Action Form if selected */}
        {selectedStatusId && (
          <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-left">
            <div className="flex-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">ACTIVE SELECTED ISSUE TICKET:</span>
              <strong className="text-xs text-white">
                {issues.find(i => i.id === selectedStatusId)?.title}
              </strong>
            </div>

            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="bg-slate-900 text-xs text-slate-300 border border-slate-850 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="">Select crew state...</option>
                {Object.values(IssueStatus).map((stat) => (
                  <option key={stat} value={stat}>{stat}</option>
                ))}
              </select>
              <button
                disabled={!targetStatus}
                onClick={() => {
                  onUpdateStatus(selectedStatusId, targetStatus, `Administrative dispatch assigned status updated to: ${targetStatus}`);
                  setSelectedStatusId("");
                  setTargetStatus("");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Update Dispatch
              </button>
              <button
                onClick={() => setSelectedStatusId("")}
                className="px-3 py-2 bg-slate-800 text-slate-400 text-xs rounded-xl transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Table layout overflow-x */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                <th className="pb-3 pl-2">Incident ID</th>
                <th className="pb-3">Title &amp; Category</th>
                <th className="pb-3">Address</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Validation</th>
                <th className="pb-3">Crew Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {issues.map((issue) => {
                const isSelected = selectedStatusId === issue.id;
                
                return (
                  <tr 
                    key={issue.id}
                    className={`hover:bg-slate-950/40 transition ${
                      isSelected ? "bg-slate-950/80" : ""
                    }`}
                  >
                    <td className="py-3.5 pl-2 font-mono text-[11px] text-slate-400">
                      {issue.id.slice(0, 8)}...
                    </td>

                    <td className="py-3.5 max-w-[200px]">
                      <div className="font-bold text-slate-200 truncate">{issue.title}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{issue.category}</span>
                    </td>

                    <td className="py-3.5 max-w-[150px] truncate text-slate-400">
                      {issue.address}
                    </td>

                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                        issue.severity === IssueSeverity.CRITICAL 
                          ? "bg-red-950/40 text-red-400 border border-red-900/30" 
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {issue.severity}
                      </span>
                    </td>

                    <td className="py-3.5 font-mono text-slate-300">
                      +{issue.score} index
                    </td>

                    <td className="py-3.5">
                      <div className="flex flex-col space-y-1">
                        <span className={`font-mono text-[10px] font-bold ${
                          issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED
                            ? "text-emerald-400"
                            : "text-blue-400"
                        }`}>
                          ● {issue.status}
                        </span>
                        {(issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED) && (
                          <div className="flex items-center space-x-1.5 mt-0.5" title="Before & After resolution evidence is available">
                            <span className="text-[8px] font-mono bg-red-950/45 text-rose-400 border border-red-900/30 px-1.5 py-0.5 rounded leading-none">BF</span>
                            <span className="text-[9px] text-slate-600 font-mono leading-none">→</span>
                            <span className="text-[8px] font-mono bg-emerald-950/45 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded leading-none">AF</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 text-right pr-2 space-x-1.5 shrink-0">
                      <button
                        onClick={() => onSelectIssue(issue.id)}
                        className="p-1 px-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-lg text-[10px] transition cursor-pointer"
                      >
                        View Case
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStatusId(issue.id);
                          setTargetStatus(issue.status);
                        }}
                        className="p-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                      >
                        Dispatch Crew
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
