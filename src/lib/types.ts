// Types for Antigravity Monitor

export type InstanceStatus = 'idle' | 'working' | 'error' | 'complete' | 'disabled';

export interface Instance {
    id: string;
    windowTitle: string;
    windowHandle: number;
    projectPath: string;
    projectName: string;
    enabled: boolean;
    customPrompt?: string;
    currentIssue: number;
    totalIssues: number;
    retryCount: number;
    maxRetries: number;
    status: InstanceStatus;
    lastActivity: number;
    stepCount: number;
}

export interface Settings {
    defaultPrompt: string;
    inactivitySeconds: number;
    maxRetries: number;
    discordWebhook: string;
    notifyOnComplete: boolean;
    notifyOnError: boolean;
    minimizeToTray: boolean;
}

export interface ScanResult {
    windowTitle: string;
    windowHandle: number;
    processId: number;
}
