export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'working' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  toolAction?: string;
  permissionLevel?: number;
}

export interface SystemStatusData {
  platform: string;
  hostname: string;
  uptime: string;
  cpu: {
    model: string;
    cores: number;
    usagePercent: number;
    speedMhz: number;
  };
  memory: {
    totalMb: number;
    usedMb: number;
    freeMb: number;
    usagePercent: number;
  };
  disk: {
    drive: string;
    totalGb: number;
    usedGb: number;
    freeGb: number;
    usagePercent: number;
  };
  network: {
    status: string;
    interfaces: number;
    latencyMs: number;
  };
  battery: {
    hasBattery: boolean;
    percent: number;
    isCharging: boolean;
    timeRemaining: string;
  };
  aiStatus: string;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'conversation' | 'project' | 'task' | 'tool' | 'working';
  key: string;
  value: string;
  tags: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  level: number;
  parameters: Record<string, string>;
}

export interface FileNode {
  name: string;
  type: 'drive' | 'folder' | 'file';
  size?: string;
  ext?: string;
  description?: string;
  children?: FileNode[];
}

export interface SelfImprovementProposal {
  id: string;
  title: string;
  description: string;
  category?: 'security' | 'performance' | 'reliability' | 'architecture';
  risk: string;
  riskLevel?: number;
  targetFile: string;
  diff: string;
  tests: string[];
  testResults?: { name: string; status: 'pass' | 'fail'; durationMs: number }[];
  urduExplanation?: string;
  status: 'ready_for_review' | 'applied' | 'rejected';
}

export interface CheckpointRecord {
  id: string;
  patchId: string;
  patchTitle: string;
  timestamp: string;
  targetFile: string;
  status: 'active' | 'reverted';
}

export interface SavedPythonScript {
  id: string;
  title: string;
  description: string;
  code: string;
  packages: string[];
  urduExplanation?: string;
  createdAt: string;
}

export interface VoiceProfileConfig {
  voice: string;
  pitch: number;
  speed: number;
  genderResonance: 'baritone' | 'classic_butler' | 'crisp_tactical' | 'deep_cyber';
  style: string;
}

