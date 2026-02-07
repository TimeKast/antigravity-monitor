#!/usr/bin/osascript
-- detect-ui-state.scpt
-- Detect UI state (buttons) for a window on macOS
-- Uses screencapture for pixel detection

on run argv
    set windowHandle to item 1 of argv as number
    
    try
        tell application "System Events"
            -- Find the process by ID
            set targetProcess to first process whose unix id is windowHandle
            set processName to name of targetProcess
            
            -- Get window bounds
            tell targetProcess
                set frontmost to true
                delay 0.2
                
                set targetWindow to window 1
                set {winX, winY} to position of targetWindow
                set {winWidth, winHeight} to size of targetWindow
            end tell
        end tell
        
        -- Calculate button search area (bottom-right corner)
        set searchX to winX + winWidth - 100
        set searchY to winY + winHeight - 120
        set searchWidth to 100
        set searchHeight to 120
        
        -- Capture the search region
        set captureFile to "/tmp/bob_ui_capture.png"
        do shell script "screencapture -x -R " & searchX & "," & searchY & "," & searchWidth & "," & searchHeight & " " & captureFile
        
        -- Analyze captured image for button colors using Python
        set analyzeScript to "python3 -c \"
import sys
from PIL import Image
import json

img = Image.open('" & captureFile & "')
pixels = list(img.getdata())
width, height = img.size

result = {
    'hasAcceptButton': False,
    'hasEnterButton': False,
    'hasRetryButton': False,
    'isPaused': False,
    'chatButtonColor': 'none',
    'acceptButtonX': 0,
    'acceptButtonY': 0,
    'enterButtonX': 0,
    'enterButtonY': 0,
    'retryButtonX': 0,
    'retryButtonY': 0,
    'isBottomButton': False
}

# Search for colored buttons
for y in range(height):
    for x in range(width):
        r, g, b = pixels[y * width + x][:3]
        
        # Gray button (chat ready) - R,G,B similar, medium brightness
        if 100 <= r <= 180 and 100 <= g <= 180 and 100 <= b <= 180:
            if abs(r-g) < 20 and abs(g-b) < 20:
                result['chatButtonColor'] = 'gray'
                result['hasEnterButton'] = True
                result['enterButtonX'] = " & searchX & " + x
                result['enterButtonY'] = " & searchY & " + y
        
        # Red button (agent working or retry)
        if r >= 180 and g < 100 and b < 100:
            result['chatButtonColor'] = 'red'
            result['isPaused'] = True
            result['hasRetryButton'] = True
            result['retryButtonX'] = " & searchX & " + x
            result['retryButtonY'] = " & searchY & " + y

        # Green/Blue Accept button
        if r < 100 and g >= 150 and b >= 100:
            result['hasAcceptButton'] = True
            result['acceptButtonX'] = " & searchX & " + x
            result['acceptButtonY'] = " & searchY & " + y
            result['isBottomButton'] = True

print(json.dumps(result))
\""
        
        try
            set analysisResult to do shell script analyzeScript
            return analysisResult
        on error
            -- Fallback: return default state (assume ready if no error)
            return "{\"hasAcceptButton\": false, \"hasEnterButton\": true, \"hasRetryButton\": false, \"isPaused\": false, \"chatButtonColor\": \"gray\", \"acceptButtonX\": 0, \"acceptButtonY\": 0, \"enterButtonX\": " & (winX + winWidth - 30) & ", \"enterButtonY\": " & (winY + winHeight - 50) & ", \"retryButtonX\": 0, \"retryButtonY\": 0, \"isBottomButton\": false}"
        end try
        
    on error errMsg
        return "{\"hasAcceptButton\": false, \"hasEnterButton\": false, \"hasRetryButton\": false, \"isPaused\": false, \"chatButtonColor\": \"none\", \"acceptButtonX\": 0, \"acceptButtonY\": 0, \"enterButtonX\": 0, \"enterButtonY\": 0, \"retryButtonX\": 0, \"retryButtonY\": 0, \"isBottomButton\": false, \"error\": \"" & errMsg & "\"}"
    end try
end run
