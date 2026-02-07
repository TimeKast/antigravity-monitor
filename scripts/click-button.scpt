#!/usr/bin/osascript
-- click-button.scpt
-- Click at screen coordinates on macOS
-- Requires: brew install cliclick

on run argv
    set screenX to item 1 of argv
    set screenY to item 2 of argv
    
    try
        -- Use cliclick for reliable clicking (must be installed via Homebrew)
        do shell script "/usr/local/bin/cliclick c:" & screenX & "," & screenY
        return "{\"success\": true, \"x\": " & screenX & ", \"y\": " & screenY & "}"
    on error errMsg
        -- Fallback: try using AppleScript click (less reliable)
        try
            tell application "System Events"
                click at {screenX as number, screenY as number}
            end tell
            return "{\"success\": true, \"x\": " & screenX & ", \"y\": " & screenY & ", \"method\": \"applescript\"}"
        on error errMsg2
            return "{\"success\": false, \"error\": \"" & errMsg & " / " & errMsg2 & "\"}"
        end try
    end try
end run
