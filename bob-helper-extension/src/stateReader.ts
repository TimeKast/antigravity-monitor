// BOB Helper — State Reader
// Reads Antigravity's internal state via VS Code context API

import * as vscode from 'vscode';
import type { AntigravityState } from './protocol';
import { log } from './logger';

// Track last state to only log changes
let lastStateJson = '';

/**
 * Reads the current state of Antigravity by querying VS Code's `when` context values.
 * These contexts are set internally by the Antigravity extension and indicate
 * what actions are available (accept, retry, terminal approval, etc.)
 */
export async function readAntigravityState(): Promise<AntigravityState> {
    const [
        canAcceptOrReject,
        canAcceptAllEdits,
        canAcceptHunk,
        canTriggerTerminal,
        isAgentInputFocused,
        canRetry,
        agentHasError,
    ] = await Promise.all([
        getContext<boolean>('antigravity.canAcceptOrRejectCommand'),
        getContext<boolean>('antigravity.canAcceptOrRejectAllAgentEditsInFile'),
        getContext<boolean>('antigravity.canAcceptOrRejectFocusedHunk'),
        getContext<boolean>('antigravity.canTriggerTerminalCommandAction'),
        getContext<boolean>('antigravity.isAgentModeInputBoxFocused'),
        getContext<boolean>('antigravity.canRetry'),
        getContext<boolean>('antigravity.agentHasError'),
    ]);

    // Determine high-level state
    const hasAcceptButton = canAcceptOrReject === true || canAcceptAllEdits === true || canAcceptHunk === true;
    const terminalPending = canTriggerTerminal === true;

    // Agent is "working" ONLY if we explicitly know input is NOT focused
    // If isAgentInputFocused is undefined, assume chat is ready (not working)
    // This is safer - we'd rather try to send a prompt than miss opportunities
    const agentWorking = !hasAcceptButton && !terminalPending && isAgentInputFocused === false;

    // Chat is ready = not working, no pending accepts/terminal
    const hasEnterButton = !agentWorking && !hasAcceptButton && !terminalPending;
    
    // Retry button appears after errors
    const hasRetryButton = canRetry === true || agentHasError === true;

    const currentStateJson = `${hasAcceptButton}-${hasEnterButton}-${agentWorking}-${terminalPending}-${hasRetryButton}`;
    if (currentStateJson !== lastStateJson) {
        log(`[StateReader] State changed: hasAccept=${hasAcceptButton}, hasEnter=${hasEnterButton}, working=${agentWorking}, terminal=${terminalPending}, hasRetry=${hasRetryButton}`);
        lastStateJson = currentStateJson;
    }

    // Get workspace name
    const workspaceName = vscode.workspace.workspaceFolders?.[0]?.name || 'unknown';

    return {
        hasAcceptButton,
        hasRetryButton,
        hasEnterButton,
        agentWorking,
        terminalPending,
        workspaceName,
    };
}

/**
 * Helper to safely read a VS Code context value.
 * Uses executeCommand('getContext', key) which is available in VS Code 1.93+
 */
async function getContext<T>(key: string): Promise<T | undefined> {
    try {
        return await vscode.commands.executeCommand<T>('getContext', key);
    } catch {
        // Context not available or command failed
        return undefined;
    }
}

/**
 * Sets up watchers to detect state changes and invoke callback.
 * Since VS Code doesn't have a direct "onContextChanged" event,
 * we poll at a short interval when BOB is connected.
 */
export class StateWatcher {
    private interval: NodeJS.Timeout | null = null;
    private lastState: string = '';
    private onChange: (state: AntigravityState) => void;

    constructor(onChange: (state: AntigravityState) => void) {
        this.onChange = onChange;
    }

    start(pollMs: number = 1000): void {
        if (this.interval) { return; }

        this.interval = setInterval(async () => {
            const state = await readAntigravityState();
            const stateHash = JSON.stringify(state);

            if (stateHash !== this.lastState) {
                this.lastState = stateHash;
                this.onChange(state);
            }
        }, pollMs);
    }

    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
