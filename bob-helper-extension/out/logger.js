"use strict";
// BOB Helper — Shared Logger
// Provides a global logging function that writes to the output channel
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = initLogger;
exports.log = log;
let outputChannel = null;
function initLogger(channel) {
    outputChannel = channel;
}
function log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const line = `[${timestamp}] ${message}`;
    outputChannel?.appendLine(line);
}
//# sourceMappingURL=logger.js.map