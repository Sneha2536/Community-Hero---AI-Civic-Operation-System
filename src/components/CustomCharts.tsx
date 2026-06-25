/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { IssueReport, IssueSeverity } from "../types.js";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
}

export const CustomBarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div id="custom-bar-chart" className="flex flex-col space-y-3 w-full py-2">
      {data.map((item, idx) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={idx} className="flex items-center space-x-3 w-full">
            <span className="w-24 text-xs font-mono text-slate-400 truncate text-right">
              {item.label}
            </span>
            <div className="flex-1 bg-slate-800 rounded-full h-8 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                className={`h-full rounded-full flex items-center justify-end px-3 ${
                  item.color || "bg-blue-600"
                }`}
              >
                {percentage > 10 && (
                  <span className="text-white text-[10px] font-bold font-mono">
                    {item.value}
                  </span>
                )}
              </motion.div>
              {percentage <= 10 && (
                <span className="absolute left-2 top-1.5 text-slate-100 text-[10px] font-bold font-mono">
                  {item.value}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DonutProps {
  issues: IssueReport[];
}

export const CustomSeverityDonut: React.FC<DonutProps> = ({ issues }) => {
  const counts = {
    [IssueSeverity.CRITICAL]: issues.filter(i => i.severity === IssueSeverity.CRITICAL).length,
    [IssueSeverity.HIGH]: issues.filter(i => i.severity === IssueSeverity.HIGH).length,
    [IssueSeverity.MEDIUM]: issues.filter(i => i.severity === IssueSeverity.MEDIUM).length,
    [IssueSeverity.LOW]: issues.filter(i => i.severity === IssueSeverity.LOW).length
  };

  const total = issues.length || 1;
  const criticalPct = Math.round((counts[IssueSeverity.CRITICAL] / total) * 100);
  const highPct = Math.round((counts[IssueSeverity.HIGH] / total) * 100);
  const mediumPct = Math.round((counts[IssueSeverity.MEDIUM] / total) * 100);
  const lowPct = Math.round((counts[IssueSeverity.LOW] / total) * 100);

  return (
    <div id="severity-donut-wrapper" className="flex flex-col sm:flex-row items-center justify-around space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Circle Drawing */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-36 h-36 transform -rotate-90">
          {/* Low Gray Base */}
          <circle cx="72" cy="72" r="55" fill="transparent" stroke="#1e293b" strokeWidth="18" />
          
          {/* Segments (Simulated overlay using stroke dasharrays) */}
          <circle
            cx="72"
            cy="72"
            r="55"
            fill="transparent"
            stroke="#ef4444" // Critical Red
            strokeWidth="18"
            strokeDasharray={`${(criticalPct / 100) * 345.5} 345.5`}
            strokeDashoffset="0"
          />
          <circle
            cx="72"
            cy="72"
            r="55"
            fill="transparent"
            stroke="#f97316" // High Orange
            strokeWidth="18"
            strokeDasharray={`${(highPct / 100) * 345.5} 345.5`}
            strokeDashoffset={`-${(criticalPct / 100) * 345.5}`}
          />
          <circle
            cx="72"
            cy="72"
            r="55"
            fill="transparent"
            stroke="#eab308" // Medium Yellow
            strokeWidth="18"
            strokeDasharray={`${(mediumPct / 100) * 345.5} 345.5`}
            strokeDashoffset={`-${((criticalPct + highPct) / 100) * 345.5}`}
          />
          <circle
            cx="72"
            cy="72"
            r="55"
            fill="transparent"
            stroke="#10b981" // Low Green
            strokeWidth="18"
            strokeDasharray={`${(lowPct / 100) * 345.5} 345.5`}
            strokeDashoffset={`-${((criticalPct + highPct + mediumPct) / 100) * 345.5}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono text-white">{issues.length}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">TOTAL INCIDENTS</span>
        </div>
      </div>

      {/* Legends */}
      <div className="flex flex-col space-y-2 w-full sm:w-auto">
        <div className="flex items-center justify-between text-xs sm:space-x-8">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-300 font-medium">Critical</span>
          </div>
          <span className="font-mono text-slate-400">{counts[IssueSeverity.CRITICAL]} ({criticalPct}%)</span>
        </div>

        <div className="flex items-center justify-between text-xs sm:space-x-8">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-slate-300 font-medium">High</span>
          </div>
          <span className="font-mono text-slate-400">{counts[IssueSeverity.HIGH]} ({highPct}%)</span>
        </div>

        <div className="flex items-center justify-between text-xs sm:space-x-8">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-slate-300 font-medium">Medium</span>
          </div>
          <span className="font-mono text-slate-400">{counts[IssueSeverity.MEDIUM]} ({mediumPct}%)</span>
        </div>

        <div className="flex items-center justify-between text-xs sm:space-x-8">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-medium">Low</span>
          </div>
          <span className="font-mono text-slate-400">{counts[IssueSeverity.LOW]} ({lowPct}%)</span>
        </div>
      </div>
    </div>
  );
};

interface HealthMeterProps {
  score: number;
}

export const CustomHealthGauge: React.FC<HealthMeterProps> = ({ score }) => {
  // Radius is 50, circumference is 314
  // We want a semi-circle or full arc. Let's make a beautiful 3/4 arc
  const arcLength = 270; // 270 degree gauge
  const strokeDash = (score / 100) * 235.6; // 3/4 of 314 is ~235.6
  
  return (
    <div id="health-gauge" className="relative flex flex-col items-center justify-center py-4">
      <div className="relative w-44 h-28 flex items-center justify-center overflow-hidden">
        <svg className="w-40 h-40 transform translate-y-7 -rotate-[225deg]">
          {/* Base Track */}
          <circle
            cx="80"
            cy="80"
            r="50"
            fill="transparent"
            stroke="#1e293b"
            strokeWidth="12"
            strokeDasharray="235.6 314"
            strokeLinecap="round"
          />
          {/* Score Path color graded */}
          <circle
            cx="80"
            cy="80"
            r="50"
            fill="transparent"
            stroke={score > 80 ? "#10b981" : score > 60 ? "#f59e0b" : "#ef4444"}
            strokeWidth="12"
            strokeDasharray={`${strokeDash} 314`}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute top-12 flex flex-col items-center">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="text-4xl font-extrabold font-mono text-white"
          >
            {score}%
          </motion.span>
          <span className="text-[10px] font-sans font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
            CIVIC STABILITY
          </span>
        </div>
      </div>

      <div className="text-center mt-3 max-w-[200px]">
        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          {score > 80 
            ? "Greenwood Metro is in pristine health. Discrepancy volumes are low." 
            : score > 60 
            ? "Satisfactory stability. Minor infrastructure tickets pending fix." 
            : "Structural escalation required. Multi-category issues unresolved."}
        </p>
      </div>
    </div>
  );
};
