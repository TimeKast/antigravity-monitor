#!/usr/bin/osascript
-- accept-dialog.scpt
-- Accept dialog using Cmd+Enter keyboard shortcut on macOS

on run argv
    set windowHandle to item 1 of argv as number
    
    try
        tell application "System Events"
            -- Find the process by ID
            set targetProcess to first process whose unix id is windowHandle
            
            -- Activate the window
            tell targetProcess
                set frontmost to true
            end tell
            
            delay 0.2
            
            -- Send Cmd+Enter (equivalent to Alt+Enter on Windows)
            tell targetProcess
                key code 36 using command down -- Return with Cmd
            end tell
            
            delay 0.1
            
            return "{\"success\": true}"
        end tell
    on error errMsg
        return "{\"success\": false, \"error\": \"" & errMsg & "\"}"
    end try
end run
