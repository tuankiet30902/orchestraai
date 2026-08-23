# OrchestraAI User & Conductor Guide

Welcome to **OrchestraAI** — the native AI multi-agent collaborative development studio designed to conduct entire teams of autonomous coding agents.

---

## 📖 Table of Contents
1. [Getting Started](#1-getting-started)
2. [Workspaces & Split Panes](#2-workspaces--split-panes)
3. [Agent Badges & Terminal Renaming](#3-agent-badges--terminal-renaming)
4. [The Orchestra Pit (Multi-Agent Collaboration)](#4-the-orchestra-pit)
5. [Live Web Preview & Visual UI Inspector](#5-live-web-preview--visual-ui-inspector)
6. [Git Worktrees & Diff Inspector](#6-git-worktrees--diff-inspector)
7. [Conduct (Broadcast) Mode](#7-conduct-broadcast-mode)
8. [Keyboard Shortcuts Reference](#8-keyboard-shortcuts-reference)

---

## 1. Getting Started

### 1.1 Welcome Hub
When you launch OrchestraAI, you are greeted with the **Welcome Hub**:
- **Open Folder (`⌘O`)**: Instantly open any existing project directory.
- **Quick Terminal (`⌘T`)**: Spawn a standalone terminal in your home folder.
- **Team Workspace (`⌘N`)**: Configure a multi-agent team with pre-built role templates and automated Git worktrees.
- **Recent Projects**: Quickly resume any of your recently opened workspaces with 1 click.

---

## 2. Workspaces & Split Panes

### 2.1 Workspace Tabs
- Workspaces live in independent tabs in the top tab bar.
- Each workspace maintains its own set of terminals, agent states, and working folders.
- Double-click any tab title in the tab bar or left sidebar to rename it.

### 2.2 Flexible Split Panes
- **Split Horizontal (`⌘D`)**: Splits the active terminal pane horizontally (top & bottom).
- **Split Vertical (`⇧⌘D`)**: Splits the active terminal pane vertically (side-by-side).
- **Drag to Reorder**: Click and drag any pane header to rearrange terminals across the split grid.

---

## 3. Agent Badges & Terminal Renaming

### 3.1 Official Agent Logos
OrchestraAI automatically recognizes and displays official vector logos for running agents:
- 🤖 **Claude Code** (Anthropic)
- ⚡ **Antigravity** (Google DeepMind)
- 🌸 **Codex** (OpenAI)
- ♊ **Gemini Code** (Google)
- 🚀 **OpenCode, DeepSeek, Grok, Copilot**

### 3.2 Inline Terminal Renaming
- Double-click any terminal name in the **Left Sidebar** or **Pane Header** to rename it.
- Give agents clear team roles such as *"Frontend Architect"*, *"Backend API"*, or *"QA Unit Tests"*.
- Press `Enter` to commit the name, or `Esc` to cancel.

---

## 4. The Orchestra Pit

The **Orchestra Pit** is the central collaboration room where AI agents communicate with each other in real time via the **Model Context Protocol (MCP)**.

### 4.1 Adding Terminals to Orchestra Pit
- **Drag & Drop**: Drag any terminal pane header directly into the Orchestra Pit drop zone.
- **Dropdown Menu**: In the Orchestra Pit Members tab, click `+ Add pane` and pick any open terminal from any workspace.
- **Left Sidebar**: Click the `...` menu on any terminal and select **"Add to Orchestra Pit"**.

### 4.2 How Agents Collaborate
- Agents share architectural plans, API schemas, and task completion signals.
- You can broadcast conductor directives to the entire room or message specific agents directly.

---

## 5. Live Web Preview & Visual UI Inspector

### 5.1 Embedded Browser
- The right panel features a built-in browser column supporting `localhost` dev servers (Vite, Next.js, React, Astro, etc.).
- Auto-detects local URLs from terminal output.

### 5.2 Visual UI Inspector & Annotation
- Click the **Target Element** icon in the browser toolbar to inspect any DOM element on the page.
- Type an instruction (e.g. *"Refactor this card component into Tailwind CSS with dark mode support"*).
- Click **"Send to Agent"** to automatically format and dispatch the annotated prompt with the DOM selector directly into the active agent terminal.

---

## 6. Git Worktrees & Diff Inspector

### 6.1 Zero-Conflict Branch Isolation
- When enabled during workspace creation, each agent receives its own dedicated Git worktree branch (`orchestra/<agent-role>`).
- Prevents agents from overwriting each other's work while developing features in parallel.

### 6.2 Source Control Panel
- Open the Source Control panel (`⌘⇧G`) to view:
  - Modified, added, and deleted files with status badges.
  - Inline syntax-colored diffs (green additions, red deletions).
  - Commit history log and branch management.

---

## 7. Conduct (Broadcast) Mode

- Press **`⇧⌘B`** (or `Ctrl+Shift+B` on Windows/Linux) to toggle **Conduct Mode**.
- While active, any keystroke or prompt typed is mirrored simultaneously to all active agent panes.
- Perfect for running mass tests, installing dependencies, or issuing team-wide instructions.

---

## 8. Keyboard Shortcuts Reference

| Command | macOS | Windows / Linux |
| :--- | :--- | :--- |
| **Open Project Folder** | `⌘O` | `Ctrl+O` |
| **Quick Terminal** | `⌘T` | `Ctrl+T` |
| **New Team Workspace** | `⌘N` | `Ctrl+N` |
| **Toggle Sidebar** | `⌘B` | `Ctrl+B` |
| **Toggle Broadcast / Conduct** | `⇧⌘B` | `Ctrl+Shift+B` |
| **Split Pane Horizontal** | `⌘D` | `Ctrl+D` |
| **Split Pane Vertical** | `⇧⌘D` | `Ctrl+Shift+D` |
| **Close Active Pane** | `⌘W` | `Ctrl+W` |
| **Search in Terminal** | `⌘F` | `Ctrl+F` |
| **Open Settings** | `⌘,` | `Ctrl+,` |
| **Next Tab** | `⌃Tab` | `Ctrl+Tab` |
| **Previous Tab** | `⌃⇧Tab` | `Ctrl+Shift+Tab` |
