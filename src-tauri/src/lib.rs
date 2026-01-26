// Antigravity Monitor - Tauri Backend
// Commands for window scanning, monitoring, and system integration

use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanResult {
    #[serde(rename = "windowTitle")]
    pub window_title: String,
    #[serde(rename = "windowHandle")]
    pub window_handle: i64,
    #[serde(rename = "processId")]
    pub process_id: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InstanceStatus {
    pub status: String,
    #[serde(rename = "currentIssue")]
    pub current_issue: u32,
    #[serde(rename = "totalIssues")]
    pub total_issues: u32,
    #[serde(rename = "retryCount")]
    pub retry_count: u32,
    #[serde(rename = "lastActivity")]
    pub last_activity: u64,
    #[serde(rename = "stepCount")]
    pub step_count: u32,
}

/// Scan for VS Code / Antigravity windows using PowerShell
#[tauri::command]
fn scan_windows() -> Result<Vec<ScanResult>, String> {
    // In development, use the project directory
    // In production, use the exe directory
    let script_path = if cfg!(debug_assertions) {
        // Development: use CARGO_MANIFEST_DIR (src-tauri) parent + scripts
        std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .map(|p| p.join("scripts").join("detect-windows.ps1"))
            .unwrap_or_else(|| std::path::PathBuf::from("scripts/detect-windows.ps1"))
    } else {
        // Production: use exe directory + scripts
        std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|p| p.join("scripts").join("detect-windows.ps1")))
            .unwrap_or_else(|| std::path::PathBuf::from("scripts/detect-windows.ps1"))
    };

    let output = Command::new("powershell")
        .args([
            "-ExecutionPolicy", "Bypass",
            "-File", script_path.to_str().unwrap_or("scripts/detect-windows.ps1")
        ])
        .output()
        .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("PowerShell script failed: {} (path: {:?})", stderr, script_path));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    
    // Handle empty output (no windows found)
    if stdout.trim().is_empty() {
        return Ok(vec![]);
    }
    
    // Handle single object vs array
    let results: Vec<ScanResult> = if stdout.trim().starts_with('[') {
        serde_json::from_str(&stdout)
            .map_err(|e| format!("Failed to parse JSON array: {} - Output: {}", e, stdout))?
    } else {
        // Single object, wrap in array
        let single: ScanResult = serde_json::from_str(&stdout)
            .map_err(|e| format!("Failed to parse JSON object: {} - Output: {}", e, stdout))?;
        vec![single]
    };

    Ok(results)
}

/// Get the current status of a monitored instance
#[tauri::command]
fn get_instance_status(_window_handle: i64) -> Result<InstanceStatus, String> {
    // TODO: Implement actual status checking
    Ok(InstanceStatus {
        status: "idle".to_string(),
        current_issue: 0,
        total_issues: 0,
        retry_count: 0,
        last_activity: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64,
        step_count: 0,
    })
}

/// Paste a prompt to a specific window
#[tauri::command]
fn paste_prompt(window_title: String, prompt: String, instance_id: String) -> Result<(), String> {
    let script_path = if cfg!(debug_assertions) {
        std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .map(|p| p.join("scripts").join("paste-prompt.ps1"))
            .unwrap_or_else(|| std::path::PathBuf::from("scripts/paste-prompt.ps1"))
    } else {
        std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|p| p.join("scripts").join("paste-prompt.ps1")))
            .unwrap_or_else(|| std::path::PathBuf::from("scripts/paste-prompt.ps1"))
    };

    let output = Command::new("powershell")
        .args([
            "-ExecutionPolicy", "Bypass",
            "-File", script_path.to_str().unwrap_or("scripts/paste-prompt.ps1"),
            "-Prompt", &prompt,
            "-WindowTitle", &window_title,
            "-InstanceId", &instance_id,
        ])
        .output()
        .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to paste prompt: {}", stderr));
    }

    Ok(())
}

/// Send a notification to Discord webhook
#[tauri::command]
async fn notify_discord(webhook_url: String, title: String, message: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    
    let payload = serde_json::json!({
        "embeds": [{
            "title": title,
            "description": message,
            "color": 5814783, // Cyan color
            "footer": {
                "text": "Antigravity Monitor"
            },
            "timestamp": chrono::Utc::now().to_rfc3339()
        }]
    });

    client
        .post(&webhook_url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to send Discord notification: {}", e))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan_windows,
            get_instance_status,
            paste_prompt,
            notify_discord
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
