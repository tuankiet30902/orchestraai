<div align="center">

# OrchestraAI

**Conduct your AI coding orchestra.**

Real split terminals, one git worktree per agent — coordinate, collaborate, and conduct a whole team of AI agents from a single window.

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)

</div>

---

## What it is

Running **one** coding agent in a terminal works fine. Running **five** is where things break down: tabs hide activity, agents overwrite each other's code, and you become the bottleneck copy-pasting prompts between windows.

OrchestraAI is a native desktop app (Tauri 2 + Rust, real PTY terminals) built around three ideas:

**See the whole orchestra.** A workspace is one window of real split terminal panes — live titles, activity indicators on any pane still producing output, and Conduct mode for when every agent should hear the same instruction at once.

**Keep the work separate.** One switch gives every agent its own git worktree on its own branch — clean, reviewable diffs from the very first edit, with a built-in git panel to inspect them without leaving the app.

**Agents are part of the team.** Every pane connects to OrchestraAI itself via MCP, so agents don't just run *in* it: they open live web previews beside their own pane, spin up isolated worktrees to delegate subtasks, and collaborate with each other in the **Orchestra Pit** — with you as conductor.

---

## Install & run

### Build from source

```bash
git clone https://github.com/tuankiet30902/orchestraai.git
cd orchestraai
npm install
npm run tauri dev
```

Requires **Node.js 18+** and a stable **Rust** toolchain from [rustup.rs](https://rustup.rs).

---

## Contributing

Bug reports and questions welcome in [issues](https://github.com/tuankiet30902/orchestraai/issues). OrchestraAI is free software under [GPL-3.0](LICENSE).

---

<sub>Built on [Tauri](https://tauri.app), [xterm.js](https://xtermjs.org) and [portable-pty](https://github.com/wez/wezterm/tree/main/pty).</sub>
