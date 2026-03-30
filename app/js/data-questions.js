// ===== Practice Quiz Questions =====
const QUIZ_QUESTIONS = [
  // ===== DOMAIN 1: Agentic Architecture =====
  {
    id: "q1",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    question: "Production data shows that in 12% of cases, your agent skips get_customer entirely and calls lookup_order using only the customer's stated name, occasionally leading to misidentified accounts and incorrect refunds. What change would most effectively address this reliability issue?",
    answers: [
      { letter: "A", text: "Add a programmatic prerequisite that blocks lookup_order and process_refund calls until get_customer has returned a verified customer ID." },
      { letter: "B", text: "Enhance the system prompt to state that customer verification via get_customer is mandatory before any order operations." },
      { letter: "C", text: "Add few-shot examples showing the agent always calling get_customer first, even when customers volunteer order details." },
      { letter: "D", text: "Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type." }
    ],
    correct: "A",
    explanation: "When a specific tool sequence is required for critical business logic (like verifying customer identity before processing refunds), programmatic enforcement provides deterministic guarantees that prompt-based approaches cannot. Options B and C rely on probabilistic LLM compliance, which is insufficient when errors have financial consequences. Option D addresses tool availability rather than tool ordering."
  },
  {
    id: "q2",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "After running the system on 'impact of AI on creative industries,' each subagent completes successfully but the final report covers only visual arts, missing music, writing, and film. The coordinator's logs show it decomposed the topic into: 'AI in digital art creation,' 'AI in graphic design,' and 'AI in photography.' What is the most likely root cause?",
    answers: [
      { letter: "A", text: "The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives." },
      { letter: "B", text: "The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains." },
      { letter: "C", text: "The web search agent's queries are not comprehensive enough and need to be expanded." },
      { letter: "D", text: "The document analysis agent is filtering out non-visual creative industry sources due to overly restrictive relevance criteria." }
    ],
    correct: "B",
    explanation: "The coordinator's logs reveal the root cause: it decomposed 'creative industries' into only visual arts subtasks. The subagents executed their assigned tasks correctly -- the problem is what they were assigned. Options A, C, and D blame downstream agents that are working correctly within their assigned scope."
  },
  {
    id: "q3",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "The web search subagent times out while researching a complex topic. You need to design how this failure information flows back to the coordinator. Which error propagation approach best enables intelligent recovery?",
    answers: [
      { letter: "A", text: "Return structured error context including failure type, attempted query, partial results, and potential alternative approaches." },
      { letter: "B", text: "Implement automatic retry with exponential backoff within the subagent, returning a generic 'search unavailable' status after all retries are exhausted." },
      { letter: "C", text: "Catch the timeout and return an empty result set marked as successful." },
      { letter: "D", text: "Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow." }
    ],
    correct: "A",
    explanation: "Structured error context gives the coordinator information for intelligent recovery -- retry with modified query, try alternatives, or proceed with partial results. Option B's generic status hides context. Option C suppresses the error by marking failure as success. Option D terminates the entire workflow unnecessarily."
  },
  {
    id: "q4",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "The synthesis agent frequently needs to verify specific claims. Currently it returns to the coordinator, which invokes web search, then re-invokes synthesis, adding 2-3 round trips (40% latency increase). 85% of verifications are simple fact-checks, 15% require deeper investigation. What's the most effective approach?",
    answers: [
      { letter: "A", text: "Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating through the coordinator." },
      { letter: "B", text: "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator." },
      { letter: "C", text: "Give the synthesis agent access to all web search tools so it handles any verification directly." },
      { letter: "D", text: "Have the web search agent proactively cache extra context around each source during initial research." }
    ],
    correct: "A",
    explanation: "Option A applies least privilege: scoped tool for the 85% common case while preserving coordination for complex cases. Option B creates blocking dependencies since synthesis steps may depend on earlier verified facts. Option C over-provisions, violating separation of concerns. Option D relies on speculative caching."
  },
  {
    id: "q5",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    question: "Your agent achieves 55% first-contact resolution, well below 80% target. Logs show it escalates straightforward cases (standard damage replacements with photo evidence) while attempting complex situations requiring policy exceptions. What's the most effective fix?",
    answers: [
      { letter: "A", text: "Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously." },
      { letter: "B", text: "Have the agent self-report a confidence score (1-10) and automatically route to humans when below a threshold." },
      { letter: "C", text: "Deploy a separate classifier model trained on historical tickets to predict escalation needs." },
      { letter: "D", text: "Implement sentiment analysis to detect frustration and automatically escalate when negative sentiment exceeds a threshold." }
    ],
    correct: "A",
    explanation: "Explicit criteria with few-shot examples directly addresses unclear decision boundaries. Option B fails because LLM self-reported confidence is poorly calibrated. Option C is over-engineered when prompt optimization hasn't been tried. Option D solves a different problem -- sentiment doesn't correlate with case complexity."
  },
  {
    id: "q6",
    domain: 1,
    scenario: "Developer Productivity Tools",
    question: "You're building a coordinator agent that delegates to specialized subagents. When you test it, subagents consistently fail to execute, returning errors about unavailable tools. The coordinator's allowedTools includes Bash, Read, Write, and Grep. What's the most likely issue?",
    answers: [
      { letter: "A", text: "The coordinator's allowedTools does not include 'Task', which is required for spawning subagents." },
      { letter: "B", text: "The subagent definitions are missing system prompts." },
      { letter: "C", text: "The coordinator needs 'spawn_subagent' in allowedTools instead of 'Task'." },
      { letter: "D", text: "Subagents inherit the coordinator's tool restrictions and cannot access their own tools." }
    ],
    correct: "A",
    explanation: "The Task tool is the mechanism for spawning subagents. If allowedTools doesn't include 'Task', the coordinator cannot invoke subagents at all. Option C references a non-existent tool name. Option D is wrong because subagents have their own tool configurations. Option B would cause different errors."
  },
  {
    id: "q7",
    domain: 1,
    scenario: "Developer Productivity Tools",
    question: "Your coordinator agent spawns a synthesis subagent, but it produces a report missing key findings from the web search subagent that ran earlier. The web search results were detailed and correct. What's the most likely cause?",
    answers: [
      { letter: "A", text: "The synthesis subagent's prompt did not include the web search findings -- subagents don't automatically inherit the coordinator's conversation history." },
      { letter: "B", text: "The synthesis subagent's context window was too small to process the web search results." },
      { letter: "C", text: "The web search subagent stored its results in a shared memory space that the synthesis subagent couldn't access." },
      { letter: "D", text: "The coordinator should have used fork_session instead of Task to share context between agents." }
    ],
    correct: "A",
    explanation: "Subagents have isolated context and do NOT inherit the coordinator's conversation history. Context must be explicitly provided in the subagent's prompt. There is no 'shared memory space' between agents (Option C). fork_session is for branching exploration, not for context sharing between different subagent types (Option D)."
  },
  {
    id: "q8",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    question: "You need to normalize data from multiple MCP tools: one returns Unix timestamps, another returns ISO 8601 dates, and a third returns numeric status codes. What's the best approach to ensure consistent data processing?",
    answers: [
      { letter: "A", text: "Implement PostToolUse hooks that intercept and normalize tool results before the model processes them." },
      { letter: "B", text: "Add format conversion instructions to the system prompt, asking the model to mentally convert formats." },
      { letter: "C", text: "Modify each MCP tool server to return data in a standardized format." },
      { letter: "D", text: "Create a separate normalization subagent that processes all tool results before passing them to the main agent." }
    ],
    correct: "A",
    explanation: "PostToolUse hooks intercept tool results for transformation before the model processes them -- this is exactly what they're designed for. Option B relies on probabilistic model behavior. Option C may not be feasible if you don't control the MCP servers. Option D adds unnecessary complexity and latency."
  },
  // ===== DOMAIN 2: Tool Design & MCP Integration =====
  {
    id: "q9",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    question: "Production logs show the agent frequently calls get_customer when users ask about orders (e.g., 'check my order #12345'), instead of lookup_order. Both tools have minimal descriptions ('Retrieves customer information' / 'Retrieves order details') and accept similar identifier formats. What's the most effective first step?",
    answers: [
      { letter: "A", text: "Add 5-8 few-shot examples to the system prompt demonstrating correct tool selection patterns." },
      { letter: "B", text: "Expand each tool's description to include input formats, example queries, edge cases, and boundaries explaining when to use it versus similar tools." },
      { letter: "C", text: "Implement a routing layer that parses user input and pre-selects the appropriate tool based on keywords." },
      { letter: "D", text: "Consolidate both tools into a single lookup_entity tool that accepts any identifier." }
    ],
    correct: "B",
    explanation: "Tool descriptions are the primary mechanism LLMs use for selection. Minimal descriptions cause the problem; expanding them is the low-effort, high-leverage first step. Few-shot examples (A) add token overhead without fixing the root cause. A routing layer (C) is over-engineered. Consolidation (D) requires more effort than a 'first step' warrants."
  },
  {
    id: "q10",
    domain: 2,
    scenario: "Developer Productivity Tools",
    question: "Your agent has access to 18 tools across different specializations. You notice it increasingly selects wrong tools for tasks, especially when multiple tools have overlapping capabilities. What should you do?",
    answers: [
      { letter: "A", text: "Restrict each agent to 4-5 tools relevant to its role and distribute specialized tools to appropriate subagents." },
      { letter: "B", text: "Add detailed priority rankings to each tool description so the model knows which to prefer." },
      { letter: "C", text: "Implement a tool selection verification step where the model confirms its choice before execution." },
      { letter: "D", text: "Train a separate classifier to predict the correct tool based on the user's query." }
    ],
    correct: "A",
    explanation: "Too many tools (18 vs 4-5) degrades selection reliability by increasing decision complexity. Restricting each agent's tool set to its role is the direct fix. Priority rankings (B) add complexity without reducing the decision space. Verification steps (C) add latency. A separate classifier (D) is over-engineered."
  },
  {
    id: "q11",
    domain: 2,
    scenario: "Structured Data Extraction",
    question: "Your extraction tool returns an empty result set when querying a database for records matching a valid but uncommon filter. The agent interprets this as a failure and retries multiple times before giving up. How should you fix the tool's error response?",
    answers: [
      { letter: "A", text: "Distinguish between access failures (returning isError with isRetryable: true) and valid empty results (returning success with an empty data array and a message confirming zero matches)." },
      { letter: "B", text: "Always return at least one placeholder record so the result set is never empty." },
      { letter: "C", text: "Add a minimum retry count of 3 for all empty results before treating them as final." },
      { letter: "D", text: "Return a generic 'no results' error with isError: true for all empty result cases." }
    ],
    correct: "A",
    explanation: "Distinguishing access failures from valid empty results is critical. An empty result from a successful query is not an error -- it's valid data. Option B fabricates data. Option C wastes resources retrying a correct result. Option D incorrectly marks a successful query as an error."
  },
  {
    id: "q12",
    domain: 2,
    scenario: "Code Generation with Claude Code",
    question: "Your team has a GitHub integration MCP server configured in the project's .mcp.json, but a new developer reports they can't use it. Other team members work fine. The MCP server requires a GITHUB_TOKEN. What's the most likely issue?",
    answers: [
      { letter: "A", text: "The new developer doesn't have the GITHUB_TOKEN environment variable set on their machine, and .mcp.json uses ${GITHUB_TOKEN} for credential expansion." },
      { letter: "B", text: "The .mcp.json file needs to be in ~/.claude.json instead for it to work for all users." },
      { letter: "C", text: "MCP servers only work for the user who originally configured them." },
      { letter: "D", text: "The new developer needs to run a special MCP initialization command after cloning the repo." }
    ],
    correct: "A",
    explanation: ".mcp.json supports environment variable expansion (${GITHUB_TOKEN}). If the new developer hasn't set this env var, the MCP server connection will fail. Project-level .mcp.json (not ~/.claude.json) is correct for shared team tools. MCP servers work for any user with proper config (C is wrong). There's no special initialization command (D is wrong)."
  },
  {
    id: "q13",
    domain: 2,
    scenario: "Developer Productivity Tools",
    question: "You want to find all files named '*.service.ts' in your project. Which built-in tool should you use?",
    answers: [
      { letter: "A", text: "Glob -- it finds files matching name/path patterns like **/*.service.ts" },
      { letter: "B", text: "Grep -- it searches for patterns across the codebase" },
      { letter: "C", text: "Read -- it can scan directories recursively" },
      { letter: "D", text: "Bash with 'find' command -- built-in tools can't do file discovery" }
    ],
    correct: "A",
    explanation: "Glob is for finding files by name/path patterns. Grep is for searching file contents (the text inside files). Read is for reading specific files, not discovery. While Bash+find works, the built-in Glob tool is the correct choice."
  },
  // ===== DOMAIN 3: Claude Code Configuration =====
  {
    id: "q14",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "You want to create a custom /review slash command available to every developer when they clone the repository. Where should you create this command file?",
    answers: [
      { letter: "A", text: "In the .claude/commands/ directory in the project repository" },
      { letter: "B", text: "In ~/.claude/commands/ in each developer's home directory" },
      { letter: "C", text: "In the CLAUDE.md file at the project root" },
      { letter: "D", text: "In a .claude/config.json file with a commands array" }
    ],
    correct: "A",
    explanation: "Project-scoped commands in .claude/commands/ are version-controlled and available to all developers on clone/pull. ~/.claude/commands/ (B) is for personal commands. CLAUDE.md (C) is for instructions, not command definitions. .claude/config.json with commands array (D) doesn't exist."
  },
  {
    id: "q15",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "You've been assigned to restructure a monolithic application into microservices, involving changes across dozens of files with decisions about service boundaries. Which approach should you take?",
    answers: [
      { letter: "A", text: "Enter plan mode to explore the codebase, understand dependencies, and design an approach before making changes." },
      { letter: "B", text: "Start with direct execution, making changes incrementally to let implementation reveal natural service boundaries." },
      { letter: "C", text: "Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured." },
      { letter: "D", text: "Begin in direct execution and only switch to plan mode if you encounter unexpected complexity." }
    ],
    correct: "A",
    explanation: "Plan mode is designed for complex tasks with large-scale changes, multiple valid approaches, and architectural decisions. Option B risks costly rework when dependencies are found late. Option C assumes you know the right structure without exploring. Option D ignores that complexity is already stated in the requirements."
  },
  {
    id: "q16",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "Your codebase has React components (functional style), API handlers (async/await), and database models (repository pattern). Test files are spread throughout. What's the most maintainable way to apply correct conventions automatically?",
    answers: [
      { letter: "A", text: "Create rule files in .claude/rules/ with YAML frontmatter specifying glob patterns for conditional convention loading." },
      { letter: "B", text: "Consolidate all conventions in root CLAUDE.md under headers for each area, relying on Claude to infer which applies." },
      { letter: "C", text: "Create skills in .claude/skills/ for each code type with relevant conventions in SKILL.md files." },
      { letter: "D", text: "Place a separate CLAUDE.md file in each subdirectory containing that area's specific conventions." }
    ],
    correct: "A",
    explanation: ".claude/rules/ with glob patterns (e.g., **/*.test.tsx) automatically applies conventions based on file paths regardless of directory location. Option B relies on inference. Option C requires manual invocation. Option D can't handle test files spread across many directories."
  },
  {
    id: "q17",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "A new team member joins and reports that Claude Code gives them different coding style suggestions than the rest of the team. Other team members get consistent results. What's the most likely cause?",
    answers: [
      { letter: "A", text: "The coding style rules are in ~/.claude/CLAUDE.md (user-level) on existing team members' machines instead of the project-level configuration." },
      { letter: "B", text: "The new team member hasn't installed the latest version of Claude Code." },
      { letter: "C", text: "The project's CLAUDE.md file was corrupted during the git clone." },
      { letter: "D", text: "Claude Code randomizes style suggestions for each user by default." }
    ],
    correct: "A",
    explanation: "User-level settings (~/.claude/CLAUDE.md) are NOT shared via version control. If coding standards are there instead of project-level (.claude/CLAUDE.md or root CLAUDE.md), new team members won't receive them. This is a classic hierarchy configuration issue."
  },
  {
    id: "q18",
    domain: 3,
    scenario: "Claude Code for CI",
    question: "Your CI pipeline runs 'claude \"Analyze this PR for security issues\"' but the job hangs indefinitely. What's the correct fix?",
    answers: [
      { letter: "A", text: "Add the -p flag: claude -p \"Analyze this PR for security issues\"" },
      { letter: "B", text: "Set CLAUDE_HEADLESS=true before running the command" },
      { letter: "C", text: "Redirect stdin from /dev/null" },
      { letter: "D", text: "Add the --batch flag" }
    ],
    correct: "A",
    explanation: "The -p (--print) flag runs Claude Code in non-interactive mode: processes prompt, outputs to stdout, exits. The other options reference non-existent features (CLAUDE_HEADLESS, --batch) or Unix workarounds that don't properly handle Claude Code's command syntax."
  },
  {
    id: "q19",
    domain: 3,
    scenario: "Claude Code for CI",
    question: "Your team wants to reduce API costs. Two workflows exist: (1) blocking pre-merge check, (2) overnight technical debt report. Your manager proposes switching both to Message Batches API for 50% savings. How should you evaluate this?",
    answers: [
      { letter: "A", text: "Use batch processing for technical debt reports only; keep real-time calls for pre-merge checks." },
      { letter: "B", text: "Switch both to batch processing with status polling." },
      { letter: "C", text: "Keep real-time calls for both to avoid batch result ordering issues." },
      { letter: "D", text: "Switch both to batch with a timeout fallback to real-time." }
    ],
    correct: "A",
    explanation: "Batch API has up to 24-hour processing with no latency SLA -- unsuitable for blocking pre-merge checks where developers wait. Ideal for overnight jobs. Option B puts blocking workflows at risk. Option C wastes money unnecessarily. Option D adds complexity when the solution is simply matching each API to its use case."
  },
  {
    id: "q20",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "You're creating a skill that performs verbose codebase analysis, generating extensive output. You want to prevent this from polluting the main conversation context. What SKILL.md frontmatter should you use?",
    answers: [
      { letter: "A", text: "context: fork to run the skill in an isolated sub-agent context" },
      { letter: "B", text: "output: hidden to suppress the skill's output from the conversation" },
      { letter: "C", text: "isolation: true to create a sandboxed execution environment" },
      { letter: "D", text: "context: silent to run without affecting conversation history" }
    ],
    correct: "A",
    explanation: "context: fork runs the skill in an isolated sub-agent context, preventing its outputs from polluting the main conversation. The other options (output: hidden, isolation: true, context: silent) are not real SKILL.md frontmatter options."
  },
  // ===== DOMAIN 4: Prompt Engineering =====
  {
    id: "q21",
    domain: 4,
    scenario: "Claude Code for CI",
    question: "A PR modifies 14 files. Your single-pass review produces inconsistent depth: detailed feedback for some files, superficial for others, missed bugs, and contradictory feedback (flagging a pattern in one file while approving it elsewhere). How should you restructure?",
    answers: [
      { letter: "A", text: "Split into focused passes: analyze each file individually for local issues, then a separate integration pass for cross-file data flow." },
      { letter: "B", text: "Require developers to split large PRs into 3-4 file submissions." },
      { letter: "C", text: "Switch to a larger context window model." },
      { letter: "D", text: "Run three independent passes and only flag issues appearing in at least two." }
    ],
    correct: "A",
    explanation: "Per-file passes + integration pass directly addresses attention dilution. Option B shifts burden to developers. Option C misunderstands that larger context doesn't solve attention quality. Option D would suppress detection of real bugs by requiring consensus."
  },
  {
    id: "q22",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "Your extraction system uses tool_use with strict JSON schemas, eliminating syntax errors. But you notice line items don't sum to stated totals, and values appear in wrong fields. What type of errors remain?",
    answers: [
      { letter: "A", text: "Semantic validation errors -- strict schemas eliminate syntax errors but not logical inconsistencies like mismatched totals or misplaced values." },
      { letter: "B", text: "Schema definition errors -- the JSON schema needs stricter type constraints." },
      { letter: "C", text: "Parsing errors -- the tool_use response isn't being decoded correctly." },
      { letter: "D", text: "Token limit errors -- the model is truncating output to fit within limits." }
    ],
    correct: "A",
    explanation: "Strict JSON schemas via tool_use eliminate syntax errors (malformed JSON, wrong types) but cannot prevent semantic errors (values that don't add up, data in wrong fields). These require additional validation logic beyond schema enforcement."
  },
  {
    id: "q23",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "Your extraction schema has a required 'company_address' field. When processing documents that don't contain an address, the model fabricates plausible-looking addresses. How should you fix this?",
    answers: [
      { letter: "A", text: "Make the field optional/nullable so the model can return null when the information isn't present in the source document." },
      { letter: "B", text: "Add 'DO NOT fabricate information' to the system prompt." },
      { letter: "C", text: "Add a confidence score field and filter out low-confidence extractions." },
      { letter: "D", text: "Implement a post-processing step that validates addresses against a postal database." }
    ],
    correct: "A",
    explanation: "Making fields nullable when source documents may not contain the information prevents the model from fabricating values to satisfy required fields. Option B is prompt-based and unreliable. Option C doesn't prevent fabrication, just flags it after the fact. Option D is over-engineered for this root cause."
  },
  {
    id: "q24",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "Your extraction system fails validation on some documents. You implement a retry loop that re-sends the document with the validation errors. It fixes most issues, but some documents consistently fail all retries. Investigation shows the failing documents simply don't contain the required information. What should you conclude?",
    answers: [
      { letter: "A", text: "Retries are effective for format/structural errors but ineffective when the required information is absent from the source document." },
      { letter: "B", text: "The retry count should be increased from 3 to 10 for difficult documents." },
      { letter: "C", text: "A more powerful model is needed for these edge cases." },
      { letter: "D", text: "The validation rules are too strict and should be relaxed for all documents." }
    ],
    correct: "A",
    explanation: "Retry-with-error-feedback works for format mismatches and structural output errors. It's fundamentally ineffective when the information doesn't exist in the source. More retries (B) won't create missing information. A larger model (C) can't extract what isn't there. Relaxing rules (D) hides the real problem."
  },
  {
    id: "q25",
    domain: 4,
    scenario: "Claude Code for CI",
    question: "Your automated code review produces detailed instructions but developers report inconsistent output formats -- sometimes bullet points, sometimes paragraphs, sometimes tables. What's the most effective fix?",
    answers: [
      { letter: "A", text: "Add 2-4 few-shot examples showing the exact desired output format with location, issue, severity, and suggested fix." },
      { letter: "B", text: "Add 'Always use bullet point format' to the system prompt." },
      { letter: "C", text: "Increase the temperature to 0 for maximum determinism." },
      { letter: "D", text: "Post-process the output into a standard format." }
    ],
    correct: "A",
    explanation: "Few-shot examples are the most effective technique for achieving consistent output format. A simple format instruction (B) is often interpreted inconsistently. Temperature 0 (C) affects randomness, not format compliance. Post-processing (D) adds complexity without fixing the root cause."
  },
  {
    id: "q26",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "You need to extract data from documents where the document type is unknown (could be invoices, contracts, or reports). Each type has a different JSON schema. How should you configure tool_choice?",
    answers: [
      { letter: "A", text: "Set tool_choice: 'any' so the model must call a tool but can choose which extraction schema to apply based on the document." },
      { letter: "B", text: "Set tool_choice: 'auto' so the model can optionally return text if it can't determine the document type." },
      { letter: "C", text: "Force a specific tool with tool_choice: {type: 'tool', name: 'extract_invoice'} and fall back to others on failure." },
      { letter: "D", text: "Define a single generic schema that covers all document types." }
    ],
    correct: "A",
    explanation: "tool_choice: 'any' guarantees structured output (model must call a tool) while letting the model select the appropriate schema based on document content. 'auto' (B) risks getting unstructured text. Forcing one tool (C) assumes a document type incorrectly. A single generic schema (D) loses type-specific precision."
  },
  // ===== DOMAIN 5: Context Management & Reliability =====
  {
    id: "q27",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    question: "Your support agent handles multi-issue customer sessions. After resolving the third issue, you notice the agent references incorrect dollar amounts and dates from the first issue. What's the most effective fix?",
    answers: [
      { letter: "A", text: "Extract transactional facts (amounts, dates, order IDs, statuses) into a persistent 'case facts' block included in each prompt, outside summarized history." },
      { letter: "B", text: "Increase the context window size to retain all conversation details." },
      { letter: "C", text: "Add a prompt instruction: 'Always refer back to exact values mentioned by the customer.'" },
      { letter: "D", text: "Limit sessions to handling only one issue at a time." }
    ],
    correct: "A",
    explanation: "Progressive summarization risks condensing exact values into vague summaries. Extracting transactional facts into a persistent structured block ensures they survive summarization. Larger context (B) delays but doesn't prevent the problem. Prompt instructions (C) are unreliable. Single-issue sessions (D) hurt the customer experience."
  },
  {
    id: "q28",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    question: "A customer writes: 'This is ridiculous, I want to speak to a real person NOW.' The agent has the information to resolve the issue. What should the agent do?",
    answers: [
      { letter: "A", text: "Escalate immediately to a human agent -- the customer has explicitly requested one." },
      { letter: "B", text: "Acknowledge the frustration and attempt to resolve the issue first, since the solution is available." },
      { letter: "C", text: "Run sentiment analysis to determine if escalation is truly warranted." },
      { letter: "D", text: "Ask the customer clarifying questions to better understand what they need." }
    ],
    correct: "A",
    explanation: "When a customer explicitly demands a human agent, escalate immediately without first attempting investigation. This is a core escalation principle. Option B ignores the explicit request. Option C over-engineers the decision. Option D delays honoring the clear request."
  },
  {
    id: "q29",
    domain: 5,
    scenario: "Multi-Agent Research System",
    question: "Your research system finds two credible sources reporting different statistics on the same topic (one says 30%, another says 45%). How should the synthesis handle this?",
    answers: [
      { letter: "A", text: "Include both values with source attribution and annotate the conflict, distinguishing well-established from contested findings." },
      { letter: "B", text: "Average the two values and report 37.5% as the best estimate." },
      { letter: "C", text: "Use the more recent source's value as it's likely more accurate." },
      { letter: "D", text: "Report only the lower value to be conservative." }
    ],
    correct: "A",
    explanation: "Conflicting statistics should be annotated with source attribution rather than arbitrarily selecting one. Reports should distinguish well-established from contested findings. Averaging (B), recency bias (C), and conservative selection (D) all lose important context about the disagreement."
  },
  {
    id: "q30",
    domain: 5,
    scenario: "Developer Productivity Tools",
    question: "During a long codebase exploration session, you notice the agent starts giving inconsistent answers and referencing 'typical patterns' instead of specific classes it discovered earlier. What's happening and what should you do?",
    answers: [
      { letter: "A", text: "Context degradation from an extended session. Use scratchpad files to persist key findings, spawn subagents for new investigations, and use /compact to reduce context." },
      { letter: "B", text: "The model is hallucinating. Restart from scratch with a completely new session." },
      { letter: "C", text: "The codebase is too large for Claude to handle. Reduce the project scope." },
      { letter: "D", text: "Increase the max_tokens parameter to give the model more output space." }
    ],
    correct: "A",
    explanation: "This is context degradation in extended sessions. Scratchpad files persist findings across context boundaries, subagents isolate verbose exploration, and /compact reduces accumulated context. Full restart (B) loses all progress. Scope reduction (C) avoids the problem. max_tokens (D) affects output, not input context."
  },
  {
    id: "q31",
    domain: 5,
    scenario: "Structured Data Extraction",
    question: "Your extraction system achieves 97% overall accuracy, but when you break down results by document type, invoices are at 99%, contracts at 95%, and handwritten notes at 72%. Management wants to fully automate based on the 97% figure. What should you recommend?",
    answers: [
      { letter: "A", text: "Analyze accuracy by document type and field before automating. The 97% aggregate masks poor performance on handwritten notes. Keep human review for low-performing categories." },
      { letter: "B", text: "Proceed with full automation since 97% overall accuracy is well above most thresholds." },
      { letter: "C", text: "Train a specialized model for handwritten notes to bring overall accuracy even higher." },
      { letter: "D", text: "Lower the confidence threshold to catch more handwritten note errors." }
    ],
    correct: "A",
    explanation: "Aggregate accuracy metrics can mask poor performance on specific document types. The 97% hides that handwritten notes are at 72%, which is unacceptable for automation. Accuracy must be validated by document type and field segment before reducing human review."
  },
  {
    id: "q32",
    domain: 5,
    scenario: "Multi-Agent Research System",
    question: "Your synthesis agent produces reports where claims are made without source attribution. Investigation shows the search and analysis subagents return detailed findings, but sources are lost during synthesis. What's the fix?",
    answers: [
      { letter: "A", text: "Require subagents to output structured claim-source mappings (source URLs, doc names, excerpts) that the synthesis agent must preserve and merge." },
      { letter: "B", text: "Add 'always cite sources' to the synthesis agent's prompt." },
      { letter: "C", text: "Have the synthesis agent re-search for sources after generating the report." },
      { letter: "D", text: "Store all source URLs in a separate database and append them to the final report." }
    ],
    correct: "A",
    explanation: "Source attribution is lost during summarization when findings are compressed without claim-source mappings. Structured claim-source data that must be preserved through synthesis is the architectural fix. A prompt instruction (B) is unreliable. Re-searching (C) wastes resources and may find different sources. A separate database (D) loses the claim-source connection."
  },

  // ===== Article Insight Questions =====
  {
    id: "q33",
    domain: 5,
    scenario: "Code Generation with Claude Code",
    question: "You're working in Claude Code with 5 MCP servers connected (GitHub, Jira, Slack, database, and monitoring). Your agent starts behaving erratically on complex tasks despite having a small CLAUDE.md. Using /context, you discover the context is nearly full. What is the most likely cause and fix?",
    answers: [
      { letter: "A", text: "MCP tool definitions are consuming ~25K tokens (12.5% of budget). Disconnect idle MCP servers via /mcp and use defer_loading for non-essential tools." },
      { letter: "B", text: "The CLAUDE.md file is too large. Split it into smaller rule files in .claude/rules/." },
      { letter: "C", text: "The conversation history is too long. Use /compact to reduce it." },
      { letter: "D", text: "The model is inefficient. Switch to Haiku for better token usage." }
    ],
    correct: "A",
    explanation: "Each MCP server contributes 20-30 tool definitions × ~200 tokens = 4-6K tokens. Five servers = ~25K tokens consumed before any work begins. The CLAUDE.md is described as small (B is wrong). While /compact helps with history (C), the root cause is fixed MCP overhead, not conversation length. Switching to Haiku (D) doesn't reduce context consumption."
  },
  {
    id: "q34",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "After using /compact in a long session, you notice Claude has forgotten critical architectural decisions made earlier but remembers verbose tool output. What should you have done to prevent this?",
    answers: [
      { letter: "A", text: "Add a 'Compact Instructions' section to CLAUDE.md specifying what to preserve during compaction (e.g., architectural decisions, API design choices, failure modes)." },
      { letter: "B", text: "Increase the context window size to avoid needing compaction." },
      { letter: "C", text: "Use /memory instead of /compact to preserve important information." },
      { letter: "D", text: "Avoid using /compact and instead start a new session when context gets full." }
    ],
    correct: "A",
    explanation: "Default compaction prioritizes 're-readable' content (tool outputs, code) over reasoning and decisions. Adding Compact Instructions to CLAUDE.md explicitly tells the compactor what to preserve. You can't increase the context window (B). /memory checks loaded files, not compaction behavior (C). Starting fresh (D) loses all progress without a structured handoff."
  },
  {
    id: "q35",
    domain: 5,
    scenario: "Code Generation with Claude Code",
    question: "You're approaching the end of a long session and need to hand off to a fresh Claude session tomorrow. What is the most reliable way to preserve session context for continuation?",
    answers: [
      { letter: "A", text: "Ask Claude to write a HANDOFF.md file summarizing: current progress, approaches tried, what worked/failed, and next steps. The new session reads this file." },
      { letter: "B", text: "Use --resume to continue the exact same session tomorrow." },
      { letter: "C", text: "Rely on /compact to summarize the session before closing." },
      { letter: "D", text: "Copy the terminal output into a text file for the new session." }
    ],
    correct: "A",
    explanation: "The HANDOFF.md pattern creates a structured, purposeful summary that a fresh session can read. --resume (B) may work but risks context degradation with stale tool outputs. /compact (C) is lossy — it drops architectural decisions unless Compact Instructions are configured. Terminal output (D) is noisy and unstructured."
  },
  {
    id: "q36",
    domain: 2,
    scenario: "Developer Productivity Tools",
    question: "You're designing an MCP server with 25 tools. In production, you notice Claude Code's prompt cache misses are high and tool selection is unreliable. What's the best approach?",
    answers: [
      { letter: "A", text: "Enable defer_loading: true for tool definitions so only stub descriptions are loaded initially, with full schemas loaded on-demand after selection via ToolSearch." },
      { letter: "B", text: "Split the 25 tools into 5 separate MCP servers with 5 tools each." },
      { letter: "C", text: "Add more detailed descriptions to all 25 tools to improve selection." },
      { letter: "D", text: "Reduce the tool count to 5 by combining similar tools into multi-purpose ones." }
    ],
    correct: "A",
    explanation: "defer_loading creates stub definitions with only descriptions, loading full schemas only when selected. This reduces fixed token overhead and keeps the prompt cache prefix stable. Splitting into 5 servers (B) actually increases overhead (5 server connections). More descriptions (C) increases token cost further. Combining tools (D) creates complex multi-purpose tools that are harder to select correctly."
  },
  {
    id: "q37",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "A developer on your team switches from Sonnet to Opus mid-session for a complex reasoning task, then switches back to Sonnet. They notice significantly increased latency and cost. Why?",
    answers: [
      { letter: "A", text: "Switching models invalidates the prompt cache for all prior tokens. Both switches force complete cache rebuilds, doubling the uncached token processing." },
      { letter: "B", text: "Opus is inherently slower, and the slowdown persists after switching back." },
      { letter: "C", text: "The conversation history grew too large from the Opus responses." },
      { letter: "D", text: "Sonnet needs to re-process all of Opus's outputs to understand them." }
    ],
    correct: "A",
    explanation: "The prompt cache uses prefix matching and is model-specific. Switching to Opus invalidates all Sonnet-cached tokens; switching back invalidates all Opus-cached tokens. The correct approach is to use a subagent with a different model for specific tasks, keeping the main session's cache intact."
  },
  {
    id: "q38",
    domain: 3,
    scenario: "Developer Productivity Tools",
    question: "You're creating a SKILL.md for a database migration workflow that modifies production schemas. It should only run when explicitly triggered by the developer, never when Claude decides to invoke it autonomously. How should you configure the skill?",
    answers: [
      { letter: "A", text: "Set disable-model-invocation: true in the SKILL.md frontmatter so it can only be triggered via slash command." },
      { letter: "B", text: "Add 'Only run this skill when explicitly asked by the user' to the skill's description." },
      { letter: "C", text: "Set context: fork to isolate the skill execution." },
      { letter: "D", text: "Put the skill in the user-level ~/.claude/skills/ directory instead of the project." }
    ],
    correct: "A",
    explanation: "disable-model-invocation: true prevents Claude from autonomously triggering the skill — it can only be invoked via explicit slash command. A prompt instruction (B) is not deterministic. context: fork (C) isolates execution context but doesn't prevent auto-invocation. User-level directory (D) only changes scope, not invocation behavior."
  },
  {
    id: "q39",
    domain: 1,
    scenario: "Code Generation with Claude Code",
    question: "You want to ensure that every time Claude edits a file, the code is automatically formatted and linted before Claude sees the result. Where should this enforcement live?",
    answers: [
      { letter: "A", text: "A PostToolUse hook that runs the formatter/linter after Edit tool returns, before the model processes the result." },
      { letter: "B", text: "A PreToolUse hook that formats the file before the Edit tool executes." },
      { letter: "C", text: "Add 'always run prettier after editing' to CLAUDE.md." },
      { letter: "D", text: "Create a skill that combines editing with formatting into a single workflow." }
    ],
    correct: "A",
    explanation: "PostToolUse hooks fire after a tool returns but before the model processes the result — perfect for auto-formatting after edits. PreToolUse (B) fires before the edit happens, so there's nothing to format yet. CLAUDE.md instructions (C) are probabilistic — Claude might forget. A skill (D) is over-engineered for this and doesn't guarantee enforcement."
  },
  {
    id: "q40",
    domain: 5,
    scenario: "Code Generation with Claude Code",
    question: "Your team uses Claude Code for a large monorepo. You want to organize context so that: project-wide conventions are always loaded, language-specific rules load only for relevant files, complex workflows are available on-demand, and code audit logging happens without consuming tokens. Which layering strategy is correct?",
    answers: [
      { letter: "A", text: "CLAUDE.md for project conventions, .claude/rules/ with path globs for language rules, Skills for workflows, and Hooks for audit logging." },
      { letter: "B", text: "Put everything in CLAUDE.md to ensure it's always available." },
      { letter: "C", text: "Use Skills for all conventions and rules to keep them on-demand." },
      { letter: "D", text: "Put language rules in subdirectory CLAUDE.md files and use MCP tools for audit logging." }
    ],
    correct: "A",
    explanation: "This maps to the five-layer context strategy: CLAUDE.md (always resident), .claude/rules/ (path-loaded), Skills (on-demand), Hooks (outside context — zero token cost). Putting everything in CLAUDE.md (B) wastes fixed tokens. Making all rules on-demand via Skills (C) means critical conventions might not load. Subdirectory CLAUDE.md files (D) are less flexible than path-scoped rules, and MCP for logging adds token overhead."
  },

  // ===== Gap-Filling Questions =====

  // t1.1 coverage: Agentic loop fundamentals
  {
    id: "q41",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    question: "You are implementing the core agent loop for a customer support system using the Messages API. After each API call, you need to decide whether to continue the loop or stop. Which approach correctly implements the agentic loop?",
    answers: [
      { letter: "A", text: "Check stop_reason: if 'tool_use', execute the tool and append the result as a tool_result message, then call the API again. If 'end_turn', exit the loop and return the final text response." },
      { letter: "B", text: "Check if the response contains any text content. If it does, the agent is done. If it contains only tool_use blocks, continue." },
      { letter: "C", text: "Maintain a counter and exit after 5 iterations. If the agent needs more, the user can re-invoke it." },
      { letter: "D", text: "Parse the text response for keywords like 'done', 'complete', or 'finished' to determine when to exit the loop." }
    ],
    correct: "A",
    explanation: "The correct agentic loop pattern uses stop_reason as the primary control signal. When stop_reason is 'tool_use', execute the requested tool, append the result, and continue. When 'end_turn', the agent has decided it's finished. Options B and D rely on fragile text parsing. Option C uses arbitrary limits as the primary mechanism rather than a safety backstop."
  },

  // t1.6 coverage: Session management and context preservation
  {
    id: "q42",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "Your multi-agent research system has been running for 3 hours. The coordinator agent starts producing vague summaries instead of specific findings, and occasionally contradicts earlier conclusions. What combination of techniques best addresses this?",
    answers: [
      { letter: "A", text: "Write key findings to a structured scratchpad file after each research phase, use subagents for new investigations to isolate context, and run /compact with custom Compact Instructions to preserve critical decisions." },
      { letter: "B", text: "Increase the model's max_tokens parameter to give it more room for detailed responses." },
      { letter: "C", text: "Restart the entire research process from scratch every 2 hours to prevent context degradation." },
      { letter: "D", text: "Switch to a model with a larger context window mid-session." }
    ],
    correct: "A",
    explanation: "This is classic context degradation in extended sessions. The three-pronged approach addresses it: scratchpad files persist key facts outside the conversation, subagents isolate verbose work, and /compact with custom instructions preserves critical decisions during summarization. max_tokens (B) affects output size, not input context. Full restarts (C) waste all accumulated progress. Switching models (D) invalidates the prompt cache and makes the situation worse."
  },

  // S3/D2 coverage: Multi-Agent Research with Tool Design focus
  {
    id: "q43",
    domain: 2,
    scenario: "Multi-Agent Research System",
    question: "Your web search subagent has 3 tools: web_search, fetch_page, and extract_text. The coordinator also needs to spawn subagents, aggregate results, and write the final report. How should you design the tool distribution?",
    answers: [
      { letter: "A", text: "Keep search tools on the web search subagent. Give the coordinator Task (for spawning subagents), Write (for the final report), and Read (for reviewing subagent output). Each agent stays at 3-5 tools." },
      { letter: "B", text: "Give all tools to the coordinator so it has full control, and have subagents request tools from the coordinator when needed." },
      { letter: "C", text: "Give every agent access to every tool for maximum flexibility." },
      { letter: "D", text: "Consolidate web_search, fetch_page, and extract_text into one tool called research_tool to reduce tool count." }
    ],
    correct: "A",
    explanation: "Each agent should have 4-5 focused tools relevant to its role. The web search subagent gets search-related tools; the coordinator gets orchestration tools (Task, Write, Read). Giving all tools to the coordinator (B) creates a 6+ tool overload. Universal access (C) maximizes confusion. Consolidating tools (D) creates a complex multi-purpose tool that's harder for the model to use correctly."
  },

  // S3/D2 coverage: MCP in multi-agent context
  {
    id: "q44",
    domain: 2,
    scenario: "Multi-Agent Research System",
    question: "Your research system uses an MCP server for academic paper search. The tool definition says 'Searches academic databases.' The coordinator frequently routes general web queries to this tool instead of the web_search tool. What's the fix?",
    answers: [
      { letter: "A", text: "Expand the MCP tool description to clarify: 'Searches academic databases (PubMed, arXiv, IEEE) for peer-reviewed papers. NOT for general web content, news, or non-academic sources. Use web_search for general queries.'" },
      { letter: "B", text: "Add few-shot examples showing the coordinator choosing web_search for general queries." },
      { letter: "C", text: "Implement a pre-routing classifier that determines which tool to call before the model sees the tools." },
      { letter: "D", text: "Remove the academic search tool and have the web_search tool handle all searches." }
    ],
    correct: "A",
    explanation: "Tool descriptions are the primary selection mechanism. The description 'Searches academic databases' is too similar to general search. Adding explicit scope boundaries, listing what the tool IS for and what it is NOT for, directly fixes routing ambiguity. Few-shot examples (B) add token overhead without addressing the root cause. A pre-routing classifier (C) adds unnecessary complexity. Removing the tool (D) loses valuable capability."
  },

  // S5/D4 coverage: CI/CD with Prompt Engineering
  {
    id: "q45",
    domain: 4,
    scenario: "Claude Code for CI",
    question: "Your CI pipeline uses Claude to categorize build failures into types (syntax error, dependency conflict, test failure, infrastructure issue). Currently it returns free-text descriptions that are hard to parse programmatically. How should you get reliable structured categorization?",
    answers: [
      { letter: "A", text: "Define a tool_use tool with a JSON schema containing an enum field for failure_type (with values: 'syntax_error', 'dependency_conflict', 'test_failure', 'infrastructure', 'other') and set strict: true." },
      { letter: "B", text: "Add 'Always respond with exactly one of: syntax_error, dependency_conflict, test_failure, infrastructure' to the system prompt." },
      { letter: "C", text: "Parse the free-text response with regex to extract the category keyword." },
      { letter: "D", text: "Use tool_choice: 'auto' so the model can return text when it's uncertain about the category." }
    ],
    correct: "A",
    explanation: "tool_use with a strict JSON schema and enum values provides guaranteed structured output with constrained categorization. The 'other' value handles edge cases. System prompt instructions (B) are unreliable for enforcing exact format. Regex parsing (C) breaks when the model rephrases. tool_choice: 'auto' (D) allows the model to skip the tool entirely and return unstructured text."
  },

  // S5/D4 coverage: Prompt engineering for CI code review
  {
    id: "q46",
    domain: 4,
    scenario: "Claude Code for CI",
    question: "Your CI code review pipeline analyzes PRs with extended thinking enabled (budget_tokens: 10000). For simple one-line PRs, this wastes tokens on unnecessary reasoning. For complex architectural PRs, the budget is sometimes insufficient. How should you optimize?",
    answers: [
      { letter: "A", text: "Use adaptive thinking (thinking: { type: 'adaptive', effort: 'medium' }) to let the model dynamically allocate reasoning depth based on PR complexity." },
      { letter: "B", text: "Set budget_tokens to 50000 for all PRs to ensure complex ones always have enough." },
      { letter: "C", text: "Disable thinking entirely and rely on the model's default behavior." },
      { letter: "D", text: "Create two separate pipelines: one with low budget_tokens for small PRs and one with high budget_tokens for large PRs, determined by file count." }
    ],
    correct: "A",
    explanation: "Adaptive thinking dynamically allocates reasoning depth based on task complexity, solving both problems: simple PRs get minimal reasoning (saving tokens) while complex PRs get deep analysis. Fixed high budgets (B) waste tokens on simple cases. Disabling thinking (C) hurts quality on complex PRs. Separate pipelines (D) are over-engineered when adaptive thinking handles this automatically, and file count is a poor proxy for complexity."
  },

  // Cross-scenario D4: Prompt engineering in customer support
  {
    id: "q47",
    domain: 4,
    scenario: "Customer Support Resolution Agent",
    question: "Your support agent needs to extract structured ticket data (customer ID, issue type, priority, summary) from free-form customer messages. Some messages are vague and don't clearly state an issue type. How should you design the extraction?",
    answers: [
      { letter: "A", text: "Use tool_use with a JSON schema. Make issue_type an enum with values including 'unclear', and add a nullable confidence_note field where the model explains why it chose 'unclear'." },
      { letter: "B", text: "Use tool_use with a strict schema where all fields are required and non-nullable." },
      { letter: "C", text: "Ask the model to output a formatted string like 'ID:123|TYPE:billing|PRI:high|SUMMARY:...' and parse it." },
      { letter: "D", text: "Add 'Always classify every message into one of these categories' to the prompt with a list of types." }
    ],
    correct: "A",
    explanation: "Adding 'unclear' as an enum value and a nullable explanation field gives the model a structured way to express uncertainty instead of forcing it to guess. Non-nullable required fields (B) force hallucination when data is absent. String parsing (C) is brittle. Prompt-only instructions (D) don't guarantee structured output format."
  },

  // t3.5 coverage: Advanced Claude Code configuration
  {
    id: "q48",
    domain: 3,
    scenario: "Claude Code for CI",
    question: "Your organization wants Claude Code in CI to: (1) never modify source files directly, (2) always output via a structured review tool, and (3) only access files in the PR diff. How should you configure this?",
    answers: [
      { letter: "A", text: "Create a CI-specific CLAUDE.md with these rules, use allowedTools to restrict to Read, Grep, Glob, and the custom review tool (excluding Write, Edit, Bash), and use a PreToolUse hook to validate file paths against the PR diff." },
      { letter: "B", text: "Add all three rules to the system prompt and trust the model to follow them." },
      { letter: "C", text: "Use a .claude/rules/ file with a glob pattern matching CI environments." },
      { letter: "D", text: "Create a skill with disable-model-invocation: true that enforces these rules." }
    ],
    correct: "A",
    explanation: "This combines declarative configuration (CLAUDE.md rules), programmatic enforcement (allowedTools to prevent Write/Edit/Bash access), and runtime validation (PreToolUse hook to check file paths). System prompt alone (B) is insufficient for security constraints. Rules files (C) can't restrict tools or validate paths. A skill (D) is a workflow tool, not an enforcement mechanism for CI restrictions."
  },

  // t5.5 coverage: Reliability and evaluation
  {
    id: "q49",
    domain: 5,
    scenario: "Structured Data Extraction",
    question: "Your extraction pipeline processes 10,000 invoices monthly. You want to measure and improve reliability over time. Which evaluation strategy is most effective?",
    answers: [
      { letter: "A", text: "Create a golden dataset of 200+ manually verified extractions stratified by document type. Run automated evals comparing pipeline output against golden labels. Track accuracy per-field and per-document-type over time." },
      { letter: "B", text: "Randomly sample 10 documents per month and have a human check them." },
      { letter: "C", text: "Monitor the percentage of documents that pass schema validation as the quality metric." },
      { letter: "D", text: "Use the model's self-reported confidence scores to identify low-quality extractions." }
    ],
    correct: "A",
    explanation: "A stratified golden dataset with automated evals provides reproducible, granular quality measurement across document types and fields. 10 random samples (B) is statistically insufficient. Schema validation (C) catches structural errors but misses semantic errors (wrong values in correct format). Self-reported confidence (D) is poorly calibrated and unreliable."
  },

  // t5.5 coverage: HITL and reliability in production
  {
    id: "q50",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    question: "Your support agent has been deployed for 3 months. Analytics show 82% first-contact resolution but a concerning pattern: 5% of resolved tickets are later reopened because the agent's solution was incorrect. How should you address this?",
    answers: [
      { letter: "A", text: "Analyze reopened tickets to identify common failure patterns (e.g., specific issue types, edge cases). Add programmatic gates for those categories requiring human review before auto-resolving, and update escalation criteria based on findings." },
      { letter: "B", text: "Reduce the agent's autonomy by requiring human approval for all resolutions." },
      { letter: "C", text: "Increase the system prompt length with more detailed instructions covering every possible scenario." },
      { letter: "D", text: "Retrain the model on the reopened ticket data to improve accuracy." }
    ],
    correct: "A",
    explanation: "Data-driven analysis of failure patterns leads to targeted improvements: adding programmatic gates for high-risk categories and refining escalation criteria. Requiring human approval for all resolutions (B) eliminates the agent's value. Longer prompts (C) don't address specific failure modes and may cause attention dilution. You can't retrain Claude (D) -- it's an API model."
  },

  // t1.1 coverage: stop_reason edge cases
  {
    id: "q51",
    domain: 1,
    scenario: "Developer Productivity Tools",
    question: "Your agent loop receives a response with stop_reason 'max_tokens'. The agent was in the middle of generating a code refactoring plan. What should your loop do?",
    answers: [
      { letter: "A", text: "Append the partial response to the conversation and make another API call to let the model continue, since max_tokens means the output was truncated, not that the task is complete." },
      { letter: "B", text: "Treat it as end_turn since the model produced output, and present the partial plan to the user." },
      { letter: "C", text: "Retry the entire request with a higher max_tokens value." },
      { letter: "D", text: "Discard the response and restart with a simplified prompt to get a shorter output." }
    ],
    correct: "A",
    explanation: "stop_reason 'max_tokens' means the output was truncated mid-generation. The correct handling is to append the partial content and continue the conversation so the model can finish. Treating it as complete (B) presents an incomplete plan. Retrying from scratch (C) wastes the already-generated content. Simplifying the prompt (D) changes the task rather than handling the truncation."
  },

  // Cross-scenario D4: Prompt engineering for research synthesis
  {
    id: "q52",
    domain: 4,
    scenario: "Multi-Agent Research System",
    question: "Your synthesis subagent receives findings from 5 research subagents but produces reports where all sources are weighted equally, even when some are peer-reviewed journals and others are blog posts. How should you fix this?",
    answers: [
      { letter: "A", text: "Include explicit source quality criteria in the synthesis prompt: 'Peer-reviewed > official reports > industry analysis > news articles > blog posts. Weight claims proportionally and flag any findings supported only by lower-tier sources.'" },
      { letter: "B", text: "Add 'prioritize reliable sources' to the system prompt." },
      { letter: "C", text: "Pre-filter sources before synthesis, removing all non-peer-reviewed content." },
      { letter: "D", text: "Have each research subagent assign a quality score (1-10) to each source." }
    ],
    correct: "A",
    explanation: "Explicit, ranked criteria with concrete examples give the model a clear framework for weighting sources. 'Prioritize reliable sources' (B) is vague -- 'reliable' is undefined. Pre-filtering (C) loses potentially valuable context from non-academic sources. LLM-assigned quality scores (D) are poorly calibrated and add unreliable metadata."
  },

  // ===== NOTEBOOKLM PRACTICE QUESTIONS =====
  // ===== Domain 1: Agentic Architecture & Orchestration (Questions 1-27) =====

  {
    id: "q53",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Easy",
    question: "A Customer Support Resolution Agent must call a get_user_history tool. Which stop_reason must the architect check for to trigger the tool execution logic?",
    answers: [
      { letter: "A", text: "end_turn" },
      { letter: "B", text: "max_tokens" },
      { letter: "C", text: "tool_use" },
      { letter: "D", text: "stop_sequence" }
    ],
    correct: "C",
    explanation: "tool_use signals that the model is waiting for the system to execute a tool and return the output."
  },
  {
    id: "q54",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Medium",
    question: "A Multi-Agent Research System has a Coordinator spawning a 'WebSearch' subagent. How are the Coordinator's previous findings shared with the subagent?",
    answers: [
      { letter: "A", text: "Subagents automatically inherit the parent's conversation history." },
      { letter: "B", text: "Findings must be explicitly passed into the subagent's prompt during the Task tool call." },
      { letter: "C", text: "The subagent queries the parent's memory via the get_context built-in tool." },
      { letter: "D", text: "Context is shared via a global .memory file in the project root." }
    ],
    correct: "B",
    explanation: "Subagents in the SDK are ephemeral and isolated; they do not inherit context automatically."
  },
  {
    id: "q55",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Hard",
    question: "An architect needs to enforce a policy where no refunds over $100 are processed without a manager's ID. What is the most reliable implementation to ensure this deterministic check cannot be bypassed?",
    answers: [
      { letter: "A", text: "A system prompt instruction stating: 'Never process refunds > $100 without a manager ID.'" },
      { letter: "B", text: "A PreToolUse hook that intercepts the process_refund call and validates the amount and manager ID." },
      { letter: "C", text: "A few-shot example in the prompt showing a refund being blocked." },
      { letter: "D", text: "Using the Opus model to ensure higher reasoning adherence to the policy." }
    ],
    correct: "B",
    explanation: "Hooks provide programmatic (deterministic) enforcement, whereas prompts are probabilistic."
  },
  {
    id: "q56",
    domain: 1,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "A Developer Productivity agent is running a complex loop. What message subtype is emitted by the SDK to manage the session state after tokens are summarized to save space?",
    answers: [
      { letter: "A", text: "init" },
      { letter: "B", text: "compact_boundary" },
      { letter: "C", text: "subagent_start" },
      { letter: "D", text: "result_message" }
    ],
    correct: "B",
    explanation: "compact_boundary manages window state after context compaction."
  },
  {
    id: "q57",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Medium",
    question: "An architect wants to run three research subagents simultaneously. How is parallel execution achieved in the Hub-and-Spoke model?",
    answers: [
      { letter: "A", text: "Spawning three separate SDK sessions in different threads." },
      { letter: "B", text: "The Coordinator emitting multiple Task or tool calls in a single response turn." },
      { letter: "C", text: "Using the --parallel flag when starting Claude Code." },
      { letter: "D", text: "Context isolation prevents parallel execution; agents must run sequentially." }
    ],
    correct: "B",
    explanation: "The Claude Agent SDK supports parallel tool execution when the model emits multiple requests in one turn."
  },
  {
    id: "q58",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Hard",
    question: "An architect implements both a filesystem hook in settings.json and a programmatic hook in the query() function. Which statement correctly describes their execution scope?",
    answers: [
      { letter: "A", text: "Programmatic hooks apply to the main session and all spawned subagents." },
      { letter: "B", text: "Filesystem hooks apply only to the main session." },
      { letter: "C", text: "Programmatic hooks are scoped only to the main session; filesystem hooks fire for both main and subagents." },
      { letter: "D", text: "Both hook types are strictly restricted to the main session." }
    ],
    correct: "C",
    explanation: "Programmatic hooks are application-specific and session-scoped. Filesystem hooks are project-wide."
  },
  {
    id: "q59",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Easy",
    question: "A Multi-Agent Research System Coordinator needs to delegate a search. Which built-in SDK tool is primarily used to spawn a subagent for a discrete subtask?",
    answers: [
      { letter: "A", text: "Agent" },
      { letter: "B", text: "Skill" },
      { letter: "C", text: "Task" },
      { letter: "D", text: "Grep" }
    ],
    correct: "C",
    explanation: "The Task tool is the standard primitive for managing discrete subtasks in multi-agent orchestration."
  },
  {
    id: "q60",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Medium",
    question: "A Customer Support Agent enters a loop that seems to be repeating the same tool call with the same error. What is the 'Anti-Pattern' in this architecture?",
    answers: [
      { letter: "A", text: "Using the Haiku model for support." },
      { letter: "B", text: "Lack of an iteration cap or a 'Self-Correction' log analysis within the loop." },
      { letter: "C", text: "Returning isRetryable: true for a business policy violation." },
      { letter: "D", text: "Using a PostToolUse hook to format the output." }
    ],
    correct: "C",
    explanation: "Policy violations are not transient; marking them as retryable causes infinite loops."
  },
  {
    id: "q61",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Hard",
    question: "An architect is designing a research system that must synthesize conflicting reports. What is the Coordinator's primary responsibility in the 'Hub-and-Spoke' model during synthesis?",
    answers: [
      { letter: "A", text: "Re-running the subagents until they agree." },
      { letter: "B", text: "Arbitrarily selecting the first result to reduce latency." },
      { letter: "C", text: "Aggregating results and annotating values with source attribution and provenance." },
      { letter: "D", text: "Deleting conflicting data to ensure a clean final report." }
    ],
    correct: "C",
    explanation: "Multi-source synthesis requires maintaining information provenance to distinguish established from contested findings."
  },
  {
    id: "q62",
    domain: 1,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "A Developer Productivity agent finishes its task. What is the final message yielded by the Agent SDK containing the total cost and response?",
    answers: [
      { letter: "A", text: "AssistantMessage" },
      { letter: "B", text: "ResultMessage" },
      { letter: "C", text: "SystemMessage(subtype: 'end')" },
      { letter: "D", text: "SessionSummary" }
    ],
    correct: "B",
    explanation: "ResultMessage is the final yield containing text, tokens, and cost."
  },
  {
    id: "q63",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Medium",
    question: "A Customer Support Agent needs to hand off a case to a human. What architectural pattern ensures the human receives sufficient context?",
    answers: [
      { letter: "A", text: "Passing the entire 100-turn raw JSON log to the human." },
      { letter: "B", text: "Implementing a handoff summary hook that generates a concise 'case facts' block." },
      { letter: "C", text: "Telling the user to 'explain the problem again to the next person.'" },
      { letter: "D", text: "Clearing the context window before handoff." }
    ],
    correct: "B",
    explanation: "A structured handoff summary (Customer ID, root cause, attempted actions) is required for reliability."
  },
  {
    id: "q64",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Hard",
    question: "A Multi-Agent Research System uses 'Dynamic Decomposition' for an open-ended investigation. How does this differ from 'Prompt Chaining'?",
    answers: [
      { letter: "A", text: "Prompt chaining is adaptive; dynamic decomposition is a fixed sequence." },
      { letter: "B", text: "Prompt chaining uses multiple models; dynamic decomposition uses one." },
      { letter: "C", text: "Dynamic decomposition allows the agent to build and prioritize an adaptive plan on the fly." },
      { letter: "D", text: "There is no difference; both are synonyms for multi-agent work." }
    ],
    correct: "C",
    explanation: "Dynamic decomposition is adaptive and planning-oriented; chaining is a fixed, sequential workflow."
  },
  {
    id: "q65",
    domain: 1,
    scenario: "Claude Code for CI",
    difficulty: "Easy",
    question: "An architect is using Claude Code for CI/CD. Which flag is used to run Claude in a non-interactive, print-only mode for pipelines?",
    answers: [
      { letter: "A", text: "--no-input" },
      { letter: "B", text: "-p (or --print)" },
      { letter: "C", text: "--silent" },
      { letter: "D", text: "--headless" }
    ],
    correct: "B",
    explanation: "The -p flag is the official non-interactive mode."
  },
  {
    id: "q66",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Medium",
    question: "A Customer Support Agent receives a tool_use stop reason but the tool execution fails. What should the system return to the model to enable autonomous recovery?",
    answers: [
      { letter: "A", text: "A natural language message: 'It didn't work, try something else.'" },
      { letter: "B", text: "A ResultMessage with a 404 status." },
      { letter: "C", text: "A structured error response with a boolean isRetryable flag." },
      { letter: "D", text: "Terminate the session immediately to prevent hallucination." }
    ],
    correct: "C",
    explanation: "Structured error metadata with isRetryable is the standard for agentic recovery."
  },
  {
    id: "q67",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Hard",
    question: "An architect is designing a research system that spawns subagents to research 'Scenario A' and 'Scenario B' independently. Which SDK command creates independent branches from a shared baseline conversation for this purpose?",
    answers: [
      { letter: "A", text: "split_session" },
      { letter: "B", text: "fork_session" },
      { letter: "C", text: "Task(parallel: true)" },
      { letter: "D", text: "Agent(isolate: true)" }
    ],
    correct: "B",
    explanation: "fork_session creates independent branches from a shared baseline."
  },
  {
    id: "q68",
    domain: 1,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "An architect sees the subtype 'init' in a message. Where does this message appear in the session?",
    answers: [
      { letter: "A", text: "At the very end as a summary." },
      { letter: "B", text: "Only when a subagent fails." },
      { letter: "C", text: "As the first message in the session to establish grounding." },
      { letter: "D", text: "When context is compacted." }
    ],
    correct: "C",
    explanation: "SystemMessage subtype 'init' establishes session metadata at start."
  },
  {
    id: "q69",
    domain: 1,
    scenario: "Developer Productivity Tools",
    difficulty: "Medium",
    question: "A Developer Productivity agent is performing a large-scale code review. Which pattern avoids 'Attention Dilution' across 50 files?",
    answers: [
      { letter: "A", text: "Reading all 50 files into one large prompt." },
      { letter: "B", text: "Using per-file local analysis passes followed by a separate cross-file integration pass." },
      { letter: "C", text: "Increasing the max_tokens limit to 200,000." },
      { letter: "D", text: "Using the Haiku model for its speed." }
    ],
    correct: "B",
    explanation: "Multi-pass review (local then global) prevents the model from missing details in long contexts."
  },
  {
    id: "q70",
    domain: 1,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An architect wants to use a PostToolUse hook to normalize data. Which is a valid use case for this hook?",
    answers: [
      { letter: "A", text: "Blocking a tool call before it reaches the API." },
      { letter: "B", text: "Changing the user's initial prompt." },
      { letter: "C", text: "Transforming heterogeneous timestamps from various tool outputs into a standard ISO format." },
      { letter: "D", text: "Deciding which model to use for the next turn." }
    ],
    correct: "C",
    explanation: "PostToolUse is for processing/normalizing tool results before the model sees them."
  },
  {
    id: "q71",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Easy",
    question: "A Multi-Agent Research System Coordinator needs to terminate. What is the expected stop_reason?",
    answers: [
      { letter: "A", text: "end_turn" },
      { letter: "B", text: "finished" },
      { letter: "C", text: "null" },
      { letter: "D", text: "exit" }
    ],
    correct: "A",
    explanation: "end_turn is the standard terminal stop reason."
  },
  {
    id: "q72",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Medium",
    question: "A Customer Support Agent is helping a frustrated user. When should the agent escalate to a human immediately?",
    answers: [
      { letter: "A", text: "Whenever the user uses an exclamation point." },
      { letter: "B", text: "Only if the agent's confidence score is below 50%." },
      { letter: "C", text: "If the customer explicitly requests a human." },
      { letter: "D", text: "Never; the agent should always try to resolve it first to save costs." }
    ],
    correct: "C",
    explanation: "Explicit human requests are a primary trigger for immediate escalation."
  },
  {
    id: "q73",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Hard",
    question: "An architect is configuring 'Agent Teams' via the CLI. What distinguishes an 'Agent Team' from 'Subagents'?",
    answers: [
      { letter: "A", text: "Subagents share the same process; Agent Teams are independent instances." },
      { letter: "B", text: "Subagents are ephemeral; Agent Teams coordinate independent instances that share a task list." },
      { letter: "C", text: "Agent Teams are only available in the Opus model." },
      { letter: "D", text: "Subagents can call tools; Agent Teams cannot." }
    ],
    correct: "B",
    explanation: "Agent Teams coordinate multiple independent instances with shared state; subagents are ephemeral subtasks."
  },
  {
    id: "q74",
    domain: 1,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "An architect is using the allowedTools parameter. If they want the agent to be able to spawn subagents, which tool must be in the list?",
    answers: [
      { letter: "A", text: "Agent" },
      { letter: "B", text: "Subagent" },
      { letter: "C", text: "Task" },
      { letter: "D", text: "Spawn" }
    ],
    correct: "C",
    explanation: "The Task tool is used for spawning and managing subagents."
  },
  {
    id: "q75",
    domain: 1,
    scenario: "Developer Productivity Tools",
    difficulty: "Medium",
    question: "A Developer Productivity agent is exploring a codebase. What is the most effective sequence for building understanding?",
    answers: [
      { letter: "A", text: "Read all files in the repository." },
      { letter: "B", text: "Grep entry points → Read to follow imports → Targeted edits." },
      { letter: "C", text: "Run npm test and hope for the best." },
      { letter: "D", text: "Use the WebSearch tool to find documentation." }
    ],
    correct: "B",
    explanation: "Incremental exploration (Grep then Read) is more context-efficient than bulk reading."
  },
  {
    id: "q76",
    domain: 1,
    scenario: "Multi-Agent Research System",
    difficulty: "Hard",
    question: "An architect is concerned about 'Context Leakage' between parallel subagents. Which design choice best mitigates this?",
    answers: [
      { letter: "A", text: "Forcing all subagents to use the same system prompt." },
      { letter: "B", text: "Using context: fork to ensure isolation." },
      { letter: "C", text: "Sharing the same SQLite database for all sessions." },
      { letter: "D", text: "Using a single global coordinator turn for all actions." }
    ],
    correct: "B",
    explanation: "context: fork (or the SDK equivalent of isolated sessions) ensures subagents don't pollute each other's reasoning."
  },
  {
    id: "q77",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Easy",
    question: "An architect wants to log every prompt sent to Claude. Which hook should they use?",
    answers: [
      { letter: "A", text: "PreToolUse" },
      { letter: "B", text: "UserPromptSubmit" },
      { letter: "C", text: "PostCompact" },
      { letter: "D", text: "SessionStart" }
    ],
    correct: "B",
    explanation: "UserPromptSubmit triggers whenever a prompt is sent to the model."
  },
  {
    id: "q78",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Medium",
    question: "A Customer Support Agent needs to verify a user's subscription tier. In the Hub-and-Spoke model, where should this verification logic ideally reside?",
    answers: [
      { letter: "A", text: "In the subagent's natural language reasoning." },
      { letter: "B", text: "In a PreToolUse hook on the Coordinator." },
      { letter: "C", text: "In the user's input prompt." },
      { letter: "D", text: "In the CLAUDE.md file." }
    ],
    correct: "B",
    explanation: "The Coordinator should manage deterministic guardrails like verification via hooks."
  },
  {
    id: "q79",
    domain: 1,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "A Developer Productivity agent is stuck in a loop of 5 failed attempts to fix a bug. What is the architecturally sound escalation trigger?",
    answers: [
      { letter: "A", text: "Inability to make meaningful progress after multiple retries." },
      { letter: "B", text: "The model's self-reported 'I am stuck' text." },
      { letter: "C", text: "A 401 Unauthorized error from the tool." },
      { letter: "D", text: "High token consumption." }
    ],
    correct: "A",
    explanation: "Lack of progress after retries is a standard HITL escalation trigger."
  },

  // ===== Domain 2: Tool Design & MCP Integration (Questions 28-45) =====

  {
    id: "q80",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "An architect is creating an MCP server. Which primitive should they use to expose a database schema as static reference data?",
    answers: [
      { letter: "A", text: "Tool" },
      { letter: "B", text: "Prompt" },
      { letter: "C", text: "Resource" },
      { letter: "D", text: "Skill" }
    ],
    correct: "C",
    explanation: "Resources are used for static or semi-static data like schemas or documentation."
  },
  {
    id: "q81",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Medium",
    question: "A Developer Productivity agent has two tools: list_files and search_files. Claude often confuses them. What is the highest-leverage fix?",
    answers: [
      { letter: "A", text: "Rename them A and B." },
      { letter: "B", text: "Update the descriptions to define explicit boundaries and unique input requirements." },
      { letter: "C", text: "Move the tools to different MCP servers." },
      { letter: "D", text: "Force the model to use list_files first via the system prompt." }
    ],
    correct: "B",
    explanation: "Tool descriptions are the primary routing mechanism for model tool selection."
  },
  {
    id: "q82",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Hard",
    question: "An architect is designing a tool that interfaces with a legacy CRM. How should the tool handle a 'Permission Denied' error?",
    answers: [
      { letter: "A", text: "Return an empty string." },
      { letter: "B", text: "Return isRetryable: false with a descriptive error message about the missing permission." },
      { letter: "C", text: "Throw a system-level exception that crashes the agent." },
      { letter: "D", text: "Return isRetryable: true and hope the user fixes the permission mid-session." }
    ],
    correct: "B",
    explanation: "Permission errors are not transient; they should not be retried autonomously."
  },
  {
    id: "q83",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "A team wants to share a Jira MCP server across all project members. Where should the configuration be stored?",
    answers: [
      { letter: "A", text: "~/.claude.json" },
      { letter: "B", text: ".mcp.json" },
      { letter: "C", text: "CLAUDE.md" },
      { letter: "D", text: "package.json" }
    ],
    correct: "B",
    explanation: ".mcp.json is project-scoped and shared via version control."
  },
  {
    id: "q84",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Medium",
    question: "An architect is limiting the number of tools available to a specific agent. What is the recommended target number of tools per agent to maintain selection reliability?",
    answers: [
      { letter: "A", text: "1\u20132" },
      { letter: "B", text: "4\u20135" },
      { letter: "C", text: "10\u201312" },
      { letter: "D", text: "Unlimited" }
    ],
    correct: "B",
    explanation: "Reliability degrades with too many tools; 4\u20135 is the architectural 'sweet spot.'"
  },
  {
    id: "q85",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An architect is configuring a 'Managed' MCP allowlist for their organization. Where must this configuration be placed to ensure users cannot override it?",
    answers: [
      { letter: "A", text: ".claude/settings.json" },
      { letter: "B", text: "macOS: /Library/Application Support/ClaudeCode/managed-settings.json" },
      { letter: "C", text: "~/.claude.json" },
      { letter: "D", text: "Inside the MCP server's Python code." }
    ],
    correct: "B",
    explanation: "Managed settings at the system level have highest precedence and cannot be overridden."
  },
  {
    id: "q86",
    domain: 2,
    scenario: "Structured Data Extraction",
    difficulty: "Easy",
    question: "An architect needs to template a complex prompt for a specific dataset. Which MCP primitive is designed for this?",
    answers: [
      { letter: "A", text: "Resource" },
      { letter: "B", text: "Tool" },
      { letter: "C", text: "Prompt" },
      { letter: "D", text: "Skill" }
    ],
    correct: "C",
    explanation: "MCP Prompts are specifically defined as templates for guiding model interaction with datasets."
  },
  {
    id: "q87",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Medium",
    question: "An MCP tool returns a '429 Too Many Requests' error. What should the isRetryable flag be set to?",
    answers: [
      { letter: "A", text: "true" },
      { letter: "B", text: "false" },
      { letter: "C", text: "null" },
      { letter: "D", text: "depends_on_model" }
    ],
    correct: "A",
    explanation: "Rate limits/throttling are transient errors; the agent should potentially retry."
  },
  {
    id: "q88",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An organization wants to allow all MCP servers from an internal GitHub organization. Which configuration key in managed-settings.json supports regex matching for hosts?",
    answers: [
      { letter: "A", text: "allowedMcpServers" },
      { letter: "B", text: "hostPattern" },
      { letter: "C", text: "strictKnownMarketplaces" },
      { letter: "D", text: "sourcePattern" }
    ],
    correct: "B",
    explanation: "hostPattern allows for regex matching of marketplace hosts (e.g., internal GitHub Enterprise)."
  },
  {
    id: "q89",
    domain: 2,
    scenario: "Structured Data Extraction",
    difficulty: "Easy",
    question: "An architect is using the tool_choice parameter. Which setting forces the model to use any tool but forbids a text-only response?",
    answers: [
      { letter: "A", text: "auto" },
      { letter: "B", text: "any" },
      { letter: "C", text: "required" },
      { letter: "D", text: "tool: forced" }
    ],
    correct: "B",
    explanation: "any requires a tool call but allows the model to choose which one."
  },
  {
    id: "q90",
    domain: 2,
    scenario: "Structured Data Extraction",
    difficulty: "Medium",
    question: "A Structured Data Extraction agent needs to access a sensitive database. Which MCP transport mechanism is most common for local, command-line based integration?",
    answers: [
      { letter: "A", text: "HTTP" },
      { letter: "B", text: "SSE" },
      { letter: "C", text: "stdio" },
      { letter: "D", text: "gRPC" }
    ],
    correct: "C",
    explanation: "stdio is the standard transport for local MCP servers in the Claude ecosystem."
  },
  {
    id: "q91",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An architect is migrating from legacy Windows paths for managed settings. Which path is now unsupported as of version 2.1.75?",
    answers: [
      { letter: "A", text: "C:\\Program Files\\ClaudeCode\\managed-settings.json" },
      { letter: "B", text: "C:\\ProgramData\\ClaudeCode\\managed-settings.json" },
      { letter: "C", text: "C:\\Users\\Admin\\.claude\\managed-settings.json" },
      { letter: "D", text: "C:\\Windows\\System32\\claudecode.json" }
    ],
    correct: "B",
    explanation: "The C:\\ProgramData path is legacy; admins must migrate to C:\\Program Files."
  },
  {
    id: "q92",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "An architect wants to provide a list of GitHub issues to an agent. Which MCP primitive is best for a 'Content Catalog'?",
    answers: [
      { letter: "A", text: "Tool" },
      { letter: "B", text: "Resource" },
      { letter: "C", text: "Prompt" },
      { letter: "D", text: "Skill" }
    ],
    correct: "B",
    explanation: "Resources are ideal for content catalogs to reduce exploratory tool calls."
  },
  {
    id: "q93",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Medium",
    question: "A Developer Productivity agent uses a tool that modifies code. What is the best practice for tool response design to ensure the agent knows the edit worked?",
    answers: [
      { letter: "A", text: "Return a boolean true." },
      { letter: "B", text: "Return a string: 'OK'." },
      { letter: "C", text: "Return a structured snippet of the modified code and a success metadata flag." },
      { letter: "D", text: "Return nothing." }
    ],
    correct: "C",
    explanation: "Providing the modified state allows the agent to reason about subsequent steps."
  },
  {
    id: "q94",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An organization wants to block all MCP servers by default except for an admin-defined allowlist. Which setting in managed-settings.json enables this 'Lockdown' mode?",
    answers: [
      { letter: "A", text: "allowedMcpServers: [] (empty array)" },
      { letter: "B", text: "allowManagedMcpServersOnly: true" },
      { letter: "C", text: "denyAllMcp: true" },
      { letter: "D", text: "strictMcp: true" }
    ],
    correct: "B",
    explanation: "allowManagedMcpServersOnly forces the system to respect only the admin-defined allowlist."
  },
  {
    id: "q95",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "An architect wants to use a community-built Jira integration. What is the recommended approach?",
    answers: [
      { letter: "A", text: "Build a custom MCP server from scratch." },
      { letter: "B", text: "Use a community MCP server via a marketplace." },
      { letter: "C", text: "Hard-code the Jira API keys into the system prompt." },
      { letter: "D", text: "Use a subagent to browse the Jira web interface." }
    ],
    correct: "B",
    explanation: "Prefer community MCP servers for standard integrations to leverage existing stability."
  },
  {
    id: "q96",
    domain: 2,
    scenario: "Multi-Agent Research System",
    difficulty: "Medium",
    question: "An architect is using the mcpServers parameter in the Agent SDK. What happens to these servers when a subagent is spawned?",
    answers: [
      { letter: "A", text: "They are automatically inherited." },
      { letter: "B", text: "They are not inherited; the subagent must be provisioned with its own mcpServers." },
      { letter: "C", text: "Only 'Resource' primitives are inherited." },
      { letter: "D", text: "The SDK crashes." }
    ],
    correct: "B",
    explanation: "Subagents do not inherit tool/MCP provisioning from the parent."
  },
  {
    id: "q97",
    domain: 2,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An organization uses environment variables for MCP secrets (e.g., ${GITHUB_TOKEN}). Where should these variables be defined to apply to all team members?",
    answers: [
      { letter: "A", text: "In the project-level .mcp.json." },
      { letter: "B", text: "In the env key of the project-level settings.json." },
      { letter: "C", text: "In the user-level ~/.bashrc." },
      { letter: "D", text: "In the CLAUDE.md file." }
    ],
    correct: "B",
    explanation: "settings.json under the env key standardizes environment variables for the session."
  },

  // ===== Domain 3: Claude Code Configuration & Workflows (Questions 46-65) =====

  {
    id: "q98",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Easy",
    question: "A developer wants to set a personal theme for Claude Code. Where should this setting be stored?",
    answers: [
      { letter: "A", text: "/etc/claude-code/settings.json" },
      { letter: "B", text: ".claude/settings.json" },
      { letter: "C", text: "~/.claude.json" },
      { letter: "D", text: "CLAUDE.md" }
    ],
    correct: "C",
    explanation: "Theme and personal preferences are stored in the global ~/.claude.json."
  },
  {
    id: "q99",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Medium",
    question: "A developer joins a team and finds Claude Code isn't following the project's styling rules. The rules are in the Lead's ~/.claude/CLAUDE.md. What is the architectural issue?",
    answers: [
      { letter: "A", text: "User-level CLAUDE.md files are not shared via VCS." },
      { letter: "B", text: "The developer doesn't have a Max subscription." },
      { letter: "C", text: "CLAUDE.md is deprecated." },
      { letter: "D", text: "The Lead needs to run /push-memory." }
    ],
    correct: "A",
    explanation: "Shared conventions must be in the project-level CLAUDE.md to be accessible by all team members."
  },
  {
    id: "q100",
    domain: 3,
    scenario: "Claude Code for CI",
    difficulty: "Hard",
    question: "An architect is configuring a CI/CD pipeline and wants to ensure security policies cannot be bypassed. Which configuration layer takes precedence over command-line arguments?",
    answers: [
      { letter: "A", text: "User settings" },
      { letter: "B", text: "Project settings" },
      { letter: "C", text: "Managed settings" },
      { letter: "D", text: "Local settings" }
    ],
    correct: "C",
    explanation: "Managed settings (System-level/IT) are the highest precedence and cannot be overridden by CLI flags like --dangerously-skip-permissions if blocked."
  },
  {
    id: "q101",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Easy",
    question: "A developer wants to create a custom command /check-security. Where should the markdown file for this command be placed for the whole team to use?",
    answers: [
      { letter: "A", text: "~/.claude/commands/" },
      { letter: "B", text: ".claude/commands/" },
      { letter: "C", text: "ROOT/commands/" },
      { letter: "D", text: "/usr/bin/" }
    ],
    correct: "B",
    explanation: ".claude/commands/ is the project-scoped directory for shared slash commands."
  },
  {
    id: "q102",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Medium",
    question: "An architect needs to apply specific rules only to .tsx files. What is the most context-efficient implementation?",
    answers: [
      { letter: "A", text: "A large CLAUDE.md at the root." },
      { letter: "B", text: "A .claude/rules/react-rules.md file with paths: ['**/*.tsx'] in the YAML frontmatter." },
      { letter: "C", text: "A subdirectory CLAUDE.md." },
      { letter: "D", text: "Telling Claude in the chat to 'only use React rules for TSX.'" }
    ],
    correct: "B",
    explanation: "Path-specific rules load only when relevant, preventing context bloat from irrelevant instructions."
  },
  {
    id: "q103",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Hard",
    question: "An architect is working in a massive monorepo and Claude Code takes too long to start. Which setting reduces disk overhead by symlinking large directories like node_modules into worktrees?",
    answers: [
      { letter: "A", text: "worktree.sparsePaths" },
      { letter: "B", text: "worktree.symlinkDirectories" },
      { letter: "C", text: "sandbox.filesystem.allowWrite" },
      { letter: "D", text: "mcp.link" }
    ],
    correct: "B",
    explanation: "symlinkDirectories avoids duplicating large folders in git worktrees."
  },
  {
    id: "q104",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Easy",
    question: "A developer is unsure which CLAUDE.md files are currently active. Which command provides a diagnostic view of loaded memory and rules?",
    answers: [
      { letter: "A", text: "/config" },
      { letter: "B", text: "/status" },
      { letter: "C", text: "/memory" },
      { letter: "D", text: "/debug" }
    ],
    correct: "C",
    explanation: "The /memory command shows which files/rules are currently in the agent's context."
  },
  {
    id: "q105",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Medium",
    question: "An architect wants to ensure a skill doesn't pollute the main conversation with its verbose discovery logs. Which frontmatter option should they use in the skill's .md file?",
    answers: [
      { letter: "A", text: "allowed-tools: []" },
      { letter: "B", text: "context: fork" },
      { letter: "C", text: "isolated: true" },
      { letter: "D", text: "silent: true" }
    ],
    correct: "B",
    explanation: "context: fork executes the skill in an isolated subagent."
  },
  {
    id: "q106",
    domain: 3,
    scenario: "Claude Code for CI",
    difficulty: "Hard",
    question: "An architect wants to block all network access for Claude Code except for internal domains. Which configuration key in the sandbox settings should be used?",
    answers: [
      { letter: "A", text: "network.allowAll: false" },
      { letter: "B", text: "network.allowedDomains" },
      { letter: "C", text: "permissions.deny: ['WebFetch']" },
      { letter: "D", text: "mcp.security.lockdown" }
    ],
    correct: "B",
    explanation: "network.allowedDomains (paired with managed lockdown) restricts outbound traffic."
  },
  {
    id: "q107",
    domain: 3,
    scenario: "Claude Code for CI",
    difficulty: "Easy",
    question: "An architect wants to automate PR reviews using Claude Code. Which flag ensures Claude produces machine-parseable output for the review script?",
    answers: [
      { letter: "A", text: "--json" },
      { letter: "B", text: "--output-format json" },
      { letter: "C", text: "--format-as-data" },
      { letter: "D", text: "-p" }
    ],
    correct: "B",
    explanation: "--output-format json is the official flag for structured CLI output."
  },
  {
    id: "q108",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Medium",
    question: "A developer is making large-scale architectural changes. When is 'Plan Mode' preferred over 'Direct Execution'?",
    answers: [
      { letter: "A", text: "When fixing a simple typo." },
      { letter: "B", text: "When multiple valid implementation approaches exist and architectural decisions are required." },
      { letter: "C", text: "When the stack trace is clear and the fix is single-file." },
      { letter: "D", text: "Only when the Haiku model is in use." }
    ],
    correct: "B",
    explanation: "Plan mode is for complex, multi-file changes where reasoning about the approach is critical."
  },
  {
    id: "q109",
    domain: 3,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An organization wants to prevent users from installing plugins from untrusted marketplaces. Which managed setting provides an allowlist for plugin sources?",
    answers: [
      { letter: "A", text: "enabledPlugins" },
      { letter: "B", text: "strictKnownMarketplaces" },
      { letter: "C", text: "extraKnownMarketplaces" },
      { letter: "D", text: "blockedMarketplaces" }
    ],
    correct: "B",
    explanation: "strictKnownMarketplaces (Managed-only) provides an exact-match allowlist for marketplaces."
  },
  {
    id: "q110",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Easy",
    question: "An architect wants to provide a custom script for @ file autocomplete. Which setting should they configure?",
    answers: [
      { letter: "A", text: "fileSuggestion" },
      { letter: "B", text: "autocomplete.script" },
      { letter: "C", text: "glob.helper" },
      { letter: "D", text: "hooks.file_picker" }
    ],
    correct: "A",
    explanation: "fileSuggestion allows for custom scripts to handle file path autocomplete."
  },
  {
    id: "q111",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Medium",
    question: "A developer is using the 'Explore' subagent during a plan. What is the benefit of this approach?",
    answers: [
      { letter: "A", text: "It is 50% cheaper." },
      { letter: "B", text: "It isolates verbose discovery output from the main plan's context window." },
      { letter: "C", text: "It allows for higher token limits." },
      { letter: "D", text: "It skips permission checks." }
    ],
    correct: "B",
    explanation: "The 'Explore' subagent keeps the main conversation clean while doing deep discovery."
  },
  {
    id: "q112",
    domain: 3,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An architect wants to define a 'Project' subagent with specific tool restrictions. Where should the subagent's markdown file be stored?",
    answers: [
      { letter: "A", text: "~/.claude/agents/" },
      { letter: "B", text: ".claude/agents/" },
      { letter: "C", text: "CLAUDE.md" },
      { letter: "D", text: ".claude/settings.json" }
    ],
    correct: "B",
    explanation: ".claude/agents/ is the project-scoped location for custom AI subagents."
  },
  {
    id: "q113",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Easy",
    question: "An architect wants to see the active settings layers. Which command shows if 'Managed' settings are being applied?",
    answers: [
      { letter: "A", text: "/config" },
      { letter: "B", text: "/status" },
      { letter: "C", text: "/memory" },
      { letter: "D", text: "/version" }
    ],
    correct: "B",
    explanation: "/status identifies active configuration layers and their origins."
  },
  {
    id: "q114",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Medium",
    question: "A developer wants to commit code but Claude keeps adding 'Generated with Claude Code' to the message. Which setting allows them to customize or remove this?",
    answers: [
      { letter: "A", text: "attribution" },
      { letter: "B", text: "includeCoAuthoredBy" },
      { letter: "C", text: "git.metadata" },
      { letter: "D", text: "commit.suffix" }
    ],
    correct: "A",
    explanation: "The attribution setting (under commit and pr) controls these trailers."
  },
  {
    id: "q115",
    domain: 3,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An organization wants to enforce that users can only use the Sonnet and Haiku models. Which managed setting should be used?",
    answers: [
      { letter: "A", text: "model: 'claude-sonnet-4-6'" },
      { letter: "B", text: "availableModels: ['sonnet', 'haiku']" },
      { letter: "C", text: "deniedModels: ['opus']" },
      { letter: "D", text: "forceModel: true" }
    ],
    correct: "B",
    explanation: "availableModels restricts the picker options for the user."
  },
  {
    id: "q116",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Easy",
    question: "An architect wants to resume a specific session by name. What is the command?",
    answers: [
      { letter: "A", text: "claude --resume <name>" },
      { letter: "B", text: "claude /resume" },
      { letter: "C", text: "claude --last" },
      { letter: "D", text: "claude --session restart" }
    ],
    correct: "A",
    explanation: "--resume <name> is the CLI flag to continue a named session."
  },
  {
    id: "q117",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    difficulty: "Medium",
    question: "A project uses a very large monorepo. Claude spends 2 minutes searching for files. Which setting ensures the @ file picker ignores .gitignore patterns to speed up results?",
    answers: [
      { letter: "A", text: "respectGitignore: false" },
      { letter: "B", text: "ignorePatterns" },
      { letter: "C", text: "glob.fast: true" },
      { letter: "D", text: "permissions.deny" }
    ],
    correct: "A",
    explanation: "Setting respectGitignore to false (if appropriate) or optimizing sparsePaths can improve performance."
  },

  // ===== Domain 4: Prompt Engineering & Structured Output (Questions 66-85) =====

  {
    id: "q118",
    domain: 4,
    scenario: "Structured Data Extraction",
    difficulty: "Easy",
    question: "A Structured Data Extraction agent needs to pull data from a document where fields might be missing. How should the JSON schema be designed to prevent hallucination?",
    answers: [
      { letter: "A", text: "Make all fields required." },
      { letter: "B", text: "Use nullable fields for optional information." },
      { letter: "C", text: "Add a 'guess' field." },
      { letter: "D", text: "Use only string types." }
    ],
    correct: "B",
    explanation: "Nullable fields allow the model to indicate absence without fabrication."
  },
  {
    id: "q119",
    domain: 4,
    scenario: "Structured Data Extraction",
    difficulty: "Medium",
    question: "An architect is using the Message Batches API. What is a primary limitation of this API compared to the Messages API?",
    answers: [
      { letter: "A", text: "It costs 50% more." },
      { letter: "B", text: "It does not support multi-turn tool calling within a single request." },
      { letter: "C", text: "It only supports the Haiku model." },
      { letter: "D", text: "It has a 5-minute timeout." }
    ],
    correct: "B",
    explanation: "Batches are for asynchronous, single-turn high-volume tasks."
  },
  {
    id: "q120",
    domain: 4,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An architect is designing a 'Self-Correction' pattern for a code generator. What should be sent back to the model after a validation failure?",
    answers: [
      { letter: "A", text: "'Error: try again.'" },
      { letter: "B", text: "The original prompt, the failed output, and the specific validation error logs." },
      { letter: "C", text: "A new, empty session." },
      { letter: "D", text: "A different model's opinion." }
    ],
    correct: "B",
    explanation: "Feedback loops require the original goal and the failure context to be effective."
  },
  {
    id: "q121",
    domain: 4,
    scenario: "Claude Code for CI",
    difficulty: "Easy",
    question: "An architect wants to distinguish between a 'Critical' and 'Major' bug. Which technique is most effective for grounding this ambiguity?",
    answers: [
      { letter: "A", text: "Writing a long paragraph explaining the difference." },
      { letter: "B", text: "Using 2\u20134 targeted few-shot examples showing the reasoning for each." },
      { letter: "C", text: "Using the Opus model." },
      { letter: "D", text: "Increasing the temperature." }
    ],
    correct: "B",
    explanation: "Few-shot prompting is the most reliable method for grounding ambiguous classifications."
  },
  {
    id: "q122",
    domain: 4,
    scenario: "Structured Data Extraction",
    difficulty: "Medium",
    question: "An architect wants to ensure 100% JSON schema compliance. Which method is most reliable for guaranteeing structural integrity?",
    answers: [
      { letter: "A", text: "Using tool_use with a defined JSON schema." },
      { letter: "B", text: "Using a system prompt that says 'Respond only in JSON.'" },
      { letter: "C", text: "Using regex to parse the output." },
      { letter: "D", text: "Using the Haiku model." }
    ],
    correct: "A",
    explanation: "tool_use forces the model to adhere to the provided JSON schema."
  },
  {
    id: "q123",
    domain: 4,
    scenario: "Structured Data Extraction",
    difficulty: "Hard",
    question: "A Structured Data Extraction task involves 10,000 documents. How should the architect correlate the asynchronous batch results to the source documents?",
    answers: [
      { letter: "A", text: "Relying on the order of the results array." },
      { letter: "B", text: "Using the custom_id field for each request in the batch." },
      { letter: "C", text: "Checking the timestamp of each response." },
      { letter: "D", text: "Parsing the filename from the model's text response." }
    ],
    correct: "B",
    explanation: "custom_id is the official mechanism for correlation in the Batches API."
  },
  {
    id: "q124",
    domain: 4,
    scenario: "Structured Data Extraction",
    difficulty: "Easy",
    question: "An architect wants the model to admit it's unsure about a field. Which pattern should they add to the JSON enum?",
    answers: [
      { letter: "A", text: "'N/A'" },
      { letter: "B", text: "'unclear' or 'unknown'" },
      { letter: "C", text: "An empty string ''" },
      { letter: "D", text: "A zero value 0" }
    ],
    correct: "B",
    explanation: "Explicit 'unclear' enums prevent the model from guessing."
  },
  {
    id: "q125",
    domain: 4,
    scenario: "Multi-Agent Research System",
    difficulty: "Medium",
    question: "A Multi-Agent Research System needs to summarize 20 sources. Where should the 'Executive Summary' prompt be placed in the final aggregation to avoid 'Lost in the Middle'?",
    answers: [
      { letter: "A", text: "In the exact center of the prompt." },
      { letter: "B", text: "At the very beginning or the very end of the context window." },
      { letter: "C", text: "In a separate CLAUDE.md file." },
      { letter: "D", text: "In the system prompt only." }
    ],
    correct: "B",
    explanation: "Recall is highest at the beginning and end of long contexts."
  },
  {
    id: "q126",
    domain: 4,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An architect is building a 'Best-of-N' reviewer. What is the core workflow of this pattern?",
    answers: [
      { letter: "A", text: "Choosing the cheapest model." },
      { letter: "B", text: "Generating N solutions and using a programmatic evaluator or separate agent to select the optimal one." },
      { letter: "C", text: "Forcing the agent to retry N times until it succeeds." },
      { letter: "D", text: "Running N agents in a single process." }
    ],
    correct: "B",
    explanation: "Best-of-N involves generating multiple candidates and selecting the best one via a separate logic/agent."
  },
  {
    id: "q127",
    domain: 4,
    scenario: "Structured Data Extraction",
    difficulty: "Easy",
    question: "An architect wants to reduce prompt size for a RAG system. Which feature allows a 90% cost reduction on the static context part of the prompt?",
    answers: [
      { letter: "A", text: "Message Batches API" },
      { letter: "B", text: "Prompt Caching" },
      { letter: "C", text: "Token Compaction" },
      { letter: "D", text: "Haiku model" }
    ],
    correct: "B",
    explanation: "Prompt Caching reduces costs for repeated prefixes by 90% (0.1x read rate)."
  },
  {
    id: "q128",
    domain: 4,
    scenario: "Claude Code for CI",
    difficulty: "Medium",
    question: "A developer is using the --append-system-prompt flag. How does this interact with the internal Claude Code system prompt?",
    answers: [
      { letter: "A", text: "It replaces it." },
      { letter: "B", text: "It is appended to the existing system prompt." },
      { letter: "C", text: "It is ignored if a CLAUDE.md exists." },
      { letter: "D", text: "It only works in Plan Mode." }
    ],
    correct: "B",
    explanation: "The flag appends instructions to the existing system prompt."
  },
  {
    id: "q129",
    domain: 4,
    scenario: "Structured Data Extraction",
    difficulty: "Hard",
    question: "A Structured Data Extraction agent is extracting data into a 'category' field that is growing. Which pattern allows for extensible categorization without fabrication?",
    answers: [
      { letter: "A", text: "A rigid enum of 100 items." },
      { letter: "B", text: "An 'other' enum value paired with a details string field." },
      { letter: "C", text: "Letting the model create its own JSON keys." },
      { letter: "D", text: "Making the field optional." }
    ],
    correct: "B",
    explanation: "'Other' + detail string provides a structured but flexible way to handle novel data."
  },
  {
    id: "q130",
    domain: 4,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "An architect wants to track token usage for billing. Which SDK message contains the usage object with input/output tokens?",
    answers: [
      { letter: "A", text: "AssistantMessage" },
      { letter: "B", text: "ResultMessage" },
      { letter: "C", text: "SystemMessage" },
      { letter: "D", text: "UsageMessage" }
    ],
    correct: "B",
    explanation: "The ResultMessage contains the final token usage and cost data for the session."
  },
  {
    id: "q131",
    domain: 4,
    scenario: "Developer Productivity Tools",
    difficulty: "Medium",
    question: "A Developer Productivity agent is generating unit tests. What is the single highest-leverage instruction to give the agent?",
    answers: [
      { letter: "A", text: "'Be professional.'" },
      { letter: "B", text: "'Use the Opus model.'" },
      { letter: "C", text: "'Provide a way to verify your work (e.g., run the tests).'" },
      { letter: "D", text: "'Write 100 tests.'" }
    ],
    correct: "C",
    explanation: "Giving the agent a way to verify its own work is the most effective pattern for reliability."
  },
  {
    id: "q132",
    domain: 4,
    scenario: "Multi-Agent Research System",
    difficulty: "Hard",
    question: "An architect wants to ensure that a subagent only uses specific tools. Which parameter in the Task tool call enforces this?",
    answers: [
      { letter: "A", text: "restrict_tools" },
      { letter: "B", text: "allowedTools" },
      { letter: "C", text: "tool_choice" },
      { letter: "D", text: "mcp_scope" }
    ],
    correct: "B",
    explanation: "allowedTools restricts the toolset available to the subagent session."
  },
  {
    id: "q133",
    domain: 4,
    scenario: "Structured Data Extraction",
    difficulty: "Easy",
    question: "An architect is optimizing for cost on an asynchronous audit task. Which API should they use?",
    answers: [
      { letter: "A", text: "Messages API" },
      { letter: "B", text: "Message Batches API" },
      { letter: "C", text: "Prompt Caching API" },
      { letter: "D", text: "Token API" }
    ],
    correct: "B",
    explanation: "Batches offer 50% savings for non-real-time tasks."
  },
  {
    id: "q134",
    domain: 4,
    scenario: "Structured Data Extraction",
    difficulty: "Medium",
    question: "A Structured Data Extraction agent is pulling info from multiple documents. Why might the architect use a 'Multi-Pass' approach?",
    answers: [
      { letter: "A", text: "To increase latency." },
      { letter: "B", text: "To avoid contradictory findings and attention dilution in long contexts." },
      { letter: "C", text: "Because it's cheaper." },
      { letter: "D", text: "It's only required for PDFs." }
    ],
    correct: "B",
    explanation: "Multi-pass ensures focus by separating local extraction from global synthesis."
  },
  {
    id: "q135",
    domain: 4,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An architect is using the compact_boundary subtype. When is this message emitted?",
    answers: [
      { letter: "A", text: "Only on session start." },
      { letter: "B", text: "When the model reaches the token limit and the system summarizes the context." },
      { letter: "C", text: "Every time a tool is called." },
      { letter: "D", text: "When a human intervenes." }
    ],
    correct: "B",
    explanation: "It manages window state after a context compaction event."
  },
  {
    id: "q136",
    domain: 4,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "An architect wants to count tokens before sending a prompt. What is the standard tool/feature for this?",
    answers: [
      { letter: "A", text: "Token Counting (built-in to SDK/API)" },
      { letter: "B", text: "/count slash command" },
      { letter: "C", text: "Guessing based on character count" },
      { letter: "D", text: "usage object in ResultMessage" }
    ],
    correct: "A",
    explanation: "Token counting allows for programmatic budget enforcement before calling the model."
  },
  {
    id: "q137",
    domain: 4,
    scenario: "Code Generation with Claude Code",
    difficulty: "Medium",
    question: "A Developer Productivity agent is writing a CLAUDE.md. What is an architectural 'Anti-Pattern' for this file?",
    answers: [
      { letter: "A", text: "Including architecture decisions." },
      { letter: "B", text: "Including testing instructions." },
      { letter: "C", text: "Including frequently changing data or standard language conventions." },
      { letter: "D", text: "Using the @import syntax." }
    ],
    correct: "C",
    explanation: "Including verbose, standard, or volatile data wastes context and distracts the model."
  },

  // ===== Domain 5: Context Management & Reliability (Questions 86-100) =====

  {
    id: "q138",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Easy",
    question: "A Customer Support Agent is in a long session and starts hallucinating 'typical' policies instead of the ones in the prompt. This is a symptom of which architectural constraint?",
    answers: [
      { letter: "A", text: "Token limit reached." },
      { letter: "B", text: "Attention degradation in long-running sessions." },
      { letter: "C", text: "Tool failure." },
      { letter: "D", text: "Network latency." }
    ],
    correct: "B",
    explanation: "Performance and adherence degrade as session history grows."
  },
  {
    id: "q139",
    domain: 5,
    scenario: "Structured Data Extraction",
    difficulty: "Medium",
    question: "An architect wants to minimize human review for a data extraction task. Which technique helps identify which documents actually need human review?",
    answers: [
      { letter: "A", text: "Reviewing everything." },
      { letter: "B", text: "Calibrating model-reported confidence scores against a labeled validation set." },
      { letter: "C", text: "Using the cheapest model for review." },
      { letter: "D", text: "Relying on the agent's 'I am 100% sure' text." }
    ],
    correct: "B",
    explanation: "Confidence calibration allows for routing only low-confidence cases to humans."
  },
  {
    id: "q140",
    domain: 5,
    scenario: "Multi-Agent Research System",
    difficulty: "Hard",
    question: "A Multi-Agent Research System is synthesizing a report from 5 different databases. How should the agent handle a missing source or a partial failure?",
    answers: [
      { letter: "A", text: "Stop the whole session and error out." },
      { letter: "B", text: "Silently ignore the failure and return partial results as if they were complete." },
      { letter: "C", text: "Return structured error context and partial results, annotating which findings have 'coverage gaps.'" },
      { letter: "D", text: "Hallucinate the missing data to fill the report." }
    ],
    correct: "C",
    explanation: "Structured reporting of partial successes/failures is critical for system integrity."
  },
  {
    id: "q141",
    domain: 5,
    scenario: "Developer Productivity Tools",
    difficulty: "Easy",
    question: "A Developer Productivity agent is investigating a complex bug. Which architectural feature allows the agent to record key findings for itself during the process?",
    answers: [
      { letter: "A", text: "System prompt" },
      { letter: "B", text: "Scratchpad files or internal reasoning space" },
      { letter: "C", text: ".claude.json" },
      { letter: "D", text: "CLAUDE.md" }
    ],
    correct: "B",
    explanation: "Scratchpads allow the agent to persist findings and counteract attention degradation."
  },
  {
    id: "q142",
    domain: 5,
    scenario: "Structured Data Extraction",
    difficulty: "Medium",
    question: "An architect is measuring the ongoing accuracy of a production agent. What is the recommended 'Systems Thinking' approach?",
    answers: [
      { letter: "A", text: "Waiting for a user complaint." },
      { letter: "B", text: "Stratified random sampling of extractions for manual auditing." },
      { letter: "C", text: "Only checking cases where the model reports low confidence." },
      { letter: "D", text: "Checking 100% of the output forever." }
    ],
    correct: "B",
    explanation: "Stratified sampling catches novel patterns and validates high-confidence output."
  },
  {
    id: "q143",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Hard",
    question: "An architect is designing a 'Case Facts' block for a long-running support session. Where should this block be placed in every prompt turn?",
    answers: [
      { letter: "A", text: "Inside the summarized history." },
      { letter: "B", text: "Outside the summarized history as a persistent, non-compacted block." },
      { letter: "C", text: "In the CLAUDE.md." },
      { letter: "D", text: "Only in the very first message." }
    ],
    correct: "B",
    explanation: "Persistent facts must remain outside the compaction boundary to avoid the 'Lost in the Middle' effect."
  },
  {
    id: "q144",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Easy",
    question: "A Customer Support Agent receives a request for a manager. What is the correct architectural action?",
    answers: [
      { letter: "A", text: "Try to resolve the issue for 5 more turns first." },
      { letter: "B", text: "Escalate to HITL immediately." },
      { letter: "C", text: "Offer the user a $10 discount to stay." },
      { letter: "D", text: "Terminate the session." }
    ],
    correct: "B",
    explanation: "Explicit human requests are an immediate escalation trigger."
  },
  {
    id: "q145",
    domain: 5,
    scenario: "Developer Productivity Tools",
    difficulty: "Medium",
    question: "An architect wants to optimize the cost of a support agent. Which benchmark reflects the typical daily spend for an active developer using Claude Code?",
    answers: [
      { letter: "A", text: "$0.50/day" },
      { letter: "B", text: "$6/day" },
      { letter: "C", text: "$50/day" },
      { letter: "D", text: "$100/day" }
    ],
    correct: "B",
    explanation: "The ~$6/day benchmark is the standard for ROI projections."
  },
  {
    id: "q146",
    domain: 5,
    scenario: "Developer Productivity Tools",
    difficulty: "Hard",
    question: "An architect is using the compact_boundary to manage a session. Why is this superior to simple history truncation?",
    answers: [
      { letter: "A", text: "It is cheaper." },
      { letter: "B", text: "It provides the model with a summary of the deleted context while preserving the most recent turns." },
      { letter: "C", text: "It allows for unlimited tokens." },
      { letter: "D", text: "It resets the model's temperature." }
    ],
    correct: "B",
    explanation: "Compaction preserves context through summarization rather than outright deletion."
  },
  {
    id: "q147",
    domain: 5,
    scenario: "Multi-Agent Research System",
    difficulty: "Easy",
    question: "An architect is synthesizing a report from two sources. Source A says 'July 1' and Source B says 'July 5'. What is the correct way to present this?",
    answers: [
      { letter: "A", text: "Pick July 1 (it's earlier)." },
      { letter: "B", text: "Average them to July 3." },
      { letter: "C", text: "Annotate both values with Source A/B attribution and publication dates." },
      { letter: "D", text: "Delete the dates to avoid confusion." }
    ],
    correct: "C",
    explanation: "Information provenance requires presenting conflicting sources with structured attribution."
  },
  {
    id: "q148",
    domain: 5,
    scenario: "Developer Productivity Tools",
    difficulty: "Medium",
    question: "A Developer Productivity agent is running in a shared workspace. What is the risk of assuming 'typical patterns' instead of reading the current files?",
    answers: [
      { letter: "A", text: "Hallucination and regression." },
      { letter: "B", text: "Lower token costs." },
      { letter: "C", text: "Faster response time." },
      { letter: "D", text: "There is no risk." }
    ],
    correct: "A",
    explanation: "Relying on training data (typical patterns) over session context leads to incorrect code and hallucinations."
  },
  {
    id: "q149",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Hard",
    question: "An organization uses a 'Max' plan subscription. What is the usage multiplier compared to the Free tier?",
    answers: [
      { letter: "A", text: "2x" },
      { letter: "B", text: "5x" },
      { letter: "C", text: "25x" },
      { letter: "D", text: "100x" }
    ],
    correct: "C",
    explanation: "Max Plan offers 25x the usage of the Free tier."
  },
  {
    id: "q150",
    domain: 5,
    scenario: "Structured Data Extraction",
    difficulty: "Easy",
    question: "An architect wants to ensure the agent doesn't 'hallucinate' a tool success. Which approach is best?",
    answers: [
      { letter: "A", text: "Ask the model 'Are you sure?'" },
      { letter: "B", text: "Require the tool to return a verifiable result (e.g., a success code and log)." },
      { letter: "C", text: "Use the Opus model." },
      { letter: "D", text: "Use a longer system prompt." }
    ],
    correct: "B",
    explanation: "Verifiable tool responses provide the grounding necessary to prevent fabrication."
  },
  {
    id: "q151",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    difficulty: "Medium",
    question: "A Customer Support Agent hits a 'Policy Gap' where the documentation is silent. What is the correct escalation pattern?",
    answers: [
      { letter: "A", text: "Make up a plausible policy." },
      { letter: "B", text: "Escalate to a human for policy clarification." },
      { letter: "C", text: "Try to resolve the issue anyway." },
      { letter: "D", text: "Tell the user 'I am broken.'" }
    ],
    correct: "B",
    explanation: "Policy gaps (silence on a topic) require HITL intervention."
  },
  {
    id: "q152",
    domain: 5,
    scenario: "Structured Data Extraction",
    difficulty: "Hard",
    question: "An architect is implementing 'Confidence-Based Review.' What is the primary metric used to calibrate the review threshold?",
    answers: [
      { letter: "A", text: "The model's self-reported 'confidence' number." },
      { letter: "B", text: "A validation set where model outputs are compared to human-labeled ground truth." },
      { letter: "C", text: "The length of the response." },
      { letter: "D", text: "The cost of the token usage." }
    ],
    correct: "B",
    explanation: "Calibration must be done against a known ground truth to be reliable."
  },

  // ===== CONTEXT EDITING (from platform docs) =====
  {
    id: "q153",
    domain: 5,
    question: "An agentic system accumulates many tool call results over a long conversation. The architect wants the API to automatically clear old tool results once the prompt exceeds 30,000 input tokens, while always preserving the 3 most recent tool interactions. Which API feature and configuration achieves this?",
    answers: [
      { letter: "A", text: "Use server-side compaction with a summarization prompt." },
      { letter: "B", text: "Use the clear_tool_uses_20250919 context editing strategy with trigger: {type: 'input_tokens', value: 30000} and keep: {type: 'tool_uses', value: 3}." },
      { letter: "C", text: "Manually truncate the messages array on the client side before each API call." },
      { letter: "D", text: "Set max_tokens to 30000 to cap the conversation length." }
    ],
    correct: "B",
    explanation: "The clear_tool_uses_20250919 strategy is designed specifically for this use case. It activates at a configurable trigger threshold and preserves the N most recent tool interactions. Manual truncation (C) loses the server-side automation. Compaction (A) summarizes rather than selectively clearing. max_tokens (D) limits output, not input context."
  },
  {
    id: "q154",
    domain: 5,
    question: "When combining both clear_thinking_20251015 and clear_tool_uses_20250919 strategies in a single context_management configuration, what ordering constraint must be followed?",
    answers: [
      { letter: "A", text: "clear_tool_uses must be listed first in the edits array." },
      { letter: "B", text: "clear_thinking must be listed first in the edits array." },
      { letter: "C", text: "The order does not matter; the API processes them alphabetically." },
      { letter: "D", text: "They cannot be combined in a single request." }
    ],
    correct: "B",
    explanation: "Per the documentation, when using multiple strategies, clear_thinking_20251015 MUST be listed first in the edits array. This is a strict API requirement, not just a recommendation."
  },
  {
    id: "q155",
    domain: 5,
    question: "An architect wants to maximize prompt cache hits while using extended thinking. How should the clear_thinking_20251015 strategy be configured?",
    answers: [
      { letter: "A", text: "Set keep to {type: 'thinking_turns', value: 1} (the default)." },
      { letter: "B", text: "Do not use the clear_thinking strategy at all." },
      { letter: "C", text: "Set keep to 'all' to preserve all thinking blocks." },
      { letter: "D", text: "Set keep to {type: 'thinking_turns', value: 0}." }
    ],
    correct: "C",
    explanation: "Setting keep: 'all' preserves all thinking blocks, which maintains the prompt cache prefix and enables cache hits. Clearing thinking blocks invalidates the cache at the point of clearing. The default (value: 1) clears older thinking which breaks the cache. Not using the strategy (B) results in the default behavior of keeping only the last turn."
  },
  {
    id: "q156",
    domain: 5,
    question: "What happens to a tool result that is cleared by the clear_tool_uses_20250919 strategy?",
    answers: [
      { letter: "A", text: "The entire tool_use and tool_result message blocks are deleted from the conversation." },
      { letter: "B", text: "The tool result is replaced with placeholder text indicating it was removed; the tool call itself is preserved by default." },
      { letter: "C", text: "The tool result is compressed into a summary generated by the model." },
      { letter: "D", text: "The tool result is moved to a separate metadata field outside the messages array." }
    ],
    correct: "B",
    explanation: "The API replaces each cleared result with placeholder text so Claude knows it was removed. By default, only tool results are cleared while keeping Claude's original tool calls visible. To also clear the tool call parameters, set clear_tool_inputs: true."
  },
  {
    id: "q157",
    domain: 5,
    question: "An architect uses the clear_tool_uses_20250919 strategy but wants web_search results to never be cleared because they provide essential grounding context. How should this be configured?",
    answers: [
      { letter: "A", text: "Set the web_search tool's cache_control to 'ephemeral'." },
      { letter: "B", text: "Add 'web_search' to the exclude_tools array in the context editing configuration." },
      { letter: "C", text: "Move web_search results to the system prompt instead." },
      { letter: "D", text: "Set keep to a very high number so web_search results are never reached." }
    ],
    correct: "B",
    explanation: "The exclude_tools parameter accepts a list of tool names whose tool uses and results should never be cleared. This is the purpose-built solution for preserving important context from specific tools."
  },
  {
    id: "q158",
    domain: 5,
    question: "Context editing in the Anthropic API is applied:",
    answers: [
      { letter: "A", text: "Client-side in the SDK before the request is sent to the API." },
      { letter: "B", text: "Server-side before the prompt reaches Claude, so the client maintains the full unmodified history." },
      { letter: "C", text: "Client-side after the response is received, modifying the local conversation history." },
      { letter: "D", text: "Server-side after Claude has processed the full prompt." }
    ],
    correct: "B",
    explanation: "Context editing is applied server-side before the prompt reaches Claude. The client application maintains the full, unmodified conversation history and does not need to sync state with the edited version. This is distinct from client-side SDK compaction."
  },
  {
    id: "q159",
    domain: 5,
    question: "What is the default behavior when extended thinking is enabled WITHOUT configuring the clear_thinking_20251015 strategy?",
    answers: [
      { letter: "A", text: "All thinking blocks from the entire conversation are preserved." },
      { letter: "B", text: "All thinking blocks are immediately cleared." },
      { letter: "C", text: "Only thinking blocks from the last assistant turn are kept (equivalent to keep: {type: 'thinking_turns', value: 1})." },
      { letter: "D", text: "Thinking blocks are summarized and compressed into a single block." }
    ],
    correct: "C",
    explanation: "The default behavior keeps only the thinking blocks from the last assistant turn, equivalent to keep: {type: 'thinking_turns', value: 1}. This is applied automatically even without explicit configuration."
  },
  {
    id: "q160",
    domain: 5,
    question: "An architect wants to use tool result clearing but is concerned about breaking prompt caching. Which configuration parameter helps ensure that cache invalidation is only triggered when the savings justify it?",
    answers: [
      { letter: "A", text: "clear_tool_inputs: true" },
      { letter: "B", text: "clear_at_least: {type: 'input_tokens', value: 5000}" },
      { letter: "C", text: "exclude_tools with the largest result tools" },
      { letter: "D", text: "trigger: {type: 'input_tokens', value: 999999}" }
    ],
    correct: "B",
    explanation: "The clear_at_least parameter ensures a minimum number of tokens is cleared each time the strategy activates. If the API can't clear at least the specified amount, the strategy won't be applied. This prevents breaking the prompt cache for negligible savings. Setting the trigger very high (D) would just delay clearing, not optimize the cache tradeoff."
  },
  // ===== EPAM QUESTION BANK INTEGRATION (q161+) =====
  // ===== Domain Questions: D1 - Agentic Architecture =====
  {
    id: "q161",
    domain: 1,
    scenario: "Agentic Loop Tool Results",
    question: "A team has built an agentic loop where Claude performs data analysis using tools. When Claude calls a tool, the system executes the tool and obtains a result. A junior engineer asks where the tool result should go before the next API call. After executing a tool in an agentic loop, what must happen with the tool result before making the next API call to Claude?",
    answers: [
      { letter: "A", text: "The tool result should be stored in a separate database and referenced by ID in the next prompt" },
      { letter: "B", text: "The tool result should be appended to the conversation history as a tool_result message so Claude can see it in context" },
      { letter: "C", text: "The tool result should replace Claude's previous assistant message to keep the context window small" },
      { letter: "D", text: "The tool result should be summarised by a separate model and injected into the system prompt" }
    ],
    correct: "B",
    explanation: "Tool results must be appended to the conversation history so that Claude receives them in the natural flow of the conversation. This allows Claude to reason about the result and decide its next action. Option A is wrong because Claude cannot access external databases by reference ID — it needs the content in the message history. Option C destroys Claude's reasoning chain. Option D adds latency, potential information loss, and unnecessary complexity."
  },
  {
    id: "q162",
    domain: 1,
    scenario: "Hub-and-Spoke Orchestration Pattern",
    question: "An enterprise is designing a multi-agent system where a coordinator receives a customer request, then delegates subtasks to specialised agents (billing, technical support, shipping). The architect proposes that the billing agent should be able to directly call the shipping agent when it discovers a shipping-related issue during billing review. In a hub-and-spoke orchestration pattern, why is this direct communication problematic?",
    answers: [
      { letter: "A", text: "Direct agent-to-agent communication increases latency compared to routing through the coordinator" },
      { letter: "B", text: "In hub-and-spoke, all communication must flow through the coordinator; direct subagent communication bypasses the orchestration layer and breaks visibility and control" },
      { letter: "C", text: "The billing agent lacks the computational resources to invoke other agents" },
      { letter: "D", text: "Direct communication is acceptable but requires both agents to share memory to maintain context" }
    ],
    correct: "B",
    explanation: "Hub-and-spoke orchestration requires all communication to flow through the central coordinator. This ensures full visibility into the workflow, informed routing decisions, and control over the overall process. Option A is incorrect because the issue is architectural, not about latency. Option C is incorrect because agent invocation is not a resource constraint issue. Option D is incorrect on two counts: direct communication is not acceptable in this pattern, and shared memory between subagents violates subagent isolation principles."
  },
  {
    id: "q163",
    domain: 1,
    scenario: "Multi-Agent Integration",
    question: "A multi-agent system uses a coordinator that delegates research tasks to three subagents. After deployment, the subagents produce good individual outputs, but the final combined result misses important connections between the subtasks and contains redundant work. The team blames the subagents for not coordinating with each other. What is the most likely root cause of the poor integration across subagent outputs?",
    answers: [
      { letter: "A", text: "The subagents need shared memory so they can see each other's progress and avoid redundancy" },
      { letter: "B", text: "The subagents should be given broader scopes so each one can handle overlapping concerns" },
      { letter: "C", text: "The coordinator is performing decomposition poorly — it is the coordinator's responsibility to define clear subtasks and integrate results, not the subagents'" },
      { letter: "D", text: "The subagents should inherit the coordinator's full context so they understand the bigger picture" }
    ],
    correct: "C",
    explanation: "When a multi-agent system produces poorly integrated results, the fault lies with the coordinator's decomposition and integration strategy, not with the subagents. Subagents execute narrow, well-defined tasks. Option A is wrong because subagent isolation is a design principle — shared memory creates coupling. Option B defeats the purpose of decomposition and leads to attention dilution. Option D is wrong because subagents operate in isolation and receive only explicitly passed context."
  },
  {
    id: "q164",
    domain: 1,
    scenario: "Parallel Subagent Attribution",
    question: "A coordinator agent spawns three subagents in parallel to research different aspects of a customer issue. The architect needs to ensure that when results come back, the coordinator can trace which subagent produced which finding and properly attribute recommendations. What is the recommended approach for enabling result attribution when spawning parallel subagents?",
    answers: [
      { letter: "A", text: "Have each subagent write its results to a shared file with its name as a header" },
      { letter: "B", text: "Pass structured metadata to each subagent at spawn time and require structured metadata in the response, enabling the coordinator to attribute findings to specific subagents" },
      { letter: "C", text: "Use fork_session instead of parallel spawning so all subagents share the same session and can tag their own outputs" },
      { letter: "D", text: "Have the coordinator parse the writing style of each response to determine which subagent produced it" }
    ],
    correct: "B",
    explanation: "Explicit context passing with structured metadata is the recommended approach. By passing structured input (including identifiers) and requiring structured output, the coordinator can deterministically attribute results. Option A is wrong because subagents operate in isolation and should not share files. Option C is wrong because fork_session creates a branching copy for divergent exploration, not for parallel subagent coordination. Option D is wrong because parsing writing style is non-deterministic — attribution must be explicit, not inferred."
  },
  {
    id: "q165",
    domain: 1,
    scenario: "Structured Handoff to Human Agents",
    question: "An agent handles customer escalations and must hand off to a human agent when it cannot resolve an issue. The current implementation simply sends a message saying 'I'm transferring you to a human agent' and ends the conversation. Human agents report they lack context when picking up these escalations. What should the structured handoff include?",
    answers: [
      { letter: "A", text: "The full raw conversation transcript so the human agent can read everything from the beginning" },
      { letter: "B", text: "A structured handoff containing the customer ID, conversation summary, identified root cause, any refund amount discussed, and recommended next action" },
      { letter: "C", text: "Only the customer ID and a flag indicating the conversation was escalated" },
      { letter: "D", text: "A link to the agent's internal reasoning logs so the human can understand the agent's decision-making process" }
    ],
    correct: "B",
    explanation: "A structured handoff should contain the customer ID, conversation summary, identified root cause, relevant amounts, and a recommended action. This gives the human agent immediate actionable context. Option A forces the human to re-process the entire conversation. Option C is insufficient — without summary, root cause, and recommended action, the human starts from scratch. Option D is wrong because internal reasoning logs are verbose and not designed for human consumption in customer service."
  },
  {
    id: "q166",
    domain: 1,
    scenario: "Tool Call Interception for Destructive Actions",
    question: "A compliance team wants to prevent an agent from ever calling delete_customer_record. A developer proposes adding a PostToolUse hook that checks if the tool was delete_customer_record and, if so, reverts the action. Why is using a PostToolUse hook to block this tool fundamentally flawed?",
    answers: [
      { letter: "A", text: "PostToolUse hooks cannot identify which tool was called" },
      { letter: "B", text: "PostToolUse hooks run after the tool has already executed — the record would already be deleted, making blocking at this stage too late" },
      { letter: "C", text: "PostToolUse hooks only work for read operations, not write operations" },
      { letter: "D", text: "PostToolUse hooks are only available in headless mode" }
    ],
    correct: "B",
    explanation: "PostToolUse runs AFTER tool execution. If the goal is to prevent a destructive action like deleting a record, the damage is already done by the time PostToolUse fires. The correct approach is to use tool call interception (before execution) to block the call before it runs. Option A is incorrect because PostToolUse hooks do receive information about which tool was called. Option C is incorrect because PostToolUse works for all tool types. Option D is incorrect because PostToolUse hooks are not restricted to headless mode."
  },
  {
    id: "q167",
    domain: 1,
    scenario: "Fixed Pipeline vs Dynamic Orchestration",
    question: "An engineering team needs to build an agent that processes incoming support tickets. Each ticket follows the same pattern: classify, look up customer history, generate a response, and route to the correct department. The workflow never varies. What is the most appropriate orchestration approach?",
    answers: [
      { letter: "A", text: "Dynamic orchestration, because the LLM can optimise the sequence based on ticket content" },
      { letter: "B", text: "A fixed pipeline, because the workflow is predictable and does not vary — using dynamic orchestration adds unnecessary cost and latency" },
      { letter: "C", text: "A hybrid approach where the first two steps are fixed and the last two are dynamic" },
      { letter: "D", text: "A single monolithic prompt that handles all four steps at once" }
    ],
    correct: "B",
    explanation: "Fixed pipelines are the correct choice for predictable, non-varying workflows. Each step is known in advance and always follows the same sequence. Dynamic orchestration would add LLM inference overhead at each step to 'decide' what is already known. Option A is wrong because there is nothing to optimise. Option C introduces unnecessary complexity. Option D risks attention dilution and makes the system harder to debug."
  },
  {
    id: "q168",
    domain: 1,
    scenario: "Multi-Agent System Design Review",
    question: "A startup is building an AI customer service system that needs to: (1) classify requests, (2) look up order information, (3) decide whether to issue a refund or escalate, and (4) enforce a rule that refunds over $200 require manager approval. One engineer wants a single agent; another wants a coordinator, lookup subagent, and refund subagent — with the refund subagent enforcing the $200 rule via its system prompt. What are the TWO most significant architectural issues with the proposed multi-agent design?",
    answers: [
      { letter: "A", text: "The system should use a single agent because multi-agent systems are always slower, and the $200 rule should be in the system prompt" },
      { letter: "B", text: "The multi-agent decomposition is reasonable, but the $200 refund rule must be enforced programmatically (not via system prompt), and the coordinator must handle integration rather than expecting subagents to coordinate" },
      { letter: "C", text: "The lookup subagent should share memory with the refund subagent for direct data access, and the $200 rule should be a PostToolUse hook" },
      { letter: "D", text: "The system should use dynamic orchestration with the LLM deciding all routing, and the $200 rule should be in CLAUDE.md" }
    ],
    correct: "B",
    explanation: "Two issues are identified: First, the $200 refund threshold is a financial rule requiring programmatic enforcement — placing it in the system prompt makes it probabilistic and bypassable. Second, in hub-and-spoke design, the coordinator handles integration and routing; subagents operate in isolation. Option A is wrong because multi-agent systems are not inherently slower. Option C violates subagent isolation, and PostToolUse runs after execution. Option D relies on probabilistic enforcement via CLAUDE.md."
  },
  {
    id: "q169",
    domain: 1,
    scenario: "Multi-Pass Architecture for Rule Application",
    question: "A document processing pipeline's transformation phase requires applying 30 normalisation rules to each document. When all 30 rules are given to a single agent in one pass, later rules are often skipped or applied inconsistently. Additionally, if a rule involves currency conversion, exact exchange rates from a specific API must be used (not approximated). What combination of architectural decisions best addresses both concerns?",
    answers: [
      { letter: "A", text: "Use a larger context window model and add a system prompt emphasising that all 30 rules must be applied; enforce currency rates via system prompt instruction" },
      { letter: "B", text: "Decompose transformation into a multi-pass architecture — a per-rule or batched-rule pass to avoid attention dilution — and enforce currency conversion rates with a programmatic gate that calls the exchange rate API deterministically" },
      { letter: "C", text: "Use a fixed pipeline with 30 sequential agents, one per rule, with shared memory; handle currency via a PostToolUse hook" },
      { letter: "D", text: "Switch to dynamic orchestration where the LLM decides which rules to apply based on document content, and add currency rates to CLAUDE.md" }
    ],
    correct: "B",
    explanation: "Two issues are at play. First, applying 30 rules in one pass causes attention dilution — a multi-pass approach ensures consistent application. Second, currency conversion using specific exchange rates is a deterministic requirement that must be enforced programmatically. Option A is wrong because larger context windows do not fix attention dilution. Option C violates subagent isolation, and PostToolUse is wrong for enforcing rates before conversion. Option D might skip rules and CLAUDE.md enforcement is probabilistic."
  },
  // ===== Domain Questions: D2 - Tool Design & MCP =====
  {
    id: "q170",
    domain: 2,
    scenario: "Tool Splitting for Clarity",
    question: "An agent has a tool called 'process' that handles three different operations: creating orders, updating orders, and cancelling orders. The model frequently calls 'process' with incorrect parameters because it confuses the different operation modes. A developer proposes adding detailed few-shot examples for each operation mode. What is a more effective structural solution?",
    answers: [
      { letter: "A", text: "Add a routing classifier that determines the operation type before calling process" },
      { letter: "B", text: "Split process into three separate tools — create_order, update_order, and cancel_order — with clear, specific descriptions for each" },
      { letter: "C", text: "Rename process to order_management and add few-shot examples" },
      { letter: "D", text: "Add system prompt keywords that map user intent phrases to specific parameter configurations" }
    ],
    correct: "B",
    explanation: "Tool splitting is the correct structural solution. By breaking a multi-purpose tool into focused single-purpose tools with specific names and descriptions, the model can select the right tool based on its description rather than determining the correct operation mode within a generic tool. Option A adds unnecessary infrastructure when the tool design itself is the problem. Option C merely renames the tool. Option D is fragile because system prompt keywords do not override tool descriptions as the primary selection mechanism."
  },
  {
    id: "q171",
    domain: 2,
    scenario: "Business Rule Error Classification",
    question: "An agent attempts to transfer funds from a customer's account, but the account has been frozen due to a fraud investigation. The tool returns an error with the isError flag set and the message 'Account frozen — fraud investigation in progress.' The agent's retry logic automatically attempts the transfer three more times. Why is the automatic retry behaviour incorrect, and what category does this error belong to?",
    answers: [
      { letter: "A", text: "It is a transient error, but the retry interval is too short — adding exponential backoff would fix it" },
      { letter: "B", text: "It is a validation error — the agent should fix the input parameters and retry with a different account" },
      { letter: "C", text: "It is a business rule error — the account is legitimately frozen and retrying will never succeed; the agent should report the status to the user without retrying" },
      { letter: "D", text: "It is a permission error — the agent needs elevated credentials and should request them before retrying" }
    ],
    correct: "C",
    explanation: "A frozen account due to fraud investigation is a business rule error. The system is working correctly — the freeze is intentional. Retrying will never succeed because the condition is not transient and cannot be fixed by changing parameters. Option A is wrong because the freeze will not resolve itself in seconds. Option B misunderstands the business context. Option D is wrong because no credential escalation should override a fraud freeze."
  },
  {
    id: "q172",
    domain: 2,
    scenario: "Cross-Role Tool Access",
    question: "An agent serves two roles: a 'reader' role that only looks up information, and a 'writer' role that can modify records. The current implementation gives both roles access to all 12 tools. A developer wants to restrict the reader role to read-only tools, but one tool — get_record_with_edit_history — is needed by both roles. What is the best approach?",
    answers: [
      { letter: "A", text: "Create two completely separate tool sets with no overlap, duplicating get_record_with_edit_history under different names for each role" },
      { letter: "B", text: "Use tool_choice set to 'auto' for the reader role and 'any' for the writer role to control behaviour" },
      { letter: "C", text: "Scope tools cross-role where needed — both roles can access get_record_with_edit_history, while the reader role is restricted to read-only tools and the writer role gets the full set, replacing generic tools with constrained versions" },
      { letter: "D", text: "Give both roles all 12 tools but add a system prompt instruction telling the reader role not to use write tools" }
    ],
    correct: "C",
    explanation: "Scoped cross-role tools are the correct approach. Tools legitimately needed by multiple roles should be shared, while each role's active tool set is restricted to what it needs. Generic tools should be replaced with constrained versions. Option A unnecessarily duplicates tools. Option B misunderstands tool_choice — 'auto' means the model decides whether to use a tool, 'any' means it must use one; neither controls which tools are available. Option D relies on probabilistic prompt-based enforcement."
  },
  {
    id: "q173",
    domain: 2,
    scenario: "Targeted File Modifications",
    question: "A developer needs to make a small change to a configuration file — replacing a single value on one line. They are considering whether to use the Edit tool or to Read the full file and then Write the entire file back with the change. What is the recommended approach for making small, targeted changes to existing files?",
    answers: [
      { letter: "A", text: "Read the file first, then Write the entire file back with the modification to ensure nothing is missed" },
      { letter: "B", text: "Use Edit first for targeted changes; fall back to Read followed by Write only when Edit cannot express the needed change" },
      { letter: "C", text: "Always use Write for any file modification to ensure the file is completely rewritten and consistent" },
      { letter: "D", text: "Use Grep to find the line, then use Write to replace only that line" }
    ],
    correct: "B",
    explanation: "Edit is the preferred tool for targeted modifications because it only sends the diff, reducing the risk of accidentally overwriting unrelated content and clearly expressing intent. Read followed by Write is the fallback for cases where Edit cannot handle the change. Option A is unnecessarily risky for a small change. Option C ignores the benefit of targeted edits. Option D misuses Write — it cannot replace a single line without rewriting the file."
  },
  // ===== Domain Questions: D3 - Claude Code Configuration =====
  {
    id: "q174",
    domain: 3,
    scenario: "Skill Configuration with SKILL.md",
    question: "A team is building a complex deployment skill that requires its own context, specific tools, and should run in an isolated session. The skill needs to accept a target environment as an argument. Which SKILL.md configuration correctly sets up this deployment skill?",
    answers: [
      { letter: "A", text: "Define the skill entirely in CLAUDE.md with an @import directive pointing to the deployment script" },
      { letter: "B", text: "Create a SKILL.md file specifying context: fork for session isolation, allowed-tools to restrict available tools, and argument-hint to describe the expected environment parameter" },
      { letter: "C", text: "Create a SKILL.md file with context: shared so the skill can access the main session's conversation history for deployment context" },
      { letter: "D", text: "Define the skill as a regular command in .claude/commands/ since skills and commands are interchangeable" }
    ],
    correct: "B",
    explanation: "Skills with SKILL.md support context: fork for session isolation, allowed-tools to restrict tools, and argument-hint to describe expected arguments. Option A is wrong because @import is for including content into CLAUDE.md, not for defining skills with execution configuration. Option C is wrong because context: fork is needed for isolation. Option D is wrong because skills and commands differ — skills support features like session forking and tool restriction that commands do not."
  },
  {
    id: "q175",
    domain: 3,
    scenario: "Rules File Configuration Verification",
    question: "A developer has a .claude/rules/ file with YAML frontmatter specifying paths for **/*.test.ts and **/*.spec.ts. The rules are not loading when editing src/components/Button.spec.ts. Assuming the glob patterns are correct and the file does match, what should the developer verify?",
    answers: [
      { letter: "A", text: "The rules file must be registered in .claude.json to be activated" },
      { letter: "B", text: "The rules file must have a .yaml extension, not .md" },
      { letter: "C", text: "The rules file should auto-load when editing matching files — verify the file is in the correct .claude/rules/ directory and the glob patterns actually match the file being edited" },
      { letter: "D", text: "The rules file requires an @import directive in the project CLAUDE.md to be discovered" }
    ],
    correct: "C",
    explanation: ".claude/rules/ files with YAML paths and glob patterns auto-load when editing files that match the patterns. If rules are not loading, verify: the file is in the correct .claude/rules/ directory, and the glob patterns genuinely match the file path. Option A is wrong because rules files are discovered automatically. Option B is wrong because the file format is not restricted to .yaml. Option D is wrong because @import is a CLAUDE.md feature, not a rules activation mechanism."
  },
  {
    id: "q176",
    domain: 3,
    scenario: "Workflow Selection Based on Task Characteristics",
    question: "A developer has two tasks: (1) rename a variable across a well-understood, small utility file, and (2) investigate why a complex distributed system intermittently drops WebSocket connections. Which workflow strategy correctly matches each task to the appropriate approach?",
    answers: [
      { letter: "A", text: "Use plan mode for both tasks since planning always produces better results" },
      { letter: "B", text: "Use direct mode for the variable rename (well-understood, straightforward) and use the explore subagent for the WebSocket investigation (open-ended, requires investigation before action)" },
      { letter: "C", text: "Use direct mode for both — the developer knows the codebase well enough" },
      { letter: "D", text: "Use plan mode for the variable rename (to avoid mistakes) and direct mode for the WebSocket issue (to start fixing it immediately)" }
    ],
    correct: "B",
    explanation: "The key distinction is ambiguity, not difficulty. The variable rename is well-understood — direct mode is appropriate. The WebSocket issue is open-ended and requires investigation — the explore subagent is designed for investigative work. Option A wastes time planning a simple rename. Option C jumps to implementation on an uninvestigated issue. Option D reverses the logic entirely."
  },
  {
    id: "q177",
    domain: 3,
    scenario: "Concrete Examples for Consistency",
    question: "A developer working with Claude Code to implement a REST API notices that Claude keeps generating endpoints with inconsistent naming conventions — sometimes camelCase, sometimes snake_case, sometimes kebab-case. They have tried asking Claude to 'be consistent' but the problem persists. What is the most effective way to resolve the naming inconsistency?",
    answers: [
      { letter: "A", text: "Add a rule to CLAUDE.md stating 'Use consistent naming conventions'" },
      { letter: "B", text: "Provide concrete examples: 'All endpoint paths must use kebab-case (e.g., /user-profiles, /order-items). All JSON fields must use camelCase (e.g., firstName, orderDate).'" },
      { letter: "C", text: "Switch to a different model that is more consistent with naming" },
      { letter: "D", text: "Manually fix each inconsistency after Claude generates the code" }
    ],
    correct: "B",
    explanation: "Concrete examples are the first-line fix for inconsistency problems. Showing the model exactly what the expected format looks like with specific examples eliminates ambiguity. Option A is too vague — 'be consistent' does not specify which convention. Option C is unnecessary when the issue is instruction clarity. Option D is a reactive workaround that wastes time."
  },
  {
    id: "q178",
    domain: 3,
    scenario: "Test-Driven Iteration for Design Discovery",
    question: "A developer needs Claude Code to build a data validation library. They are unsure of the exact API design and want Claude to help them iteratively discover the right design. A colleague suggests writing all the tests first and then having Claude implement them. What approach best supports iterative design discovery?",
    answers: [
      { letter: "A", text: "Write a complete specification document and have Claude implement it in one shot" },
      { letter: "B", text: "Use test-driven iteration — write a few initial tests capturing core behaviour, have Claude implement them, then write more tests based on what is learned, iterating toward the final design" },
      { letter: "C", text: "Ask Claude to generate both the tests and implementation simultaneously to save time" },
      { letter: "D", text: "Use the interview pattern where Claude asks clarifying questions, and only start coding after all questions are answered" }
    ],
    correct: "B",
    explanation: "Test-driven iteration is ideal for design discovery. Writing a few tests first captures core expected behaviour without over-committing to a design. Claude implements those tests, the developer evaluates, then writes additional tests. Option A contradicts the goal — the developer does not know the full design upfront. Option C undermines test-driven development because the model may generate tests matching its own implementation. Option D is better suited for unfamiliar domains, not API design iteration."
  },
  {
    id: "q179",
    domain: 3,
    scenario: "Structured CI Output and Review",
    question: "A team has Claude Code running in their CI pipeline for automated code review. They want structured output conforming to a specific schema for downstream tools. A developer suggests having Claude review code in the same session that generated it. What is the correct approach for structured CI output and effective review?",
    answers: [
      { letter: "A", text: "Parse Claude's natural language output with regex to extract structured data, and have Claude review in the same session for continuity" },
      { letter: "B", text: "Use --output-format json combined with --json-schema to get structured output, and use a separate session for review because the same session is less effective at self-review" },
      { letter: "C", text: "Use the Batch API for pre-merge reviews to save costs, and format output manually in a post-processing step" },
      { letter: "D", text: "Set --output-format json only, without a schema, and have Claude review in the same session to leverage existing context" }
    ],
    correct: "B",
    explanation: "--output-format json combined with --json-schema produces structured output conforming to a specific schema for downstream tools. A separate session for review is important because the same session is less effective at self-review — the model tends to be less critical of its own recent output. Option A is fragile (regex parsing) and same-session review reduces thoroughness. Option C is wrong because the Batch API is unsuitable for pre-merge reviews (high latency). Option D misses schema enforcement."
  },
  // ===== Domain Questions: D4 - Prompt Engineering =====
  {
    id: "q180",
    domain: 4,
    scenario: "False Positive Rate Management",
    question: "A compliance team deploys an AI document classifier flagging customer communications across five risk categories. After launch, the 'potential threat' category produces a 40% false positive rate while the other four categories perform well. Reviewers have begun ignoring flags across ALL categories, including legitimate ones. What is the most appropriate immediate action to restore reviewer trust?",
    answers: [
      { letter: "A", text: "Add a confidence score to each flag so reviewers can prioritize high-confidence results across all categories" },
      { letter: "B", text: "Temporarily disable the 'potential threat' category while improving its prompt criteria, and keep the other four categories active" },
      { letter: "C", text: "Write more detailed prose instructions explaining when documents should be classified as 'potential threat'" },
      { letter: "D", text: "Retrain reviewers on the importance of treating each category independently" }
    ],
    correct: "B",
    explanation: "High false positive rates in one category destroy trust in ALL categories — reviewers lose confidence in the entire system. Temporarily disabling the high-FP category while improving its prompts is the correct remediation. Option A fails because LLM self-confidence is poorly calibrated. Option C (more prose) underperforms compared to concrete examples. Option D addresses symptoms rather than the root cause."
  },
  {
    id: "q181",
    domain: 4,
    scenario: "Severity Calibration Consistency",
    question: "An engineering lead is building a prompt for an AI code review tool that flags security vulnerabilities by severity (critical, high, medium, low). Early testing shows the model inconsistently rates the same vulnerability pattern as 'high' in one review and 'medium' in another. What is the most effective technique to improve severity calibration consistency?",
    answers: [
      { letter: "A", text: "Add an instruction telling the model to 'be conservative and err on the side of higher severity'" },
      { letter: "B", text: "Include concrete code examples for each severity level showing why a specific vulnerability maps to that rating" },
      { letter: "C", text: "Set the temperature to 0 to eliminate randomness in the model's severity judgments" },
      { letter: "D", text: "Add a confidence threshold so that only flags with greater than 90% model confidence are surfaced to reviewers" }
    ],
    correct: "B",
    explanation: "Severity calibration requires concrete code examples, not prose descriptions. Showing the model actual vulnerability code and explaining why each maps to a specific severity level anchors its judgments consistently. Option A ('be conservative') provides no concrete boundary between levels. Option C (temperature=0) does not fix the underlying inconsistency in how the model interprets criteria. Option D fails because LLM self-confidence is poorly calibrated."
  },
  {
    id: "q182",
    domain: 4,
    scenario: "Structured Output for Multi-Issue Extraction",
    question: "A data extraction pipeline processes invoices from hundreds of vendors. The model correctly extracts most fields but occasionally fabricates values for fields like 'purchase order number' when the invoice does not contain one, and sometimes returns inconsistent JSON formatting. Which combination of techniques best addresses BOTH the fabrication and formatting issues?",
    answers: [
      { letter: "A", text: "Add few-shot examples with reasoning and increase the temperature to encourage creative extraction" },
      { letter: "B", text: "Use tool_use with a JSON schema that includes nullable fields for optional data like purchase order numbers" },
      { letter: "C", text: "Add more detailed text instructions specifying every possible invoice layout the model may encounter" },
      { letter: "D", text: "Implement confidence-based filtering to discard extractions where the model reports low certainty" }
    ],
    correct: "B",
    explanation: "tool_use with JSON schemas eliminates syntax/formatting errors (the most reliable method for structured output), while nullable/optional fields prevent fabrication — the model can return null instead of inventing a value. Option A does not address fabrication, and increasing temperature makes it worse. Option C cannot enumerate every layout. Option D fails because LLM self-confidence is poorly calibrated."
  },
  {
    id: "q183",
    domain: 4,
    scenario: "Few-Shot Examples for Medical Records",
    question: "A medical records extraction system processes clinical notes with varied document structures. The model occasionally returns empty fields for data that is present in the notes, and its judgment about which diagnosis is 'primary' versus 'secondary' varies inconsistently across similar documents. What is the single most effective technique to address both issues?",
    answers: [
      { letter: "A", text: "Add more detailed instructions explaining the difference between primary and secondary diagnoses" },
      { letter: "B", text: "Provide 2-4 few-shot examples with reasoning that explain why specific data was extracted and why one diagnosis was classified as primary over alternatives" },
      { letter: "C", text: "Increase the context window size to ensure the model can process longer clinical notes" },
      { letter: "D", text: "Set tool_choice to 'any' to force the model to always return structured output" }
    ],
    correct: "B",
    explanation: "Few-shot examples are the MOST effective consistency technique. The three classic triggers for few-shot are: inconsistent formatting, inconsistent judgment calls, and empty/null results for existing data — this scenario exhibits two. Including reasoning teaches generalizable principles. Option A is less effective than examples for judgment consistency. Option C does not fix attention dilution. Option D forces structured output but does not address extraction quality or judgment."
  },
  {
    id: "q184",
    domain: 4,
    scenario: "Self-Correction Fields for Financial Validation",
    question: "A financial document processor extracts line items and totals from expense reports. During testing, the model occasionally returns a stated total that does not match the sum of extracted line items. The team wants to catch these discrepancies automatically. What is the best approach?",
    answers: [
      { letter: "A", text: "Include self-correction fields in the schema: a calculated_total alongside the stated_total, with a conflict_detected boolean" },
      { letter: "B", text: "Retry the extraction three times and take the majority answer for the total" },
      { letter: "C", text: "Add a prompt instruction telling the model to 'always double-check its math'" },
      { letter: "D", text: "Use a larger model with extended thinking to improve arithmetic accuracy" }
    ],
    correct: "A",
    explanation: "Self-correction fields (calculated_total alongside stated_total with conflict_detected boolean) allow downstream validation to catch discrepancies programmatically. The model extracts both what the document states and what the line items sum to, and flags conflicts. Option B is expensive and does not guarantee catching errors. Option C is a vague instruction. Option D may improve reasoning but does not systematically detect when the document's stated total itself is wrong."
  },
  // ===== Domain Questions: D5 - Context Management =====
  {
    id: "q185",
    domain: 5,
    scenario: "Lost-in-the-Middle Effect",
    question: "A compliance review agent receives a 50-page regulatory document and must identify all non-compliant clauses. Testing reveals the agent reliably catches issues in the first and last sections but misses findings in pages 20-35, even though violations are present. An engineer suggests adding a prompt line: 'Pay special attention to the middle sections.' What is the correct approach?",
    answers: [
      { letter: "A", text: "Add the prompt reminder as proposed, since explicit instructions improve model attention to overlooked sections" },
      { letter: "B", text: "Structurally reorder the input so that the most critical sections appear at the beginning and end of the context" },
      { letter: "C", text: "Split the document into three equal parts and process each with a separate model call, then merge results without any deduplication" },
      { letter: "D", text: "Increase the temperature parameter to encourage the model to explore content it might otherwise skip" }
    ],
    correct: "B",
    explanation: "This describes the lost-in-the-middle effect, where models underperform on findings in the middle of long inputs. The fix is structural reorder of the input. Option A is explicitly wrong — prompt reminders do not fix this effect. Option C, while splitting can help, merging without deduplication introduces new problems. Option D is incorrect because temperature controls sampling randomness, not positional attention."
  },
  {
    id: "q186",
    domain: 5,
    scenario: "Silent Suppression Anti-Pattern",
    question: "A multi-agent financial research system has a market-data agent that encounters a rate-limit error when querying a stock API. Its error handler catches the exception and returns an empty JSON array [] to the orchestrator. The orchestrator interprets this as 'no market data available' and generates a report noting 'no significant market activity.' Which anti-pattern does this illustrate, and why is it particularly harmful?",
    answers: [
      { letter: "A", text: "Workflow termination — the system should have killed the entire pipeline when the API failed" },
      { letter: "B", text: "Silent suppression — returning an empty result as success is the worst anti-pattern because it prevents all downstream recovery by making the failure indistinguishable from a valid empty result" },
      { letter: "C", text: "Upstream agent optimisation failure — the market-data agent returned too little data and should have included its full reasoning chain" },
      { letter: "D", text: "Tool result trimming — the agent trimmed too aggressively and removed all market data fields" }
    ],
    correct: "B",
    explanation: "This is the silent suppression anti-pattern, where an agent returns empty results as if they were successful. It is the worst error-handling anti-pattern because it prevents ALL recovery — no downstream agent can distinguish the failure from a legitimately empty result. Option A describes workflow termination, which is also bad but at least visible. Option C misidentifies the problem. Option D is incorrect because tool result trimming is a deliberate context management technique."
  },
  {
    id: "q187",
    domain: 5,
    scenario: "Sentiment-Based Escalation Reliability",
    question: "A customer contacts a support AI agent about a billing discrepancy. After three exchanges, the customer types in all caps: 'THIS IS RIDICULOUS, I'VE BEEN CHARGED TWICE AND NO ONE IS HELPING ME.' The agent's escalation logic detects high frustration and prepares to transfer to a human agent. However, the agent has not yet attempted to look up the billing records. What is the correct handling?",
    answers: [
      { letter: "A", text: "Proceed with the escalation because high frustration sentiment is a reliable trigger, and the customer's emotional state takes priority" },
      { letter: "B", text: "Acknowledge the frustration and attempt to resolve the issue, because frustration alone is not a reliable escalation trigger — reserve escalation for when the customer explicitly requests a human" },
      { letter: "C", text: "Ignore the emotional language entirely and proceed with standard troubleshooting without acknowledgement" },
      { letter: "D", text: "Ask the customer to rate their frustration on a scale of 1-10 to determine whether the threshold for escalation has been met" }
    ],
    correct: "B",
    explanation: "Sentiment-based escalation is unreliable — frustration does not equal complexity. The correct nuance: frustrated but resolvable = acknowledge + resolve; explicit 'I want a human' = escalate immediately. The customer has not requested a human. Option A is wrong because sentiment-based escalation is unreliable. Option C is wrong because acknowledgement is part of correct handling. Option D is wrong because self-reported frustration scores are poorly calibrated."
  },
  {
    id: "q188",
    domain: 5,
    scenario: "Ambiguous Customer Identity Resolution",
    question: "A customer identity verification agent receives a request from 'John Smith' with a date of birth matching two customer records that differ by middle name and address. The agent's current logic selects the record with the closest address match using a fuzzy-matching heuristic and proceeds with the transaction. What is wrong with this approach?",
    answers: [
      { letter: "A", text: "The fuzzy-matching threshold is likely set too low; increasing it to 95% similarity would make heuristic selection acceptable" },
      { letter: "B", text: "The agent should never use heuristic selection for ambiguous customer matching — it must ask the customer for additional identifiers to disambiguate" },
      { letter: "C", text: "The agent should escalate to a human agent immediately because any ambiguity in customer records is a policy violation" },
      { letter: "D", text: "The agent should proceed with both records flagged and let the downstream system reconcile them" }
    ],
    correct: "B",
    explanation: "For ambiguous customer matching, the correct approach is to ask for additional identifiers — never heuristic selection. Selecting based on fuzzy matching risks acting on the wrong customer record. Option A is wrong because no heuristic threshold makes automatic selection acceptable in ambiguous identity scenarios. Option C is wrong because ambiguity is a resolvable situation, not a policy violation. Option D creates downstream risk and violates proper identity verification."
  },
  {
    id: "q189",
    domain: 5,
    scenario: "Structured Error Context with Partial Results",
    question: "A multi-agent legal research system's case-law agent searches for relevant precedents but one of its three database sources is temporarily unavailable. It retrieves results from the other two sources. Its current implementation returns the combined results with no indication that one source was not queried. What should the agent include in its response to the orchestrator?",
    answers: [
      { letter: "A", text: "Only the successful results, since partial data is better than no data and the orchestrator does not need to know about infrastructure issues" },
      { letter: "B", text: "Structured error context including: the failure type (database unavailability), the attempted query, the partial results from successful sources, and alternative approaches — plus coverage annotations noting which findings are well-supported and where gaps exist" },
      { letter: "C", text: "An error flag that terminates the entire research pipeline so the user knows results may be incomplete" },
      { letter: "D", text: "A retry loop that blocks until the third database becomes available, ensuring complete results before responding" }
    ],
    correct: "B",
    explanation: "The correct approach combines structured error context (failure type, attempted query, partial results, alternative approaches) with coverage annotations. This enables the orchestrator to make informed decisions. Option A is the silent suppression anti-pattern. Option C is the workflow termination anti-pattern. Option D introduces unbounded latency — the system should proceed with annotated partial results."
  },
  // ===== Exam Questions 1: Unique Questions =====
  {
    id: "q190",
    domain: 4,
    scenario: "Customer Support Resolution Agent",
    question: "Your agent handles single-concern requests with 94% accuracy, but when customers include multiple concerns in one message (e.g., 'I need a refund for order #1234 and also want to update my shipping address for order #5678'), tool selection accuracy drops to 58%. The agent typically addresses only one concern or mixes up parameters between requests. What's the most effective approach to improve reliability for multi-concern requests?",
    answers: [
      { letter: "A", text: "Implement a preprocessing layer that uses a separate model call to decompose multi-concern messages into individual requests" },
      { letter: "B", text: "Consolidate related tools into fewer, more general-purpose tools" },
      { letter: "C", text: "Implement response validation that detects incomplete responses and automatically re-prompts the agent" },
      { letter: "D", text: "Add few-shot examples demonstrating the correct reasoning and tool sequence for multi-concern requests" }
    ],
    correct: "D",
    explanation: "Few-shot examples demonstrating correct reasoning and tool sequencing for multi-concern requests is most effective because the agent already handles individual concerns well at 94% — it simply needs pattern guidance for handling multiple concerns. This is a low-cost technique that directly addresses the root cause."
  },
  {
    id: "q191",
    domain: 4,
    scenario: "Customer Support Resolution Agent",
    question: "Production logs show the agent sometimes selects get_customer when lookup_order would be more appropriate, particularly for ambiguous requests like 'I need help with my recent purchase.' You decide to add few-shot examples. Which approach will most effectively address this issue?",
    answers: [
      { letter: "A", text: "Add 10-15 examples of clear, unambiguous requests that demonstrate correct tool selection for each tool's typical use cases" },
      { letter: "B", text: "Add explicit 'use when' and 'do not use when' guidelines in each tool's description covering the ambiguous cases" },
      { letter: "C", text: "Add examples grouped by tool — all get_customer scenarios together, then all lookup_order scenarios" },
      { letter: "D", text: "Add 4-6 examples targeting ambiguous scenarios, each showing reasoning for why one tool was chosen over plausible alternatives" }
    ],
    correct: "D",
    explanation: "Targeting ambiguous scenarios with reasoning is most effective because the problem specifically occurs with ambiguous requests. 4-6 focused examples with explicit reasoning about why one tool was chosen over alternatives teaches the model the decision-making process. Unambiguous examples (A) don't address the problem. Grouped examples (C) don't teach discrimination between tools."
  },
  {
    id: "q192",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    question: "Production metrics show that when your agent resolves complex billing disputes or multi-order returns, customer satisfaction is 15% lower than for simple cases — even when the resolution is technically correct. Root cause analysis reveals the agent provides accurate resolutions but inconsistently explains the reasoning: sometimes omitting policy details, other times missing timeline information. What approach is most effective?",
    answers: [
      { letter: "A", text: "Add a confirmation step where the agent asks 'Does this fully address your concern?' before closing" },
      { letter: "B", text: "Increase the model tier from Haiku to Sonnet for complex cases" },
      { letter: "C", text: "Add a self-critique step where the agent evaluates its draft response for completeness — ensuring it addresses the concern, includes relevant context, and anticipates follow-up questions" },
      { letter: "D", text: "Implement few-shot examples showing complete resolution explanations for five common complex case types" }
    ],
    correct: "C",
    explanation: "A self-critique step (evaluator-optimizer pattern) directly addresses inconsistent explanation completeness by having the agent evaluate its own draft against specific criteria — policy context, timelines, and next steps — before presenting it. This catches case-specific gaps that vary across different complex scenarios without requiring human review."
  },
  {
    id: "q193",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    question: "Production metrics show your agent averages 4+ API round-trips per resolution. Analysis reveals Claude frequently requests get_customer and lookup_order in separate sequential turns even when both are needed upfront. What's the most effective way to reduce round-trips?",
    answers: [
      { letter: "A", text: "Create composite tools like get_customer_with_orders that bundle common lookup combinations" },
      { letter: "B", text: "Prompt Claude to batch tool requests per turn, and return all tool results together before the next API call" },
      { letter: "C", text: "Implement speculative execution that automatically calls likely-needed tools alongside any requested tool" },
      { letter: "D", text: "Increase max_tokens to give Claude more space to plan ahead and naturally batch its tool requests" }
    ],
    correct: "B",
    explanation: "Prompting Claude to batch related tool requests in a single turn leverages Claude's native ability to request multiple tools simultaneously. This directly addresses the sequential calling pattern with minimal architectural changes. Composite tools (A) reduce flexibility, speculative execution (C) wastes resources, and max_tokens (D) doesn't affect tool calling behaviour."
  },
  {
    id: "q194",
    domain: 4,
    scenario: "Customer Support Resolution Agent",
    question: "Production logs reveal a consistent pattern: when customers include 'account' in messages, the agent calls get_customer first 78% of the time. When customers phrase similar requests without 'account', it calls lookup_order first 93% of the time. The tool descriptions are well-written and unambiguous. What is the most likely root cause?",
    answers: [
      { letter: "A", text: "The system prompt contains keyword-sensitive instructions that steer behaviour based on terms like 'account', creating unintended tool selection patterns" },
      { letter: "B", text: "The model requires more training data on multi-concept messages and should be fine-tuned" },
      { letter: "C", text: "The tool descriptions need additional negative examples specifying when NOT to use each tool" },
      { letter: "D", text: "The model's base training creates associations between 'account' terminology and customer-related operations that override tool descriptions" }
    ],
    correct: "A",
    explanation: "The systematic, keyword-triggered pattern (78% vs 93%) strongly suggests explicit routing logic in the system prompt that reacts to the word 'account' and directs the agent toward customer-related tools. Since tool descriptions are already well-written, the discrepancy points to prompt-level instructions creating unintended behavioural steering."
  },
  {
    id: "q195",
    domain: 5,
    scenario: "Customer Support Resolution Agent",
    question: "After calling get_customer and lookup_order, the agent has retrieved all available system data but faces uncertainty. Which situation represents the most appropriate trigger for calling escalate_to_human?",
    answers: [
      { letter: "A", text: "The customer claims they never received their order, but tracking shows it was delivered and signed for three days ago" },
      { letter: "B", text: "The customer's message mentions both a billing question and a product return" },
      { letter: "C", text: "The customer requests a price match against a competitor, but policies are silent on competitor pricing — only covering own-site price drops within 14 days" },
      { letter: "D", text: "The customer wants to cancel an order that shipped yesterday, with delivery scheduled for tomorrow" }
    ],
    correct: "C",
    explanation: "This represents a genuine policy gap where guidelines cover own-site price drops but are silent on competitor price matching. The agent cannot fabricate a policy and must escalate for human judgment. Option A is a factual contradiction the agent can present. Option B involves two standard tasks the agent can handle. Option D involves a cancellation the agent can process per standard procedures."
  },
  {
    id: "q196",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    question: "For complex requests like 'I've been charged twice, my discount didn't apply, and I want to cancel', the agent averages 12+ tool calls with only 54% resolution — often investigating concerns sequentially and gathering redundant customer data for each one. Simple requests succeed at 91%. What's the most effective change?",
    answers: [
      { letter: "A", text: "Reduce available tools by consolidating get_customer, lookup_order, and billing lookups into a single investigate_issue tool" },
      { letter: "B", text: "Add few-shot examples demonstrating ideal tool call sequences for multi-part billing scenarios" },
      { letter: "C", text: "Decompose the request into distinct concerns, then investigate each in parallel using shared customer context before synthesizing a resolution" },
      { letter: "D", text: "Add verification gates between steps requiring the agent to checkpoint after resolving each concern" }
    ],
    correct: "C",
    explanation: "Decomposing the request into distinct concerns and investigating them in parallel with shared customer context eliminates redundant data fetching and reduces total tool calls by parallelizing investigations before synthesizing a unified resolution."
  },
  {
    id: "q197",
    domain: 4,
    scenario: "Claude Code for Continuous Integration",
    question: "Your CI/CD system performs three Claude-powered analyses: (1) quick style checks on each PR that block merging, (2) comprehensive security audits run weekly, (3) test case generation triggered nightly. The Message Batches API offers 50% cost savings but can take up to 24 hours. Which combination correctly matches each task to its API approach?",
    answers: [
      { letter: "A", text: "Use synchronous calls for PR style checks; use the Message Batches API for weekly security audits and nightly test generation" },
      { letter: "B", text: "Use the Message Batches API for all three tasks to maximize cost savings, with polling for completion" },
      { letter: "C", text: "Use synchronous calls for all three tasks for consistent response times, and rely on prompt caching to reduce costs" },
      { letter: "D", text: "Use synchronous calls for PR style checks and nightly test generation; use Batches API only for weekly security audits" }
    ],
    correct: "A",
    explanation: "PR style checks block developers and require immediate responses. Weekly security audits and nightly test generation are scheduled tasks with flexible timelines that can tolerate up to 24-hour batch processing, capturing the 50% cost savings. Option D incorrectly uses synchronous calls for nightly test generation which has no latency requirement."
  },
  {
    id: "q198",
    domain: 3,
    scenario: "Claude Code for Continuous Integration",
    question: "After an initial automated review generates 12 findings, a developer pushes new commits to address the issues. The re-run produces 8 findings — but 5 duplicate earlier comments on code that was already fixed. What's the most effective way to eliminate redundant feedback?",
    answers: [
      { letter: "A", text: "Add a post-processing filter that removes findings matching previous file paths and issue descriptions" },
      { letter: "B", text: "Include prior review findings in context, instructing Claude to only report new or still-unaddressed issues" },
      { letter: "C", text: "Run reviews only on initial PR creation and final pre-merge state, skipping intermediate commits" },
      { letter: "D", text: "Restrict review scope to only files modified in the most recent push" }
    ],
    correct: "B",
    explanation: "Including prior review findings in context allows Claude to intelligently distinguish between new issues and those already addressed by recent commits. This maintains thorough analysis while leveraging Claude's reasoning to avoid redundant feedback. Post-processing filters (A) are brittle. Restricting scope (D) could miss regressions."
  },
  {
    id: "q199",
    domain: 4,
    scenario: "Claude Code for Continuous Integration",
    question: "Your automated code review averages 15 findings per PR with a 40% false positive rate. The bottleneck is investigation time: developers must click into each finding to read reasoning before deciding whether to address or dismiss it. Stakeholders have rejected any approach that filters findings before review. What change best addresses the investigation time bottleneck?",
    answers: [
      { letter: "A", text: "Categorize findings as 'blocking issues' versus 'suggestions' with tiered review requirements" },
      { letter: "B", text: "Add a post-processor that suppresses findings matching historical false positive signatures" },
      { letter: "C", text: "Require Claude to include its reasoning and confidence assessment inline with each finding" },
      { letter: "D", text: "Configure Claude to only surface findings assessed as high confidence, filtering out uncertain flags" }
    ],
    correct: "C",
    explanation: "Including reasoning and confidence assessments inline allows developers to quickly evaluate findings without clicking into each one separately. This respects the constraint against filtering, since all findings remain visible while making triage significantly faster. Options B and D violate the no-filtering constraint."
  },
  {
    id: "q200",
    domain: 4,
    scenario: "Claude Code for Continuous Integration",
    question: "Your automated review analyses comments and docstrings with the instruction to 'check that comments are accurate and up-to-date.' Findings frequently flag acceptable patterns (TODO markers, straightforward descriptions) while missing comments that describe behaviour the code no longer implements. What change addresses the root cause?",
    answers: [
      { letter: "A", text: "Add few-shot examples of misleading comments to help the model recognise similar patterns" },
      { letter: "B", text: "Filter out TODO, FIXME, and descriptive comment patterns before analysis" },
      { letter: "C", text: "Include git blame data so Claude can identify comments that predate recent code modifications" },
      { letter: "D", text: "Specify explicit criteria: flag comments only when their claimed behaviour contradicts actual code behaviour" }
    ],
    correct: "D",
    explanation: "Specifying explicit criteria — flag comments only when their claimed behaviour contradicts actual code behaviour — directly addresses the root cause by replacing a vague instruction with a precise definition of what constitutes a problem. This eliminates both false positives on acceptable patterns and false negatives on genuinely misleading comments."
  },
  {
    id: "q201",
    domain: 3,
    scenario: "Claude Code for Continuous Integration",
    question: "Your automated review generates test case suggestions for a PR adding course completion tracking. Claude suggests 10 test cases but 6 duplicate scenarios already covered in the existing test suite. What change would most effectively reduce duplicate suggestions?",
    answers: [
      { letter: "A", text: "Include the existing test file in the context so Claude can identify what scenarios are already covered" },
      { letter: "B", text: "Reduce requested suggestions from 10 to 5, assuming Claude will prioritize the most valuable cases first" },
      { letter: "C", text: "Implement post-processing that filters suggestions matching keywords from existing test names" },
      { letter: "D", text: "Add instructions directing Claude to focus exclusively on edge cases and error conditions" }
    ],
    correct: "A",
    explanation: "Including the existing test file in context directly addresses the root cause: Claude can only avoid suggesting already-covered scenarios if it knows what tests exist. This gives Claude the information needed to reason about which suggestions would be genuinely new and valuable."
  },
  {
    id: "q202",
    domain: 4,
    scenario: "Claude Code for Continuous Integration",
    question: "The code review component works iteratively: Claude analyses a changed file, then may request related files via tool calling to understand context before providing feedback. You're evaluating batch processing to reduce API costs. What is the primary technical constraint when considering batch processing for this workflow?",
    answers: [
      { letter: "A", text: "The asynchronous model prevents executing tools mid-request and returning results for Claude to continue analysis" },
      { letter: "B", text: "Batch processing latency of up to 24 hours is too slow for pull request feedback" },
      { letter: "C", text: "Batch processing lacks request correlation identifiers for matching outputs to inputs" },
      { letter: "D", text: "The batch API doesn't support tool definitions in request parameters" }
    ],
    correct: "A",
    explanation: "The batch API's asynchronous fire-and-forget model means there is no mechanism to intercept a tool call mid-request, execute the tool, and return results for Claude to continue analysis. This fundamentally breaks iterative tool-calling workflows. Option B is about latency (a practical concern but not the technical constraint). Option C is wrong — custom_id provides correlation."
  },
  {
    id: "q203",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "You've created a /commit skill in .claude/skills/ that your team uses. One developer wants to customize it for their personal workflow (different commit message format, additional checks) without affecting teammates. What should you recommend?",
    answers: [
      { letter: "A", text: "Add username-based conditional logic to the project skill's frontmatter" },
      { letter: "B", text: "Create a personal version at ~/.claude/skills/commit/SKILL.md with the same name" },
      { letter: "C", text: "Set override: true in the personal skill's frontmatter to take precedence" },
      { letter: "D", text: "Create a personal version in ~/.claude/skills/ with a different name like /my-commit" }
    ],
    correct: "D",
    explanation: "Since project skills take precedence over personal skills with the same name, the developer must use a different skill name (like /my-commit) in their personal ~/.claude/skills/ directory. Options B and C would not work because project-level skills override personal ones with the same name."
  },
  {
    id: "q204",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "Your CLAUDE.md has grown to over 400 lines containing coding standards, testing conventions, PR review checklist, deployment workflow, and database migration procedures. You want Claude to always follow coding standards and testing conventions, but only apply PR review, deployment, and migration guidance when performing those tasks. What's the most effective restructuring?",
    answers: [
      { letter: "A", text: "Keep universal standards in CLAUDE.md and create Skills for task-specific workflows (PR reviews, deployments, migrations) with trigger keywords" },
      { letter: "B", text: "Move all guidance into separate Skills organized by workflow type, keeping only a brief project description in CLAUDE.md" },
      { letter: "C", text: "Keep all content in CLAUDE.md but use @import syntax to organize it into separately maintained files" },
      { letter: "D", text: "Split CLAUDE.md into .claude/rules/ files with path-specific glob patterns so each rule loads only for matching file types" }
    ],
    correct: "A",
    explanation: "CLAUDE.md content is loaded for every conversation, ensuring coding standards are always applied. Skills are invoked on-demand when Claude detects relevant trigger keywords, making them ideal for task-specific workflows. Option B removes universal standards from always-on context. Option D doesn't match task-specific workflows to file patterns well."
  },
  {
    id: "q205",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "You've asked Claude Code to implement a function that transforms API responses into a normalised internal format. After two iterations, the output structure still doesn't match expectations — some fields are nested differently and timestamps aren't formatted correctly. You've been describing the requirements in prose, but Claude seems to interpret them differently each time. What's the most effective approach for the next iteration?",
    answers: [
      { letter: "A", text: "Rewrite your requirements with greater technical precision, specifying exact field mappings and format strings" },
      { letter: "B", text: "Ask Claude to explain its current interpretation so you can identify where understanding diverges" },
      { letter: "C", text: "Provide 2-3 concrete input-output examples showing the expected transformation for representative API responses" },
      { letter: "D", text: "Write a JSON schema defining the expected output structure and validate Claude's output against it" }
    ],
    correct: "C",
    explanation: "Concrete input-output examples eliminate the ambiguity inherent in prose descriptions by showing Claude exactly what the expected transformation looks like. This directly addresses the root cause — misinterpretation of prose requirements — by giving unambiguous, concrete targets for field nesting and timestamp formatting."
  },
  {
    id: "q206",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "Your coordinator needs to spawn three subagents simultaneously at the start of research: web search, document analysis, and data extraction. Each subagent works independently on different aspects of the query. What is the correct implementation pattern for parallel subagent execution?",
    answers: [
      { letter: "A", text: "Emit multiple Task tool calls in a single coordinator response rather than across separate turns" },
      { letter: "B", text: "Chain the Task calls sequentially, waiting for each subagent to complete before spawning the next" },
      { letter: "C", text: "Create a separate coordinator agent instance for each subagent and run them in parallel processes" },
      { letter: "D", text: "Use a message queue to dispatch tasks to subagents asynchronously outside the agent framework" }
    ],
    correct: "A",
    explanation: "The correct pattern is having the coordinator emit multiple Task tool calls in a single response, which enables parallel execution. The Agent SDK handles the parallelism. Sequential chaining defeats the purpose, separate coordinator instances add complexity, and external message queues bypass built-in coordination mechanisms."
  },
  {
    id: "q207",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "Your web search subagent and document analysis subagent both return findings about market growth. The synthesis agent consistently treats web search claims as more reliable than document findings, even when documents are primary sources and web results are news articles. What is the most likely cause of this bias?",
    answers: [
      { letter: "A", text: "The synthesis agent's system prompt contains keyword-sensitive instructions that inadvertently favour web sources" },
      { letter: "B", text: "The web search subagent formats its output more prominently than the document analysis subagent" },
      { letter: "C", text: "The synthesis agent has a training bias toward web-based information" },
      { letter: "D", text: "The document analysis subagent is not including sufficient metadata about source reliability" }
    ],
    correct: "A",
    explanation: "System prompt wording can create unintended tool associations and biases. Phrases like 'recent data' or 'latest reports' may inadvertently prioritise web search results over document analysis findings. The fix is reviewing system prompts for keyword-sensitive instructions that might override well-structured subagent outputs."
  },
  {
    id: "q208",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "After implementing your multi-agent system, you notice the coordinator routes web search tasks to the synthesis agent and synthesis tasks to the document analysis agent. Each agent attempts work outside its specialisation, producing poor results. What is the root cause and appropriate fix?",
    answers: [
      { letter: "A", text: "The agent definitions lack clear descriptions distinguishing their roles and responsibilities" },
      { letter: "B", text: "The Task tool descriptions don't differentiate between the types of work each subagent should receive" },
      { letter: "C", text: "The coordinator has too many tools available and is experiencing decision fatigue" },
      { letter: "D", text: "The subagents are not properly isolated and are sharing context incorrectly" }
    ],
    correct: "A",
    explanation: "When agent definitions have minimal or overlapping descriptions, the coordinator cannot reliably distinguish which agent handles which task. Expanding each agent's description to clearly define its purpose, expected inputs, outputs, and boundaries directly addresses the root cause."
  },
  {
    id: "q209",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "Your coordinator needs to pass the full context of a research query to each subagent, including the original question, constraints, and intermediate findings from other agents. Which approach correctly handles context passing?",
    answers: [
      { letter: "A", text: "Subagents automatically inherit the coordinator's conversation history; no explicit context passing is needed" },
      { letter: "B", text: "Include complete findings from prior agents directly in the subagent's prompt parameter when invoking the Task tool" },
      { letter: "C", text: "Store context in a shared database that all subagents can access using a custom tool" },
      { letter: "D", text: "Use the coordinator's session ID to link subagents to the parent's context" }
    ],
    correct: "B",
    explanation: "Subagents do not automatically inherit parent context or share memory. Context must be explicitly provided in the prompt parameter when spawning subagents via the Task tool. Using structured data formats to separate content from metadata preserves attribution. Options A, C, and D all violate the subagent isolation principle."
  },
  {
    id: "q210",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "The final synthesis report contains excellent findings but fails to distinguish between claims supported by multiple sources versus claims based on a single source. Stakeholders cannot assess the confidence level of different findings. How should the synthesis output be restructured?",
    answers: [
      { letter: "A", text: "Organise findings into explicit sections: well-supported (3+ sources), contested (conflicting sources), and coverage gaps (unavailable sources)" },
      { letter: "B", text: "Add a numeric confidence score to each claim based on the number of supporting sources" },
      { letter: "C", text: "Include only findings supported by at least two independent sources, filtering out single-source claims" },
      { letter: "D", text: "Append a disclaimer stating that findings should be independently verified" }
    ],
    correct: "A",
    explanation: "The synthesis output should structure findings by support level, allowing stakeholders to assess confidence appropriately. Coverage annotations indicating which findings are well-supported versus which topic areas have gaps provides transparency about research quality and limitations. Numeric scores (B) are poorly calibrated. Filtering (C) loses potentially useful single-source findings."
  },
  {
    id: "q211",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "Your multi-agent system produces research reports, but the same source is cited multiple times with different metadata — sometimes as 'MIT Tech Review, 2024' and other times as 'technologyreview.mit.edu, March 2024.' What change would address this source deduplication issue?",
    answers: [
      { letter: "A", text: "Require subagents to use canonical source identifiers (standardised URLs or DOIs) and include these in structured output" },
      { letter: "B", text: "Implement post-processing that attempts to match and merge similar citations based on string similarity" },
      { letter: "C", text: "Restrict subagents to using only sources with formal academic identifiers" },
      { letter: "D", text: "Increase the synthesis agent's instructions to watch for and merge duplicate sources" }
    ],
    correct: "A",
    explanation: "Requiring structured output with canonical identifiers from subagents prevents the deduplication problem at the source. Post-processing similarity matching (B) is fragile, restricting source types (C) limits research scope, and synthesis instructions (D) don't fix inconsistent subagent output."
  },
  {
    id: "q212",
    domain: 5,
    scenario: "Multi-Agent Research System",
    question: "Your research system receives two findings on AI investment trends: Finding A: 'AI investment reached $50B in 2023' (source: 2024 report citing 2023 data). Finding B: 'AI investment declined to $45B in 2024' (source: mid-2024 report). The synthesis agent reports these as contradictory trends, suggesting the market became volatile. What is the actual issue?",
    answers: [
      { letter: "A", text: "The synthesis failed to account for temporal differences — the findings describe different years, not contradictory trends" },
      { letter: "B", text: "The sources have different methodological approaches that make them incomparable" },
      { letter: "C", text: "The findings are actually measuring different investment categories" },
      { letter: "D", text: "One of the sources is likely unreliable and should have been excluded" }
    ],
    correct: "A",
    explanation: "Requiring subagents to include publication or data collection dates in structured outputs enables correct temporal interpretation. Without dates, temporal differences can be misinterpreted as contradictions. The 2023 and mid-2024 figures describe sequential years, not conflicting views of the same period."
  },
  {
    id: "q213",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "Your extraction system categorises documents into types (invoice, contract, receipt, etc.). Sometimes documents don't clearly fit any category, and the model is forced to choose the 'closest' option, introducing errors. What schema design pattern handles these ambiguous cases?",
    answers: [
      { letter: "A", text: "Use an enum with an 'other' value plus a detail string field for extensible categorisation" },
      { letter: "B", text: "Add 'unclear' as an enum value for ambiguous cases" },
      { letter: "C", text: "Make the document type field optional so it can be omitted when unclear" },
      { letter: "D", text: "Create a separate 'confidence' field to indicate how well the document fits the assigned type" }
    ],
    correct: "A",
    explanation: "The recommended pattern for extensible categorisation is enum values with 'other' plus a detail string field. This allows the model to flag unclear cases while still providing useful information about what the document appears to be. Option B has no explanatory detail. Option C loses useful information. Option D relies on poorly calibrated LLM confidence."
  },
  {
    id: "q214",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "You're processing a batch of 5,000 documents overnight using the Message Batches API. Your SLA requires results within 30 hours. The batch API has a 24-hour processing window. What submission strategy ensures you meet your SLA?",
    answers: [
      { letter: "A", text: "Submit batches with a 4-hour processing window buffer to guarantee the 30-hour SLA with 24-hour batch processing" },
      { letter: "B", text: "Submit all documents in a single batch at the start of the 30-hour window" },
      { letter: "C", text: "Split documents into multiple batches submitted at different times" },
      { letter: "D", text: "Use the synchronous API instead to guarantee faster processing" }
    ],
    correct: "A",
    explanation: "Calculating batch submission frequency based on SLA constraints ensures reliable delivery. With a 30-hour SLA and 24-hour batch processing, submitting with a 4-hour buffer accounts for submission overhead and potential delays. Submitting all at once (B) risks exceeding the SLA if processing takes the full 24 hours."
  },
  {
    id: "q215",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "You have a two-stage extraction pipeline: first extract metadata, then extract detailed content. Sometimes the second stage runs before the first completes successfully. What tool_choice configuration ensures the correct extraction sequence?",
    answers: [
      { letter: "A", text: "Use forced tool selection to ensure extract_metadata runs first, then process subsequent steps in follow-up turns" },
      { letter: "B", text: "Combine both extractions into a single tool definition" },
      { letter: "C", text: "Add instructions in the prompt specifying the correct order" },
      { letter: "D", text: "Use tool_choice: 'any' to guarantee at least one extraction tool is called" }
    ],
    correct: "A",
    explanation: "Using forced tool selection with tool_choice: {type: 'tool', name: 'extract_metadata'} ensures a particular extraction runs first, with subsequent steps in follow-up turns. This is the documented pattern for enforcing multi-step extraction sequences. Prompt instructions (C) are probabilistic, and tool_choice 'any' (D) doesn't control which tool."
  },
  {
    id: "q216",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "Your extraction pipeline processes purchase orders with item quantities. Some orders use numeric quantities ('5'), others use spelled-out numbers ('five'), and some use both ('5 (five)'). What approach handles these format variations consistently?",
    answers: [
      { letter: "A", text: "Include format normalisation rules in prompts alongside strict output schemas to handle inconsistent source formatting" },
      { letter: "B", text: "Pre-process documents to convert all quantities to numeric format" },
      { letter: "C", text: "Create separate schema fields for numeric and text quantities" },
      { letter: "D", text: "Use a two-pass extraction that first normalises text, then extracts values" }
    ],
    correct: "A",
    explanation: "Including format normalisation rules in prompts alongside strict output schemas enables handling inconsistent source formatting while maintaining structured output. This addresses format variation at the extraction layer rather than requiring pre-processing or complex schema designs."
  },
  {
    id: "q217",
    domain: 3,
    scenario: "Code Generation with Claude Code",
    question: "You're adding error handling wrappers to external API calls across a 120-file codebase. During Phase 1 (discovering all API call locations), Claude generates verbose output listing hundreds of call sites. Your context window is filling rapidly. What's the most effective approach?",
    answers: [
      { letter: "A", text: "Define your error handling pattern in CLAUDE.md, then process files in batches across multiple sessions" },
      { letter: "B", text: "Use the Explore subagent for Phase 1 to isolate verbose output and return a summary, then continue Phases 2-3 in the main conversation" },
      { letter: "C", text: "Switch to headless mode with --continue, passing explicit context summaries between batch invocations" },
      { letter: "D", text: "Continue all phases in the main conversation, using /compact periodically to reduce context usage" }
    ],
    correct: "B",
    explanation: "Using the Explore subagent for Phase 1 isolates the verbose discovery output in a separate context, returning only a concise summary to the main conversation. This preserves the main context window for the collaborative design and consistent implementation phases where retained context is most valuable."
  },
  {
    id: "q218",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "The synthesis agent frequently needs to verify specific claims while combining findings. Currently, verification requires returning control to the coordinator, which invokes the web search agent, adding 2-3 round trips per verification (40% latency increase). 85% of verifications are simple fact-checks; 15% require deeper investigation. What's most effective?",
    answers: [
      { letter: "A", text: "Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating through the coordinator" },
      { letter: "B", text: "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator" },
      { letter: "C", text: "Give the synthesis agent access to all web search tools so it handles any verification directly" },
      { letter: "D", text: "Have the web search agent proactively cache extra context around each source during initial research" }
    ],
    correct: "A",
    explanation: "This applies the principle of least privilege — giving the synthesis agent only what it needs for the 85% common case (simple fact verification) while preserving coordinator delegation for complex cases. Over-provisioning tools (C) violates least privilege, batching (B) creates blocking dependencies, and speculative caching (D) cannot predict what needs verification."
  },
  {
    id: "q219",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "PDF parsing frequently encounters failures (corrupted sections, password protection). Currently, these terminate the subagent and trigger coordinator intervention for every failure. What's the most effective architectural improvement to reduce coordinator involvement in routine error handling?",
    answers: [
      { letter: "A", text: "Create a dedicated error-handling agent that processes all parsing failures" },
      { letter: "B", text: "Have the coordinator validate all documents before dispatching them to subagents" },
      { letter: "C", text: "Configure subagents to always return partial results with 'success' status" },
      { letter: "D", text: "Have the subagent implement local recovery for transient failures and only propagate errors it cannot resolve to the coordinator" }
    ],
    correct: "D",
    explanation: "Handling errors at the lowest possible level follows the principle of local recovery. Enabling subagents to independently resolve routine parsing issues (retrying corrupted sections, skipping password-protected pages with annotation) reduces unnecessary coordinator overhead and simplifies global error management. Only truly unresolvable errors should bubble up."
  },
  {
    id: "q220",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    question: "When process_refund fails (e.g., the order is outside the refund window), the team wants Claude to provide a helpful explanation to the customer rather than retrying or hallucinating a success. How should the tool result be structured to signal an error to Claude?",
    answers: [
      { letter: "A", text: "Return an HTTP 500 status code in the tool result so Claude detects the failure from the status" },
      { letter: "B", text: "Return the tool result with the isError flag set to true and include a descriptive error message with the error category (e.g., error_type: 'policy_violation')" },
      { letter: "C", text: "Return an empty result so Claude infers the tool failed and explains the situation" },
      { letter: "D", text: "Throw an exception in the tool server and let the SDK propagate it as a system-level error" }
    ],
    correct: "B",
    explanation: "The isError flag in the tool result signals to Claude that the tool call failed, prompting it to explain the error to the user rather than treating the result as a success. Including a descriptive error message with an error category (e.g., 'policy_violation') gives Claude the context it needs to provide a helpful, specific explanation. HTTP status codes are not part of the tool result schema, empty results are ambiguous, and SDK-level exceptions may crash the loop."
  },
  {
    id: "q221",
    domain: 1,
    scenario: "Customer Support Resolution Agent",
    question: "The agent needs to hand off to a human agent when it detects certain conditions. The team wants to define clear, deterministic escalation triggers. Which implementation approach best balances reliability with flexibility?",
    answers: [
      { letter: "A", text: "Rely entirely on Claude's judgment by prompting it to 'escalate when you think the issue is too complex'" },
      { letter: "B", text: "Define programmatic escalation triggers in code (e.g., after 3 failed refund attempts, or when the customer explicitly requests a human) while also providing prompt-level guidance for Claude to call escalate_to_human for nuanced situations it can detect but code cannot" },
      { letter: "C", text: "Hard-code every possible escalation condition in a rules engine and remove Claude's ability to call escalate_to_human directly" },
      { letter: "D", text: "Let the customer decide when to escalate by presenting an 'escalate' button in the UI and removing all automated escalation logic" }
    ],
    correct: "B",
    explanation: "The best approach combines programmatic triggers for deterministic, well-defined escalation conditions (e.g., failed refund attempts exceeding a threshold, explicit customer request) with prompt-level guidance for nuanced situations that are hard to codify in rules (e.g., detecting customer frustration, recognizing domain-specific complexity). Pure prompt-based escalation is unreliable for critical business rules. Pure rules-engine escalation cannot handle nuanced situations."
  },
  {
    id: "q222",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    question: "The team wants the agent to return structured data to the backend system after each resolution — including the resolution type, actions taken, and customer satisfaction signal — while still providing a natural language response to the customer. What is the most reliable way to extract structured data from Claude's response?",
    answers: [
      { letter: "A", text: "Ask Claude to include a JSON block at the end of its natural language response and parse it with regex" },
      { letter: "B", text: "Use the tool_use pattern: define a dedicated tool (e.g., submit_resolution_summary) whose parameters match the desired schema, and have Claude call it when it finishes handling the issue" },
      { letter: "C", text: "Use a separate API call after the conversation to ask Claude to summarize the resolution in JSON format" },
      { letter: "D", text: "Parse the natural language response with a second model to extract structured fields" }
    ],
    correct: "B",
    explanation: "Using the tool_use pattern with a dedicated tool (e.g., submit_resolution_summary) whose parameters define the exact desired schema is the most reliable way to extract structured data from Claude. The API enforces the parameter schema, guaranteeing valid, well-structured output. Parsing JSON from text responses is fragile, a separate API call adds latency and cost, and using a second model adds complexity."
  },
  {
    id: "q223",
    domain: 2,
    scenario: "Customer Support Resolution Agent",
    question: "The handoff to a human agent requires passing the full conversation context, customer data, and a summary of actions taken. The team is designing the escalate_to_human tool's input schema. What is the best practice for structuring this handoff?",
    answers: [
      { letter: "A", text: "Pass only the customer ID and let the human agent start fresh by looking up the customer manually" },
      { letter: "B", text: "Design the tool's parameters to accept a structured summary including the customer ID, issue description, actions already attempted, tool results received, and the reason for escalation" },
      { letter: "C", text: "Pass the entire raw conversation history as a single string parameter" },
      { letter: "D", text: "Have Claude generate a brief one-line reason for escalation and pass only that to the human agent" }
    ],
    correct: "B",
    explanation: "The handoff tool should accept a structured parameter set that captures all context the human agent needs: customer identification, issue description, actions already attempted and their results, and the specific reason for escalation. This ensures a smooth handoff where the human agent can pick up without re-asking the customer for information. Minimal context forces the human to re-gather information. Raw conversation history is unstructured and hard for humans to quickly parse."
  },
  {
    id: "q224",
    domain: 3,
    scenario: "Claude Code for CI",
    question: "The CI pipeline runs Claude Code on multiple PRs concurrently. The team is concerned that context or state from one PR's review might leak into another. How does Claude Code handle session isolation in CI?",
    answers: [
      { letter: "A", text: "Claude Code uses a global session that persists across all CI runs, so explicit cleanup is needed between runs" },
      { letter: "B", text: "Each invocation of Claude Code with the -p flag operates in its own isolated session with no shared state, so concurrent CI runs are naturally isolated from each other" },
      { letter: "C", text: "Claude Code stores session state in a shared /tmp directory that must be manually partitioned per PR" },
      { letter: "D", text: "Claude Code requires a --session-id flag to ensure isolation between concurrent runs" }
    ],
    correct: "B",
    explanation: "Each invocation of Claude Code with the -p flag operates in its own isolated session. There is no shared state between invocations, so concurrent CI runs processing different PRs are naturally isolated. No global session exists that would require cleanup, there is no shared /tmp state to partition, and no --session-id flag is needed for isolation."
  },
  {
    id: "q225",
    domain: 3,
    scenario: "Claude Code for CI",
    question: "The team wants to configure Claude Code's behavior specifically for CI runs — for example, instructing it to focus on security vulnerabilities and not suggest style changes. They want this configuration to apply only in the CI environment, not when developers use Claude Code locally. How should they configure this?",
    answers: [
      { letter: "A", text: "Add CI-specific instructions to the repository's root CLAUDE.md file, which will also affect local developer usage" },
      { letter: "B", text: "Use a project-level CLAUDE.md for general rules, and pass CI-specific instructions directly in the -p prompt. The CLAUDE.md hierarchy allows layered configuration" },
      { letter: "C", text: "Set environment variables in the CI runner to override Claude Code's behavior" },
      { letter: "D", text: "Create a separate fork of the repository with different Claude Code settings for CI" }
    ],
    correct: "B",
    explanation: "The CLAUDE.md hierarchy supports layered configuration: user-level, project-level, and directory-level settings. For CI-specific behavior, the team can pass CI-specific instructions directly in the -p prompt or use path-specific configuration. A project-level CLAUDE.md with general rules applies everywhere, while CI-specific instructions can be scoped to the CI context without affecting local development."
  },
  {
    id: "q226",
    domain: 3,
    scenario: "Claude Code for CI",
    question: "The team implements an incremental review strategy: Claude Code reviews only the changed files in a PR. However, Claude Code sometimes misses issues that depend on understanding unchanged code (e.g., a changed function call where the function definition was not modified). How should the team address this?",
    answers: [
      { letter: "A", text: "Always send the entire codebase to Claude Code to ensure full context" },
      { letter: "B", text: "Provide the changed files as the primary review target, but also include relevant context files (imported modules, type definitions, function signatures referenced by the changed code)" },
      { letter: "C", text: "Ignore cross-file issues — they will be caught by unit tests" },
      { letter: "D", text: "Run two separate reviews — one for changed files and one for the entire codebase — and merge findings" }
    ],
    correct: "B",
    explanation: "Incremental review should focus on changed files but provide sufficient surrounding context — imported modules, type definitions, function signatures referenced by the changed code — so Claude Code can understand cross-file dependencies. This balances efficiency (not reviewing the entire codebase) with accuracy (understanding the context of changes). Sending the entire codebase causes attention dilution."
  },
  {
    id: "q227",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "During testing, the team finds that Claude occasionally extracts dates in inconsistent formats (e.g., '03/18/2026' vs. '2026-03-18' vs. 'March 18, 2026'). They want to ensure consistent formatting without post-processing. What is the most effective approach?",
    answers: [
      { letter: "A", text: "Add a post-processing step to normalize date formats after extraction" },
      { letter: "B", text: "Provide few-shot examples in the prompt showing the exact expected format for each field type" },
      { letter: "C", text: "Add 'use ISO format' to the system prompt and trust Claude to comply consistently" },
      { letter: "D", text: "Define a regex pattern in the tool schema's field description and expect Claude to match it exactly" }
    ],
    correct: "B",
    explanation: "Few-shot examples are the most effective way to establish consistent output formatting. By including 2-3 examples showing the exact expected format (e.g., dates as '2026-03-18'), Claude strongly follows the demonstrated pattern. System prompt instructions are less reliable for precise formatting. Post-processing adds complexity. Regex in descriptions is not reliably followed by the model."
  },
  {
    id: "q228",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "The team has implemented a self-review step: after Claude extracts data, the same session sends the extraction back to Claude and asks it to verify the results. The team notices that the self-review almost never catches errors that were in the original extraction. Why is this happening, and how should they address it?",
    answers: [
      { letter: "A", text: "The self-review model is not powerful enough — use a larger model for verification" },
      { letter: "B", text: "Self-review within the same session retains the original reasoning context, making it likely to repeat the same errors. Use a separate session or programmatic validation rules for independent review" },
      { letter: "C", text: "The self-review prompt is not detailed enough — adding more specific review instructions will fix the issue" },
      { letter: "D", text: "Self-review works well in general but fails on extraction tasks specifically due to the structured output format" }
    ],
    correct: "B",
    explanation: "Self-review within the same session is fundamentally limited because the session retains the original reasoning context. Claude is essentially reviewing its own work with the same 'state of mind' that produced it, making it likely to repeat the same errors. Effective verification requires an independent perspective: a separate Claude session that receives only the document and the extraction (not the original reasoning), programmatic validation rules, or human review."
  },
  {
    id: "q229",
    domain: 4,
    scenario: "Structured Data Extraction",
    question: "The team is evaluating extraction accuracy across document types. They sample 50 invoices and find 98% field-level accuracy. They conclude the system is production-ready. A senior architect raises a concern about this evaluation approach. What is the likely issue?",
    answers: [
      { letter: "A", text: "The sample size is too small — they need at least 10,000 documents" },
      { letter: "B", text: "They may be falling into the aggregate metrics trap — a single accuracy number can mask poor performance on specific document types, edge cases, or specific fields. They should use stratified sampling across document types, layouts, and confidence levels" },
      { letter: "C", text: "98% accuracy is already perfect and there is no issue with this evaluation" },
      { letter: "D", text: "They should only evaluate on documents where Claude reported low confidence to focus on the hardest cases" }
    ],
    correct: "B",
    explanation: "This is the aggregate metrics trap. A single accuracy number (98%) can mask significant problems: the system might achieve 99.5% on standard invoices but only 85% on handwritten invoices, or might systematically fail on specific fields like tax calculations. Stratified sampling is needed — evaluating accuracy broken down by document type, layout, specific fields, and edge cases. Importantly, stratified sampling should include high-confidence items (not just difficult ones) to get a representative picture."
  },
  {
    id: "q230",
    domain: 1,
    scenario: "Multi-Agent Research System",
    question: "For a topic like 'impact of AI on creative industries,' the system produces a report covering only visual arts, missing music, writing, and film. Subagents completed tasks successfully, but the coordinator's logs show it decomposed the topic into 'AI in digital art,' 'AI in graphic design,' and 'AI in photography.' What is the most likely root cause?",
    answers: [
      { letter: "A", text: "The coordinator agent's task decomposition is too narrow, resulting in assignments that don't cover all relevant domains" },
      { letter: "B", text: "The web search agent's queries are not comprehensive enough" },
      { letter: "C", text: "The document analysis agent is filtering out non-visual industries" },
      { letter: "D", text: "The synthesis agent lacks instructions for identifying coverage gaps" }
    ],
    correct: "A",
    explanation: "Logs clearly show the missing coverage is a direct result of the coordinator's initial narrow task decomposition. Since subagents performed their assigned tasks successfully, the failure occurred upstream at the delegation stage. The coordinator should break broad queries into diverse, representative subtasks spanning all relevant domains — not just a single subcategory."
  }
];
