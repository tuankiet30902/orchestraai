# Orchestron v1.0 — Architecture & System Design

**Orchestron** is a native desktop application designed for conducting teams of AI coding agents in parallel. Built with **Tauri 2**, **Rust**, **React 19**, and **TypeScript**, it bridges real operating system PTY terminals with multi-agent coordination protocols.

---

## 1. High-Level Architecture

```mermaid
graph TD
    subgraph UI ["Frontend (React 19 + TypeScript)"]
        Nav["Hierarchical Navbar"]
        Tabs["Compact Workspace Tabs"]
        Grid["xterm.js Split Pane Grid"]
        Right["Right Panel (Files / Git / Orchestra Pit)"]
        Store["Zustand Reactive Stores"]
    end

    subgraph Native ["Rust Backend (Tauri 2 Core)"]
        PTY["PTY Multiplexer Pool (portable-pty)"]
        MCP["Native MCP Streamable-HTTP Server"]
        Git["Git Engine (Worktrees, Diffs, Branches)"]
        Pit["Orchestra Pit Hub & Message Router"]
        FS["File System & Editor Bridge"]
    end

    subgraph Agents ["AI Coding Agents"]
        C1["Claude Code (Pane 1)"]
        C2["Codex / OpenCode (Pane 2)"]
        C3["Antigravity CLI (Pane 3)"]
    end

    Grid <--> Store
    Nav <--> Store
    Right <--> Store
    Store <-->|Tauri IPC (Async Invokes + Events)| Native

    PTY <--> C1 & C2 & C3
    MCP <-->|Streamable-HTTP / Tool Calls| C1 & C2 & C3
    Pit <--> MCP
```

---

## 2. Core Subsystems

### 2.1 PTY Multiplexer & Terminal Engine
- **Engine**: Built on `portable-pty` with asynchronous thread pools.
- **I/O Streaming**: ANSI escape sequences are converted into lossless UTF-8 streams and dispatched directly to `xterm.js` WebGL renderers.
- **Process Trees**: On Windows, child processes are managed via Windows Job Objects; on macOS/Linux, POSIX process groups guarantee complete cleanups on pane termination.

### 2.2 Model Context Protocol (MCP) Integration
- Every terminal pane spawned within Orchestron automatically receives:
  - `ORCHESTRON_MCP_URL`: Local HTTP endpoint bound to the native Rust MCP server.
  - `ORCHESTRON_SESSION`: Ephemeral authentication token scoping the agent to its specific workspace and pane.
- **MCP Tool Endpoints**:
  - `worktree.*`: Inspect, switch, and delegate tasks to isolated Git worktree branches.
  - `orchestra_pit.*`: Broadcast messages, coordinate with peer agents, and query team inboxes.
  - `browser.*`: Open and control live web previews beside the agent's active pane.

### 2.3 Git Worktree Isolation
- Each AI agent can work inside its own Git worktree branch (`orchestra/<role>-<name>`).
- Completely prevents branch collisions, overwrite races, and file locking issues when multiple agents edit the same repository simultaneously.
- **View-Only Inspector**: Live changed file list, syntax-highlighted inline diffs, commit history timeline, and branch network list.

### 2.4 Orchestra Pit Collaboration Protocol
- Central multi-agent chat and task coordination hub.
- Agents can read messages, announce task completions, request feedback from peer agents, or consult the human Conductor.
- Message routing guarantees isolation between independent workspace rooms with automatic moderator privileges.

---

## 3. Technology Stack

- **Runtime**: Tauri 2.0 (Rust 1.80+)
- **Frontend**: React 19, TypeScript (Strict), Vite 6, Tailwind CSS 3.4
- **Terminal Rendering**: xterm.js 5.5 + WebGL Addon
- **State Management**: Zustand 5.0
- **Drag & Drop**: @dnd-kit (Core, Sortable, Utilities)
- **Icons**: Lucide React
