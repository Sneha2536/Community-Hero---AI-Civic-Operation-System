/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  Flame,
  CheckCircle2
} from "lucide-react";
import { IssueReport, IssueCategory, IssueSeverity, IssueStatus } from "../types.js";

interface IssuesFeedProps {
  issues: IssueReport[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
  onOpenReportForm: () => void;
}

export const IssuesFeed: React.FC<IssuesFeedProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  onOpenReportForm
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const categories = ["All", ...Object.values(IssueCategory)];
  const severities = ["All", ...Object.values(IssueSeverity)];

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "All" || issue.severity === selectedSeverity;
    
    let matchesStatus = true;
    if (selectedStatus === "Active") {
      matchesStatus = issue.status !== IssueStatus.RESOLVED && issue.status !== IssueStatus.CLOSED;
    } else if (selectedStatus === "Resolved") {
      matchesStatus = issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED;
    }

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const getSeverityStyle = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL:
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case IssueSeverity.HIGH:
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case IssueSeverity.MEDIUM:
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.REPORTED: return "text-orange-400 bg-orange-950/40 border border-orange-850";
      case IssueStatus.UNDER_VERIFICATION: return "text-yellow-400 bg-yellow-950/40 border border-yellow-850";
      case IssueStatus.ASSIGNED: return "text-indigo-400 bg-indigo-950/40 border border-indigo-850";
      case IssueStatus.IN_PROGRESS: return "text-blue-400 bg-blue-950/40 border border-blue-850";
      case IssueStatus.RESOLVED: return "text-emerald-400 bg-emerald-950/40 border border-emerald-850";
      case IssueStatus.CLOSED: return "text-slate-400 bg-slate-950/40 border border-slate-800";
    }
  };

  return (
    <div id="issues-feed-container" className="flex flex-col space-y-4 w-full h-full">
      
      {/* Top Search Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reported incidents, addresses, descriptions..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 pl-10 pr-4 py-2.5 text-xs text-white rounded-xl focus:outline-none transition placeholder-slate-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs w-full text-slate-300 focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All" className="bg-slate-950">All Categories</option>
              {Object.values(IssueCategory).map((cat) => (
                <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-transparent text-xs w-full text-slate-300 focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All" className="bg-slate-950">All Severities</option>
              {Object.values(IssueSeverity).map((sev) => (
                <option key={sev} value={sev} className="bg-slate-950">{sev} Urgency</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs w-full text-slate-300 focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All" className="bg-slate-950">All Statuses</option>
              <option value="Active" className="bg-slate-950">Active Incidents</option>
              <option value="Resolved" className="bg-slate-950">Resolved Work</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues list Feed */}
      <div className="space-y-2 overflow-y-auto max-h-[580px] scrollbar-thin scrollbar-thumb-slate-800 pr-1">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
            <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No Incidents Found</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Adjust your search parameters or select a different category filter.</p>
            <button
              onClick={onOpenReportForm}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
            >
              Report New Issue
            </button>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isSelected = selectedIssueId === issue.id;
            const isResolved = issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED;

            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue.id)}
                className={`p-4 rounded-2xl cursor-pointer text-left border transition ${
                  isSelected
                    ? "bg-slate-800/80 border-blue-500/80 shadow-lg shadow-blue-900/10"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex justify-between items-start space-x-2">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-1 leading-none">
                      {/* Category Label */}
                      <span className="text-[10px] font-mono font-extrabold uppercase bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {issue.category}
                      </span>
                      {/* Priority Tag */}
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${getSeverityStyle(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      {/* Status Tag */}
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold leading-none ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                      {isResolved && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-extrabold flex items-center space-x-1 border border-emerald-500/20">
                          <span>📷 Before &amp; After</span>
                        </span>
                      )}
                      {issue.esclated && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-500 font-extrabold flex items-center space-x-1 border border-red-500/20">
                          <Flame className="w-3 h-3 text-red-500" />
                          <span>ESCALATED</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white mt-2 leading-snug">
                      {issue.title}
                    </h4>
                  </div>

                  {/* Right hand side score indicator */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">VALIDITY RATIO</span>
                    <span className="text-sm font-black font-mono text-white mt-0.5 flex items-center space-x-1">
                      {issue.score >= 40 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      <span>+{issue.score}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {issue.description}
                </p>

                <div className="flex items-center justify-between border-t border-slate-800/60 mt-3 pt-3">
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate max-w-[200px]">{issue.address}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
