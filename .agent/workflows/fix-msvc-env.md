---
description: Fix VS 2022/2026 MSVC toolchain for Rust/Tauri builds
---

# Fix MSVC Build Environment for BOB

VS 2026 (v18) has an incomplete C++ installation (`excpt.h` missing).
Use VS 2022 BuildTools instead, which has the complete toolchain.

## Quick Fix (set environment before building)

// turbo-all

1. Set the environment variables in PowerShell:
```powershell
$env:CC = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64\cl.exe"
$env:CXX = $env:CC
$env:LIB = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\lib\x64;C:\Program Files (x86)\Windows Kits\10\Lib\10.0.26100.0\ucrt\x64;C:\Program Files (x86)\Windows Kits\10\Lib\10.0.26100.0\um\x64"
$env:INCLUDE = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\include;C:\Program Files (x86)\Windows Kits\10\Include\10.0.26100.0\ucrt;C:\Program Files (x86)\Windows Kits\10\Include\10.0.26100.0\um;C:\Program Files (x86)\Windows Kits\10\Include\10.0.26100.0\shared"
```

2. Run the build:
```powershell
cd "c:\Users\flevik\Proyectos Timekast\bob\src-tauri"
cargo check
```

## Root Cause

- **VS 2026 (v18)**: `excpt.h` missing from include dir, `msvcrt.lib` moved to `lib\onecore\x64`
- **VS 2022 BuildTools**: Complete toolchain at `C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools`
  - MSVC: `14.44.35207`
  - `excpt.h` ✅, `msvcrt.lib` ✅, `cl.exe` ✅

## Permanent Fix

To avoid setting env vars every time, you can add a `.cargo/config.toml` in the project:
```toml
[env]
CC = "C:\\Program Files (x86)\\Microsoft Visual Studio\\2022\\BuildTools\\VC\\Tools\\MSVC\\14.44.35207\\bin\\Hostx64\\x64\\cl.exe"
CXX = "C:\\Program Files (x86)\\Microsoft Visual Studio\\2022\\BuildTools\\VC\\Tools\\MSVC\\14.44.35207\\bin\\Hostx64\\x64\\cl.exe"
```

Or repair the VS 2026 C++ installation via **Visual Studio Installer** → Modify → check **"Desktop development with C++"**.
