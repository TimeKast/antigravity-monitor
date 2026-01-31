<#
.SYNOPSIS
    Reads backlog from project path and returns issue counts

.DESCRIPTION
    Scans docs/backlog/*/issues/ directories to count total and completed issues

.PARAMETER ProjectPath
    Path to the project root directory
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectPath
)

try {
    $result = @{
        totalIssues     = 0
        completedIssues = 0
        currentIssue    = ""
        backlogPath     = ""
        error           = $null
    }
    
    # Find backlog directory
    $backlogBase = Join-Path $ProjectPath "docs\backlog"
    if (-not (Test-Path $backlogBase)) {
        $result.error = "No backlog found at $backlogBase"
        $result | ConvertTo-Json -Compress
        exit
    }
    
    # Find first version folder (v1.0, v2.0, etc.)
    $versionDirs = Get-ChildItem -Path $backlogBase -Directory | Where-Object { $_.Name -match "^v\d" } | Sort-Object Name -Descending
    if ($versionDirs.Count -eq 0) {
        $result.error = "No version directories found in backlog"
        $result | ConvertTo-Json -Compress
        exit
    }
    
    $latestVersion = $versionDirs[0]
    $issuesPath = Join-Path $latestVersion.FullName "issues"
    $result.backlogPath = $issuesPath
    
    if (-not (Test-Path $issuesPath)) {
        $result.error = "No issues directory found at $issuesPath"
        $result | ConvertTo-Json -Compress
        exit
    }
    
    # Count issues
    $issueFiles = Get-ChildItem -Path $issuesPath -Filter "*.md"
    $result.totalIssues = $issueFiles.Count
    
    $completed = 0
    $firstIncomplete = $null
    
    foreach ($file in $issueFiles | Sort-Object Name) {
        $content = Get-Content $file.FullName -Raw
        
        # Check for completion status - match "Status:" followed by Done/Completado (any emoji or marker)
        if ($content -match "Status:.*Done" -or $content -match "Status:.*Completado" -or $content -match "Status:.*Complete") {
            $completed++
        }
        elseif ($null -eq $firstIncomplete) {
            # First incomplete issue - extract ID from filename
            if ($file.Name -match "^([A-Z]+-\d+)") {
                $firstIncomplete = $matches[1]
            }
        }
    }
    
    $result.completedIssues = $completed
    $result.currentIssue = if ($firstIncomplete) { $firstIncomplete } else { "DONE" }
    
    $result | ConvertTo-Json -Compress
}
catch {
    @{
        totalIssues     = 0
        completedIssues = 0
        currentIssue    = ""
        backlogPath     = ""
        error           = $_.Exception.Message
    } | ConvertTo-Json -Compress
}
