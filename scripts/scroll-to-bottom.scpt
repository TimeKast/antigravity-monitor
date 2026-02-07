#!/usr/bin/osascript
-- scroll-to-bottom.scpt
-- Scroll chat to bottom using Cmd+End on macOS

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
            
            -- Send Cmd+End (End key = key code 119)
            tell targetProcess
                key code 119 using command down
            end tell
            
            delay 0.1
            
            return "{\"success\": true}"
        end tell
    on error errMsg
        return "{\"success\": false, \"error\": \"" & errMsg & "\"}"
    end try
end run
