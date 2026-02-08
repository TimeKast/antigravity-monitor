// BOB Helper — Shared Logger
// Provides a global logging function that writes to the output channel

import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | null = null;

export function initLogger(channel: vscode.OutputChannel) {
    outputChannel = channel;
}

export function log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const line = `[${timestamp}] ${message}`;
    outputChannel?.appendLine(line);
}
