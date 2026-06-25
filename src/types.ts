/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum IssueCategory {
  ROADS = "Roads",
  WATER_SUPPLY = "Water Supply",
  WASTE_MANAGEMENT = "Waste Management",
  ELECTRICITY = "Electricity",
  DRAINAGE = "Drainage",
  PUBLIC_SAFETY = "Public Safety",
  ENVIRONMENT = "Environment",
  INFRASTRUCTURE = "Infrastructure",
  OTHER = "Other"
}

export enum IssueStatus {
  REPORTED = "Reported",
  UNDER_VERIFICATION = "Under Verification",
  ASSIGNED = "Assigned",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed"
}

export enum IssueSeverity {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low"
}

export enum IssueUrgency {
  IMMEDIATE = "Immediate",
  HIGH = "High",
  MODERATE = "Moderate",
  STANDARD = "Standard"
}

export interface ImpactScore {
  communityImpact: number; // 0-100
  safetyRisk: number; // 0-100
  environmentalImpact: number; // 0-100
  affectedPopulation: number;
}

export interface ResolutionAssistant {
  suggestedSolutions: string[];
  responsibleDepartment: string;
  estimatedTimeline: string;
  requiredResources: string[];
}

export interface ModerationScoring {
  isFakeReport: boolean;
  isDuplicate: boolean;
  isSpam: boolean;
  reason?: string;
}

export interface AgentStep {
  step: number; // 1 to 10
  title: string;
  status: "completed" | "active" | "pending";
  detail: string;
  timestamp: string;
}

export interface TimelineEntry {
  status: string;
  detail: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: string; // 'citizen' | 'volunteer' | 'admin' | 'ai_system'
  text: string;
  timestamp: string;
  imageUrl?: string;
}

export interface CommunityVerification {
  upvotes: number;
  confirmedCount: number;
  flagCount: number;
  status: "unverified" | "verified" | "flagged";
  userActions: { [userId: string]: "upvote" | "confirm" | "flag" }; // tracks voter action
}

export interface IssueReport {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  address: string;
  severity: IssueSeverity;
  urgency: IssueUrgency;
  impactScore: ImpactScore;
  resolutionAssistant: ResolutionAssistant;
  communityVerification: CommunityVerification;
  agentWorkflow: {
    currentStep: number;
    steps: AgentStep[];
    resolutionReport?: string;
  };
  status: IssueStatus;
  timeline: TimelineEntry[];
  comments: Comment[];
  score: number; // Verification Score
  citizenId: string;
  citizenName: string;
  createdAt: string;
  resolutionPrediction?: number; // percentage (e.g. 84%)
  esclated?: boolean;
  resolvedImageUrl?: string;
  impactSummary?: string;
}

export interface CitizenImpactIndex {
  points: number;
  reportsSubmitted: number;
  reportsResolved: number;
  verificationsSubmitted: number;
  commentsContributed: number;
  rank: number;
  level: number;
  badges: Badge[];
}

export interface UserLeaderboard {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  badgeCount: number;
  activeStreak: number;
  contributions: number;
  role: string;
  verifiedQty: number;
  badges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string; // lucide icon name
  unlockedAt?: string;
  tier: "Gold" | "Silver" | "Bronze";
}

export interface CommunityHealthScore {
  overallScore: number; // 0-100
  localityName: string;
  roadsScore: number;
  waterScore: number;
  wasteScore: number;
  electricityScore: number;
  drainageScore: number;
  publicSafetyScore: number;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  type?: "text" | "report_created" | "issue_search_results";
  metadata?: any;
}
