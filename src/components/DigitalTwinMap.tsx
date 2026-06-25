/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Info, Layers, Flame, Compass, RefreshCw } from "lucide-react";
import { IssueReport, IssueSeverity, IssueStatus } from "../types.js";

interface DigitalTwinMapProps {
  issues: IssueReport[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
  onMapClickCoordinates?: (lat: number, lng: number, address: string) => void;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  onMapClickCoordinates
}) => {
  const [mapMode, setMapMode] = useState<'civic-health' | 'hotspots' | 'standard'>('civic-health');
  const isHeatmap = mapMode === 'hotspots';
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null);

  // Bounds for Springfield Township coordinates mapping to a 800x500 SVG grid
  // Lat: 39.765 to 39.795
  // Lng: -89.665 to -89.635
  const mapBounds = {
    minLat: 39.765,
    maxLat: 39.795,
    minLng: -89.665,
    maxLng: -89.635
  };

  const getCoordinatesXY = (lat: number, lng: number) => {
    const width = 800;
    const height = 500;
    
    // Lat maps to Y: higher latitude is further north (top of map, close to 0)
    const yPct = 1 - (lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat);
    // Lng maps to X: more positive/less negative is further east (right of map)
    const xPct = (lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng);

    return {
      x: Math.round(xPct * width),
      y: Math.round(yPct * height)
    };
  };

  const getLatLngFromXY = (x: number, y: number) => {
    const width = 800;
    const height = 500;

    const lng = mapBounds.minLng + (x / width) * (mapBounds.maxLng - mapBounds.minLng);
    const lat = mapBounds.minLat + (1 - y / height) * (mapBounds.maxLat - mapBounds.minLat);

    return {
      lat: parseFloat(lat.toFixed(4)),
      lng: parseFloat(lng.toFixed(4))
    };
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgElement = e.currentTarget;
    const rect = svgElement.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Translate to coordinates matching original 800x500 design
    const mappedX = (clickX / rect.width) * 800;
    const mappedY = (clickY / rect.height) * 500;

    const coords = getLatLngFromXY(mappedX, mappedY);
    setSelectedCoords(coords);

    if (onMapClickCoordinates) {
      // Ingest coordinates and trigger fill
      const addresses = [
        "Upper Oakwood Blvd, Sector 3",
        "North Plaza, Near Lake Ridge Corridor",
        "Springfield Crossing, Landmark Row",
        "Southwest Industrial Estate, Boundary Lane",
        "Greenwood Nature Buffer zone"
      ];
      const randomAddress = `${parseInt(String(coords.lat * 1000 % 500))} ${addresses[Math.floor(Math.random() * addresses.length)]}, Springfield, IL`;
      onMapClickCoordinates(coords.lat, coords.lng, randomAddress);
    }
  };

  const getSeverityStyle = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL:
        return { color: "#ef4444", text: "text-red-500", bg: "bg-red-500", border: "border-red-500", shadow: "shadow-red-500/50" };
      case IssueSeverity.HIGH:
        return { color: "#f97316", text: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500", shadow: "shadow-orange-500/50" };
      case IssueSeverity.MEDIUM:
        return { color: "#eab308", text: "text-yellow-500", bg: "bg-yellow-500", border: "border-yellow-500", shadow: "shadow-yellow-500/50" };
      case IssueSeverity.LOW:
        default:
        return { color: "#10b981", text: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-500", shadow: "shadow-emerald-500/50" };
    }
  };

  // Helper to map dynamic issue coordinates into 1 of 4 neighborhood sectors
  const getSectorForIssue = (lat: number, lng: number) => {
    const { x, y } = getCoordinatesXY(lat, lng);
    if (x < 320) {
      if (y < 200) return "sec_1";
      return "sec_3";
    } else {
      if (y < 235) return "sec_2";
      return "sec_4";
    }
  };

  // Dynamically calculate dynamic metrics and health score based on issues
  const getSectorMetrics = () => {
    const sectorCounts: Record<string, { total: number; unresolved: number; activeScoreReduction: number }> = {
      sec_1: { total: 0, unresolved: 0, activeScoreReduction: 0 },
      sec_2: { total: 0, unresolved: 0, activeScoreReduction: 0 },
      sec_3: { total: 0, unresolved: 0, activeScoreReduction: 0 },
      sec_4: { total: 0, unresolved: 0, activeScoreReduction: 0 },
    };

    issues.forEach((issue) => {
      const sectorId = getSectorForIssue(issue.latitude, issue.longitude);
      if (sectorCounts[sectorId]) {
        sectorCounts[sectorId].total += 1;
        const isUnresolved = issue.status !== IssueStatus.RESOLVED && issue.status !== IssueStatus.CLOSED;
        if (isUnresolved) {
          sectorCounts[sectorId].unresolved += 1;
          let penalty = 5;
          if (issue.severity === IssueSeverity.CRITICAL) penalty = 20;
          else if (issue.severity === IssueSeverity.HIGH) penalty = 12;
          else if (issue.severity === IssueSeverity.MEDIUM) penalty = 7;
          else if (issue.severity === IssueSeverity.LOW) penalty = 3;
          sectorCounts[sectorId].activeScoreReduction += penalty;
        }
      }
    });

    return Object.keys(sectorCounts).reduce((acc, key) => {
      const rawHealth = 100 - sectorCounts[key].activeScoreReduction;
      const health = Math.max(25, Math.min(100, rawHealth));
      acc[key] = {
        count: sectorCounts[key].total,
        activeCount: sectorCounts[key].unresolved,
        health: health
      };
      return acc;
    }, {} as Record<string, { count: number; activeCount: number; health: number }>);
  };

  const getHealthColor = (health: number, opacity: number = 0.15) => {
    if (health >= 85) return `rgba(16, 185, 129, ${opacity})`; // emerald
    if (health >= 70) return `rgba(245, 158, 11, ${opacity})`; // amber
    return `rgba(239, 68, 68, ${opacity})`; // red
  };

  // Sectors list to render on the SVG grid for high-tech aesthetic
  const sectors = [
    { id: "sec_1", name: "Greenwood Trails Precinct", points: "50,50 320,50 240,250 50,150" },
    { id: "sec_2", name: "Central Commercial Plaza", points: "320,50 750,50 550,220 240,250" },
    { id: "sec_3", name: "Oakwood Residential Sector", points: "50,150 240,250 180,450 50,450" },
    { id: "sec_4", name: "Crescent Boulevard Crossroads", points: "240,250 550,220 750,450 180,450" }
  ];

  const dynamicMetrics = getSectorMetrics();
  const dynamicSectors = sectors.map(sec => {
    const metric = dynamicMetrics[sec.id] || { count: 0, activeCount: 0, health: 100 };
    return {
      ...sec,
      count: metric.count,
      activeCount: metric.activeCount,
      health: metric.health
    };
  });

  return (
    <div id="digital-twin-map-container" className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative w-full h-full min-h-[580px]">
      
      {/* Header bar controls */}
      <div className="bg-slate-950/80 backdrop-blur px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-blue-500 animate-spin" style={{ animationDuration: '8s' }} />
          <div>
            <h3 className="text-sm font-semibold text-white">Urban Digital Twin</h3>
            <p className="text-[10px] font-mono text-slate-400">GEO-COORD SPRINGFIELD SYSTEMS Mapped Live</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Map Mode Buttons */}
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setMapMode('standard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                mapMode === 'standard'
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Pins Only</span>
            </button>
            
            <button
              onClick={() => setMapMode('civic-health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                mapMode === 'civic-health'
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Civic Health Map</span>
            </button>

            <button
              onClick={() => setMapMode('hotspots')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                mapMode === 'hotspots'
                  ? "bg-red-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>AI Hotspots</span>
            </button>
          </div>

          <span className="text-[10px] py-1 px-2.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono hidden xl:inline-block">
            Click map to ping coordinate
          </span>
        </div>
      </div>

      {/* Main SVG Map Area */}
      <div className="flex-1 min-h-[420px] bg-[#0c1221] relative overflow-hidden select-none cursor-crosshair">
        
        {/* Background Network Aesthetics */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <svg 
          viewBox="0 0 800 500" 
          className="w-full h-full min-h-[420px]"
          onClick={handleSvgClick}
        >
          {/* Definitions for gradients */}
          <defs>
            <radialGradient id="critical-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="high-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Sectors Polygons */}
          {dynamicSectors.map((sec) => {
            const isCivicHealthMode = mapMode === 'civic-health';
            const defaultFill = hoveredSector === sec.id ? "rgba(37, 99, 235, 0.08)" : "transparent";
            const defaultStroke = "rgba(37, 99, 235, 0.15)";
            
            const fillColor = isCivicHealthMode ? getHealthColor(sec.health, hoveredSector === sec.id ? 0.4 : 0.22) : defaultFill;
            const strokeColor = isCivicHealthMode ? getHealthColor(sec.health, 0.6) : defaultStroke;
            const strokeWidth = isCivicHealthMode ? "2" : "1.5";
            const strokeDash = isCivicHealthMode ? "none" : "6 4";
            
            return (
              <polygon
                key={sec.id}
                points={sec.points}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                className="transition duration-300"
                onMouseEnter={() => setHoveredSector(sec.id)}
                onMouseLeave={() => setHoveredSector(null)}
              />
            );
          })}

          {/* Springfield Lake Water Body */}
          <path
            d="M 600,0 Q 640,100 600,180 T 780,260 L 800,260 L 800,0 Z"
            fill="url(#water-gradient)"
            stroke="#2563eb"
            strokeWidth="1.5"
            strokeOpacity="0.2"
          />

          {/* Springfield Central Boulevard Roads */}
          <path d="M 50,220 L 750,220" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 50,220 L 750,220" stroke="#1e293b" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />

          <path d="M 320,50 L 320,450" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 320,50 L 320,450" stroke="#1e293b" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />

          {/* Diagnostic Cross Grid */}
          <line x1="0" y1="250" x2="800" y2="250" stroke="rgba(37,99,235,0.05)" strokeWidth="1" />
          <line x1="400" y1="0" x2="400" y2="500" stroke="rgba(37,99,235,0.05)" strokeWidth="1" />

          {/* Hotspot Glowing Radial circles when isHeatmap selected */}
          {isHeatmap && issues.map((issue) => {
            if (issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED) return null;
            const style = getSeverityStyle(issue.severity);
            const { x, y } = getCoordinatesXY(issue.latitude, issue.longitude);
            const radius = issue.severity === IssueSeverity.CRITICAL ? "70" : "50";
            const gradientId = issue.severity === IssueSeverity.CRITICAL ? "url(#critical-glow)" : "url(#high-glow)";
            
            return (
              <motion.circle
                key={`glow-${issue.id}`}
                cx={x}
                cy={y}
                r={radius}
                fill={gradientId}
                animate={{ r: [parseInt(radius) - 5, parseInt(radius) + 10, parseInt(radius) - 5] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
            );
          })}

          {/* active user clicked coordinates ping indicator */}
          {selectedCoords && (
            <g>
              {(() => {
                const { x, y } = getCoordinatesXY(selectedCoords.lat, selectedCoords.lng);
                return (
                  <>
                    <circle cx={x} cy={y} r="15" fill="rgba(37,99,235,0.2)" stroke="#2563eb" strokeWidth="1" className="animate-ping" />
                    <circle cx={x} cy={y} r="4" fill="#2563eb" />
                  </>
                );
              })()}
            </g>
          )}

          {/* Markers representing Issues */}
          {issues.map((issue) => {
            const { x, y } = getCoordinatesXY(issue.latitude, issue.longitude);
            const style = getSeverityStyle(issue.severity);
            const isSelected = selectedIssueId === issue.id;
            const isResolved = issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED;

            return (
              <g 
                key={issue.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIssue(issue.id);
                }}
              >
                {/* Ping rings for unresolved urgent issues */}
                {!isResolved && (issue.severity === IssueSeverity.CRITICAL || issue.severity === IssueSeverity.HIGH) && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="transparent"
                    stroke={style.color}
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                )}

                {/* Main pin background selector visualizer */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="18"
                    fill="rgba(37, 99, 235, 0.25)"
                    stroke="#2563eb"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ animationDuration: "12s" }}
                  />
                )}

                <motion.g
                  initial={{ scale: 0 }}
                  animate={{ scale: isSelected ? 1.25 : 1 }}
                  whileHover={{ scale: 1.35 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {/* Pin Shape */}
                  <g transform={`translate(${x - 12}, ${y - 24})`}>
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      fill={isResolved ? "#64748b" : style.color}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    {/* Tiny category letters on pins */}
                    <text
                      x="12"
                      y="10.5"
                      fill="#ffffff"
                      fontSize="6.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {issue.category[0]}
                    </text>
                  </g>
                </motion.g>
              </g>
            );
          })}
        </svg>

        {/* Float Overlays: Sector status or hovered coordinates display */}
        <div className="absolute bottom-4 left-4 flex flex-col space-y-2 pointer-events-none z-10">
          <AnimatePresence>
            {hoveredSector && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl shadow-xl w-60"
              >
                {(() => {
                  const sec = dynamicSectors.find(s => s.id === hoveredSector);
                  return (
                    sec && (
                      <>
                        <h4 className="text-xs font-bold text-blue-400">{sec.name}</h4>
                        <div className="flex flex-col space-y-1 mt-1.5">
                          <div className="flex justify-between text-[10px] font-mono border-b border-slate-900 pb-1">
                            <span className="text-slate-400">Civic Health Score:</span>
                            <span className={
                              sec.health >= 85 ? "text-emerald-400 font-bold" : sec.health >= 70 ? "text-amber-400 font-bold" : "text-red-400 font-bold animate-pulse"
                            }>{sec.health}%</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Unresolved Issues:</span>
                            <span className="text-amber-500 font-bold">{sec.activeCount}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Total Registered:</span>
                            <span className="text-white">{sec.count}</span>
                          </div>
                        </div>
                      </>
                    )
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {selectedCoords && (
            <div className="bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded text-[10px] font-mono text-slate-300">
              Selected Geo-Coord: Lat <span className="text-blue-400 font-bold">{selectedCoords.lat}</span>, Lng <span className="text-blue-400 font-bold">{selectedCoords.lng}</span>
            </div>
          )}
        </div>

        {/* Legend Overlay at top right */}
        <div className="absolute top-4 right-4 bg-slate-950/95 border border-slate-800 px-3.5 py-3 rounded-xl shadow-lg flex flex-col space-y-2 pointer-events-auto z-10 w-44">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-1">
            {mapMode === 'civic-health' ? "CIVIC HEALTH SCORE" : "HAZARD INTENSITY MAP"}
          </span>
          <div className="flex flex-col space-y-1.5">
            {mapMode === 'civic-health' ? (
              <>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span className="text-slate-300">Optimal (85% - 100%)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span className="text-slate-300">Caution (70% - 84%)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded bg-red-500 animate-pulse" />
                  <span className="text-slate-300">Critical (&lt; 70%)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-slate-300">Critical Priority</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-slate-300">High Severity</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="text-slate-300">Medium Severity</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Low/Resolved State</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Footer bar showing status details if an issue is active */}
      <AnimatePresence>
        {selectedIssueId && (() => {
          const matched = issues.find(i => i.id === selectedIssueId);
          if (!matched) return null;
          const isResolved = matched.status === IssueStatus.RESOLVED || matched.status === IssueStatus.CLOSED;
          return (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-950 border-t border-slate-800 px-5 py-4 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex space-x-3 items-start">
                <div className={`mt-0.5 p-2 rounded-lg ${isResolved ? "bg-slate-800" : getSeverityStyle(matched.severity).bg} bg-opacity-10 text-white`}>
                  <MapPin className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-xs font-bold font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {matched.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      matched.status === IssueStatus.RESOLVED ? "bg-emerald-950/60 text-emerald-400" : "bg-blue-950 text-blue-400"
                    }`}>
                      {matched.status}
                    </span>
                    {matched.esclated && (
                      <span className="text-[10px] font-mono font-bold bg-red-950 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">
                        ESCALATED
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-1">{matched.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[400px]">{matched.address}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">Verification Credit Score: <strong className="text-white font-mono">{matched.score}</strong></span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};
