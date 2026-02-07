#!/usr/bin/osascript
-- write-to-chat.scpt
-- Write text to Antigravity chat and submit on macOS

on run argv
    set thePrompt to item 1 of argv
    set windowHandle to item 2 of argv as number
    
    try
        tell application "System Events"
            -- Find the process by ID
            set targetProcess to first process whose unix id is windowHandle
            set processName to name of targetProcess
            
            -- Activate the window
            tell targetProcess
                set frontmost to true
            end tell
            
            delay 0.3
            
            -- Use clipboard to paste (more reliable than keystroke for special chars)
            set the clipboard to thePrompt
            
            -- Cmd+V to paste
            tell targetProcess
                keystroke "v" using command down
            end tell
            
            delay 0.2
            
            -- Press Enter to submit
            tell targetProcess
                key code 36 -- Return key
            end tell
            
            delay 0.1
            
            -- Truncate prompt for response
            set promptLen to length of thePrompt
            if promptLen > 50 then
                set truncatedPrompt to text 1 thru 50 of thePrompt
            else
                set truncatedPrompt to thePrompt
            end if
            
            return "{\"success\": true, \"prompt\": \"" & truncatedPrompt & "\"}"
        end tell
    on error errMsg
        return "{\"success\": false, \"error\": \"" & errMsg & "\"}"
    end try
end run
