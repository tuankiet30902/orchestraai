/**
 * token-tracker.ts — Parse and accumulate token usage from terminal output.
 *
 * Sources:
 * 1. Claude Code status-line JSON on stdin (already piped via --statusline)
 * 2. Pattern matching in terminal output text for common patterns
 *
 * This is pure — no side effects, injectable for tests.
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
}

export interface CostEstimate {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
}

export interface ModelPricing {
  inputPerMillion: number;   // USD per 1M input tokens
  outputPerMillion: number;  // USD per 1M output tokens
  cacheReadPerMillion: number;
  cacheWritePerMillion: number;
}

// Pricing table (as of mid-2025 — user can override in settings)
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-3-5-sonnet': { inputPerMillion: 3.0, outputPerMillion: 15.0, cacheReadPerMillion: 0.3, cacheWritePerMillion: 3.75 },
  'claude-3-7-sonnet': { inputPerMillion: 3.0, outputPerMillion: 15.0, cacheReadPerMillion: 0.3, cacheWritePerMillion: 3.75 },
  'claude-sonnet-4': { inputPerMillion: 3.0, outputPerMillion: 15.0, cacheReadPerMillion: 0.3, cacheWritePerMillion: 3.75 },
  'claude-opus-4': { inputPerMillion: 15.0, outputPerMillion: 75.0, cacheReadPerMillion: 1.5, cacheWritePerMillion: 18.75 },
  'gpt-4o': { inputPerMillion: 2.5, outputPerMillion: 10.0, cacheReadPerMillion: 1.25, cacheWritePerMillion: 2.5 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.6, cacheReadPerMillion: 0.075, cacheWritePerMillion: 0.15 },
  'gemini-2.0-flash': { inputPerMillion: 0.075, outputPerMillion: 0.30, cacheReadPerMillion: 0.01875, cacheWritePerMillion: 0.075 },
  'gemini-2.5-pro': { inputPerMillion: 1.25, outputPerMillion: 10.0, cacheReadPerMillion: 0.31, cacheWritePerMillion: 1.25 },
  'antigravity': { inputPerMillion: 1.25, outputPerMillion: 10.0, cacheReadPerMillion: 0.31, cacheWritePerMillion: 1.25 },
  'agy': { inputPerMillion: 1.25, outputPerMillion: 10.0, cacheReadPerMillion: 0.31, cacheWritePerMillion: 1.25 },
  'deepseek-v3': { inputPerMillion: 0.27, outputPerMillion: 1.10, cacheReadPerMillion: 0.07, cacheWritePerMillion: 0.27 },
  'default': { inputPerMillion: 3.0, outputPerMillion: 15.0, cacheReadPerMillion: 0.3, cacheWritePerMillion: 3.75 },
};

export function emptyUsage(): TokenUsage {
  return { inputTokens: 0, outputTokens: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0 };
}

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheRead: a.cacheRead + b.cacheRead,
    cacheWrite: a.cacheWrite + b.cacheWrite,
    totalTokens: a.totalTokens + b.totalTokens,
  };
}

export function estimateCost(usage: TokenUsage, modelKey: string): CostEstimate {
  const pricing = MODEL_PRICING[modelKey] ?? MODEL_PRICING['default'];
  const inputCostUsd = (usage.inputTokens / 1_000_000) * pricing.inputPerMillion
    + (usage.cacheRead / 1_000_000) * pricing.cacheReadPerMillion
    + (usage.cacheWrite / 1_000_000) * pricing.cacheWritePerMillion;
  const outputCostUsd = (usage.outputTokens / 1_000_000) * pricing.outputPerMillion;
  return { inputCostUsd, outputCostUsd, totalCostUsd: inputCostUsd + outputCostUsd };
}

export function formatCost(usd: number): string {
  if (usd < 0.001) return '<$0.001';
  if (usd < 0.01) return `$${usd.toFixed(3)}`;
  if (usd < 1) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}

/**
 * Try to parse a token usage snapshot from Claude Code's context window JSON.
 * Claude Code status line JSON looks like:
 * { "session_id": "...", "context_window": { "input_tokens": 1234, "output_tokens": 567, ... } }
 */
export function parseClaudeStatusJson(raw: string): TokenUsage | null {
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const cw = obj['context_window'] as Record<string, unknown> | undefined;
    if (!cw) return null;
    const input = Number(cw['input_tokens'] ?? 0);
    const output = Number(cw['output_tokens'] ?? 0);
    const cacheRead = Number(cw['cache_read_input_tokens'] ?? 0);
    const cacheWrite = Number(cw['cache_creation_input_tokens'] ?? 0);
    if (isNaN(input) || isNaN(output)) return null;
    return { inputTokens: input, outputTokens: output, cacheRead, cacheWrite, totalTokens: input + output + cacheRead + cacheWrite };
  } catch {
    return null;
  }
}

// Patterns that appear in terminal output for various agents
const CLAUDE_TOKENS_RE = /Tokens?:\s*([\d,]+)\s+(?:input|in)[,\s]+([\d,]+)\s+(?:output|out)/i;
const OPENAI_USAGE_RE = /"usage"\s*:\s*\{[^}]*"prompt_tokens"\s*:\s*(\d+)[^}]*"completion_tokens"\s*:\s*(\d+)/;

function parseNum(s: string): number {
  return parseInt(s.replace(/,/g, ''), 10);
}

/**
 * Parse token usage from a chunk of terminal output text.
 * Returns null if no recognizable token pattern found.
 */
export function parseTerminalChunk(text: string): TokenUsage | null {
  const claudeMatch = CLAUDE_TOKENS_RE.exec(text);
  if (claudeMatch) {
    const input = parseNum(claudeMatch[1]);
    const output = parseNum(claudeMatch[2]);
    return { inputTokens: input, outputTokens: output, cacheRead: 0, cacheWrite: 0, totalTokens: input + output };
  }
  const openaiMatch = OPENAI_USAGE_RE.exec(text);
  if (openaiMatch) {
    const input = parseNum(openaiMatch[1]);
    const output = parseNum(openaiMatch[2]);
    return { inputTokens: input, outputTokens: output, cacheRead: 0, cacheWrite: 0, totalTokens: input + output };
  }
  return null;
}
