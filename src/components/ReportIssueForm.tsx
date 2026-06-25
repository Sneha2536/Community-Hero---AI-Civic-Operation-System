/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  MapPin, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Terminal,
  Loader2,
  Trash2,
  HelpCircle,
  Camera,
  Mic,
  MicOff
} from "lucide-react";
import { IssueCategory, IssueSeverity, IssueReport } from "../types.js";

interface ReportIssueFormProps {
  onIssueCreated: (newIssue: IssueReport) => void;
  onClose: () => void;
  clickedCoords: { lat: number; lng: number; address: string } | null;
  userEmail: string;
}

// Preset Base64 images or mockup templates for rapid user click-to-analyze testing!
const SAMPLE_PRESETS = [
  {
    id: "pothole",
    name: "Street Crack Pothole",
    category: IssueCategory.ROADS,
    desc: "Large dangerous crater crack on central boulevard lane causing vehicle swerving.",
    img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2327272a'/><circle cx='50' cy='55' r='25' fill='%2309090b'/><path d='M30,50 L70,50 M35,40 L65,70' stroke='%233f3f46' strokeWidth='3'/></svg>"
  },
  {
    id: "leak",
    name: "Burst Water Main",
    category: IssueCategory.WATER_SUPPLY,
    desc: "Severe ongoing freshwater main burst leaking hundreds of gallons onto pedestrian intersections.",
    img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e293b'/><circle cx='50' cy='60' r='30' fill='none' stroke='%2338bdf8' strokeWidth='4'/><path d='M50,20 L50,90 M20,60 L80,60' stroke='%230284c7' strokeWidth='3'/></svg>"
  },
  {
    id: "light",
    name: "Shattered Street Lamp",
    category: IssueCategory.ELECTRICITY,
    desc: "Exposed wiring on a major dark intersection lane compromising safety since yesterday.",
    img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e1b4b'/><circle cx='50' cy='30' r='15' fill='%23fef08a'/><line x1='50' y1='45' x2='50' y2='90' stroke='%23475569' strokeWidth='5'/></svg>"
  },
  {
    id: "trash",
    name: "Illegal Waste Dump",
    category: IssueCategory.WASTE_MANAGEMENT,
    desc: "Piles of toxic electronic trash dumped on greenwood nature trials, blockading routes.",
    img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23064e3b'/><rect x='30' y='40' width='40' height='40' fill='%23b45309'/><path d='M25,40 L75,40' stroke='%2378350f' strokeWidth='4'/></svg>"
  }
];

export const ReportIssueForm: React.FC<ReportIssueFormProps> = ({
  onIssueCreated,
  onClose,
  clickedCoords,
  userEmail
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IssueCategory>(IssueCategory.ROADS);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState(clickedCoords?.address || "Springfield Oakwood Blvd, Sector 3");
  const [latitude, setLatitude] = useState(clickedCoords?.lat || 39.775);
  const [longitude, setLongitude] = useState(clickedCoords?.lng || -89.650);

  // Image upload hooks
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording / transcription states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [manualSpokenText, setManualSpokenText] = useState("");
  const [showManualSpokenInput, setShowManualSpokenInput] = useState(false);
  const recognitionRef = useRef<any>(null);

  React.useEffect(() => {
    const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechLib) {
      setSpeechSupported(false);
    }
  }, []);

  const handleParseVoiceText = async (text: string) => {
    if (!text.trim() || text.startsWith("Listening...")) return;
    setIsVoiceProcessing(true);
    try {
      const res = await fetch("/api/issues/parse-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category as IssueCategory);
      }
    } catch (err) {
      console.error("Error parsing voice transcript", err);
    } finally {
      setIsVoiceProcessing(false);
    }
  };

  const toggleListening = () => {
    const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechLib) {
      setSpeechSupported(false);
      setShowManualSpokenInput(true);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const rec = new SpeechLib();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          setVoiceTranscript("Listening... speak now!");
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setShowManualSpokenInput(true);
          }
          setVoiceTranscript(`Error: ${event.error}. You can also type description in the simulation input below.`);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onresult = async (event: any) => {
          const resultText = event.results[0][0].transcript;
          setVoiceTranscript(resultText);
          await handleParseVoiceText(resultText);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error("Speech Recognition starting exception", err);
        setSpeechSupported(false);
        setShowManualSpokenInput(true);
      }
    }
  };

  // Verification pipeline simulation loading
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Steps matching the 10-Step AI Core checklist from types
  const analysisSteps = [
    "Ingesting sensor visual buffers...",
    "Scanning municipal indexes for duplicates...",
    "Validating image parameters with Vision Transformer...",
    "Calculating regional Community Impact indices...",
    "Evaluating immediate Security Risk metrics...",
    "Allocating local municipal department responsibility...",
    "Synthesizing emergency escalation indicators...",
    "Generating suggested physical solution procedures...",
    "Estimating technical fix time matrices...",
    "Registering active operational ticket in persistent store."
  ];

  // Map clicked coordinates updates
  React.useEffect(() => {
    if (clickedCoords) {
      setAddress(clickedCoords.address);
      setLatitude(clickedCoords.lat);
      setLongitude(clickedCoords.lng);
    }
  }, [clickedCoords]);

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid JPEG/PNG image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBase64Image(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setCategory(preset.category);
    setTitle(preset.name);
    setDescription(preset.desc);
    setBase64Image(preset.img);
  };

  // Run the 10-step loading simulator and route payload to server!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!base64Image) {
      alert("An image upload is required to execute AI Vision authentication.");
      return;
    }

    setIsAnalyzing(true);
    setLogs([]);
    
    // Simulate Terminal output progress for the 10 steps
    for (let i = 0; i < analysisSteps.length; i++) {
      setActiveStepIdx(i);
      setLogs(prev => [...prev, `[LOG] ${analysisSteps[i]}`]);
      await new Promise(r => setTimeout(r, 650));
    }

    try {
      // POST payload back to server analytical pipeline!
      const res = await fetch("/api/issues/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Pothole Discrepancy",
          category,
          description,
          latitude,
          longitude,
          address,
          image: base64Image,
          reporterEmail: userEmail
        })
      });

      if (!res.ok) {
        throw new Error("Analysis failed");
      }

      const freshIssue = await res.json();
      onIssueCreated(freshIssue);
      onClose();

    } catch (err) {
      console.error(err);
      alert("Transit error analyzing image with Gemini. Check logs.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="report-issue-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-45 overflow-y-auto">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[85vh]"
      >
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">AI Vision Incident Logging</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">Autonomous Verification Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="p-1 px-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Loading Screen Overlay during step sequence */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#080d19] z-50 flex flex-col p-6 space-y-6 overflow-y-auto"
            >
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <div>
                  <h4 className="text-sm font-bold text-white">Gemini Municipal Agency Running...</h4>
                  <p className="text-[10px] font-mono text-emerald-400 tracking-wider">SECURE DIGITAL CONTAINER ACTIVE</p>
                </div>
              </div>

              {/* Progress bars bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-blue-600 h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((activeStepIdx + 1) / analysisSteps.length) * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>

              {/* Terminal Logs monitor */}
              <div className="flex-1 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl font-mono text-xs text-slate-300 space-y-2 overflow-y-auto max-h-[300px]">
                <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 text-slate-500 text-[10px]">
                  <span>AI VERIFICATION CORE OS v3.5</span>
                  <span>ONLINE LOGS</span>
                </div>
                {logs.map((log, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <span className="text-blue-500">{">"}</span>
                    <p className="flex-1 text-left">{log}</p>
                  </div>
                ))}
                <div className="animate-pulse text-blue-500 font-bold">● PROCESSING...</div>
              </div>

              <div className="text-center font-sans text-xs text-slate-400">
                Please wait. AI is measuring safety score indices, routing departments, and preventing spam.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body Fields */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Preset image templates shortcut */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
              1. CHOOSE HIGH INTEGRITY PROTOTYPING SAMPLE (OPTIONAL):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="p-2 border border-slate-800 rounded-xl bg-slate-950/40 hover:bg-slate-950/90 hover:border-slate-700 transition flex items-center space-x-2 text-[11px] font-medium text-slate-300 w-full text-left cursor-pointer"
                >
                  <img src={preset.img} referrerPolicy="no-referrer" alt="" className="w-7 h-7 rounded border border-slate-800 shrink-0 object-cover" />
                  <span className="truncate leading-tight block">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 my-4" />

          {/* Drag & Drop Upload field */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
              2. LOAD DISCREPANCY PHOTO (REQUIRED):
            </span>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition cursor-pointer text-center ${
                isDragging
                  ? "border-blue-500 bg-blue-950/15"
                  : base64Image
                  ? "border-slate-800 bg-slate-950/40"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/20"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {base64Image ? (
                <div className="relative w-full max-w-[200px] aspect-video sm:aspect-square rounded-xl overflow-hidden border border-slate-800">
                  <img src={base64Image} referrerPolicy="no-referrer" alt="Uploaded Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBase64Image(null);
                    }}
                    className="absolute bottom-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white transition shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 flex flex-col items-center">
                  <div className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl">
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Drag and drop file here, or browse local folders</h4>
                  <p className="text-[10px] text-slate-500">Supports high-res PNG or JPG files matching the visual coordinates bounds</p>
                </div>
              )}
            </div>
          </div>

          {/* Voice-to-Text Reporting Assistant Section */}
          <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-violet-400">
                <Mic className={`w-4 h-4 text-violet-500 ${isListening ? "animate-ping" : ""}`} />
                <span className="uppercase tracking-widest font-mono">AI Voice-to-Text Assistant</span>
              </div>
              {!speechSupported && (
                <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                  Mic restricted / unsupported
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Click the button below and describe the issue verbally. Gemini will instantly analyze your voice to draft the title, select the correct classification, and fill out the detailed description.
            </p>

            <div className="flex flex-wrap gap-2.5 items-center">
              <button
                type="button"
                onClick={toggleListening}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-md ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-violet-600 hover:bg-violet-700 text-white"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-violet-200" />
                    <span>Describe Verbally</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowManualSpokenInput(!showManualSpokenInput)}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                {showManualSpokenInput ? "Hide Simulated Input" : "Simulate Verbal Input"}
              </button>

              {isVoiceProcessing && (
                <div className="flex items-center space-x-1.5 text-xs text-violet-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="font-mono">Gemini parsing speech...</span>
                </div>
              )}
            </div>

            {/* Display current transcript state */}
            {voiceTranscript && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-xs">
                <span className="text-[9px] font-mono text-violet-400 block uppercase mb-1">Live Transcript / Status:</span>
                <p className="text-slate-300 font-medium italic">"{voiceTranscript}"</p>
              </div>
            )}

            {/* Simulated Voice Text Input Drawer */}
            <AnimatePresence>
              {showManualSpokenInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 border-t border-slate-850 pt-3 overflow-hidden"
                >
                  <label className="text-[9px] font-mono text-slate-400 font-bold uppercase block">
                    Simulate Spoken Audio (Type what you would say):
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={manualSpokenText}
                      onChange={(e) => setManualSpokenText(e.target.value)}
                      placeholder="e.g. 'I see a huge pothole here at Oakwood Boulevard that is causing cars to swerve...'"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-700"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (manualSpokenText.trim()) {
                            setVoiceTranscript(manualSpokenText);
                            handleParseVoiceText(manualSpokenText);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={isVoiceProcessing || !manualSpokenText.trim()}
                      onClick={() => {
                        if (manualSpokenText.trim()) {
                          setVoiceTranscript(manualSpokenText);
                          handleParseVoiceText(manualSpokenText);
                        }
                      }}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Use this to test the AI parsing intelligence directly from your keyboard!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Incident Title:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Declare a short title matching the issue..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Classification:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 cursor-pointer focus:outline-none"
              >
                {Object.values(IssueCategory).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Description / Details:</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe ongoing concerns or notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 resize-none"
            />
          </div>

          {/* Geo Coordinates fields */}
          <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl space-y-3">
            <div className="flex items-center space-x-1 text-xs font-bold text-blue-400">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="uppercase tracking-widest font-mono">Geographic Positioning Index</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 block">LATITUDE RANGE:</span>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 block">LONGITUDE RANGE:</span>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-slate-500 block">STREET ADDRESS COOPERATIVE FIELD:</span>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="bg-blue-950/15 border border-blue-500/10 rounded-2xl p-3.5 text-[11px] text-slate-400 leading-normal font-medium flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <span>
              Tip: You can close this form, click any empty grid area on the <strong>Urban Digital Twin Map</strong> to instantly auto-select coordinates, then open this form back to auto-fill location!
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!base64Image}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-blue-900/30 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Launch AI Analysis</span>
            </button>
          </div>

        </form>

      </motion.div>
    </div>
  );
};
