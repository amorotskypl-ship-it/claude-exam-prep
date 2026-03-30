// ===== Quick Reference Data =====
const REFERENCE_DATA = {
  decisionFramework: [
    { situation: "Critical business rule compliance needed", answer: "Programmatic enforcement (hooks), not prompt instructions" },
    { situation: "Tool selection is unreliable", answer: "Improve tool descriptions first" },
    { situation: "Agent skipping required steps", answer: "Programmatic prerequisite/hook to block downstream calls" },
    { situation: "Poor escalation calibration", answer: "Explicit criteria + few-shot examples in system prompt" },
    { situation: "Inconsistent output format", answer: "Few-shot examples (most effective technique)" },
    { situation: "Need guaranteed structured output", answer: "tool_use with JSON schema (not text parsing)" },
    { situation: "Self-review not catching issues", answer: "Independent second instance (no prior reasoning context)" },
    { situation: "Large review inconsistent results", answer: "Split into per-file passes + cross-file integration pass" },
    { situation: "Blocking CI workflow", answer: "Synchronous API (never batch)" },
    { situation: "Overnight/weekly non-blocking analysis", answer: "Message Batches API (50% savings)" },
    { situation: "Info might not exist in source", answer: "Make schema fields nullable/optional" },
    { situation: "Retry failing on extraction", answer: "Check if info is absent from source (retries won't help)" },
    { situation: "Context degradation in long sessions", answer: "Scratchpad files + subagent delegation + /compact" },
    { situation: "Losing exact values in summaries", answer: "Extract to persistent 'case facts' block" },
    { situation: "Customer says 'give me a human'", answer: "Escalate immediately -- don't investigate first" },
    { situation: "Multiple customer matches", answer: "Ask for more identifiers -- don't guess" },
    { situation: "Subagent failure", answer: "Return structured error + partial results to coordinator" },
    { situation: "Team needs shared commands", answer: ".claude/commands/ in project repo" },
    { situation: "Personal/experimental commands", answer: "~/.claude/commands/ (user-level)" },
    { situation: "Conventions spanning many directories", answer: ".claude/rules/ with glob patterns" },
    { situation: "Complex architectural task", answer: "Plan mode first" },
    { situation: "Simple one-file bug fix", answer: "Direct execution" },
    { situation: "Running Claude Code in CI", answer: "-p flag (prevents hang)" }
  ],
  fileLocations: [
    { what: "Shared project config", where: ".claude/CLAUDE.md or root CLAUDE.md" },
    { what: "Personal user config", where: "~/.claude/CLAUDE.md" },
    { what: "Path-scoped rules", where: ".claude/rules/ (YAML frontmatter with paths:)" },
    { what: "Team slash commands", where: ".claude/commands/" },
    { what: "Personal slash commands", where: "~/.claude/commands/" },
    { what: "Skills with SKILL.md", where: ".claude/skills/" },
    { what: "Shared MCP servers", where: ".mcp.json (project root)" },
    { what: "Personal MCP servers", where: "~/.claude.json" }
  ],
  apiValues: [
    { setting: "stop_reason", values: "\"tool_use\" (continue loop) / \"end_turn\" (stop)" },
    { setting: "tool_choice: \"auto\"", values: "Model may return text instead of calling a tool" },
    { setting: "tool_choice: \"any\"", values: "Model MUST call a tool (can choose which)" },
    { setting: "tool_choice: {type,name}", values: "Model MUST call this specific named tool" },
    { setting: "Message Batches API", values: "50% savings, up to 24h, no latency SLA" },
    { setting: "custom_id", values: "Correlates batch request/response pairs" },
    { setting: "-p / --print", values: "Non-interactive mode for CI/CD" },
    { setting: "--output-format json", values: "Structured output in CI contexts" },
    { setting: "--json-schema", values: "Enforce specific JSON schema in output" },
    { setting: "--resume <name>", values: "Continue a named session" },
    { setting: "/compact", values: "Reduce context usage in extended sessions" },
    { setting: "/memory", values: "Verify which memory files are loaded" }
  ],
  skillFrontmatter: [
    { option: "context: fork", desc: "Run in isolated sub-agent context, prevent pollution of main conversation" },
    { option: "allowed-tools", desc: "Restrict tool access during skill execution" },
    { option: "argument-hint", desc: "Prompt for required parameters when invoked without arguments" }
  ],
  hookTypes: [
    { hook: "PostToolUse", purpose: "Intercept and transform tool results before model processes them (e.g., normalize dates, timestamps)" },
    { hook: "Tool call interception", purpose: "Block policy-violating actions (e.g., refunds > $500) and redirect to alternative workflows" }
  ],
  errorCategories: [
    { category: "Transient", desc: "Timeouts, service unavailability", retryable: "Yes" },
    { category: "Validation", desc: "Invalid input format or values", retryable: "No (fix input)" },
    { category: "Business", desc: "Policy violations, rule conflicts", retryable: "No" },
    { category: "Permission", desc: "Access denied, unauthorized", retryable: "No" }
  ],
  scenarios: [
    { name: "Customer Support Resolution Agent", domains: "D1, D2, D5", desc: "Agent SDK + MCP tools for returns, billing, account issues. 80%+ first-contact resolution." },
    { name: "Code Generation with Claude Code", domains: "D3, D5", desc: "Claude Code for code gen, refactoring, debugging. CLAUDE.md, slash commands, plan mode." },
    { name: "Multi-Agent Research System", domains: "D1, D2, D5", desc: "Coordinator + subagents (search, analyze, synthesize, report). Cited research reports." },
    { name: "Developer Productivity Tools", domains: "D2, D3, D1", desc: "Agent SDK for codebase exploration, legacy understanding, boilerplate generation." },
    { name: "Claude Code for CI", domains: "D3, D4", desc: "CI/CD integration: automated code review, test generation, PR feedback." },
    { name: "Structured Data Extraction", domains: "D4, D5", desc: "Extract from unstructured docs, JSON schema validation, edge case handling." }
  ],

  // ===== Practical Insights (from deep-use engineering article) =====

  contextBudget: [
    { layer: "System instructions", tokens: "~2K", type: "Fixed", note: "Always present, cached" },
    { layer: "Skill descriptors (all loaded)", tokens: "~1-5K", type: "Fixed", note: "Every skill's description always in context" },
    { layer: "MCP tool definitions", tokens: "~10-20K", type: "Fixed", note: "Hidden killer: 1 MCP server = 4-6K tokens (20-30 tools x 200 tokens each)" },
    { layer: "LSP state", tokens: "~2-5K", type: "Fixed", note: "Language server protocol state" },
    { layer: "CLAUDE.md + Memory", tokens: "~2-5K + ~1-2K", type: "Semi-fixed", note: "Anthropic's own CLAUDE.md is ~2.5K tokens — use as benchmark" },
    { layer: "Dialog history + file content + tool output", tokens: "~160-180K", type: "Dynamic", note: "What's actually available for your work" }
  ],

  contextLayering: [
    { layer: "Always resident", mechanism: "CLAUDE.md", content: "Project contract, build commands, hard constraints" },
    { layer: "Path-loaded", mechanism: ".claude/rules/", content: "Language/directory/file-type specific rules" },
    { layer: "On-demand", mechanism: "Skills", content: "Workflows, domain knowledge — loaded only when triggered" },
    { layer: "Isolated", mechanism: "Subagents", content: "Bulk exploration, parallel research — only summaries return" },
    { layer: "Outside context", mechanism: "Hooks", content: "Deterministic scripts, audit, blocking — zero token cost" }
  ],

  claudeCodeCommands: [
    { command: "/context", purpose: "View token budget breakdown — diagnose MCP overhead and file read costs" },
    { command: "/clear", purpose: "Full session reset. If corrected more than twice, start fresh" },
    { command: "/compact", purpose: "Compress context preserving important info (pair with Compact Instructions in CLAUDE.md)" },
    { command: "/memory", purpose: "Check which CLAUDE.md files are actually loaded — diagnose missing rules" },
    { command: "/mcp", purpose: "Manage MCP connections, check token cost, disconnect idle servers" },
    { command: "/hooks", purpose: "Manage hooks — entry point to the governance layer" },
    { command: "/permissions", purpose: "View or update the permission allow-list" },
    { command: "/model", purpose: "Switch model: Opus (deep reasoning), Sonnet (general), Haiku (fast exploration)" },
    { command: "/simplify", purpose: "Three-dimensional check of recent code: reuse, quality, efficiency — fixes issues inline" },
    { command: "/rewind", purpose: "Return to a session checkpoint for re-branching (not undo — replay from that point)" },
    { command: "/btw", purpose: "Quick side-question without interrupting main task — single-round only" },
    { command: "Shift+Tab (x2)", purpose: "Enter Plan Mode — read-only exploration before committing to changes" },
    { command: "Ctrl+B", purpose: "Send long-running bash command to background — Claude checks result later via BashOutput" },
    { command: "claude --continue", purpose: "Resume last session in current directory" },
    { command: "claude --resume", purpose: "Open session selector to pick from history" },
    { command: "claude --continue --fork", purpose: "Fork from existing session — same starting point, different approaches" },
    { command: "claude --worktree", purpose: "Create isolated git worktree for safe parallel exploration" },
    { command: "claude -p \"prompt\"", purpose: "Non-interactive mode for CI/pre-commit/scripts (CRITICAL for CI)" },
    { command: "claude -p --output-format json", purpose: "Structured JSON output for scripting and automation" }
  ],

  skillTypes: [
    { type: "Checklist (quality gate)", example: "release-check", purpose: "Pre-flight verification before release — all items must pass", notes: "Short, deterministic, pass/fail per item" },
    { type: "Workflow (standardized operation)", example: "config-migration", purpose: "High-risk operations with explicit rollback steps", notes: "Use disable-model-invocation: true — explicit trigger only" },
    { type: "Domain Expert (decision framework)", example: "runtime-diagnosis", purpose: "Structured evidence collection + decision matrix for diagnosis", notes: "Collects evidence via fixed path, not guessing" }
  ],

  hookPoints: [
    { hook: "PreToolUse", timing: "Before tool executes", use: "Block protected file edits, enforce prerequisites, validate parameters" },
    { hook: "PostToolUse", timing: "After tool returns, before model processes result", use: "Auto-format/lint after Edit, normalize data, filter verbose output (e.g., cargo test → pass/fail only)" },
    { hook: "SessionStart", timing: "When session begins", use: "Inject dynamic context: git branch, environment variables, project state" },
    { hook: "Notification", timing: "When task completes", use: "Push notification (e.g., macOS notification on task done)" }
  ],

  practicalAntiPatterns: [
    { antiPattern: "CLAUDE.md too long", symptom: "Context polluted from the start, less room for actual work", fix: "Keep under ~2.5K tokens. Move details to rules/ or skills/" },
    { antiPattern: "Too many MCP servers connected", symptom: "25K+ tokens consumed by tool definitions alone (12.5% of budget)", fix: "Disconnect idle servers via /mcp. Use /context to monitor" },
    { antiPattern: "Tool output flooding context", symptom: "cargo test (1000+ lines), git log, find output fills context", fix: "Pipe through head -30 in hooks, or use output filtering (RTK pattern)" },
    { antiPattern: "No Compact Instructions", symptom: "Compaction loses architecture decisions, keeps verbose tool output", fix: "Add Compact Instructions section to CLAUDE.md listing what to preserve" },
    { antiPattern: "Switching models mid-session", symptom: "Prompt cache invalidated — rebuilt from scratch for new model, actually costs MORE", fix: "Use subagent for different model, or start new session" },
    { antiPattern: "Skill descriptor too verbose", symptom: "45-token description wastes context when skill rarely used", fix: "Trim to ~9 tokens: 'Use for PR reviews with focus on correctness'" },
    { antiPattern: "One skill covers everything", symptom: "Single skill for review+deploy+debug+docs — too broad, triggers incorrectly", fix: "Split into focused single-purpose skills" },
    { antiPattern: "Side-effect skill with auto-invoke", symptom: "Model triggers dangerous operations autonomously", fix: "Set disable-model-invocation: true for any skill with side effects" },
    { antiPattern: "No verification criteria defined", symptom: "Claude says 'done' but no way to confirm correctness", fix: "Define 'done' criteria: which commands to run, what to check" },
    { antiPattern: "Same session generates and reviews code", symptom: "Self-review biased by retained reasoning context", fix: "Use separate Claude instance for review, or second Codex as 'senior engineer'" }
  ],

  sixLayerModel: [
    { layer: "1. Context", role: "What the model sees", components: "CLAUDE.md, rules, memory, file content, tool output" },
    { layer: "2. Tools", role: "What the model can do", components: "Built-in tools, MCP servers, custom tools" },
    { layer: "3. Skills", role: "On-demand workflows", components: "SKILL.md, supporting files, scripts" },
    { layer: "4. Hooks", role: "Deterministic governance", components: "PreToolUse, PostToolUse, SessionStart, Notification" },
    { layer: "5. Subagents", role: "Isolated execution", components: "Explore, Plan, General-purpose, custom agents" },
    { layer: "6. Verification", role: "Proof of correctness", components: "Tests, lint, typecheck, screenshots, contract tests" }
  ],

  handoffPattern: {
    description: "Before ending a session or when context is nearly full, ask Claude to write a HANDOFF.md file summarizing: current progress, what was tried, what worked, what failed, and what to do next. The next session reads this file instead of relying on compaction quality.",
    template: "Write a HANDOFF.md covering: current progress, approaches tried (what worked and what didn't), open issues, and recommended next steps — so a fresh Claude session can continue seamlessly."
  },

  // ===== Recent API Features =====

  recentApiFeatures: [
    { feature: "Server-side compaction", api: "compact_20260112", desc: "Automatic context summarization when conversation approaches limit. Configurable threshold (default 150K, min 50K tokens). Custom instructions parameter for what to preserve.", domain: "D5" },
    { feature: "Context awareness", api: "<budget:token_budget>", desc: "Claude 4.5+ auto-receives context budget info. <system_warning> tags after each tool call show usage. Model self-monitors remaining context.", domain: "D5" },
    { feature: "Adaptive thinking", api: "thinking: { type: 'adaptive', effort: 'medium' }", desc: "Replaces manual budget_tokens in Claude 4.6. Effort levels: low, medium, high, max. Model dynamically decides reasoning depth per task.", domain: "D4" },
    { feature: "Strict structured output", api: "strict: true (in tool definition)", desc: "Guarantees JSON schema conformance: eliminates type mismatches, missing required fields, enum violations. Does NOT prevent semantic errors — needs validation retry loops.", domain: "D4" },
    { feature: "pause_turn stop reason", api: "stop_reason: 'pause_turn'", desc: "Server-side tool sampling loop hit its 10-iteration limit. Returns incomplete server_tool_use block. Must send result back to continue.", domain: "D2" },
    { feature: "MCP Connector", api: "mcp_servers: [{url: '...'}]", desc: "Connect to remote MCP servers directly from Messages API. No need to build/host MCP client. Simplifies deployment for MCP-compatible tool servers.", domain: "D2" }
  ],

  stopReasons: [
    { reason: "end_turn", meaning: "Agent is finished — exit the loop", action: "Return final text response to user" },
    { reason: "tool_use", meaning: "Agent wants to call a tool", action: "Execute tool, append result, continue loop" },
    { reason: "max_tokens", meaning: "Output was truncated mid-generation", action: "Append partial content and continue conversation" },
    { reason: "pause_turn", meaning: "Server-side tool loop hit iteration limit", action: "Send result back to let model continue" },
    { reason: "stop_sequence", meaning: "Custom stop sequence was matched", action: "Handle based on application logic" }
  ],

  // ===== NotebookLM New Reference Sections =====

  mcpPrimitives: [
    { primitive: "Tools", purpose: "Executable functions that change state or query dynamic data", examples: "web_search, create_issue, query_database", transport: "stdio (local), HTTP/SSE (remote)" },
    { primitive: "Resources", purpose: "Static/semi-static data exposed as content catalogs", examples: "Database schemas, log files, documentation hierarchies, issue lists", transport: "Loaded on demand, reduces exploratory tool calls" },
    { primitive: "Prompts", purpose: "Templates guiding model interaction with specific datasets", examples: "Complex query templates, dataset-specific extraction prompts", transport: "Loaded on demand, standardizes interaction patterns" }
  ],

  sdkMessageTypes: [
    { type: "SystemMessage (init)", subtype: "init", when: "First message in session", purpose: "Establishes session grounding and metadata" },
    { type: "SystemMessage (compact_boundary)", subtype: "compact_boundary", when: "After context compaction", purpose: "Manages window state, provides summary of deleted context while preserving recent turns" },
    { type: "AssistantMessage", subtype: "-", when: "During conversation", purpose: "Model's text and tool_use responses" },
    { type: "ResultMessage", subtype: "-", when: "Session completion", purpose: "Final yield with response text, total token usage (input/output), and cost data" }
  ],

  managedSettingsHierarchy: [
    { level: "1 (Highest)", source: "managed-settings.json", scope: "System-level IT admin", overridable: "No — cannot be overridden by any lower layer", path: "macOS: /Library/Application Support/ClaudeCode/ | Windows: C:\\Program Files\\ClaudeCode\\" },
    { level: "2", source: "CLI arguments", scope: "Per-invocation", overridable: "Yes (by managed)", path: "--dangerously-skip-permissions, --append-system-prompt, etc." },
    { level: "3", source: ".claude/settings.json", scope: "Project-level", overridable: "Yes (by managed, CLI)", path: "Project root .claude/ directory" },
    { level: "4 (Lowest)", source: "~/.claude.json", scope: "User-level personal", overridable: "Yes (by all above)", path: "Home directory" }
  ],

  enterpriseLockdownSettings: [
    { setting: "allowManagedMcpServersOnly", type: "boolean", effect: "Block all MCP servers except admin-defined allowlist ('Lockdown' mode)" },
    { setting: "strictKnownMarketplaces", type: "string[]", effect: "Exact-match allowlist for plugin source marketplaces" },
    { setting: "hostPattern", type: "regex string", effect: "Regex matching for allowed MCP server hosts (e.g., internal GitHub Enterprise)" },
    { setting: "network.allowedDomains", type: "string[]", effect: "Restrict outbound network access to listed domains only" },
    { setting: "availableModels", type: "string[]", effect: "Restrict model picker to listed models only (e.g., ['sonnet', 'haiku'])" },
    { setting: "attribution", type: "object", effect: "Control 'Generated with Claude Code' trailers in commits and PRs" },
    { setting: "fileSuggestion", type: "string", effect: "Custom script for @ file autocomplete" },
    { setting: "respectGitignore", type: "boolean", effect: "Control whether file picker follows .gitignore patterns (false can improve monorepo performance)" }
  ],

  monorepoOptimization: [
    { setting: "--worktree", purpose: "Create isolated git worktree for safe parallel exploration", details: "Avoids branch-switching conflicts, each worktree has its own working directory" },
    { setting: "sparsePaths", purpose: "Limit which directories are checked out in the worktree", details: "Reduces disk usage and startup time by only including relevant paths" },
    { setting: "symlinkDirectories", purpose: "Symlink large directories (e.g., node_modules) instead of copying", details: "Avoids duplicating large folders, dramatically reduces worktree creation time" },
    { setting: "respectGitignore: false", purpose: "Speed up @ file picker in large repos", details: "Skips .gitignore pattern matching — use when repo structure is well-known" }
  ],

  subscriptionTiers: [
    { tier: "Free", multiplier: "1x (baseline)", dailyCost: "-", notes: "Limited usage" },
    { tier: "Pro", multiplier: "20x", dailyCost: "~$6/day active developer benchmark", notes: "Standard individual use" },
    { tier: "Max", multiplier: "25x", dailyCost: "Higher", notes: "Some sources report higher limits" },
    { tier: "Team Standard", multiplier: "25-30x", dailyCost: "Varies", notes: "Standard team allocation" },
    { tier: "Team Premium", multiplier: "150x", dailyCost: "Varies", notes: "Enterprise-grade capacity" }
  ],

  agentPatterns: [
    { pattern: "Hub-and-Spoke (Coordinator + Subagents)", description: "Coordinator decomposes tasks, delegates to ephemeral subagents, aggregates results. Subagents are isolated — no shared context.", bestFor: "Standard multi-step tasks with clear subtask boundaries" },
    { pattern: "Agent Teams", description: "Independent persistent instances coordinating via shared task list. Each maintains own context but collaborates through shared work queues.", bestFor: "Sustained parallel work requiring multiple independent investigations" },
    { pattern: "Dynamic Decomposition", description: "Agent builds and prioritizes an adaptive plan on the fly. Can reorder, skip, or add subtasks based on intermediate results.", bestFor: "Open-ended investigations where the plan depends on discoveries" },
    { pattern: "Prompt Chaining", description: "Fixed, sequential workflow — output of step N feeds step N+1. Pre-defined pipeline.", bestFor: "Well-understood data processing pipelines with known steps" },
    { pattern: "Best-of-N", description: "Generate N candidate solutions, use programmatic evaluator or judge agent to select the optimal one.", bestFor: "Tasks where quality varies and objective evaluation criteria exist" },
    { pattern: "Self-Correction Loop", description: "On validation failure, feed original prompt + failed output + specific error log back to model for correction turn.", bestFor: "Format/structural errors in code generation and data extraction" }
  ],

  contextEditing: [
    { param: "Strategy: clear_tool_uses_20250919", description: "Clears old tool results when context grows beyond threshold. Replaces cleared results with placeholder text. By default keeps tool calls visible.", configKeys: "trigger, keep, clear_at_least, exclude_tools, clear_tool_inputs" },
    { param: "Strategy: clear_thinking_20251015", description: "Manages thinking blocks in extended thinking conversations. Default keeps last 1 turn.", configKeys: "keep (thinking_turns N or 'all')" },
    { param: "trigger", description: "When to activate clearing. Default: 100,000 input tokens. Can specify in input_tokens or tool_uses.", defaultValue: "100,000 input tokens" },
    { param: "keep (tool uses)", description: "How many recent tool use/result pairs to preserve after clearing. Oldest removed first.", defaultValue: "3 tool uses" },
    { param: "clear_at_least", description: "Minimum tokens to clear per activation. If API can't clear this amount, strategy is not applied. Prevents cache-breaking for negligible savings.", defaultValue: "None" },
    { param: "exclude_tools", description: "List of tool names whose results are never cleared. Use for grounding context (e.g., web_search).", defaultValue: "None" },
    { param: "clear_tool_inputs", description: "When true, clears both tool call parameters AND results. When false, only results are cleared.", defaultValue: "false" },
    { param: "keep (thinking)", description: "thinking_turns: N keeps last N assistant turns with thinking. 'all' preserves everything (maximizes cache hits).", defaultValue: "thinking_turns: 1" },
    { param: "Beta header", description: "Required header to enable context editing: context-management-2025-06-27", defaultValue: "N/A" },
    { param: "Ordering rule", description: "When combining strategies, clear_thinking MUST be listed FIRST in the edits array.", defaultValue: "N/A" },
    { param: "Server-side execution", description: "Context editing happens server-side before prompt reaches Claude. Client keeps full unmodified history — no sync needed.", defaultValue: "N/A" },
    { param: "Cache interaction", description: "Tool clearing invalidates cached prefixes. Thinking keep: 'all' preserves cache. Use clear_at_least to ensure invalidation is worthwhile.", defaultValue: "N/A" }
  ]
};
