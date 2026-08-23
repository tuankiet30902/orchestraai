<div align="center">

<img src="src-tauri/icons/128x128.png" alt="Orchestron Logo" width="96" height="96" style="border-radius: 24px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);" />

# Orchestron

### **The Multi-Agent AI Coding Studio**
*A native desktop studio to orchestrate, isolate, and conduct teams of autonomous AI coding agents.*

<br />

<p align="center">
  <a href="#-quick-installation"><img src="https://img.shields.io/badge/Download-macOS%20%7C%20Windows%20%7C%20Linux-f59e0b?style=for-the-badge&logo=apple&logoColor=white" alt="Download Orchestron" /></a>
  <a href="https://github.com/tuankiet30902/orchestraai/releases"><img src="https://img.shields.io/github/v/release/tuankiet30902/orchestraai?style=for-the-badge&color=18181b&label=Latest%20Release" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-18181b?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Engine-Tauri_2.0_%7C_Rust-orange?style=flat-square&logo=tauri" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/UI-React_19_%7C_TypeScript-blue?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/PTY-Real_Hardware_Terminals-black?style=flat-square&logo=gnometerminal" alt="PTY Terminals" />
  <img src="https://img.shields.io/badge/Protocol-MCP_(Model_Context_Protocol)-purple?style=flat-square" alt="Model Context Protocol" />
  <img src="https://img.shields.io/badge/Test_Suite-839_Passed-emerald?style=flat-square" alt="839 Passing Unit Tests" />
</p>

<br />

<img src="docs/images/orchestron-workspace-preview.png" alt="Orchestron Studio Workspace" width="100%" style="border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 30px 70px rgba(0, 0, 0, 0.7);" />

</div>

<br />

---

## 📖 What is Orchestron?

**Orchestron** is a high-performance desktop engineering studio built from the ground up to solve a fundamental problem in modern software development: **how to effectively manage and collaborate with multiple autonomous AI coding agents at the same time.**

Running a single AI coding agent (like Claude Code, Antigravity, or Codex) inside a standard terminal works well for small, isolated tasks. But when building production-grade software requiring an **Architect**, a **Frontend Engineer**, a **Backend Engineer**, and a **QA Tester**, standard terminal emulators immediately break down.

Orchestron unifies **hardware pseudo-terminal multiplexing**, **per-agent Git worktree isolation**, an **inter-agent Model Context Protocol (MCP) collaboration room**, and **live web application previews with visual DOM inspection** into a single native desktop application.

```
                     ┌────────────────────────────────────────────────────────┐
                     │              ORCHESTRON DESKTOP STUDIO                │
                     │                 (You as the Conductor)                 │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
            ┌───────────────────┬────────────────┴──────────────────┬───────────────────┐
            ▼                   ▼                                   ▼                   ▼
   ┌─────────────────┐ ┌─────────────────┐                 ┌─────────────────┐ ┌─────────────────┐
   │ 🏗️ Architect    │ │ 🎨 Frontend     │                 │ ⚙️ Backend      │ │ 🧪 QA Tester    │
   │ (Claude Code)   │ │ (Antigravity)   │                 │ (Codex/Claude)  │ │ (DeepSeek/Gemini)│
   └────────┬────────┘ └────────┬────────┘                 └────────┬────────┘ └────────┬────────┘
            │                   │                                   │                   │
            │                   │   💬 THE ORCHESTRA PIT (MCP)      │                   │
            └───────────────────┴───► Agents talk & sync contracts  ◄───┴───────────────────┘
                                                 │
            ┌───────────────────┬────────────────┴──────────────────┬───────────────────┐
            ▼                   ▼                                   ▼                   ▼
   ┌─────────────────┐ ┌─────────────────┐                 ┌─────────────────┐ ┌─────────────────┐
   │ Git Worktree    │ │ Git Worktree    │                 │ Git Worktree    │ │ Git Worktree    │
   │ orchestra/arch  │ │ orchestra/fe    │                 │ orchestra/be    │ │ orchestra/qa    │
   └─────────────────┘ └────────┬────────┘                 └─────────────────┘ └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ 🌐 Live Browser │
                       │ Click DOM to    │
                       │ Prompt Agent    │
                       └─────────────────┘
```

---

## ⚡ Quick Installation

Pre-built binaries are standalone, lightweight (~10MB installer), and require zero background daemons.

### 🍎 macOS (Apple Silicon M1/M2/M3/M4 & Intel x86_64)
Run in your terminal:
```bash
curl -fsSL https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.sh | bash
```
> Or download the standalone disk image: [**Orchestron_0.1.1_universal.dmg**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.1/Orchestron_0.1.1_universal.dmg)

### 🪟 Windows (Windows 10 / 11 64-bit)
Run in PowerShell (Run as Administrator or standard user):
```powershell
irm https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.ps1 | iex
```
> Or download the installer: [**Orchestron_0.1.1_x64-setup.exe**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.1/Orchestron_0.1.1_x64-setup.exe) · [**Enterprise MSI**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.1/Orchestron_0.1.1_x64_en-US.msi)

### 🐧 Linux (Ubuntu, Debian, Fedora, Arch, RHEL)
```bash
curl -fsSL https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.sh | bash
```
> Direct packages: [**Universal .AppImage**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.1/Orchestron_0.1.1_amd64.AppImage) · [**Debian / Ubuntu (.deb)**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.1/Orchestron_0.1.1_amd64.deb) · [**Fedora / RHEL (.rpm)**](https://github.com/tuankiet30902/orchestraai/releases/download/v0.1.1/Orchestron-0.1.1-1.x86_64.rpm)

---

## 🎯 The Five Core Problems Orchestron Solves

| Problem in Multi-Agent Workflows | What Happens in Traditional Terminals | How Orchestron Solves It |
| :--- | :--- | :--- |
| **1. Blind Multi-Tasking & Hidden Status** | Tabs hide background agent output. You don't know which agent is still thinking, which is blocked waiting for user confirmation, or which finished. | **Live Split Panes + State Sniffing LEDs**: Every pane displays real-time status indicators: 🟡 Generating, 🔵 Awaiting Permission, 🟢 Idle. |
| **2. Destructive Git File Collisions** | When 3 agents write to the same folder at once, they overwrite each other's unstaged files, break builds, and create impossible merge conflicts. | **Isolated Git Worktrees**: Automatically provisions isolated working trees on dedicated branches (`orchestra/<role>`). Each agent has its own folder. |
| **3. Context Silos & Manual Relaying** | Agents cannot communicate. If Frontend needs Backend's newly created API contract, the developer must manually copy-paste JSON schemas across tabs. | **The Orchestra Pit (MCP Server)**: An integrated collaboration room. Agents call MCP tools (`list_peers`, `send_message`, `read_inbox`) to sync autonomously. |
| **4. Disconnected Web UI Feedback** | Agents modify frontend components without seeing the rendered DOM. The developer must switch to Chrome, inspect elements, and copy selectors manually. | **Live Web Browser + DOM Inspector**: Embedded browser automatically detects local servers. Click any UI element and send annotated prompt instructions with DOM context directly to the agent. |
| **5. Cost & Token Blindness** | Running 4–6 agents concurrently can burn millions of tokens without warning until an API invoice arrives. | **Real-Time Token & USD Ticker**: Sniffs context window metrics from agent outputs and displays live per-terminal and session-wide USD cost metrics in the Status Bar HUD. |

---

## 🛠️ Deep Dive: The 5 Core Architecture Pillars

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ORCHESTRON STUDIO                              │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. Terminal Core & PTY        │ Real OS PTYs (portable-pty), infinite split │
│                               │ grid, dynamic zoom, process sniffing.       │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 2. The Orchestra Pit (MCP)    │ Embedded loopback MCP Server, peer discovery│
│                               │ inbox delivery, drag-and-drop assignment.   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 3. Git Worktree Isolation     │ Per-agent branch isolation, visual diff     │
│                               │ viewer, conflict-free parallel building.    │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 4. Live Web Preview & DOM     │ Localhost auto-discovery, element picker,   │
│                               │ 1-click prompt annotation to terminal.      │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 5. HUD, Themes & Control      │ Token cost tracker, Command Palette (⌘K),   │
│                               │ Conduct broadcast mode, 7 color themes.     │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

### Pillar 1: Hardware Pseudo-Terminals (PTY) & Real-Time Process Sniffing

Orchestron does not use web socket simulations or fake shells. It embeds a native **Rust PTY engine** using `portable-pty` and `xterm.js`.

- **Infinite Split Grid**: Split horizontally (`⌘D`) or vertically (`⇧⌘D`). Rearrange panes with drag-and-drop tabs.
- **Process Sniffing Engine**: Scans foreground processes to detect active CLI agents:
  - `claude` ➔ Claude Code
  - `agy` ➔ Google Antigravity
  - `codex` ➔ OpenAI Codex
  - `opencode` ➔ OpenCode
  - `gemini` ➔ Google Gemini CLI
  - `deepseek` ➔ DeepSeek Coder
  - `zsh` / `bash` / `fish` / `pwsh` ➔ Shell
- **Dynamic Terminal Font Scaling**: Adjust terminal font sizes per pane (`⌘+`, `⌘-`, `⌘0`) without affecting the rest of the application interface.
- **Conduct (Broadcast) Mode (`⇧⌘B`)**: Broadcast keystrokes and commands simultaneously across all open panes (e.g. running `git pull` or `npm test` across all worktrees in one keystroke).

<div align="center">
  <img src="docs/images/orchestron-multi-agent-split.png" alt="Orchestron Split Terminal Grid" width="88%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); margin: 12px 0;" />
</div>

---

### Pillar 2: The Orchestra Pit — Autonomous Agent Collaboration via MCP

The **Orchestra Pit** is an integrated inter-agent messaging system powered by the **Model Context Protocol (MCP)**. Orchestron hosts an embedded loopback MCP server on `localhost` with authorization tokens injected directly into agent terminal sessions.

#### How Agents Communicate in the Pit:
1. **Peer Discovery**: Connected agents call `war_room.list_peers` to see who else is in the room.
2. **Autonomous Messaging**: An agent calls `war_room.send_message` with:
   - `target`: The recipient agent (or `all`).
   - `content`: The message, API specification, or pull request review request.
   - `mode`: `probe` (non-blocking notification) or `execute` (prompts the receiving agent).
3. **Inbox Reading**: Receiving agents call `war_room.read_inbox` to consume pending messages and data contracts.
4. **Conductor Intervention**: The human developer can view the entire live conversation in the Orchestra Pit panel, jump in with guidance, or broadcast directives.

<div align="center">
  <img src="docs/images/orchestron-pit-collaboration.png" alt="Orchestra Pit MCP Collaboration" width="88%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); margin: 12px 0;" />
</div>

---

### Pillar 3: Zero-Collision Git Worktree Isolation & Visual Diff Viewer

When multiple agents work on a single repository simultaneously, file conflicts normally make parallel development impossible. Orchestron solves this with **Git Worktrees**.

- **Automatic Worktree Creation**: Each agent pane is assigned its own dedicated folder and branch (`orchestra/<role-name>`), branching cleanly off `main`.
- **Independent Build & Test Environments**: Frontend agent can run `npm install` and modify UI files while Backend agent compiles Rust/Go code in parallel without lockfile conflicts.
- **Integrated Source Control Sidebar**:
  - Review Staged and Unstaged changes in real time.
  - Interactive file expansion with syntax-highlighted diffs (side-by-side or unified).
  - One-click Stage All, Unstage All, Commit, and Merge.

<div align="center">
  <img src="docs/images/orchestron-git-worktrees.png" alt="Source Control & Worktree Inspector" width="88%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); margin: 12px 0;" />
</div>

---

### Pillar 4: Live Web Application Preview & Visual DOM Inspector

No need to keep switching between your code editor and Google Chrome. Orchestron provides a native embedded webview column:

- **Localhost Discovery**: Automatically senses active dev server ports (`3000`, `5173`, `8080`, `4173`, etc.) and opens the live preview.
- **Click-to-Prompt Element Picker**: Click any button, card, or navigation element in the web preview to select it.
- **1-Click Context Injection**: Enter an instruction (e.g. *"Change this card layout to CSS Grid and make the border amber on hover"*) and click **Send to Agent**. Orchestron extracts the exact DOM hierarchy, class names, and CSS selectors and types them directly into the active agent terminal.

---

### Pillar 5: Developer Ergonomics, Token Tracker & Command Palette

- **Real-Time Token & USD Tracker**: Parses context window status lines and output streams to display prompt tokens, output tokens, cache hits, and calculated USD costs in real time (supporting Claude 3.7, Claude 3.5, GPT-4o, Gemini 2.5 Pro, DeepSeek V3).
- **Raycast-Style Command Palette (`⌘K` / `⌘P`)**: Search workspaces, trigger team templates, switch color themes, and adjust UI scaling.
- **7 Pro Developer Themes**:
  - 🟧 **Orchestra Amber** (Warm Obsidian Dark — Default)
  - 🟦 **VS Code Dark Blue**
  - 🩵 **Tokyo Cyan Neon**
  - 🟩 **Emerald Green Dark**
  - 🟪 **Amethyst Violet Dark**
  - 🌸 **Rose Pink Dark**
  - ☀️ **Orchestra Light Luxury**
- **System-Wide UI Scaling**: Default 125% zoom for high-DPI crisp readability, adjustable from 80% to 150% with instant `⌘0` reset.

---

## 🚀 Step-by-Step Walkthrough: Building a Feature from Scratch

Here is how a developer builds a complete feature using Orchestron in 5 minutes:

```
Step 1: Open Project (⌘O) ➔ Select your repository folder.
Step 2: Launch "Feature Factory" Template (⌘N) ➔ 4 agents start automatically in split panes.
Step 3: Architect Agent analyzes requirements and shares API contract in the Orchestra Pit.
Step 4: Frontend and Backend agents read the contract from the Pit, create isolated worktrees, and build in parallel.
Step 5: Live Browser automatically displays localhost:5173. You click a button in the preview to refine the UI.
Step 6: QA Agent runs the test suite, verifies zero regressions, and posts "All green ✅" in the Pit.
Step 7: Review visual diffs in the Git sidebar and merge the feature branch cleanly to main.
```

---

## 📋 Pre-Configured Team Workflows (Templates)

Orchestron includes pre-built team configurations with tailored system role prompts:

| Template | Icon | Team Composition | Best For |
| :--- | :---: | :--- | :--- |
| **Feature Factory** | 🏗️ | Architect + Frontend + Backend + QA (4 Agents) | End-to-end full-stack feature development |
| **Bug Hunt** | 🐛 | Root Cause Investigator + Fixer & Tester (2 Agents) | Rapidly diagnosing and fixing complex bugs |
| **Refactor Sprint** | 🔄 | Code Analyzer + Structural Refactorer + Test Coverage (3 Agents) | Modernizing legacy codebases safely |
| **Docs Writer** | 📖 | Code Reader + Technical Author (2 Agents) | Generating accurate, hallucination-free documentation |
| **Full Stack Team** | 🚀 | Tech Lead + Frontend + Backend + Database + DevOps + QA (6 Agents) | Major architectural milestones |
| **Solo Focus** | 🎯 | Single Focused Agent (1 Agent) | Focused 1-on-1 pair programming |

---

## 🤖 Supported Coding Agents & LLM Tools

Orchestron is agent-agnostic and works with any command-line coding tool:

| Agent / CLI | Command | Integration Level |
| :--- | :--- | :--- |
| **Anthropic Claude Code** | `claude` | Deep MCP Integration + Statusline JSON + Real-time Token Tracker |
| **Google Antigravity** | `agy` | Deep MCP Integration + Subagent Hierarchy + Process Detection |
| **OpenAI Codex** | `codex` | Built-in MCP Server + Process Detection |
| **OpenCode** | `opencode` | Built-in MCP Server + Process Detection |
| **Google Gemini CLI** | `gemini` | Real Hardware PTY + Process Detection |
| **DeepSeek Coder** | `deepseek` | Real Hardware PTY + Process Detection |
| **xAI Grok CLI** | `grok` | Real Hardware PTY + Process Detection |
| **GitHub Copilot CLI** | `gh copilot` | Real Hardware PTY + Process Detection |
| **Native Shells** | `zsh`, `bash`, `fish`, `pwsh` | Full PTY multiplexing with VT100/Xterm emulation |

---

## ⌨️ Complete Keyboard Shortcuts Cheat Sheet

### Navigation & Command Center
| macOS Shortcut | Windows / Linux Shortcut | Description |
| :--- | :--- | :--- |
| <kbd>⌘</kbd> <kbd>K</kbd> or <kbd>⌘</kbd> <kbd>P</kbd> | <kbd>Ctrl</kbd> <kbd>K</kbd> or <kbd>Ctrl</kbd> <kbd>P</kbd> | Open Command Palette |
| <kbd>⌘</kbd> <kbd>O</kbd> | <kbd>Ctrl</kbd> <kbd>O</kbd> | Open Project Directory |
| <kbd>⌘</kbd> <kbd>N</kbd> | <kbd>Ctrl</kbd> <kbd>N</kbd> | New Team Workspace (Welcome Hub) |
| <kbd>⌘</kbd> <kbd>,</kbd> | <kbd>Ctrl</kbd> <kbd>,</kbd> | Open Settings & Preferences |
| <kbd>⌘</kbd> <kbd>0</kbd> | <kbd>Ctrl</kbd> <kbd>0</kbd> | Reset UI Zoom to Default (125%) |
| <kbd>⌘</kbd> <kbd>+</kbd> / <kbd>⌘</kbd> <kbd>-</kbd> | <kbd>Ctrl</kbd> <kbd>+</kbd> / <kbd>Ctrl</kbd> <kbd>-</kbd> | Zoom Application In / Out |

### Panes & Terminals
| macOS Shortcut | Windows / Linux Shortcut | Description |
| :--- | :--- | :--- |
| <kbd>⌘</kbd> <kbd>T</kbd> | <kbd>Ctrl</kbd> <kbd>T</kbd> | Quick Terminal Pane |
| <kbd>⌘</kbd> <kbd>D</kbd> | <kbd>Ctrl</kbd> <kbd>D</kbd> | Split Pane Horizontally (Side-by-side) |
| <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>D</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>D</kbd> | Split Pane Vertically (Top-and-bottom) |
| <kbd>⌘</kbd> <kbd>W</kbd> | <kbd>Ctrl</kbd> <kbd>W</kbd> | Close Focused Terminal Pane |
| <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>B</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>B</kbd> | **Toggle Conduct (Broadcast) Mode** |
| <kbd>⌘</kbd> <kbd>F</kbd> | <kbd>Ctrl</kbd> <kbd>F</kbd> | Find / Search in Terminal Buffer |

### Sidebars & Views
| macOS Shortcut | Windows / Linux Shortcut | Description |
| :--- | :--- | :--- |
| <kbd>⌘</kbd> <kbd>B</kbd> | <kbd>Ctrl</kbd> <kbd>B</kbd> | Toggle Primary Sidebar |
| <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>E</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>E</kbd> | Open Workspaces & Explorer Tab |
| <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>F</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>F</kbd> | Open Project Files Tree Tab |
| <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>G</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>G</kbd> | Open Source Control & Git Tab |
| <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>P</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>P</kbd> | Open Orchestra Pit Tab |

---

## 🛠️ Building & Developing from Source

### Requirements
- **Node.js 18+** & `npm` ([nodejs.org](https://nodejs.org))
- **Rust Toolchain (1.80+ stable)** ([rustup.rs](https://rustup.rs))
- **C Compiler & CMake** (Xcode Command Line Tools on macOS, Build Tools on Windows)

```bash
# 1. Clone the repository
git clone https://github.com/tuankiet30902/orchestraai.git
cd orchestron

# 2. Install dependencies
npm install

# 3. Launch in desktop development mode (Hot-reload React + Rust backend)
npm run tauri dev

# 4. Run full test suite (839 passing unit tests)
npm test

# 5. Type-check TypeScript
npx tsc --noEmit

# 6. Build production desktop release package (.dmg / .exe / .AppImage)
npm run tauri build
```

---

## 🛡️ Security, Privacy & Local-First Philosophy

- **Zero Cloud Relay / 100% Local**: All pseudo-terminals, MCP sockets, Git worktrees, and IPC commands run entirely on your local machine.
- **Zero Telemetry**: Orchestron contains no analytics trackers, advertising IDs, or telemetry. Your proprietary code and prompts remain private.
- **Termination Guard**: Prevents accidental application closing while background AI agents are actively executing commands or generating code.

---

## 🤝 Contributing

We welcome community contributions, bug reports, and suggestions!

1. Fork the repository on GitHub.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Ensure all tests pass (`npm test && npx tsc --noEmit`).
4. Commit your changes (`git commit -m 'feat: add amazing feature'`).
5. Push to your branch and open a Pull Request.

---

## 📜 License

Orchestron is free and open-source software licensed under the **[GNU General Public License v3.0 (GPL-3.0)](LICENSE)**.

<br />

<div align="center">
  <sub>Developed with ❤️ by <a href="https://github.com/tuankiet30902">Kiet Tran</a> · Powered by <a href="https://tauri.app">Tauri 2</a>, <a href="https://react.dev">React 19</a>, <a href="https://xtermjs.org">xterm.js</a>, and <a href="https://github.com/wez/wezterm/tree/main/pty">portable-pty</a>.</sub>
</div>

