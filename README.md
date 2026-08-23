<div align="center">

# 🎻 OrchestraAI

### **The Native AI Multi-Agent Collaborative Development Studio**

*Conduct whole teams of autonomous AI coding agents — split terminals, isolated Git worktrees, live web previews, and an Orchestra Pit where agents collaborate in real time.*

<br />

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-amber.svg)](LICENSE)
[![Platforms: macOS | Windows | Linux](https://img.shields.io/badge/Platforms-macOS%20%7C%20Windows%20%7C%20Linux-blue.svg)](#-download--installation)
[![Tauri: 2.0](https://img.shields.io/badge/Tauri-2.0-orange.svg)](https://tauri.app)
[![React: 19](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev)
[![Rust: 1.80+](https://img.shields.io/badge/Rust-Backend-red.svg)](https://rust-lang.org)
[![Tests: 839 Passed](https://img.shields.io/badge/Tests-839%20Passed-brightgreen.svg)]()

<br />

<img src="docs/images/orchestraai-workspace-preview.png" alt="OrchestraAI Workspace with Live Web Preview and Multi-Agent Terminals" width="100%" style="border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.6);" />

</div>

---

## 💡 Why OrchestraAI?

Running **one** coding agent in your terminal works fine. Running **five** agents in parallel is where traditional workflows collapse:
- **Terminal tab overload**: Background prompts, waiting approvals, and streaming outputs get lost behind tabs.
- **Merge collisions & overwritten code**: Multiple agents writing to the same working directory concurrently step on each other's changes.
- **Human bottleneck**: You spend your entire day copy-pasting specs, diffs, and context between agent windows.

**OrchestraAI** solves this by turning your multi-agent workflow into an orchestrated development environment. Built with **Tauri 2**, **Rust (portable-pty)**, and **React 19**, OrchestraAI runs real native terminals with per-agent Git worktrees, live web previews, and an **Orchestra Pit** where agents communicate with each other autonomously.

---

## 🚀 Core Features

### 🎻 1. See the Whole Orchestra
- **Real Split Terminals**: Divide your workspace horizontally and vertically to monitor all active agents simultaneously without switching tabs.
- **Dedicated Agent Badging**: Auto-detects and displays official logos for **Claude Code**, **Google Antigravity**, **OpenAI Codex**, **OpenCode**, **Gemini**, **DeepSeek**, **Grok**, **GitHub Copilot**, and standard shells.
- **Inline Terminal Renaming**: Double-click any terminal title or click the pencil icon to give descriptive roles (e.g., *Frontend Architect*, *Backend API*, *QA Runner*).
- **Live Output Pulsing & State Dots**: Real-time status indicators show which agents are actively generating code, thinking, waiting for human input, or idle.
- **Conduct (Broadcast) Mode (`⇧⌘B`)**: Send a single instruction or directive simultaneously to all active panes with 1 keystroke.

<div align="center">
  <img src="docs/images/orchestraai-multi-agent-split.png" alt="Split Terminals with Claude Code and Antigravity" width="90%" style="border-radius: 10px; margin: 15px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

---

### 🤝 2. The Orchestra Pit (Multi-Agent Team Collaboration)
- **Autonomous Agent Communication**: Every terminal pane connects to OrchestraAI via the **Model Context Protocol (MCP)**.
- **Real-Time Discussion Rooms**: Agents converse directly with each other to align on contracts, share design specs, report bugs, and signal task completion.
- **Drag & Drop Team Roster**: Drag any terminal pane directly into the Orchestra Pit, or select them from the quick-add dropdown.
- **Human Conductor Control**: Intervene in the discussion, broadcast conductor directives, or inspect execution transcripts at any time.

<div align="center">
  <img src="docs/images/orchestraai-pit-collaboration.png" alt="Orchestra Pit Real-Time Collaboration Room" width="90%" style="border-radius: 10px; margin: 15px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

---

### 🌐 3. Live Web Preview & Visual UI Inspector
- **Embedded Browser Column**: View live development servers (`localhost:3000`, `localhost:5173`, etc.) directly beside your coding agents.
- **Visual Element Picker**: Click any UI element on your web app to inspect its DOM selector (`#main-cta-button`).
- **1-Click Prompt Annotation**: Type a UI request (e.g. *"Change button color to amber and add hover scale"*) and click **"Send to Agent"** to automatically pipe the annotated context into the active terminal.

---

### 🌿 4. Isolated Git Worktrees & Diff Inspector
- **Zero-Conflict Branching**: Each agent works inside its own isolated Git worktree on an independent branch (`orchestra/feature-branch`).
- **Built-in Diff Inspector**: Review color-coded syntax diffs across all modified files before merging.
- **Clean Commits & History**: Manage commits, stage files, and switch branches directly within the Source Control panel.

<div align="center">
  <img src="docs/images/orchestraai-git-worktrees.png" alt="Git Source Control and Worktree Inspector" width="90%" style="border-radius: 10px; margin: 15px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

---

### ⚡ 5. Progressive Welcome Hub & Team Presets
- **Frictionless Quick Start**: Open any folder (`⌘O`) or launch a Quick Terminal (`⌘T`) instantly.
- **Curated Multi-Agent Templates**:
  - 🏗️ **Feature Factory** (Architect + Frontend + Backend + QA)
  - 🐛 **Bug Hunt** (Investigator + Fixer)
  - 🔄 **Refactor Sprint** (Analyzer + Refactorer + Test Coverage)
  - 📖 **Docs Writer** (Code Reader + Doc Author)
  - 🚀 **Full Stack Team** (Lead + Frontend + Backend + Database + DevOps + QA)

<div align="center">
  <img src="docs/images/orchestraai-welcome-hub.png" alt="OrchestraAI Welcome Hub" width="90%" style="border-radius: 10px; margin: 15px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

---

### 📊 6. Real-Time Token & Cost Monitoring
- Live tracking of input, output, and cached tokens per terminal.
- Accurate real-time cost estimation across popular LLMs (Claude 3.7 Sonnet, Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Pro, DeepSeek V3).

---

## 📥 Download & Installation

Pre-built releases for **macOS**, **Windows**, and **Linux** are available on the [Releases](https://github.com/tuankiet30902/orchestraai/releases) page:

| Operating System | Architecture / Package | Download Link |
| :--- | :--- | :--- |
| 🍏 **macOS** | Universal DMG *(Apple Silicon M1-M4 & Intel)* | [Download `.dmg`](https://github.com/tuankiet30902/orchestraai/releases) |
| 🪟 **Windows** | 64-bit Installer / Portable EXE | [Download `.exe`](https://github.com/tuankiet30902/orchestraai/releases) |
| 🐧 **Linux** | Debian (`.deb`) / AppImage | [Download `.deb` / `.AppImage`](https://github.com/tuankiet30902/orchestraai/releases) |

---

## 🛠️ Build from Source

### Prerequisites
- **Node.js 18+** ([nodejs.org](https://nodejs.org))
- **Rust Toolchain (stable)** ([rustup.rs](https://rustup.rs))
- **Git**

### Build Instructions

```bash
# 1. Clone the repository
git clone https://github.com/tuankiet30902/orchestraai.git
cd orchestraai

# 2. Install dependencies
npm install

# 3. Run in development mode (Live Reloading)
npm run tauri dev

# 4. Run test suite (839 Vitest unit tests)
npm test

# 5. Build native release package
npm run tauri build
```

---

## 🤖 Supported Coding Agents

OrchestraAI seamlessly supports all terminal-based AI coding agents:

| Agent / CLI | Command | Description |
| :--- | :--- | :--- |
| **Claude Code** | `claude` | Anthropic's agentic CLI with deep tool usage |
| **Antigravity** | `agy` | Google DeepMind's Advanced Coding Agent |
| **OpenCode** | `opencode` | Open-source agentic coding assistant |
| **Codex CLI** | `codex` | OpenAI CLI coding agent |
| **Gemini CLI** | `gemini` | Google Gemini developer agent |
| **DeepSeek** | `deepseek` | DeepSeek Coder CLI |
| **Grok** | `grok` | xAI Grok coding assistant |
| **GitHub Copilot** | `gh copilot` | GitHub Copilot CLI |
| **Custom Shell** | `zsh` / `bash` / `fish` | Standard Unix & Windows shells |

---

## ⌨️ Keyboard Shortcuts

| Action | macOS | Windows / Linux |
| :--- | :--- | :--- |
| **Open Project Folder** | `⌘O` | `Ctrl+O` |
| **Quick Terminal** | `⌘T` | `Ctrl+T` |
| **New Team Workspace** | `⌘N` | `Ctrl+N` |
| **Toggle Sidebar** | `⌘B` | `Ctrl+B` |
| **Broadcast / Conduct Mode** | `⇧⌘B` | `Ctrl+Shift+B` |
| **Split Pane Horizontal** | `⌘D` | `Ctrl+D` |
| **Split Pane Vertical** | `⇧⌘D` | `Ctrl+Shift+D` |
| **Close Active Pane** | `⌘W` | `Ctrl+W` |
| **Find in Terminal** | `⌘F` | `Ctrl+F` |
| **Open Settings** | `⌘,` | `Ctrl+,` |

---

## 🔒 Security & Privacy

- **100% Local & Private**: All PTY sessions and Git operations execute entirely on your local machine.
- **Zero Telemetry**: No tracking, analytics, or background telemetry.
- **Permission Guard**: Prompts confirmation before terminating busy agents with unsaved work.

---

## 📄 License

OrchestraAI is free software licensed under the **[GNU General Public License v3.0 (GPL-3.0)](LICENSE)**.

---

<div align="center">
<sub>Crafted with ❤️ by <a href="https://github.com/tuankiet30902">Kiet Tran</a> · Built with <a href="https://tauri.app">Tauri 2</a>, <a href="https://react.dev">React 19</a>, <a href="https://xtermjs.org">xterm.js</a>, and <a href="https://github.com/wez/wezterm/tree/main/pty">portable-pty</a>.</sub>
</div>
