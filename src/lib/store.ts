// Svelte stores for Antigravity Monitor state management

import { writable, get } from 'svelte/store';
import type { Instance, Settings } from './types';
import { invoke } from '@tauri-apps/api/core';

// Default settings
const defaultSettings: Settings = {
    defaultPrompt: 'Continúa con el siguiente paso',
    inactivitySeconds: 30,
    maxRetries: 3,
    discordWebhook: '',
    notifyOnComplete: true,
    notifyOnError: true,
    minimizeToTray: true
};

// Load settings from localStorage
function loadSettings(): Settings {
    if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('antigravity-settings');
        if (saved) {
            return { ...defaultSettings, ...JSON.parse(saved) };
        }
    }
    return defaultSettings;
}

// Settings store with persistence
function createSettingsStore() {
    const { subscribe, set, update } = writable<Settings>(loadSettings());

    return {
        subscribe,
        set: (value: Settings) => {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('antigravity-settings', JSON.stringify(value));
            }
            set(value);
        },
        update
    };
}

export const settings = createSettingsStore();

// Instances store
export const instances = writable<Instance[]>([]);

// Scan for Antigravity instances (VS Code windows)
export async function scanForInstances(): Promise<void> {
    try {
        // Call Tauri backend to scan for windows
        const results = await invoke<ScanResult[]>('scan_windows');

        const currentInstances = get(instances);

        // Map scan results to Instance objects
        const newInstances: Instance[] = results.map((result: ScanResult) => {
            // Check if this instance already exists
            const existing = currentInstances.find(i => i.windowHandle === result.windowHandle);

            if (existing) {
                return {
                    ...existing,
                    windowTitle: result.windowTitle
                };
            }

            // Create new instance
            return {
                id: `instance-${result.windowHandle}`,
                windowTitle: result.windowTitle,
                windowHandle: result.windowHandle,
                projectPath: extractProjectPath(result.windowTitle),
                projectName: extractProjectName(result.windowTitle),
                enabled: false,
                currentIssue: 0,
                totalIssues: 0,
                retryCount: 0,
                maxRetries: get(settings).maxRetries,
                status: 'idle',
                lastActivity: Date.now(),
                stepCount: 0
            };
        });

        instances.set(newInstances);
    } catch (error) {
        console.error('Failed to scan for instances:', error);
        // Fallback: use mock data for development without Tauri
        if (import.meta.env.DEV) {
            instances.set([
                {
                    id: 'mock-1',
                    windowTitle: 'constela_back - Antigravity',
                    windowHandle: 12345,
                    projectPath: 'C:/Users/flevik/Proyectos/constela_back',
                    projectName: 'constela_back',
                    enabled: true,
                    currentIssue: 3,
                    totalIssues: 8,
                    retryCount: 0,
                    maxRetries: 3,
                    status: 'working',
                    lastActivity: Date.now() - 5000,
                    stepCount: 12
                },
                {
                    id: 'mock-2',
                    windowTitle: 'clawdbot - Visual Studio Code',
                    windowHandle: 67890,
                    projectPath: 'C:/Users/flevik/Proyectos/clawdbot',
                    projectName: 'clawdbot',
                    enabled: false,
                    currentIssue: 0,
                    totalIssues: 5,
                    retryCount: 0,
                    maxRetries: 3,
                    status: 'idle',
                    lastActivity: Date.now() - 60000,
                    stepCount: 0
                }
            ]);
        }
    }
}

// Refresh instances (update status, don't rescan)
export async function refreshInstances(): Promise<void> {
    const currentInstances = get(instances);

    for (const instance of currentInstances) {
        if (!instance.enabled) continue;

        try {
            // Call Tauri to get instance status
            const status = await invoke<InstanceStatus>('get_instance_status', {
                windowHandle: instance.windowHandle
            });

            instances.update(list =>
                list.map(i => i.id === instance.id ? { ...i, ...status } : i)
            );
        } catch (error) {
            console.error(`Failed to refresh instance ${instance.id}:`, error);
        }
    }
}

// Helper: Extract project path from window title
function extractProjectPath(title: string): string {
    // Window title format: "projectName - Visual Studio Code" or "projectName - Antigravity"
    const match = title.match(/^(.+?)\s*[-–]\s*(Visual Studio Code|Antigravity|Code)/);
    if (match) {
        return match[1].trim();
    }
    return title;
}

// Helper: Extract project name from window title
function extractProjectName(title: string): string {
    const path = extractProjectPath(title);
    return path.split(/[/\\]/).pop() || path;
}

// Types for scan results
interface ScanResult {
    windowTitle: string;
    windowHandle: number;
    processId: number;
}

interface InstanceStatus {
    status: 'idle' | 'working' | 'error' | 'complete';
    currentIssue: number;
    totalIssues: number;
    retryCount: number;
    lastActivity: number;
    stepCount: number;
}
