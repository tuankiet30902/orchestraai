<div align="center">

<img src="src-tauri/icons/128x128.png" alt="OrchestraAI Logo" width="88" height="88" style="border-radius: 22px;" />

# OrchestraAI

### **The Multi-Agent AI Coding Studio**
*Conduct your AI coding orchestra from a single unified window.*

<p align="center">
  <a href="#-quick-install"><img src="https://img.shields.io/badge/Download-macOS%20%7C%20Windows%20%7C%20Linux-f59e0b?style=for-the-badge&logo=apple&logoColor=white" alt="Download" /></a>
  <a href="https://github.com/tuankiet30902/orchestraai/releases"><img src="https://img.shields.io/github/v/release/tuankiet30902/orchestraai?style=for-the-badge&color=18181b&label=Release" alt="Latest Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-18181b?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri_2.0-Rust-orange?style=flat-square&logo=tauri" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/React_19-TypeScript-blue?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/PTY-Real_Hardware_Terminals-black?style=flat-square&logo=gnometerminal" alt="Real PTY" />
  <img src="https://img.shields.io/badge/MCP-Model_Context_Protocol-purple?style=flat-square" alt="MCP" />
  <img src="https://img.shields.io/badge/Tests-839_Passed-emerald?style=flat-square" alt="Unit Tests" />
</p>

<br />

<img src="docs/images/orchestraai-workspace-preview.png" alt="OrchestraAI Studio Preview" width="100%" style="border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65);" />

</div>

<br />

---

## ⚡ Quick Install

Get up and running in seconds. No cloud account or background services required.

### 🍎 macOS (Apple Silicon & Intel)
```bash
curl -fsSL https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.sh | bash
```
> Or download the standalone disk image: [**OrchestraAI_0.1.0_universal.dmg**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI_0.1.0_universal.dmg)

### 🪟 Windows (x64)
```powershell
irm https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.ps1 | iex
```
> Or download the standalone installer: [**OrchestraAI_0.1.0_x64-setup.exe**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI_0.1.0_x64-setup.exe)

### 🐧 Linux (AppImage / Deb / RPM)
```bash
curl -fsSL https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.sh | bash
```
> Or download package: [**AppImage**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI_0.1.0_amd64.AppImage) · [**Debian/Ubuntu (.deb)**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI_0.1.0_amd64.deb) · [**Fedora/RHEL (.rpm)**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI-0.1.0-1.x86_64.rpm)

---

## 💡 The Multi-Agent Coding Problem

Running a single AI coding agent works great. But building full-scale applications with multiple autonomous agents across **Architecture**, **Frontend**, **Backend**, and **QA** quickly causes friction:

| Problem | Traditional Terminal Workflow | The OrchestraAI Studio |
| :--- | :--- | :--- |
| **Visibility** | Hidden in tab bars, no active status | **Live split grid** with real-time process & activity LEDs |
| **Git Conflicts** | Agents overwrite each other's edits | **Isolated Git worktrees** (1 branch & directory per agent) |
| **Inter-Agent Sync** | Manual copy-pasting API specs | **Orchestra Pit** (agents chat & share docs via MCP) |
| **Web Feedback** | Blind code edits without DOM context | **Live browser column** (click any element to prompt agent) |
| **Token Cost** | Hidden until monthly billing surprises | **Live per-agent token & USD cost ticker HUD** |
| **Team Control** | Typing repetitive commands across windows | **Conduct Mode (`⇧⌘B`)** (broadcast keystrokes to all panes) |

---

## 🌟 Key Highlights & Capabilities

### 1. 🪟 Real Split Terminals with Process Sniffing
*Native pseudo-terminals powered by Rust and `portable-pty`.*
- **Infinite Split Grid**: Split horizontally (`⌘D`) and vertically (`⇧⌘D`) with dynamic resizing.
- **Process Sniffing**: Automatically identifies running agents (`claude`, `agy`, `codex`, `opencode`, `gemini`, `deepseek`) and attaches authentic brand logos.
- **State Rollup LEDs**: Live visual indicators for Thinking (🟡), Awaiting Input (🔵), and Idle (🟢).
- **Per-Pane Zoom**: Scale individual terminal text on the fly (`⌘+` / `⌘-` / `⌘0`).

<div align="center">
  <img src="docs/images/orchestraai-multi-agent-split.png" alt="Split Terminals Grid" width="88%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); margin: 12px 0;" />
</div>

---

### 2. 🎻 The Orchestra Pit (Autonomous Inter-Agent Collaboration)
*Where AI agents talk to each other so you don't have to be the middleman.*
- **Model Context Protocol (MCP) Server**: Built directly into the desktop app. Agents use `list_peers`, `send_message`, and `read_inbox` tools to coordinate.
- **Drag-and-Drop Assignment**: Drag any terminal header into a Pit room to instantly join that agent into the collaboration network.
- **Conductor Directives**: Jump in at any time to post guidelines, review schemas, or steer the team.

<div align="center">
  <img src="docs/images/orchestraai-pit-collaboration.png" alt="Orchestra Pit Collaboration Room" width="88%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); margin: 12px 0;" />
</div>

---

### 3. 🌐 Live Web Preview & DOM Element Inspector
*Inspect live applications alongside agent terminals.*
- **Automatic Dev Server Discovery**: Detects running localhost ports (`3000`, `5173`, `8080`, etc.).
- **Click-to-Prompt Element Picker**: Click any UI element in the preview, write an instruction, and inject the exact DOM context and CSS selector into the agent terminal.

---

### 4. 🌿 Zero-Collision Git Worktrees & Visual Diff Viewer
*Complete branch and file isolation for parallel development.*
- **Auto Worktree Provisioning**: Creates clean branches (`orchestra/<role>`) and dedicated working directories.
- **Source Control Sidebar**: Stage, unstage, discard, and review side-by-side or unified diffs with syntax highlighting.

<div align="center">
  <img src="docs/images/orchestraai-git-worktrees.png" alt="Source Control & Worktree Inspector" width="88%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); margin: 12px 0;" />
</div>

---

### 5. 🎯 Raycast-Style Command Palette (`⌘K` / `⌘P`)
*Instant navigation, theme switching, and layout controls at your fingertips.*
- **Workspace Navigation**: Quick-switch projects, recents, and open files.
- **Themes & Display**: Instant palette switcher (*Orchestra Amber, VS Code Blue, Tokyo Cyan, Emerald Green, Violet Purple, Rose Pink, Light Luxury*).
- **Studio Zoom**: Scale the entire application UI from 80% to 150% (Default: 125%).

---

### 6. 💰 Real-Time Token Tracker & Cost Estimator
*Never get caught off-guard by context token explosions.*
- **Context Window Parsing**: Captures input tokens, output tokens, and cache creation/reads.
- **Live USD Pricing Ticker**: Real-time cost estimates for Claude 3.7 Sonnet, Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Pro, and DeepSeek V3.
- **Status Bar HUD**: Session-wide token and spending aggregate.

---

### 7. 🚀 Pre-Configured Team Workflows (Templates)
*Launch multi-agent teams with tailored role prompts from the Welcome Hub (`⌘N`).*

```
├── 🏗️ Feature Factory   ── 4 Agents: Architect ➔ Frontend ➔ Backend ➔ QA
├── 🐛 Bug Hunt          ── 2 Agents: Root Cause Investigator ➔ Fixer & Tester
├── 🔄 Refactor Sprint   ── 3 Agents: Analyzer ➔ Structural Refactorer ➔ Test Coverage
├── 📖 Docs Writer       ── 2 Agents: Code Reader ➔ Technical Author
├── 🚀 Full Stack Team   ── 6 Agents: Lead ➔ Frontend ➔ Backend ➔ DB ➔ DevOps ➔ QA
└── 🎯 Solo Focus        ── 1 Agent : Clean, distraction-free companion mode
```

---

## 🤖 Supported Agents & CLI Tools

OrchestraAI works out of the box with any terminal-based agent:

| Agent / Tool | Command | Capabilities & Integration |
| :--- | :--- | :--- |
| **Claude Code** | `claude` | MCP Tools + Real-time Statusline JSON + Token Cost Sniffing |
| **Google Antigravity** | `agy` | Built-in MCP + Subagent Delegation + Process Detection |
| **OpenAI Codex** | `codex` | Built-in MCP Server + Process Detection |
| **OpenCode** | `opencode` | Built-in MCP Server + Process Detection |
| **Google Gemini CLI** | `gemini` | Real PTY + Process Detection |
| **DeepSeek Coder** | `deepseek` | Real PTY + Process Detection |
| **xAI Grok** | `grok` | Real PTY + Process Detection |
| **GitHub Copilot CLI**| `gh copilot`| Real PTY + Process Detection |
| **Standard Shells** | `zsh`, `bash`, `fish`, `pwsh` | High-performance Native PTY Multiplexing |

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut (macOS) | Shortcut (Win / Linux) | Action |
| :--- | :--- | :--- |
| <kbd>⌘</kbd> <kbd>K</kbd> / <kbd>⌘</kbd> <kbd>P</kbd> | <kbd>Ctrl</kbd> <kbd>K</kbd> / <kbd>Ctrl</kbd> <kbd>P</kbd> | **Command Palette** |
| <kbd>⌘</kbd> <kbd>O</kbd> | <kbd>Ctrl</kbd> <kbd>O</kbd> | Open Project Folder |
| <kbd>⌘</kbd> <kbd>N</kbd> | <kbd>Ctrl</kbd> <kbd>N</kbd> | New Team Workspace (Welcome Hub) |
| <kbd>⌘</kbd> <kbd>T</kbd> | <kbd>Ctrl</kbd> <kbd>T</kbd> | Quick Terminal Pane |
| <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>B</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>B</kbd> | **Toggle Conduct (Broadcast) Mode** |
| <kbd>⌘</kbd> <kbd>D</kbd> | <kbd>Ctrl</kbd> <kbd>D</kbd> | Split Terminal Horizontal |
| <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>D</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>D</kbd> | Split Terminal Vertical |
| <kbd>⌘</kbd> <kbd>W</kbd> | <kbd>Ctrl</kbd> <kbd>W</kbd> | Close Active Pane |
| <kbd>⌘</kbd> <kbd>F</kbd> | <kbd>Ctrl</kbd> <kbd>F</kbd> | Find in Active Terminal |
| <kbd>⌘</kbd> <kbd>,</kbd> | <kbd>Ctrl</kbd> <kbd>,</kbd> | Open Settings & Preferences |
| <kbd>⌘</kbd> <kbd>0</kbd> | <kbd>Ctrl</kbd> <kbd>0</kbd> | Reset UI Zoom to 125% |
| <kbd>⌘</kbd> <kbd>+</kbd> / <kbd>⌘</kbd> <kbd>-</kbd> | <kbd>Ctrl</kbd> <kbd>+</kbd> / <kbd>Ctrl</kbd> <kbd>-</kbd> | Zoom Studio UI In / Out |

---

## 🛠️ Building from Source

### Prerequisites
- **Node.js 18+** & `npm` ([nodejs.org](https://nodejs.org))
- **Rust Toolchain (stable)** ([rustup.rs](https://rustup.rs))
- **Git**

```bash
# 1. Clone the repository
git clone https://github.com/tuankiet30902/orchestraai.git
cd orchestraai

# 2. Install frontend dependencies
npm install

# 3. Launch in desktop development mode
npm run tauri dev

# 4. Run full unit test suite (839 passing tests)
npm test

# 5. Build optimized production release package
npm run tauri build
```

---

## 🛡️ Security & Privacy Guarantee

- **100% Local**: All pseudo-terminals, MCP sockets, Git worktrees, and IPC commands execute entirely on your machine.
- **Zero Telemetry**: OrchestraAI collects zero telemetry, logs, prompts, or keystrokes. Your code stays strictly private.
- **Termination Guard**: Protects against accidental pane closures while AI agents are actively executing commands.

---

## 📜 License

OrchestraAI is free and open-source software licensed under the **[GNU General Public License v3.0 (GPL-3.0)](LICENSE)**.

<br />

<div align="center">
  <sub>Developed with ❤️ by <a href="https://github.com/tuankiet30902">Kiet Tran</a> · Powered by <a href="https://tauri.app">Tauri 2</a>, <a href="https://react.dev">React 19</a>, <a href="https://xtermjs.org">xterm.js</a>, and <a href="https://github.com/wez/wezterm/tree/main/pty">portable-pty</a>.</sub>
</div>
