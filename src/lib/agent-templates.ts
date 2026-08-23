/**
 * agent-templates.ts — Rich Orchestron workspace templates.
 * Each template defines a full team configuration with role-specific prompts.
 */

export type TemplateCategory = 'development' | 'maintenance' | 'writing' | 'exploration';

export interface AgentSlot {
  /** Agent CLI id (e.g. 'claude-code', 'codex', 'opencode'), or null = plain terminal */
  agentId: string | null;
  /** Display name for this role */
  role: string;
  /** Initial prompt to send when the agent starts */
  initialPrompt: string;
}

export interface OrchestraTemplate {
  id: string;
  name: string;
  icon: string;
  category: TemplateCategory;
  description: string;
  tagline: string;
  /** Agent slots in layout order */
  agents: AgentSlot[];
  /** Enable git worktrees by default */
  worktreeMode: boolean;
}

export const ORCHESTRA_TEMPLATES: OrchestraTemplate[] = [
  {
    id: 'feature-factory',
    name: 'Feature Factory',
    icon: 'Layers',
    category: 'development',
    tagline: 'Design → Build → Test → Review',
    description: 'A 4-agent team that takes a feature from spec to shipped. The Architect plans, Frontend and Backend build in parallel, QA verifies.',
    worktreeMode: true,
    agents: [
      {
        agentId: 'claude-code',
        role: 'Architect',
        initialPrompt: 'You are the Architect. Start by reading the codebase and creating a short design doc for the feature we will build. List the files to create/modify and the data contracts between frontend and backend. Then coordinate with the team via Orchestra Pit.',
      },
      {
        agentId: 'claude-code',
        role: 'Frontend',
        initialPrompt: 'You are the Frontend engineer. Wait for the Architect to share the design doc in Orchestra Pit, then implement the UI components. Focus on the React/TypeScript layer. Check Orchestra Pit for updates.',
      },
      {
        agentId: 'claude-code',
        role: 'Backend',
        initialPrompt: 'You are the Backend engineer. Wait for the Architect\'s design doc in Orchestra Pit, then implement the API/Rust layer. Focus on correctness and tests. Check Orchestra Pit regularly.',
      },
      {
        agentId: 'claude-code',
        role: 'QA',
        initialPrompt: 'You are QA. Monitor Orchestra Pit for completion signals from Frontend and Backend. Then run all tests, look for edge cases, and report issues back to the team via Orchestra Pit.',
      },
    ],
  },
  {
    id: 'bug-hunt',
    name: 'Bug Hunt',
    icon: 'Bug',
    category: 'maintenance',
    tagline: 'Investigate → Fix → Verify',
    description: 'Two agents: one investigates the root cause while the other prepares the fix environment. Faster than a single agent context-switching.',
    worktreeMode: true,
    agents: [
      {
        agentId: 'claude-code',
        role: 'Investigator',
        initialPrompt: 'You are the Investigator. Reproduce the bug, trace its root cause through the code, and share your findings in the Orchestra Pit. Be specific: which file, which line, why it happens.',
      },
      {
        agentId: 'claude-code',
        role: 'Fixer',
        initialPrompt: 'You are the Fixer. Wait for the Investigator to report the root cause in Orchestra Pit, then implement the minimal fix with a regression test. Do not change anything unrelated to the bug.',
      },
    ],
  },
  {
    id: 'refactor-sprint',
    name: 'Refactor Sprint',
    icon: 'GitPullRequest',
    category: 'maintenance',
    tagline: 'Analyze → Refactor → Test',
    description: 'Three agents tackle a refactor in parallel: analysis, transformation, and test coverage. Each works in its own worktree branch.',
    worktreeMode: true,
    agents: [
      {
        agentId: 'claude-code',
        role: 'Analyzer',
        initialPrompt: 'You are the Analyzer. Survey the codebase area to refactor. Identify all coupling points, dead code, and improvement opportunities. Post a prioritized refactor plan to Orchestra Pit.',
      },
      {
        agentId: 'claude-code',
        role: 'Refactorer',
        initialPrompt: 'You are the Refactorer. Wait for the Analyzer\'s plan in Orchestra Pit, then execute the structural changes. Keep each commit focused. Update Orchestra Pit when each chunk is done.',
      },
      {
        agentId: 'claude-code',
        role: 'Test Coverage',
        initialPrompt: 'You are responsible for test coverage. As the Refactorer makes changes (check Orchestra Pit), ensure tests exist for each refactored area. Add missing tests and fix broken ones.',
      },
    ],
  },
  {
    id: 'docs-writer',
    name: 'Docs Writer',
    icon: 'FileCode',
    category: 'writing',
    tagline: 'Read Code → Write Docs',
    description: 'Two agents: one reads the codebase to extract facts, one writes clear human documentation. Produces accurate, readable docs without hallucination.',
    worktreeMode: false,
    agents: [
      {
        agentId: 'claude-code',
        role: 'Code Reader',
        initialPrompt: 'You are the Code Reader. Systematically read the codebase and extract key facts: what each module does, its public API, usage patterns, gotchas. Post structured summaries to Orchestra Pit for the Doc Author.',
      },
      {
        agentId: 'claude-code',
        role: 'Doc Author',
        initialPrompt: 'You are the Doc Author. Read summaries posted by the Code Reader in Orchestra Pit, then write clear, accurate documentation. Focus on the reader — not the implementer. Ask the Code Reader for clarification when needed.',
      },
    ],
  },
  {
    id: 'full-stack',
    name: 'Full Stack Team',
    icon: 'Cpu',
    category: 'development',
    tagline: 'A complete engineering team',
    description: 'Six agents covering the full stack: Lead, Frontend, Backend, Database, DevOps, and QA. For ambitious features that touch every layer.',
    worktreeMode: true,
    agents: [
      {
        agentId: 'claude-code',
        role: 'Tech Lead',
        initialPrompt: 'You are the Tech Lead. Create the architecture plan, divide work, and coordinate through Orchestra Pit. Keep the team unblocked. Make cross-cutting decisions.',
      },
      {
        agentId: 'claude-code',
        role: 'Frontend',
        initialPrompt: 'You are Frontend. Build the UI layer following the Tech Lead\'s architecture. Post progress and blockers to Orchestra Pit.',
      },
      {
        agentId: 'claude-code',
        role: 'Backend',
        initialPrompt: 'You are Backend. Implement the server layer and business logic. Post progress to Orchestra Pit.',
      },
      {
        agentId: 'claude-code',
        role: 'Database',
        initialPrompt: 'You are Database. Handle schema design, migrations, and query optimization. Coordinate with Backend via Orchestra Pit.',
      },
      {
        agentId: 'claude-code',
        role: 'DevOps',
        initialPrompt: 'You are DevOps. Handle CI/CD, environment config, and build tooling. Ensure the other agents\' work integrates cleanly.',
      },
      {
        agentId: 'claude-code',
        role: 'QA',
        initialPrompt: 'You are QA. Write and run tests as features land. Report bugs via Orchestra Pit. Ensure nothing ships untested.',
      },
    ],
  },
  {
    id: 'solo-focus',
    name: 'Solo Focus',
    icon: 'Terminal',
    category: 'exploration',
    tagline: 'One agent, full attention',
    description: 'A single focused agent in a clean workspace. Best for exploration, investigation, or when you want to work alongside one AI partner.',
    worktreeMode: false,
    agents: [
      {
        agentId: 'claude-code',
        role: 'Assistant',
        initialPrompt: '',
      },
    ],
  },
];

/** Look up a template by id. */
export function getTemplate(id: string): OrchestraTemplate | undefined {
  return ORCHESTRA_TEMPLATES.find(t => t.id === id);
}

/** Group templates by category. */
export function templatesByCategory(): Record<TemplateCategory, OrchestraTemplate[]> {
  const result: Record<TemplateCategory, OrchestraTemplate[]> = {
    development: [], maintenance: [], writing: [], exploration: [],
  };
  for (const t of ORCHESTRA_TEMPLATES) result[t.category].push(t);
  return result;
}
