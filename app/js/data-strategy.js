const STRATEGY_DATA = {

  // ─── 1. Exam Briefing ────────────────────────────────────────────────
  examBriefing: {
    format: '60 questions, all multiple choice (1 correct + 3 distractors)',
    duration: '120 minutes (proctored via ProctorFree)',
    passing: '720 / 1000 (scaled scoring)',
    scenarios: '4 of 6 scenarios randomly selected per exam',
    cost: '$99 (some partners may have promo codes)',
    validity: '6 months, then renewal required',
    attempts: '<strong style="color:var(--accent)">ONE attempt only</strong> &mdash; no retakes',
    level: '~301 level &mdash; applied expertise, not introductory',
    practiceTarget: 'Aim for <strong>900/1000</strong> on Practice Exam before attempting Certification (Anthropic\'s own recommendation)',
    prerequisites: 'All 200-level Academy courses, working familiarity with Agent SDK, having <em>built</em> solutions with Claude Code, Agent SDK, API, and MCP',
    keyStrategy: 'The exam tests best practices, not just correct solutions. Multiple answers may technically work &mdash; you must pick the one that follows Anthropic\'s recommended architectural patterns.',
    tips: [
      '<strong style="color:var(--accent)">You only get ONE attempt</strong> &mdash; there are no retakes. Prepare thoroughly before registering.',
      'Anthropic recommends scoring <strong>900+</strong> on the Practice Exam before taking the real exam (passing is 720).',
      'There is no guessing penalty &mdash; always answer every question.',
      'Several options may technically solve the problem. Pick the BEST PRACTICE, not just a working solution.',
      'Read the scenario description carefully &mdash; it constrains which approaches are appropriate.',
      'The exam tests system design thinking, UX awareness, and AI ethics alongside technical knowledge.',
      'Time management: ~2 minutes per question. Flag difficult ones and return later.',
      'Focus on &quot;root cause&quot; solutions, not band-aids or workarounds.',
      'Prerequisites: must have built solutions with Claude Code, Agent SDK, API, and MCP &mdash; this is not a theory-only exam.'
    ]
  },

  // ─── 2. Scenarios ────────────────────────────────────────────────────
  scenarios: [
    {
      id: 'S1',
      name: 'Customer Support Resolution Agent',
      description: 'Build an agentic customer-support system that resolves tickets autonomously, escalating to human agents when appropriate and enforcing business rules around refunds and financial actions.',
      primaryDomains: [1, 2, 5],
      taskStatements: ['t1.1', 't1.2', 't1.4', 't1.5', 't2.2', 't2.3', 't5.1', 't5.2', 't5.4', 't5.5'],
      keyPatterns: [
        'Agent loop using stop_reason field to decide continue vs. finish',
        'Escalation triggers: explicit customer request, policy gaps, no progress &mdash; NOT sentiment analysis',
        'HITL via programmatic enforcement for refunds &amp; financial actions',
        'Tool descriptions as the primary routing mechanism',
        'Persistent case facts block to prevent progressive summarization loss'
      ],
      traps: [
        'Using sentiment analysis for escalation triggers',
        'Relying on prompt-only enforcement for financial transactions',
        'Parsing natural language for loop termination instead of stop_reason',
        'Using arbitrary iteration caps as the main stopping condition'
      ],
      walkthrough: '<p><strong>Setup:</strong> A customer contacts support about a double charge. The agent must look up the order, verify the duplicate, and process a refund.</p><p><strong>Key decision point:</strong> The refund action MUST be gated by programmatic enforcement (a prerequisite hook that verifies the duplicate exists in the billing system), not just a prompt telling the model &quot;only refund if there&#39;s a duplicate.&quot;</p><p><strong>Escalation:</strong> If the customer explicitly asks for a human, or the agent cannot find the order after multiple tool calls, or the situation falls outside policy &mdash; escalate. Do NOT escalate based on detected frustration/sentiment.</p><p><strong>Loop control:</strong> The agent loop checks <code>stop_reason</code>: if <code>tool_use</code>, continue; if <code>end_turn</code>, the agent is done.</p>'
    },
    {
      id: 'S2',
      name: 'Code Generation with Claude Code',
      description: 'Use Claude Code to generate, refactor, and maintain a codebase, leveraging CLAUDE.md hierarchies, plan mode, slash commands, and skills for repeatable developer workflows.',
      primaryDomains: [3, 5],
      taskStatements: ['t3.1', 't3.2', 't3.3', 't3.4', 't3.5', 't5.1', 't5.3', 't5.4'],
      keyPatterns: [
        'CLAUDE.md hierarchy: user-level &gt; project-level &gt; directory-level',
        'Plan mode for complex refactoring (Shift+Tab x2)',
        'Slash commands for repeatable workflows',
        'Skills for automated task matching',
        'Context management via compaction instructions in CLAUDE.md'
      ],
      traps: [
        'Storing team conventions in user-level CLAUDE.md (new devs won&#39;t get them)',
        'Using skills when custom slash commands are more appropriate',
        'Neglecting to add compact instructions to CLAUDE.md'
      ],
      walkthrough: '<p><strong>Setup:</strong> A team wants to standardize how Claude Code handles their React codebase &mdash; enforcing component patterns, test conventions, and import ordering.</p><p><strong>Key decision point:</strong> Team conventions belong in the <em>project-level</em> CLAUDE.md (checked into the repo), NOT the user-level file. The user-level file is for personal preferences that don&#39;t affect the team.</p><p><strong>Repeatable workflows:</strong> Create slash commands (e.g., <code>/generate-component</code>) for tasks the team runs frequently. Use skills only when Claude needs to automatically match and apply patterns without explicit invocation.</p><p><strong>Context management:</strong> Add compaction instructions in CLAUDE.md so that when context is compacted, critical project rules survive summarization.</p>'
    },
    {
      id: 'S3',
      name: 'Multi-Agent Research System',
      description: 'Design a hub-and-spoke multi-agent architecture where a coordinator dispatches isolated research subagents, aggregates their findings, and produces a synthesis report with proper source attribution.',
      primaryDomains: [1, 2, 5],
      taskStatements: ['t1.2', 't1.3', 't1.5', 't1.6', 't2.1', 't2.3', 't5.3', 't5.4'],
      keyPatterns: [
        'Hub-and-spoke coordinator with isolated subagents',
        'Explicit context passing &mdash; subagents do NOT share memory',
        'fork_session for parallel exploration',
        'Task tool for spawning subagents',
        'Structured data formats preserving source URLs &amp; metadata',
        'Attention dilution fix: per-file analysis first, then cross-file integration'
      ],
      traps: [
        'Assuming subagents share coordinator memory',
        'Poor task decomposition leading to missed topics',
        'Giving the coordinator too many tools (15&ndash;20 degrades selection accuracy)',
        'Not passing structured context between agents'
      ],
      walkthrough: '<p><strong>Setup:</strong> A research system must analyze 50 documents across 5 topic areas and produce a unified report with citations.</p><p><strong>Key decision point:</strong> The coordinator dispatches 5 subagents (one per topic) using the Task tool. Each subagent receives ONLY the documents relevant to its topic &mdash; they have no access to each other&#39;s context or the coordinator&#39;s memory.</p><p><strong>Parallel execution:</strong> Use <code>fork_session</code> to run subagents in parallel when their work is independent.</p><p><strong>Attention dilution:</strong> Each subagent analyzes its documents individually first (per-file), then integrates findings across its set. The coordinator then synthesizes across all subagent reports.</p><p><strong>Output:</strong> Subagents return structured JSON with source URLs and metadata preserved, enabling the coordinator to build a properly cited final report.</p>'
    },
    {
      id: 'S4',
      name: 'Developer Productivity Tools',
      description: 'Build an AI-powered developer assistant that integrates multiple tools via MCP, routes requests to the correct tool, and automates deterministic workflow steps with hooks.',
      primaryDomains: [2, 3, 1],
      taskStatements: ['t1.4', 't1.5', 't2.1', 't2.2', 't2.4', 't3.1', 't3.3', 't5.4'],
      keyPatterns: [
        'Tool descriptions as the primary selection mechanism &mdash; fix misrouting by improving descriptions, NOT adding classifiers',
        'Optimal 4&ndash;5 tools per agent',
        'MCP server integration for external tool access',
        'Combining built-in tools with custom MCP tools',
        'Hooks for deterministic workflow steps (e.g., auto-format after code generation)'
      ],
      traps: [
        'Adding few-shot examples to fix tool misrouting (fix descriptions instead)',
        'Consolidating tools to reduce count (reduces capability)',
        'Using routing classifiers when better descriptions would suffice',
        'Giving an agent 15&ndash;20 tools (degrades selection accuracy)'
      ],
      walkthrough: '<p><strong>Setup:</strong> A developer assistant has tools for file search, code editing, test running, documentation lookup, and deployment. Claude keeps calling the file-search tool when the user asks to &quot;find the bug.&quot;</p><p><strong>Key decision point:</strong> The fix is to improve the tool descriptions &mdash; make the code-editing tool&#39;s description clarify it handles debugging and bug investigation, while the file-search tool is for locating files by name/path. Do NOT add few-shot examples or a routing classifier.</p><p><strong>Tool count:</strong> Keep each agent to 4&ndash;5 tools. If you need more capabilities, split into specialized subagents rather than overloading one agent.</p><p><strong>Hooks:</strong> Use hooks for deterministic steps like auto-formatting code after generation or running linters before committing. These should not be left to the model&#39;s discretion.</p>'
    },
    {
      id: 'S5',
      name: 'Claude Code for CI/CD',
      description: 'Integrate Claude Code into CI/CD pipelines for automated code review, PR summarization, and structured extraction from build artifacts using non-interactive execution.',
      primaryDomains: [3, 4],
      taskStatements: ['t3.1', 't3.4', 't3.5', 't4.1', 't4.2', 't4.3', 't4.5'],
      keyPatterns: [
        'Non-interactive execution: <code>claude -p</code> for headless mode',
        'Structured output via tool_use with JSON schemas',
        'CLAUDE.md for CI-specific rules and constraints',
        'Prompt engineering for deterministic extraction',
        'Batch API for cost-effective processing of large volumes'
      ],
      traps: [
        'Using text parsing instead of tool_use for structured output',
        'Relying on natural language instructions instead of JSON schemas for output format',
        'Neglecting CI-specific CLAUDE.md configuration'
      ],
      walkthrough: '<p><strong>Setup:</strong> A CI pipeline needs to review every PR, extract a structured summary (files changed, risk level, test coverage delta), and post it as a PR comment.</p><p><strong>Key decision point:</strong> Use <code>claude -p</code> for non-interactive execution in the CI runner. Define the output structure via <code>tool_use</code> with a JSON schema that specifies the exact fields needed &mdash; do NOT try to parse a free-text response with regex.</p><p><strong>CLAUDE.md:</strong> Create a CI-specific CLAUDE.md with rules like &quot;never modify files directly&quot; and &quot;always output via the report_review tool.&quot;</p><p><strong>Cost optimization:</strong> For batch processing (e.g., reviewing 100 PRs nightly), use the Batch API for significant cost savings over individual calls.</p>'
    },
    {
      id: 'S6',
      name: 'Structured Data Extraction Pipeline',
      description: 'Build a production pipeline that extracts structured data from unstructured documents using tool_use with JSON schemas, handles ambiguous/missing data gracefully, and validates output with retry loops.',
      primaryDomains: [4, 5],
      taskStatements: ['t4.1', 't4.2', 't4.3', 't4.4', 't4.5', 't5.1', 't5.2', 't5.5'],
      keyPatterns: [
        'tool_use with JSON schemas for structured output (NOT text parsing)',
        'Nullable fields and enum values (&quot;unclear&quot;/&quot;other&quot;) for ambiguous data',
        'Validation retry loops: send error back to model for self-correction',
        'Few-shot examples for ambiguous extraction cases',
        'Explicit criteria instead of vague instructions like &quot;be conservative&quot;'
      ],
      traps: [
        'Using regex or text parsing for structured extraction',
        'Schemas without nullable fields (forces hallucination of missing data)',
        'Vague instructions like &quot;be conservative&quot; without defining what that means',
        'Relying on schema alone to prevent semantic errors'
      ],
      walkthrough: '<p><strong>Setup:</strong> Extract invoice data (vendor, amount, line items, dates) from 10,000 scanned invoices with varying formats.</p><p><strong>Key decision point:</strong> Define a <code>tool_use</code> tool with a strict JSON schema (<code>strict: true</code>) that includes all required fields. Make fields like <code>purchase_order_number</code> nullable so the model can output <code>null</code> instead of hallucinating a value when it&#39;s not on the invoice.</p><p><strong>Ambiguity handling:</strong> Add enum values like <code>&quot;unclear&quot;</code> and <code>&quot;other&quot;</code> for category fields. Provide explicit criteria: &quot;Mark as unclear if the text is partially obscured or contradicts other fields&quot; rather than &quot;be conservative.&quot;</p><p><strong>Validation:</strong> After extraction, validate the output (dates in correct format, amounts are numbers, required fields present). If validation fails, send the error message back to the model and let it self-correct in a retry loop.</p><p><strong>Few-shot examples:</strong> Include 2&ndash;3 examples of tricky invoices (handwritten amounts, multi-currency, partial data) so the model learns the expected handling.</p>'
    }
  ],

  // ─── 3. Anti-Patterns ────────────────────────────────────────────────
  antiPatterns: [
    {
      id: 'ap1',
      domain: 'D1',
      pattern: 'Parsing natural language output to determine when an agent loop should stop',
      why: 'Natural language is ambiguous and unreliable as a control signal. The model may phrase completion differently each time, leading to missed stop conditions or premature termination.',
      correct: 'Use the <code>stop_reason</code> field from the API response: <code>tool_use</code> means continue the loop, <code>end_turn</code> means the agent is finished.',
      examTip: 'If a question asks how to detect when an agent is &quot;done,&quot; the answer is always <code>stop_reason</code> &mdash; never text parsing, keyword detection, or regex on the output.'
    },
    {
      id: 'ap2',
      domain: 'D1',
      pattern: 'Using arbitrary iteration caps (e.g., max 10 loops) as the main stopping condition',
      why: 'Hard caps either cut off the agent before it finishes (too low) or waste resources on a stuck agent (too high). They don&#39;t reflect actual task completion.',
      correct: 'Use <code>stop_reason</code> as the primary termination signal. Iteration caps are acceptable only as a safety backstop, not as the main loop control.',
      examTip: 'Distractor answers often propose &quot;set max_iterations to 10&quot; as the solution. This is a backstop, not a strategy &mdash; the correct primary mechanism is <code>stop_reason</code>.'
    },
    {
      id: 'ap3',
      domain: 'D1',
      pattern: 'Checking the type of text output (e.g., whether it contains a summary or final answer) as a completion signal',
      why: 'The model&#39;s text output format is not a reliable indicator of task state. A model may produce summary-like text mid-task or omit a &quot;final answer&quot; format when actually done.',
      correct: 'Use <code>stop_reason</code> from the API response. It is the only reliable, deterministic signal for loop control.',
      examTip: 'Watch for answers that check &quot;if the response contains a final summary&quot; or &quot;if the output is not a tool call.&quot; These are traps &mdash; always prefer <code>stop_reason</code>.'
    },
    {
      id: 'ap4',
      domain: 'D1',
      pattern: 'Assuming subagents share the coordinator&#39;s memory or can access each other&#39;s context',
      why: 'Subagents are isolated &mdash; they receive only the context explicitly passed to them. Assuming shared memory leads to missing information, inconsistent outputs, and subtle bugs.',
      correct: 'Explicitly pass all needed context to each subagent when spawning it. Return structured results from subagents back to the coordinator for integration.',
      examTip: 'Multi-agent questions often include a distractor where the subagent &quot;already knows&quot; something from the coordinator&#39;s earlier conversation. This is always wrong &mdash; context must be explicitly passed.'
    },
    {
      id: 'ap5',
      domain: 'D5',
      pattern: 'Using sentiment analysis to decide when to escalate a customer support conversation to a human',
      why: 'Sentiment analysis is unreliable and introduces bias. A calm customer may have a critical issue; an expressive customer may just need a simple answer. Sentiment is not a valid escalation trigger.',
      correct: 'Escalate based on explicit, deterministic triggers: the customer explicitly requests a human, the issue falls outside policy/agent capabilities, or the agent is stuck (no progress after multiple attempts).',
      examTip: 'If &quot;analyze customer sentiment&quot; or &quot;detect frustration&quot; appears as an escalation strategy, it is a trap answer. The correct triggers are always explicit and rule-based.'
    },
    {
      id: 'ap6',
      domain: 'D1',
      pattern: 'Relying only on prompt instructions to enforce constraints on financial transactions, security operations, or compliance actions',
      why: 'Prompts are suggestions, not guarantees. A model can ignore or misinterpret prompt-based constraints, especially on high-stakes actions where failures have real consequences.',
      correct: 'Use programmatic enforcement: hooks that validate preconditions before execution, prerequisite gates that block unauthorized actions, and code-level checks that cannot be bypassed by the model.',
      examTip: 'Any answer suggesting &quot;add a system prompt telling the model to verify before refunding&quot; is insufficient for financial/security actions. Look for programmatic enforcement (hooks, gates, code checks).'
    },
    {
      id: 'ap7',
      domain: 'D2',
      pattern: 'Adding few-shot examples to the prompt to fix tool misrouting (Claude calling the wrong tool)',
      why: 'Few-shot examples increase token usage and don&#39;t address the root cause. If tool descriptions are ambiguous or overlapping, the model will still struggle to choose correctly regardless of examples.',
      correct: 'Improve the tool descriptions: clearly state what each tool does, what inputs it expects, when to use it vs. alternatives, and include edge cases. Descriptions are the primary selection mechanism.',
      examTip: 'When a question describes tool misrouting, the fix is ALWAYS better descriptions. Answers proposing few-shot examples, routing classifiers, or prompt engineering are distractors.'
    },
    {
      id: 'ap8',
      domain: 'D2',
      pattern: 'Giving a single agent 15&ndash;20 tools to handle all possible requests',
      why: 'Tool selection accuracy degrades significantly beyond 4&ndash;5 tools. The model becomes overwhelmed by choices and makes more routing errors, not fewer.',
      correct: 'Keep each agent to 4&ndash;5 tools. If more capabilities are needed, split into specialized subagents with focused tool sets, coordinated by a hub agent.',
      examTip: 'If a scenario mentions an agent with many tools performing poorly, the answer involves splitting into subagents &mdash; not &quot;better prompting&quot; or &quot;more examples.&quot;'
    },
    {
      id: 'ap9',
      domain: 'D3',
      pattern: 'Storing team conventions and project rules in user-level CLAUDE.md (~/.claude/CLAUDE.md)',
      why: 'User-level CLAUDE.md is personal and not shared. New team members won&#39;t have these conventions, leading to inconsistent behavior across the team.',
      correct: 'Store team conventions in project-level CLAUDE.md (in the repository root, checked into version control). User-level CLAUDE.md is only for personal preferences.',
      examTip: 'Questions about CLAUDE.md hierarchy test whether you know that team rules go in project-level (shared via repo) and personal preferences go in user-level (local only).'
    },
    {
      id: 'ap10',
      domain: 'D5',
      pattern: 'Allowing progressive summarization to lose critical case facts over long conversations',
      why: 'As context is summarized repeatedly, specific details (order numbers, dates, customer statements) degrade into vague summaries. This causes the agent to lose track of key facts mid-conversation.',
      correct: 'Extract key information into a persistent case facts block that is preserved across summarizations. Include order IDs, customer statements, actions taken, and decisions made.',
      examTip: 'If a long-running agent &quot;forgets&quot; earlier details, the fix is persistent case facts &mdash; not a larger context window or more aggressive caching.'
    },
    {
      id: 'ap11',
      domain: 'D4',
      pattern: 'Using regex or text parsing to extract structured data from Claude&#39;s response',
      why: 'Text output format can vary between calls. Regex is brittle and breaks when the model rephrases, reorders, or adds unexpected content. It also can&#39;t enforce type constraints.',
      correct: 'Use <code>tool_use</code> with a JSON schema (<code>strict: true</code> for guaranteed conformance). The model fills in a structured object that is validated against the schema automatically.',
      examTip: 'Any answer involving regex, string splitting, or text parsing for structured output is wrong. The correct approach is always <code>tool_use</code> with JSON schemas.'
    },
    {
      id: 'ap12',
      domain: 'D4',
      pattern: 'Giving vague extraction instructions like &quot;be conservative&quot; or &quot;only include high-confidence results&quot;',
      why: 'Vague instructions lead to inconsistent behavior. &quot;Conservative&quot; means different things in different contexts, and the model has no calibrated confidence threshold.',
      correct: 'Define explicit criteria: &quot;Mark as unclear if the text is partially obscured, contradicts another field, or is handwritten and not fully legible.&quot; Specificity drives consistency.',
      examTip: 'If an answer says &quot;instruct the model to be conservative,&quot; it is a trap. Look for answers that define explicit, measurable criteria for what to include or exclude.'
    },
    {
      id: 'ap13',
      domain: 'D2',
      pattern: 'Using MCP Tools for static data that should be Resources',
      why: 'MCP Tools add ~200 tokens per tool to the tool definition budget (always in context). Using Tools for static data (policies, schemas, config) wastes fixed context on every request.',
      correct: 'Use MCP <strong>Resources</strong> for static/semi-static read-only data. Resources are injected on-demand by the application, not defined as tool schemas consuming fixed context.',
      examTip: 'If the question asks how to provide reference documents to an agent, the answer is MCP Resources &mdash; not Tools. Tools are for actions with side effects or dynamic queries.'
    },
    {
      id: 'ap14',
      domain: 'D3',
      pattern: 'Expecting project-level settings to override managed-settings.json in enterprise environments',
      why: '<code>managed-settings.json</code> is the highest-precedence configuration layer (IT admin, system-level). Project and user settings CANNOT override it.',
      correct: 'Understand the settings precedence: managed-settings.json &gt; enterprise policy &gt; project settings &gt; user settings &gt; CLI flags. Enterprise lockdown settings like <code>allowManagedMcpServersOnly</code> are enforced at the managed level.',
      examTip: 'If a scenario describes restricting which MCP servers or models developers can use, the answer is <code>managed-settings.json</code> with appropriate lockdown flags &mdash; not project-level settings.'
    },
    {
      id: 'ap15',
      domain: 'D5',
      pattern: 'Trying to fix &quot;Lost in the Middle&quot; by increasing context window size',
      why: 'The Lost in the Middle effect means attention degrades in the center of the context window. Making the window larger creates MORE middle content, making the problem WORSE.',
      correct: 'Restructure content placement: put critical information at the beginning (system prompt, case facts), use explicit section headers to create attention anchors, and trim middle-section volume aggressively.',
      examTip: 'If the agent has the information in context but still &quot;misses&quot; it, this is Lost in the Middle &mdash; fix by repositioning, not expanding. Distinct from context overflow where info is actually gone.'
    },
    {
      id: 'ap16',
      domain: 'D1',
      pattern: 'Confusing Agent Teams with subagent fan-out (Task tool spawning)',
      why: 'Agent Teams are independent long-running peers coordinated through shared task lists. Subagents are ephemeral children spawned by a coordinator via the Task tool. They have different lifecycles, coordination patterns, and use cases.',
      correct: 'Use <strong>subagent fan-out</strong> for parallelizable subtasks within one session (hub-and-spoke). Use <strong>Agent Teams</strong> for long-running workflows where independent instances coordinate through shared artifacts or message queues.',
      examTip: 'If the scenario describes &quot;independent instances coordinating through a shared task list,&quot; that&#39;s Agent Teams. If it says &quot;coordinator spawns parallel workers,&quot; that&#39;s subagent fan-out via Task tool.'
    },
    {
      id: 'ap17',
      domain: 'D5',
      pattern: 'Running context compaction without custom instructions in CLAUDE.md',
      why: 'Default compaction preserves verbose tool output and drops architectural decisions, constraints, and rationale. This causes &quot;amnesia&quot; where the agent forgets WHY decisions were made.',
      correct: 'Add a &quot;Compact Instructions&quot; section to CLAUDE.md that explicitly tells the compactor to preserve: architectural decisions, API design choices, failure modes, file paths, and established constraints.',
      examTip: 'If an agent &quot;forgets&quot; earlier architectural decisions after compaction, the fix is Compact Instructions in CLAUDE.md &mdash; not avoiding compaction or increasing context window.'
    }
  ],

  // ─── 4. Decision Trees ───────────────────────────────────────────────
  decisionTrees: [
    {
      title: 'Prompts vs. Programmatic Enforcement',
      question: 'Does the action involve financial transactions, security operations, or compliance requirements?',
      branches: [
        {
          condition: 'Yes &mdash; financial, security, or compliance',
          answer: '<strong>Programmatic enforcement</strong> is required. Use hooks that validate preconditions before execution and prerequisite gates that block unauthorized actions. Prompt-only constraints are NOT sufficient for high-stakes operations.'
        },
        {
          condition: 'No &mdash; informational, advisory, or low-risk',
          answer: '<strong>Prompt-based guidance</strong> is acceptable. System prompts, tool descriptions, and behavioral instructions can effectively guide the model for non-critical actions.'
        }
      ]
    },
    {
      title: 'Agent Loop Completion',
      question: 'How should you determine when an agent loop is complete?',
      branches: [
        {
          condition: 'stop_reason === &quot;tool_use&quot;',
          answer: '<strong>Continue the loop.</strong> The model wants to call another tool &mdash; execute the tool and feed the result back.'
        },
        {
          condition: 'stop_reason === &quot;end_turn&quot;',
          answer: '<strong>The agent is finished.</strong> Extract the final response and exit the loop.'
        },
        {
          condition: 'NEVER: Parse natural language output',
          answer: 'Text output is ambiguous and unreliable as a control signal. Do not check for keywords like &quot;done&quot; or &quot;complete.&quot;'
        },
        {
          condition: 'NEVER: Check text output type',
          answer: 'Whether the response &quot;looks like&quot; a final answer is not deterministic. Only <code>stop_reason</code> is reliable.'
        },
        {
          condition: 'NEVER: Use arbitrary iteration caps as primary control',
          answer: 'Hard caps are acceptable as a safety backstop only, not as the main loop termination mechanism.'
        }
      ]
    },
    {
      title: 'Subagents vs. Direct Work',
      question: 'When should you use subagents instead of having the coordinator do the work directly?',
      branches: [
        {
          condition: 'Tasks can run in parallel',
          answer: '<strong>Use subagents.</strong> Spawn independent subagents via Task tool or fork_session to process workstreams concurrently.'
        },
        {
          condition: 'Tasks need shared context across steps',
          answer: '<strong>Do the work directly</strong> in the coordinator. Subagents are isolated and cannot share state, so sequential context-dependent work is better handled in one agent.'
        },
        {
          condition: 'Independent workstreams with distinct outputs',
          answer: '<strong>Use subagents.</strong> Each subagent handles one workstream and returns structured results for the coordinator to integrate.'
        },
        {
          condition: 'Single-file edits or simple tasks',
          answer: '<strong>Do the work directly.</strong> The overhead of spawning a subagent is not justified for small, simple operations.'
        }
      ]
    },
    {
      title: 'Tool Misrouting Fix',
      question: 'Claude keeps calling the wrong tool. What should you fix?',
      branches: [
        {
          condition: 'First: Improve tool descriptions',
          answer: '<strong>This is the correct fix.</strong> Make each tool description clearly explain: what the tool does, what inputs it expects, example use cases, edge cases it handles, and when to use it vs. alternative tools.'
        },
        {
          condition: 'NOT: Add few-shot examples',
          answer: 'Few-shot examples increase token usage without addressing the root cause. If descriptions are ambiguous, examples won&#39;t reliably fix routing.'
        },
        {
          condition: 'NOT: Add a routing classifier',
          answer: 'Adding a separate classifier layer introduces complexity and latency. Better descriptions solve the problem at the source.'
        },
        {
          condition: 'NOT: Consolidate tools to reduce count',
          answer: 'Merging tools reduces capability and creates &quot;super tools&quot; that are harder to describe clearly. Keep tools focused and well-described.'
        }
      ]
    },
    {
      title: 'Structured Output Method',
      question: 'How should you get structured output from Claude?',
      branches: [
        {
          condition: 'Production systems needing reliable structured data',
          answer: '<strong>Use <code>tool_use</code> with JSON schemas.</strong> Add <code>strict: true</code> to the tool definition for guaranteed schema conformance. This eliminates type mismatches and missing required fields.'
        },
        {
          condition: 'Data may be missing or ambiguous',
          answer: '<strong>Use nullable fields and enum values</strong> like <code>&quot;unclear&quot;</code> or <code>&quot;other&quot;</code> in your schema. This lets the model express uncertainty instead of hallucinating values to fill required fields.'
        },
        {
          condition: 'Need to catch semantic errors (e.g., wrong date, mismatched values)',
          answer: '<strong>Use validation retry loops.</strong> Validate the extracted data, and if errors are found, send the error message back to the model so it can self-correct. Schema validation alone does NOT prevent semantic errors.'
        },
        {
          condition: 'Tempted to use regex or text parsing',
          answer: '<strong>Don&#39;t.</strong> Text output format varies between calls. Regex is brittle and cannot enforce types or handle format changes. Always prefer <code>tool_use</code> with schemas.'
        }
      ]
    },
    {
      title: 'MCP Primitive Selection',
      question: 'Which MCP primitive should you use for this data/functionality?',
      branches: [
        {
          condition: 'Dynamic data retrieval or actions with side effects',
          answer: '<strong>Use MCP Tools.</strong> Tools are model-invoked &mdash; Claude decides when to call them. Examples: <code>search_orders</code>, <code>process_refund</code>, <code>query_database</code>.'
        },
        {
          condition: 'Static/semi-static reference data (policies, schemas, configs)',
          answer: '<strong>Use MCP Resources.</strong> Resources are application-controlled &mdash; injected into context by the host app. They don&#39;t consume tool definition budget. Examples: company policies, API specs, regulatory documents.'
        },
        {
          condition: 'Pre-built interaction patterns for users',
          answer: '<strong>Use MCP Prompts.</strong> Prompts are user-facing templates that structure the interaction. Examples: &quot;Summarize this document,&quot; &quot;Review this PR,&quot; &quot;Analyze this dataset.&quot;'
        },
        {
          condition: 'Unsure whether data is static or dynamic',
          answer: 'Ask: <strong>Does the model need to decide WHEN to fetch this?</strong> If yes &rarr; Tool. If the data should always/conditionally be available in context &rarr; Resource.'
        }
      ]
    },
    {
      title: 'Enterprise Configuration Precedence',
      question: 'Where should this setting be configured?',
      branches: [
        {
          condition: 'Security lockdown (restrict MCP servers, models, network)',
          answer: '<strong>managed-settings.json</strong> &mdash; highest precedence, cannot be overridden by projects or users. Settings: <code>allowManagedMcpServersOnly</code>, <code>availableModels</code>, <code>network.allowedDomains</code>.'
        },
        {
          condition: 'Team coding standards and project conventions',
          answer: '<strong>Project-level CLAUDE.md</strong> &mdash; checked into the repo, shared via version control. All team members get the same conventions.'
        },
        {
          condition: 'Personal preferences (verbosity, editor style)',
          answer: '<strong>User-level ~/.claude/CLAUDE.md</strong> &mdash; personal only, not shared. Does not affect teammates.'
        },
        {
          condition: 'Language-specific rules that should only load for matching files',
          answer: '<strong>.claude/rules/ with path-scoped YAML frontmatter</strong> &mdash; loads conditionally based on file glob patterns. Reduces irrelevant context for non-matching files.'
        },
        {
          condition: 'Need to verify which settings are active and where they come from',
          answer: '<strong>Use /status command</strong> &mdash; shows active configuration layers and their origins (managed, enterprise, project, user, CLI).'
        }
      ]
    },
    {
      title: 'Quality Assurance Pattern Selection',
      question: 'How should you verify the quality of Claude\'s output?',
      branches: [
        {
          condition: 'Code generation that needs review',
          answer: '<strong>Separate independent reviewer instance.</strong> A second Claude instance reviews without the generator&#39;s reasoning context. Same-session self-review is biased.'
        },
        {
          condition: 'High-stakes extraction without ground truth',
          answer: '<strong>Best-of-N pattern.</strong> Generate N independent extractions, compare for agreement. High agreement = high confidence; disagreement = escalate to human.'
        },
        {
          condition: 'Structural/format errors in extraction',
          answer: '<strong>Retry-with-error-feedback.</strong> Validate output, send specific error messages back, let model self-correct. Works when the info is in the source.'
        },
        {
          condition: 'Information simply absent from source document',
          answer: '<strong>Retries will NOT help.</strong> Make fields nullable/optional so the model can honestly return <code>null</code>. Don&#39;t force fabrication through required fields.'
        }
      ]
    }
  ],

  // ─── 5. New Concepts (Recent API Features) ───────────────────────────
  newConcepts: [
    {
      name: 'Server-Side Compaction',
      description: '<p>Automatic context summarization triggered when the conversation approaches the context window limit.</p><ul><li>Uses the <code>compact_20260112</code> strategy specified in <code>context_management.edits</code></li><li>Configurable trigger threshold: default 150K tokens, minimum 50K tokens</li><li>Custom summarization instructions via the <code>instructions</code> parameter (e.g., &quot;always preserve order IDs and customer names&quot;)</li><li><code>pause_after_compaction</code> flag allows you to add content after the summary before the model continues</li></ul>',
      examRelevance: 'HIGH &mdash; directly tests Domain 5 (context management). Expect questions on configuring compaction thresholds and writing effective summarization instructions.',
      domain: 'D5'
    },
    {
      name: 'Context Awareness',
      description: '<p>Claude 4.5+ models automatically receive context budget information:</p><ul><li><code>&lt;budget:token_budget&gt;</code> tag at the start of the conversation</li><li><code>&lt;system_warning&gt;Token usage: X/Y; Z remaining&lt;/system_warning&gt;</code> after each tool call</li><li>Enables the model to self-monitor remaining context and manage behavior in long sessions</li></ul>',
      examRelevance: 'MEDIUM &mdash; may test understanding of how models track their context budget and adapt behavior as context fills up.',
      domain: 'D5'
    },
    {
      name: 'Adaptive Thinking',
      description: '<p>Replaces manual <code>budget_tokens</code> configuration in Claude 4.6:</p><ul><li>Uses <code>thinking: { type: &quot;adaptive&quot; }</code> with an <code>effort</code> parameter</li><li>Effort levels: <code>low</code>, <code>medium</code>, <code>high</code>, <code>max</code></li><li>The model dynamically decides when and how much to think based on task complexity</li><li>Reduces wasted tokens on simple tasks while allowing deep reasoning on complex ones</li></ul>',
      examRelevance: 'MEDIUM &mdash; may test when to use adaptive thinking vs. extended thinking with explicit budget_tokens.',
      domain: 'D4'
    },
    {
      name: 'Structured Outputs with strict: true',
      description: '<p>Adding <code>strict: true</code> to tool definitions provides guaranteed schema validation:</p><ul><li>Eliminates type mismatches (string where number expected)</li><li>Eliminates missing required fields</li><li>Enforces enum constraints on categorical values</li><li>Essential for production agents that must produce consistently formatted output</li><li>Does NOT prevent semantic errors &mdash; validation retry loops are still needed for that</li></ul>',
      examRelevance: 'HIGH &mdash; directly related to Domain 4 (structured output). Expect questions that distinguish schema validation from semantic validation.',
      domain: 'D4'
    },
    {
      name: 'pause_turn Stop Reason',
      description: '<p>A stop reason returned by the server-side tool sampling loop:</p><ul><li>The server-side loop has a default 10-iteration limit</li><li>When hit, the API returns <code>stop_reason=&quot;pause_turn&quot;</code> with an incomplete <code>server_tool_use</code> block</li><li>You must continue the conversation (send the result back) to let Claude finish its work</li><li>Different from <code>end_turn</code> (agent done) and <code>tool_use</code> (wants to call a tool)</li></ul>',
      examRelevance: 'LOW&ndash;MEDIUM &mdash; edge case knowledge that may appear in questions about advanced agent loop handling.',
      domain: 'D2'
    },
    {
      name: 'MCP Connector',
      description: '<p>Connect directly to remote MCP servers from the Messages API:</p><ul><li>Eliminates the need to build and host your own MCP client</li><li>Specify MCP server URLs directly in the API request</li><li>Alternative architecture for tool integration alongside custom <code>tool_use</code> definitions</li><li>Simplifies deployment for teams already using MCP-compatible tool servers</li></ul>',
      examRelevance: 'LOW&ndash;MEDIUM &mdash; may appear in questions about MCP integration options and when to use a connector vs. building a custom client.',
      domain: 'D2'
    }
  ],

  // ─── 6. Scenario &times; Domain Matrix ───────────────────────────────
  scenarioDomainMatrix: {
    headers: ['Scenario', 'D1 (27%)', 'D2 (18%)', 'D3 (20%)', 'D4 (20%)', 'D5 (15%)'],
    rows: [
      { scenario: 'S1: Customer Support Agent', cells: ['Primary', 'Primary', '', '', 'Primary'] },
      { scenario: 'S2: Code Generation', cells: ['', '', 'Primary', '', 'Primary'] },
      { scenario: 'S3: Multi-Agent Research', cells: ['Primary', 'Primary', '', '', 'Primary'] },
      { scenario: 'S4: Developer Productivity', cells: ['Primary', 'Primary', 'Primary', '', ''] },
      { scenario: 'S5: Claude Code CI/CD', cells: ['', '', 'Primary', 'Primary', ''] },
      { scenario: 'S6: Structured Extraction', cells: ['', 'Secondary', '', 'Primary', 'Primary'] }
    ]
  },

  // ─── 7. Study Resources ────────────────────────────────────────────
  studyResources: [
    {
      stage: 'Stage 0: Diagnostic',
      items: [
        { name: 'Diagnostic Quiz (15 min)', url: 'https://claudecertificationguide.com/diagnostic', note: 'Identify weak domains before you start' }
      ]
    },
    {
      stage: 'Stage 1: Foundation &mdash; Anthropic Academy (8&ndash;12h)',
      items: [
        { name: '1.1 Claude Code in Action', url: 'https://anthropic.skilljar.com/claude-code-in-action', note: 'D1, D2, D3 &mdash; CLAUDE.md, MCP servers, hooks, SDK' },
        { name: '1.2 Building with the Claude API', url: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api', note: 'D1, D2, D4 &mdash; agentic loops, stop_reason, tool_use' },
        { name: '1.3 Intro to Model Context Protocol', url: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol', note: 'D2 &mdash; tools, resources, prompts, isError' },
        { name: '1.4 Intro to Agent Skills', url: 'https://anthropic.skilljar.com/introduction-to-agent-skills', note: 'D3 &mdash; SKILL.md, context: fork, allowed-tools' },
        { name: '1.5 Intro to Subagents', url: 'https://anthropic.skilljar.com/introduction-to-subagents', note: 'D1, D5 &mdash; sub-agents, context delegation' },
        { name: '1.6 MCP: Advanced Topics', url: 'https://anthropic.skilljar.com/model-context-protocol-advanced-topics', note: 'D2 &mdash; sampling, transport, production scaling' }
      ]
    },
    {
      stage: 'Stage 2: Theory &mdash; Community Study Guide (10&ndash;15h)',
      items: [
        { name: 'Community Study Guide (13 chapters)', url: 'https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.MD', note: 'All 5 domains &mdash; 60+ questions, unofficial but comprehensive' }
      ]
    },
    {
      stage: 'Stage 3: Visual Reinforcement (1&ndash;2h)',
      items: [
        { name: "The Architect's Playbook (PDF, 27 pages)", url: 'https://drive.google.com/file/d/1luC0rnrET4tDYtS7xe5jUxMDZA-4qNf-/view', note: 'Visual diagrams for production patterns and anti-patterns across 4 scenarios' }
      ]
    },
    {
      stage: 'Stage 4: Intensive &mdash; EPAM Exam Prep (12&ndash;16h)',
      items: [
        { name: 'EPAM Architecture Exam Prep', url: 'https://git.epam.com/epm-ease/anthropic-cert/arch-examp-prep', note: '7-day course + 256 practice questions + flashcards' }
      ]
    },
    {
      stage: 'Stage 5: Hands-on Practice (35&ndash;55h)',
      items: [
        { name: 'Interactive Tutoring Prompts (@hooeem)', url: 'https://x.com/hooeem/status/2033198345045336559', note: '5 prompts (one per domain) &mdash; paste into Claude for interactive lessons' },
        { name: 'Build Exercises (30 exercises)', url: 'https://claudecertificationguide.com/build-exercises', note: 'One exercise per task statement' }
      ]
    },
    {
      stage: 'Stage 6: Documentation &mdash; Closing Gaps (8&ndash;15h)',
      items: [
        { name: 'Agent SDK Overview', url: 'https://docs.anthropic.com/en/docs/claude-code/sdk', note: 'SDK architecture and concepts' },
        { name: 'Agent SDK &mdash; TypeScript', url: 'https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-typescript', note: 'TS-specific SDK usage' },
        { name: 'Agent SDK &mdash; Python', url: 'https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-python', note: 'Python-specific SDK usage' },
        { name: 'Subagents', url: 'https://docs.anthropic.com/en/docs/claude-code/sub-agents', note: 'Sub-agent patterns and delegation' },
        { name: 'Tool Use API', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview', note: 'Tool definitions, JSON schemas, tool_choice' },
        { name: 'Claude Code CLI Reference', url: 'https://docs.anthropic.com/en/docs/claude-code/cli-reference', note: 'Full CLI flag reference' },
        { name: 'Claude Code CLI Cheatsheet', url: 'https://shipyard.build/blog/claude-code-cheat-sheet/', note: 'Quick CLI reference' },
        { name: 'CLAUDE.md / Memory', url: 'https://docs.anthropic.com/en/docs/claude-code/memory', note: 'Memory persistence and CLAUDE.md hierarchy' },
        { name: 'Creating the Perfect CLAUDE.md', url: 'https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/', note: 'Best practices for CLAUDE.md' },
        { name: 'Prompt Engineering Overview', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', note: 'Official prompt engineering guide' },
        { name: 'Long Context Tips', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips', note: 'Managing long context windows' },
        { name: 'Message Batches API', url: 'https://docs.claude.com/en/docs/build-with-claude/batch-processing', note: 'Batch processing with custom_id' },
        { name: 'Context Editing (Claude Platform)', url: 'https://platform.claude.com/docs/en/build-with-claude/context-editing', note: 'New topic &mdash; editing context in conversations' },
        { name: 'MCP Specification', url: 'https://modelcontextprotocol.io/docs/getting-started/intro', note: 'Official MCP spec' },
        { name: 'MCP Blog (2026 updates)', url: 'https://blog.modelcontextprotocol.io/', note: 'Latest MCP developments' },
        { name: 'Everything Claude Code Repo', url: 'https://github.com/affaan-m/everything-claude-code', note: 'Community collection of Claude Code resources' },
        { name: 'Anthropic Cookbook', url: 'https://github.com/anthropics/anthropic-cookbook', note: 'Official code examples and recipes' }
      ]
    },
    {
      stage: 'Stage 7: Practice Exams (10&ndash;15h)',
      items: [
        { name: 'Official Practice Exam (Anthropic)', url: 'https://anthropic.skilljar.com/anthropic-certification-practice-exam/425721/scorm/17p1a5iqsma8x', note: 'The only official practice test &mdash; do this first' },
        { name: 'Community Guide Practice Test (45 Q)', url: 'https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.MD', note: 'Test at the end of the guide, 4 scenarios' },
        { name: 'claudecertificationguide.com Practice', url: 'https://claudecertificationguide.com/practice', note: '~25 questions, 60-min timer, exam traps section' },
        { name: 'AI Bazaar Quiz (@jetpippo)', url: 'https://ai-bazaar-eight.vercel.app', note: '65 scenario-based questions across 5 domains' }
      ]
    },
    {
      stage: 'Stage 8: Final Review (1&ndash;2h)',
      items: [
        { name: 'Quick Reference', url: 'https://claudecertificationguide.com/quick-reference', note: 'Last-minute review cheatsheet' },
        { name: 'Glossary', url: 'https://claudecertificationguide.com/glossary', note: 'Key terms and definitions' },
        { name: 'Domain Cheatsheet (\u2713/\u2717 format)', url: 'https://dynamicbalaji.medium.com/claude-certified-architect-foundations-certification-preparation-guide-c70546b51f51', note: 'Visual pass/fail checklist per domain' }
      ]
    }
  ]

};
