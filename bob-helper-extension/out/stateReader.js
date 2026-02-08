"use strict";
// BOB Helper — State Reader
// Reads Antigravity's internal state via VS Code context API
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateWatcher = void 0;
exports.readAntigravityState = readAntigravityState;
const vscode = __importStar(require("vscode"));
const logger_1 = require("./logger");
// Track last state to only log changes
let lastStateJson = '';
/**
 * Reads the current state of Antigravity by querying VS Code's `when` context values.
 * These contexts are set internally by the Antigravity extension and indicate
 * what actions are available (accept, retry, terminal approval, etc.)
 */
async function readAntigravityState() {
    const [canAcceptOrReject, canAcceptAllEdits, canAcceptHunk, canTriggerTerminal, isAgentInputFocused, canRetry, agentHasError,] = await Promise.all([
        getContext('antigravity.canAcceptOrRejectCommand'),
        getContext('antigravity.canAcceptOrRejectAllAgentEditsInFile'),
        getContext('antigravity.canAcceptOrRejectFocusedHunk'),
        getContext('antigravity.canTriggerTerminalCommandAction'),
        getContext('antigravity.isAgentModeInputBoxFocused'),
        getContext('antigravity.canRetry'),
        getContext('antigravity.agentHasError'),
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
        (0, logger_1.log)(`[StateReader] State changed: hasAccept=${hasAcceptButton}, hasEnter=${hasEnterButton}, working=${agentWorking}, terminal=${terminalPending}, hasRetry=${hasRetryButton}`);
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
async function getContext(key) {
    try {
        return await vscode.commands.executeCommand('getContext', key);
    }
    catch {
        // Context not available or command failed
        return undefined;
    }
}
/**
 * Sets up watchers to detect state changes and invoke callback.
 * Since VS Code doesn't have a direct "onContextChanged" event,
 * we poll at a short interval when BOB is connected.
 */
class StateWatcher {
    interval = null;
    lastState = '';
    onChange;
    constructor(onChange) {
        this.onChange = onChange;
    }
    start(pollMs = 1000) {
        if (this.interval) {
            return;
        }
        this.interval = setInterval(async () => {
            const state = await readAntigravityState();
            const stateHash = JSON.stringify(state);
            if (stateHash !== this.lastState) {
                this.lastState = stateHash;
                this.onChange(state);
            }
        }, pollMs);
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
exports.StateWatcher = StateWatcher;
//# sourceMappingURL=stateReader.js.map