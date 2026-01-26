<script lang="ts">
    import type { Instance } from "./types";

    interface Props {
        instance: Instance;
        onToggle: () => void;
    }

    let { instance, onToggle }: Props = $props();

    const statusColors: Record<string, string> = {
        idle: "#ffb800",
        working: "#00ff88",
        error: "#ff4757",
        complete: "#00d9ff",
        disabled: "#666",
    };

    const statusIcons: Record<string, string> = {
        idle: "🟡",
        working: "🟢",
        error: "🔴",
        complete: "✅",
        disabled: "⚪",
    };

    function formatTime(timestamp: number): string {
        const diff = Date.now() - timestamp;
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        return `${Math.floor(minutes / 60)}h ago`;
    }
</script>

<div
    class="card"
    class:disabled={!instance.enabled}
    class:error={instance.status === "error"}
>
    <div class="header">
        <div class="title">
            <span class="status-icon">{statusIcons[instance.status]}</span>
            <span class="name">{instance.projectName}</span>
        </div>
        <label class="toggle">
            <input
                type="checkbox"
                checked={instance.enabled}
                onchange={onToggle}
            />
            <span class="slider"></span>
        </label>
    </div>

    <div class="content">
        <div class="progress-bar">
            <div
                class="progress-fill"
                style="width: {instance.totalIssues > 0
                    ? (instance.currentIssue / instance.totalIssues) * 100
                    : 0}%; background: {statusColors[instance.status]}"
            ></div>
        </div>

        <div class="stats">
            <span class="stat">
                📋 {instance.currentIssue}/{instance.totalIssues} issues
            </span>
            <span class="stat">
                🔄 {instance.stepCount} steps
            </span>
            {#if instance.retryCount > 0}
                <span class="stat retry">
                    ⚠️ Retry {instance.retryCount}/{instance.maxRetries}
                </span>
            {/if}
        </div>

        <div class="meta">
            <span class="path" title={instance.projectPath}>
                📁 {instance.projectPath.split(/[/\\]/).pop()}
            </span>
            <span class="time">
                ⏱️ {formatTime(instance.lastActivity)}
            </span>
        </div>

        {#if instance.customPrompt}
            <div class="custom-prompt">
                💬 {instance.customPrompt}
            </div>
        {/if}
    </div>
</div>

<style>
    .card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1rem;
        transition: all 0.3s ease;
    }

    .card:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateX(4px);
    }

    .card.disabled {
        opacity: 0.5;
    }

    .card.error {
        border-color: #ff4757;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4);
        }
        50% {
            box-shadow: 0 0 0 8px rgba(255, 71, 87, 0);
        }
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .status-icon {
        font-size: 0.9rem;
    }

    .name {
        font-weight: 600;
        font-size: 1rem;
    }

    /* Toggle switch */
    .toggle {
        position: relative;
        width: 44px;
        height: 24px;
    }

    .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #444;
        transition: 0.3s;
        border-radius: 24px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background: linear-gradient(90deg, #00d9ff, #00ff88);
    }

    input:checked + .slider:before {
        transform: translateX(20px);
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .progress-bar {
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        transition: width 0.5s ease;
    }

    .stats {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        opacity: 0.8;
    }

    .stat.retry {
        color: #ffb800;
    }

    .meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        opacity: 0.6;
    }

    .path {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .custom-prompt {
        font-size: 0.75rem;
        padding: 0.5rem;
        background: rgba(0, 217, 255, 0.1);
        border-radius: 6px;
        border-left: 2px solid #00d9ff;
        margin-top: 0.25rem;
    }
</style>
