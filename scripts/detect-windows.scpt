#!/usr/bin/osascript
-- detect-windows.scpt
-- Detect VS Code / Antigravity windows on macOS

use scripting additions
use framework "Foundation"

on run
    set windowList to {}
    
    tell application "System Events"
        -- Find all Code processes (VS Code, Cursor, etc.)
        set codeProcesses to every process whose name contains "Code" or name contains "Cursor"
        
        repeat with proc in codeProcesses
            try
                set procName to name of proc
                set procId to unix id of proc
                set windowsOfProc to windows of proc
                
                repeat with w in windowsOfProc
                    try
                        set winName to name of w
                        -- Only include windows with "Antigravity" in the title
                        if winName contains "Antigravity" then
                            set windowInfo to "{\"windowTitle\": \"" & winName & "\", \"windowHandle\": " & procId & ", \"processId\": " & procId & "}"
                            set end of windowList to windowInfo
                        end if
                    end try
                end repeat
            end try
        end repeat
    end tell
    
    -- Return JSON array
    if (count of windowList) = 0 then
        return "[]"
    else if (count of windowList) = 1 then
        return "[" & (item 1 of windowList) & "]"
    else
        set jsonOutput to "["
        repeat with i from 1 to (count of windowList)
            set jsonOutput to jsonOutput & (item i of windowList)
            if i < (count of windowList) then
                set jsonOutput to jsonOutput & ", "
            end if
        end repeat
        set jsonOutput to jsonOutput & "]"
        return jsonOutput
    end if
end run
