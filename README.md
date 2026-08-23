<div align="center">

<img src="src-tauri/icons/128x128.png" alt="OrchestraAI Logo" width="80" height="80" style="border-radius: 20px;" />

# OrchestraAI

### The Native Multi-Agent Collaborative Development Studio

A lightweight, high-performance desktop studio for conducting teams of autonomous AI coding agents. Real split pseudo-terminals, isolated per-agent Git worktrees, live web application previews, and an Orchestra Pit inter-agent collaboration room powered by the Model Context Protocol (MCP).

<br />

[![License](https://img.shields.io/badge/License-GPL--3.0-18181b.svg?style=flat-square)](LICENSE)
[![Platforms](https://img.shields.io/badge/Platforms-macOS%20%7C%20Windows%20%7C%20Linux-18181b.svg?style=flat-square)](#-downloads--packages)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-18181b.svg?style=flat-square&logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-v19.0-18181b.svg?style=flat-square&logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-v1.80+-18181b.svg?style=flat-square&logo=rust)](https://rust-lang.org)
[![Tests](https://img.shields.io/badge/Unit%20Tests-839%20Passed-18181b.svg?style=flat-square)]()

<br />

<img src="docs/images/orchestraai-workspace-preview.png" alt="OrchestraAI Workspace Preview" width="100%" style="border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);" />

</div>

<br />

---

## 📦 Downloads & Packages

Official production builds are standalone, fast, and require no cloud setup or background daemons.

| Platform | Architecture | Package Format | Download Link | Quick Install Command |
| :--- | :--- | :--- | :--- | :--- |
| **macOS** 🍎 | Apple Silicon & Intel (`universal`) | `.dmg` Installer | [**OrchestraAI_0.1.0_universal.dmg**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI_0.1.0_universal.dmg) | `curl -fsSL https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.sh \| bash` |
| **Windows** 🪟 | x64 (Windows 10 / 11) | `.exe` Setup | [**OrchestraAI_0.1.0_x64-setup.exe**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI_0.1.0_x64-setup.exe) | `irm https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.ps1 \| iex` |
| **Windows** 🪟 | x64 (Enterprise) | `.msi` Package | [**OrchestraAI_0.1.0_x64_en-US.msi**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI_0.1.0_x64_en-US.msi) | — |
| **Linux** 🐧 | x86_64 / amd64 | `.AppImage` (Universal) | [**OrchestraAI_0.1.0_amd64.AppImage**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI_0.1.0_amd64.AppImage) | `curl -fsSL https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.sh \| bash` |
| **Linux** 🐧 | Debian / Ubuntu (`deb`) | `.deb` Package | [**OrchestraAI_0.1.0_amd64.deb**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI_0.1.0_amd64.deb) | `sudo dpkg -i OrchestraAI_0.1.0_amd64.deb` |
| **Linux** 🐧 | Fedora / RHEL (`rpm`) | `.rpm` Package | [**OrchestraAI-0.1.0-1.x86_64.rpm**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.0/OrchestraAI-0.1.0-1.x86_64.rpm) | `sudo rpm -i OrchestraAI-0.1.0-1.x86_64.rpm` |

---

## 📑 Table of Contents

- [Why OrchestraAI?](#-why-orchestraai)
- [Core Studio Capabilities](#-core-studio-capabilities)
  - [1. Real Split Terminals & Process Sniffing](#1-real-split-terminals--process-sniffing)
  - [2. The Orchestra Pit (MCP Agent Collaboration Room)](#2-the-orchestra-pit-mcp-agent-collaboration-room)
  - [3. Live Web Browser & DOM Element Inspector](#3-live-web-browser--dom-element-inspector)
  - [4. Zero-Collision Git Worktrees & Visual Diff Viewer](#4-zero-collision-git-worktrees--visual-diff-viewer)
  - [5. Raycast-Style Command Palette (⌘K)](#5-raycast-style-command-palette-k)
  - [6. Real-Time Token Tracker & Cost Estimator](#6-real-time-token-tracker--cost-estimator)
  - [7. Conduct (Broadcast) Mode](#7-conduct-broadcast-mode)
  - [8. Team Templates & Quick Starts](#8-team-templates--quick-starts)
- [Supported AI Coding Agents](#-supported-ai-coding-agents)
- [Installation Guide](#-installation-guide)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Building from Source](#-building-from-source)
- [Security & Privacy Philosophy](#-security--privacy-philosophy)
- [Contributing & Community](#-contributing--community)
- [License](#-license)

---

## 💡 Why OrchestraAI?

Running a single AI coding agent (like Claude Code, Antigravity, or Codex) inside a terminal window works well. But orchestrating a team of agents across frontend, backend, database, and test engineering causes immediate bottlenecks:

```
                      TRADITIONAL APPROACH                         THE ORCHESTRAAI WAY
  ┌─────────────────────────────────────────────────────────┐  ┌─────────────────────────────────────────┐
  │ ❌ Context Lost: Tabs conceal active agent tasks        │  │ ✅ Real Split Grid: See all agents live │
  │ ❌ Git Collisions: Agents overwrite the same files     │  │ ✅ Isolated Worktrees: 1 branch / agent  │
  │ ❌ Manual Relay: Copy-pasting API specs between windows  │  │ ✅ Orchestra Pit: Agents chat via MCP    │
  │ ❌ UI Guesswork: No instant feedback on web changes      │  │ ✅ Live Browser: Click DOM to prompt     │
  └─────────────────────────────────────────────────────────┘  └─────────────────────────────────────────┘
```

**OrchestraAI** unifies pseudo-terminal multiplexing, Git worktree isolation, live application previews, and inter-agent communication protocols into a single native engineering studio.

---

## 🚀 Core Studio Capabilities

### 1. Real Split Terminals & Process Sniffing

OrchestraAI provides native PTY terminals powered by Rust and `portable-pty`. Terminals can be split infinitely both horizontally (`⌘D`) and vertically (`⇧⌘D`).

- **Automatic Agent Recognition**: Inspects running foreground processes (`claude`, `agy`, `codex`, `opencode`, `gemini`, `deepseek`) to automatically apply distinct agent brand logos and titles.
- **State Rollup Indicators**: Tracks agent lifecycle states in real time:
  - 🟡 **Thinking / Generating**: Agent is actively analyzing or outputting code.
  - 🔵 **Waiting for Input**: Agent requires human review or command approval.
  - 🟢 **Idle / Ready**: Agent finished its task and is standing by.
- **Dynamic Terminal Zoom**: Scale terminal font size on the fly (`⌘+`, `⌘-`, `⌘0`) per pane.

<div align="center">
  <img src="docs/images/orchestraai-multi-agent-split.png" alt="Multi-Agent Split Terminal Grid" width="90%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);" />
</div>

---

### 2. The Orchestra Pit (MCP Agent Collaboration Room)

The **Orchestra Pit** is an integrated chat room where agents communicate autonomously with each other through the Model Context Protocol (MCP).

- **Autonomous Peer Communication**: Connected agents use built-in tools (`list_peers`, `send_message`, `read_inbox`) to discuss data contracts, coordinate schema migrations, and request peer code reviews.
- **Drag-and-Drop Assignment**: Drag any terminal pane header directly into the Orchestra Pit panel to connect that agent to the room.
- **Conductor Intervention**: Jump into the room at any moment to post conductor guidance or broadcast team-wide directives.

<div align="center">
  <img src="docs/images/orchestraai-pit-collaboration.png" alt="Orchestra Pit Collaboration Room" width="90%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);" />
</div>

---

### 3. Live Web Browser & DOM Element Inspector

A native embedded webview column resides directly next to your active code terminals:

- **Localhost Discovery**: Automatically detects running local dev servers (Next.js, Vite, Remix, Astro, SvelteKit on ports `3000`, `5173`, `8080`, etc.).
- **Visual Element Picker**: Click any UI element in the preview to select it.
- **1-Click Prompt Annotation**: Write an instruction (e.g. *"Refactor this card into a reusable component with dark mode support"*) and click **Send to Agent** to inject the exact DOM context and CSS selector into the focused agent terminal.

---

### 4. Zero-Collision Git Worktrees & Visual Diff Viewer

Prevent merge chaos when multiple agents generate code simultaneously:

- **Automatic Worktree Isolation**: Spawns isolated Git worktrees under `orchestra/<role-name>` on dedicated branches.
- **Integrated Source Control Panel**: Review staged and unstaged files, stage/discard changes, and switch branches from the sidebar.
- **Side-by-Side & Unified Diffs**: Full syntax-highlighted diff inspection with inline line additions and deletions.

<div align="center">
  <img src="docs/images/orchestraai-git-worktrees.png" alt="Source Control and Worktree Inspector" width="90%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);" />
</div>

---

### 5. Raycast-Style Command Palette (`⌘K`)

Press **`⌘K`** or **`⌘P`** from anywhere in the app to access the centralized command hub:

- **Workspaces & Recents**: Open projects, spawn team templates, switch between active tabs.
- **Layout & Panes**: Split panes, toggle browser preview, toggle sidebar.
- **Themes & Display**: Switch instantly between color themes (*Orchestra Amber, VS Code Blue, Tokyo Cyan, Emerald Green, Violet Purple, Rose Pink, Light Luxury*).
- **Studio Scaling**: Reset or fine-tune UI scaling from 80% to 150%.

---

### 6. Real-Time Token Tracker & Cost Estimator

OrchestraAI parses context window usage metrics directly from terminal outputs and agent status streams:

- **Per-Terminal Consumption**: Displays input tokens, output tokens, and cache creation/read tokens in pane headers.
- **Live Cost Calculation**: Computes real-time USD costs for Claude 3.7 Sonnet, Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Pro, and DeepSeek V3.
- **Session Totals**: Live token meter in the bottom Status Bar aggregating total session spending.

---

### 7. Conduct (Broadcast) Mode

- Press **`⇧⌘B`** (macOS) or **`Ctrl+Shift+B`** (Windows/Linux) to activate Conduct Mode.
- All keystrokes, commands, and prompts are broadcast simultaneously across all active terminal panes.
- Perfect for running mass test suites (`npm test`), batch installing packages, or giving identical sync instructions to all agents.

---

### 8. Team Templates & Quick Starts

Launch complete multi-agent workflows in seconds from the Welcome Hub (`⌘N`):

- **🏗️ Feature Factory** (4 agents: Architect + Frontend + Backend + QA)
- **🐛 Bug Hunt** (2 agents: Root Cause Investigator + Fixer)
- **🔄 Refactor Sprint** (3 agents: Codebase Analyzer + Refactorer + Test Coverage)
- **📖 Docs Writer** (2 agents: Code Reader + Technical Author)
- **🚀 Full Stack Team** (6 agents: Tech Lead + Frontend + Backend + Database + DevOps + QA)
- **🎯 Solo Focus** (1 agent in a clean, distraction-free environment)

<div align="center">
  <img src="docs/images/orchestraai-welcome-hub.png" alt="OrchestraAI Welcome Hub" width="90%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);" />
</div>

---

## 🤖 Supported AI Coding Agents

OrchestraAI works out of the box with any terminal-based agent or command-line tool:

| Agent / CLI | Command | Protocol / Integration |
| :--- | :--- | :--- |
| **Claude Code** | `claude` | Full MCP Server + Real-time Statusline + Token Sniffing |
| **Google Antigravity** | `agy` | Full MCP Server + Process Detection |
| **OpenAI Codex** | `codex` | Full MCP Server + Process Detection |
| **OpenCode** | `opencode` | Full MCP Server + Process Detection |
| **Google Gemini CLI** | `gemini` | Foreground Process Detection + PTY |
| **DeepSeek Coder** | `deepseek` | Foreground Process Detection + PTY |
| **xAI Grok** | `grok` | Foreground Process Detection + PTY |
| **GitHub Copilot CLI**| `gh copilot`| Foreground Process Detection + PTY |
| **Standard Shells** | `zsh`, `bash`, `fish`, `pwsh` | High-performance Native PTY |

---

## ⌨️ Keyboard Shortcuts

| Action | macOS Shortcut | Windows / Linux Shortcut |
| :--- | :--- | :--- |
| **Command Palette** | `⌘K` or `⌘P` | `Ctrl+K` or `Ctrl+P` |
| **Open Project Folder** | `⌘O` | `Ctrl+O` |
| **New Team Workspace** | `⌘N` | `Ctrl+N` |
| **Quick Terminal** | `⌘T` | `Ctrl+T` |
| **Toggle Primary Sidebar** | `⌘B` | `Ctrl+B` |
| **Toggle Conduct (Broadcast) Mode** | `⇧⌘B` | `Ctrl+Shift+B` |
| **Split Pane Horizontal** | `⌘D` | `Ctrl+D` |
| **Split Pane Vertical** | `⇧⌘D` | `Ctrl+Shift+D` |
| **Close Active Pane** | `⌘W` | `Ctrl+W` |
| **Find in Terminal** | `⌘F` | `Ctrl+F` |
| **Open Settings** | `⌘,` | `Ctrl+,` |
| **Reset UI Zoom (125%)** | `⌘0` | `Ctrl+0` |
| **Zoom In / Out** | `⌘=` / `⌘-` | `Ctrl+=` / `Ctrl+-` |

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

# 2. Install dependencies
npm install

# 3. Launch in development mode
npm run tauri dev

# 4. Run automated test suite (839 passing tests)
npm test

# 5. Build native release package (.dmg / .exe / .AppImage)
npm run tauri build
```

---

## 🛡️ Security & Privacy Philosophy

- **100% Local Execution**: All pseudo-terminals, processes, MCP socket servers, and Git worktrees run entirely on your local machine.
- **Zero Telemetry**: OrchestraAI does not track, collect, or transmit your code, commands, keystrokes, or project metadata.
- **Termination Guard**: Prevents accidental window or pane closures while background AI processes are actively generating code.

---

## 🤝 Contributing & Community

Contributions, feature requests, and bug reports are welcome!

1. Fork the repository on GitHub.
2. Create your feature branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m 'feat: add my feature'`).
4. Ensure all tests pass (`npm test && npx tsc --noEmit`).
5. Push to your branch and submit a Pull Request.

---

## 📜 License

OrchestraAI is free and open-source software licensed under the **[GNU General Public License v3.0 (GPL-3.0)](LICENSE)**.

---

<div align="center">
<sub>Crafted with care by <a href="https://github.com/tuankiet30902">Kiet Tran</a> · Built with <a href="https://tauri.app">Tauri 2</a>, <a href="https://react.dev">React 19</a>, <a href="https://xtermjs.org">xterm.js</a>, and <a href="https://github.com/wez/wezterm/tree/main/pty">portable-pty</a>.</sub>
</div>
