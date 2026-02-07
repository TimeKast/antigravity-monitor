#!/usr/bin/osascript
-- read-backlog.scpt
-- Read backlog.md from project path on macOS

on run argv
    set projectPath to item 1 of argv
    
    try
        -- Build possible backlog paths
        set backlogPaths to {¬
            projectPath & "/.agent/backlog.md", ¬
            projectPath & "/backlog.md", ¬
            projectPath & "/BACKLOG.md" ¬
        }
        
        set backlogContent to ""
        set foundPath to ""
        
        -- Try each path
        repeat with bp in backlogPaths
            try
                set backlogContent to (do shell script "cat " & quoted form of bp)
                set foundPath to bp
                exit repeat
            end try
        end repeat
        
        if backlogContent is "" then
            return "{\"totalIssues\": 0, \"completedIssues\": 0, \"currentIssue\": \"\", \"backlogPath\": \"\", \"error\": \"No backlog found\"}"
        end if
        
        -- Count issues using shell commands
        set totalIssues to (do shell script "grep -c '^## ' " & quoted form of foundPath & " || echo 0") as number
        set completedIssues to (do shell script "grep -c '^## .*✅' " & quoted form of foundPath & " || echo 0") as number
        
        -- Find current issue (first without checkmark)
        set currentIssue to ""
        try
            set currentIssue to (do shell script "grep '^## ' " & quoted form of foundPath & " | grep -v '✅' | head -1 | sed 's/^## //'")
        end try
        
        return "{\"totalIssues\": " & totalIssues & ", \"completedIssues\": " & completedIssues & ", \"currentIssue\": \"" & currentIssue & "\", \"backlogPath\": \"" & foundPath & "\"}"
        
    on error errMsg
        return "{\"totalIssues\": 0, \"completedIssues\": 0, \"currentIssue\": \"\", \"backlogPath\": \"\", \"error\": \"" & errMsg & "\"}"
    end try
end run
