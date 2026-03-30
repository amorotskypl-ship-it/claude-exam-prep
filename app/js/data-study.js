// ===== Study Guide Data =====
const STUDY_DATA = [
  {
    id: "d1",
    domain: 1,
    title: "Agentic Architecture & Orchestration",
    weight: 27,
    tagClass: "tag-d1",
    tasks: [
      {
        id: "t1.1",
        title: "1.1: Design and implement agentic loops",
        knowledge: [
          "The agentic loop lifecycle: send request to Claude -> inspect stop_reason ('tool_use' vs 'end_turn') -> execute requested tools -> return results for next iteration",
          "Tool results are appended to conversation history so the model can reason about the next action",
          "Model-driven decision-making: Claude reasons about which tool to call next based on context, NOT pre-configured decision trees or tool sequences"
        ],
        skills: [
          "Implement loop control flow: continue when stop_reason is 'tool_use', terminate when stop_reason is 'end_turn'",
          "Add tool results to conversation context between iterations so the model incorporates new information",
          "Avoid anti-patterns: parsing natural language to determine loop end, arbitrary iteration caps as primary stopping, checking for assistant text as completion indicator"
        ],
        keyPoint: "The agentic loop is driven by stop_reason values, not text parsing or arbitrary limits. 'tool_use' = continue, 'end_turn' = stop.",
        details: `
          <h4>How the Agentic Loop Works</h4>
          <p>An agentic loop is the core execution pattern for autonomous Claude-based agents. The loop is simple in concept but critical to implement correctly:</p>
          <pre><code>while True:
    response = claude.send(messages)

    if response.stop_reason == "end_turn":
        break   # Claude is done — return final answer

    if response.stop_reason == "tool_use":
        tool_result = execute_tool(response.tool_call)
        messages.append(response)          # assistant message
        messages.append(tool_result)       # tool result
        # loop continues — Claude will inspect the result next</code></pre>
          <p>The key insight: <strong>Claude decides</strong> what to do next. You don't pre-program a decision tree. The model inspects the tool result, reasons about the current state, and either calls another tool or returns a final answer.</p>

          <h4>The Two stop_reason Values You Must Know</h4>
          <ul>
            <li><code>stop_reason: "tool_use"</code> — Claude wants to call a tool. Execute it, append the result to the conversation, and loop again.</li>
            <li><code>stop_reason: "end_turn"</code> — Claude has finished its work. Break out of the loop and return the response.</li>
          </ul>
          <p>That's it. No parsing text content to see if it "looks done." No counting iterations. The stop_reason is the authoritative signal.</p>

          <h4>Critical Anti-Patterns (Exam Favorites)</h4>
          <div class="wrong-answer">
            <strong>Anti-pattern 1: Parsing natural language to detect completion.</strong>
            Don't check if Claude's text says "I'm done" or "Here are the results." This is fragile and unreliable. Use <code>stop_reason</code>.
          </div>
          <div class="wrong-answer">
            <strong>Anti-pattern 2: Arbitrary iteration caps as the PRIMARY stopping mechanism.</strong>
            Setting <code>max_iterations = 5</code> as the main way to stop the loop is wrong. The model should stop naturally via <code>end_turn</code>. Safety caps are fine as a failsafe, but they shouldn't be the primary mechanism.
          </div>
          <div class="wrong-answer">
            <strong>Anti-pattern 3: Checking for assistant text content as a completion indicator.</strong>
            The presence of text in the assistant's response does NOT mean it's done. Claude can return text AND a tool call in the same response.
          </div>

          <h4>Why Tool Results Go Into Conversation History</h4>
          <p>After executing a tool, you must append both the assistant message (with the tool call) and the tool result to <code>messages</code>. This is how Claude "sees" the result in the next iteration. Without this, Claude would have no idea what the tool returned and would be reasoning in the dark.</p>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a question asks "what determines when the agentic loop terminates," the answer is always <code>stop_reason</code>. If distractors mention "checking if the assistant returned text," "counting loop iterations," or "parsing the response for completion phrases" — those are all wrong.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 1: Customer Support</span> The support agent loops: get_customer → lookup_order → process_refund → end_turn. Each tool result informs the next decision.</p>
          <p><span class="scenario-tag">Scenario 3: Multi-Agent Research</span> The coordinator's agentic loop delegates to subagents via the Task tool, collecting results until research is complete.</p>

          <h4>Deep Insight: SDK Message Types in the Agentic Loop</h4>
          <p>The Agent SDK uses specific message types during the agentic loop lifecycle:</p>
          <ul>
            <li><strong>SystemMessage (init)</strong> — The very first message in a session, establishing grounding and metadata. Appears before any user messages.</li>
            <li><strong>SystemMessage (compact_boundary)</strong> — Emitted after context compaction (when the system summarizes older turns to save space). Manages window state with a summary of deleted context.</li>
            <li><strong>ResultMessage</strong> — The <em>final</em> message yielded by the SDK when the agent completes. Contains the response text, total token usage (input/output), and cost data. This is what you use for billing and usage tracking.</li>
          </ul>
          <p>Beyond <code>end_turn</code> and <code>tool_use</code>, also know <code>max_tokens</code> (output truncated — append partial content and continue) and <code>stop_sequence</code> (custom stop pattern matched).</p>
        `
      },
      {
        id: "t1.2",
        title: "1.2: Orchestrate multi-agent systems (coordinator-subagent)",
        knowledge: [
          "Hub-and-spoke architecture: coordinator manages ALL inter-subagent communication, error handling, and information routing",
          "Subagents have isolated context -- they do NOT inherit coordinator's conversation history automatically",
          "Coordinator handles: task decomposition, delegation, result aggregation, and deciding which subagents to invoke based on query complexity",
          "Risk: overly narrow task decomposition leads to incomplete coverage of broad topics"
        ],
        skills: [
          "Design coordinators that analyze query requirements and dynamically select subagents rather than always routing through the full pipeline",
          "Partition research scope across subagents to minimize duplication (e.g., distinct subtopics per agent)",
          "Implement iterative refinement loops: coordinator evaluates synthesis output for gaps, re-delegates with targeted queries",
          "Route ALL subagent communication through the coordinator for observability and consistent error handling"
        ],
        keyPoint: "Subagents are isolated. The coordinator is the single point of control for all communication, delegation, and error handling.",
        details: `
          <h4>Hub-and-Spoke Architecture</h4>
          <p>Multi-agent systems in the Claude Agent SDK follow a <strong>hub-and-spoke pattern</strong> (also called coordinator-subagent). The coordinator is the central hub; subagents are the spokes.</p>
          <pre><code>         ┌─────────────┐
         │ Coordinator │  ← Central hub
         └──────┬──────┘
           ┌────┼────┐
           ▼    ▼    ▼
        [Web] [Docs] [Synth]  ← Subagents (spokes)</code></pre>
          <p>The coordinator handles: <strong>task decomposition</strong> (breaking the request into parts), <strong>delegation</strong> (assigning parts to subagents), <strong>result aggregation</strong> (combining outputs), and <strong>error handling</strong> (recovering from failures).</p>

          <h4>The Isolation Principle</h4>
          <p>This is the most tested concept in this task statement: <strong>subagents have isolated context</strong>. They do NOT automatically inherit:</p>
          <ul>
            <li>The coordinator's conversation history</li>
            <li>Results from other subagents</li>
            <li>Previous tool call results from the coordinator</li>
            <li>Any "shared memory" — there is no implicit shared state</li>
          </ul>
          <p>If a synthesis subagent needs findings from the web search subagent, the coordinator must <em>explicitly include</em> those findings in the synthesis subagent's prompt.</p>

          <h4>Dynamic Subagent Selection</h4>
          <p>A well-designed coordinator doesn't always invoke every subagent. It analyzes the query and selects only the relevant ones:</p>
          <ul>
            <li>Simple factual query → maybe just the web search subagent</li>
            <li>Complex research topic → web search + document analysis + synthesis</li>
            <li>Ambiguous query → ask the user for clarification before delegating at all</li>
          </ul>
          <div class="wrong-answer">
            <strong>Anti-pattern: Always routing through the full pipeline.</strong>
            If a coordinator invokes every subagent for every query regardless of complexity, that's wasteful and can produce lower quality results. The coordinator should make dynamic routing decisions.
          </div>

          <h4>Iterative Refinement</h4>
          <p>After synthesis, the coordinator should evaluate the output for gaps. If gaps are found, it re-delegates with targeted queries:</p>
          <pre><code>1. Coordinator delegates research to subagents
2. Coordinator receives results, invokes synthesis subagent
3. Coordinator evaluates synthesis → finds gap in "pricing data"
4. Coordinator re-delegates to web search: "Find pricing for X"
5. Coordinator re-invokes synthesis with new data
6. Loop until coverage is sufficient</code></pre>

          <h4>Communication Routing</h4>
          <p>ALL subagent communication flows through the coordinator. Subagents never talk to each other directly. This provides:</p>
          <ul>
            <li><strong>Observability</strong> — the coordinator sees everything</li>
            <li><strong>Error handling</strong> — the coordinator can retry, redirect, or escalate</li>
            <li><strong>Information flow control</strong> — the coordinator filters and routes relevant info</li>
          </ul>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a question describes subagents communicating directly with each other or sharing a common memory store, that's the wrong answer. Everything goes through the coordinator.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 3: Multi-Agent Research</span> This is the primary scenario. A coordinator delegates to web search, document analysis, synthesis, and report generation subagents.</p>
          <p><span class="scenario-tag">Scenario 1: Customer Support</span> Even a single-agent support system may use subagents for specific tasks like searching the knowledge base or running billing queries.</p>

          <h4>Deep Insight: Coordinator Context Injection Patterns</h4>
          <p>The exam tests <em>how</em> context flows from coordinator to subagent. There are three patterns, and only one is correct:</p>
          <pre><code>// WRONG — implicit inheritance (doesn't exist)
task("Synthesize the research")
// Subagent has NO access to web search results

// WRONG — shared memory reference
task("Read findings from shared_state.research_results")
// No shared memory exists between agents

// RIGHT — explicit context injection
task("Synthesize these findings into a report:
  Source 1 (Bloomberg): Revenue grew 23% YoY...
  Source 2 (Reuters): Market share reached 34%...
  Source 3 (SEC Filing): Operating margin 18.5%...")
// Full findings embedded directly in the prompt</code></pre>
          <p><strong>Exam trap:</strong> Distractors often describe "shared context stores," "inter-agent message queues," or "global state objects." None of these exist in the Agent SDK. The coordinator manually copies relevant data into each subagent's prompt.</p>
          <p>A subtler exam trap: the coordinator should NOT pass its <em>entire</em> conversation history to a subagent. It should pass only the <strong>relevant findings</strong> — passing everything wastes context tokens and dilutes the subagent's focus.</p>
        `
      },
      {
        id: "t1.3",
        title: "1.3: Configure subagent invocation, context passing, and spawning",
        knowledge: [
          "The Task tool is the mechanism for spawning subagents; allowedTools must include 'Task' for coordinators",
          "Subagent context must be explicitly provided in the prompt -- no automatic inheritance or shared memory",
          "AgentDefinition configuration includes descriptions, system prompts, and tool restrictions per subagent",
          "fork_session for exploring divergent approaches from a shared baseline"
        ],
        skills: [
          "Include complete findings from prior agents directly in the subagent's prompt",
          "Use structured data formats to separate content from metadata (source URLs, doc names, page numbers) for attribution",
          "Spawn parallel subagents by emitting multiple Task tool calls in a single coordinator response",
          "Design coordinator prompts with research goals and quality criteria, not step-by-step instructions"
        ],
        keyPoint: "Context must be EXPLICITLY passed to subagents. Parallel spawning = multiple Task calls in ONE response.",
        details: `
          <h4>The Task Tool</h4>
          <p>In the Agent SDK, the <strong>Task tool</strong> is how coordinators spawn subagents. For a coordinator to be able to delegate, its <code>allowedTools</code> must include <code>"Task"</code>.</p>
          <pre><code>// AgentDefinition for coordinator
{
  name: "coordinator",
  description: "Manages research workflow",
  allowedTools: ["Task", "Read", "Write"],  // Task = can spawn subagents
  systemPrompt: "You coordinate research by delegating to subagents..."
}</code></pre>

          <h4>Explicit Context Passing (The Golden Rule)</h4>
          <p>Subagents have <strong>zero automatic context</strong>. Everything they need must be in their prompt. This means:</p>
          <ul>
            <li>If the synthesis subagent needs web search results, include the full results in its prompt</li>
            <li>If a subagent needs to know about previous findings, paste those findings into the prompt</li>
            <li>Metadata (source URLs, document names, page numbers) must be explicitly included for attribution</li>
          </ul>
          <pre><code>// BAD — assumes subagent has context
coordinator: "Task: Synthesize the research findings"

// GOOD — includes everything the subagent needs
coordinator: "Task: Synthesize these findings into a report.
  Web search results: [full results here]
  Document analysis: [full analysis here]
  Required format: Executive summary + detailed sections
  Include source attribution for every claim."</code></pre>

          <h4>Structured Data for Attribution</h4>
          <p>When passing context between agents, separate <strong>content</strong> from <strong>metadata</strong>:</p>
          <pre><code>{
  "finding": "Revenue grew 23% YoY",
  "source_url": "https://example.com/report",
  "document": "Q4 Financial Report",
  "page": 12,
  "date": "2024-01-15"
}</code></pre>
          <p>This structure ensures attribution survives the synthesis step. Without it, the synthesis subagent might produce claims without sources.</p>

          <h4>Parallel Subagent Spawning</h4>
          <p>To spawn subagents in parallel, the coordinator emits <strong>multiple Task tool calls in a single response</strong>:</p>
          <pre><code>// Coordinator's single response contains:
Tool call 1: Task("Search web for topic A")
Tool call 2: Task("Search web for topic B")
Tool call 3: Task("Analyze uploaded document")
// All three run concurrently</code></pre>
          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Spawning subagents one at a time across separate turns. This is sequential and slow. Parallel spawning means multiple Task calls in ONE response.
          </div>

          <h4>fork_session</h4>
          <p><code>fork_session</code> creates an independent branch from a shared baseline. Use it when you want to explore divergent approaches without contaminating the original session:</p>
          <ul>
            <li>Compare two refactoring strategies from the same codebase analysis</li>
            <li>Try different testing approaches from a shared understanding of the code</li>
            <li>Explore "what if" scenarios without losing the main conversation</li>
          </ul>

          <h4>Coordinator Prompt Design</h4>
          <p>Coordinator prompts should specify <strong>goals and quality criteria</strong>, not step-by-step instructions:</p>
          <div class="wrong-answer">
            <strong>Wrong:</strong> "Step 1: Call web_search. Step 2: Call analyze_document. Step 3: Call synthesize." — This is a pre-configured pipeline, not agentic behavior.
          </div>
          <p><strong>Right:</strong> "Research [topic]. Ensure coverage of recent developments, competing viewpoints, and quantitative data. Delegate to appropriate subagents. Re-investigate any gaps before synthesizing."</p>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Questions about subagent context always test whether you know context must be EXPLICIT. Any answer suggesting "subagents inherit coordinator context" or "subagents share memory" is wrong.
          </div>

          <h4>Deep Insight: Agent Teams vs Ephemeral Subagents</h4>
          <p>The exam distinguishes two multi-agent patterns:</p>
          <table class="ref-table">
            <thead><tr><th>Aspect</th><th>Ephemeral Subagents (Task tool)</th><th>Agent Teams</th></tr></thead>
            <tbody>
              <tr><td><strong>Lifecycle</strong></td><td>Created per-task, destroyed after return</td><td>Independent long-running instances</td></tr>
              <tr><td><strong>Coordination</strong></td><td>Hub-and-spoke: coordinator spawns &amp; collects</td><td>Shared task list / message queue</td></tr>
              <tr><td><strong>Context sharing</strong></td><td>Explicit in prompt (zero inheritance)</td><td>Via shared artifacts (files, DB records)</td></tr>
              <tr><td><strong>Best for</strong></td><td>Parallelizable subtasks in one session</td><td>Long-running workflows across sessions</td></tr>
            </tbody>
          </table>
          <p><strong>Key distinction:</strong> Subagents are <em>ephemeral children</em> of a coordinator. Agent Teams are <em>independent peers</em> that coordinate through a shared work queue — no single coordinator owns them.</p>
          <div class="wrong-answer">
            <strong>Watch out:</strong> Don't confuse Agent Teams with subagent fan-out. If the exam describes "independent instances coordinating through a shared task list," that's Agent Teams. If it says "coordinator spawns parallel workers," that's subagent fan-out.
          </div>

          <h4>Deep Insight: Dynamic Decomposition vs Prompt Chaining</h4>
          <p>Two workflow patterns the exam tests:</p>
          <ul>
            <li><strong>Prompt Chaining (fixed pipeline):</strong> Pre-defined sequential steps. Step 1 → Step 2 → Step 3. The sequence never changes regardless of input. Good for deterministic, well-understood workflows (e.g., extract → validate → transform → load).</li>
            <li><strong>Dynamic Decomposition (adaptive planning):</strong> The agent analyzes the task, creates a plan, executes it, and <em>re-plans</em> if intermediate results reveal new sub-problems. The sequence adapts to the input.</li>
          </ul>
          <pre><code>// Prompt Chaining (fixed):
Step 1: Extract entities
Step 2: Validate entities
Step 3: Generate report
// Always these 3 steps, always in this order

// Dynamic Decomposition (adaptive):
Agent analyzes task → decides it needs 5 subtasks
Agent completes subtask 3 → discovers new dependency
Agent re-plans → adds subtask 3b
Agent continues with revised plan</code></pre>
          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a scenario says "the workflow must adapt based on intermediate results" or "the agent should re-plan when it discovers new information," the answer is Dynamic Decomposition. If it says "well-defined sequential steps that don't change," it's Prompt Chaining. The key word is <strong>adaptive</strong>.
          </div>
        `
      },
      {
        id: "t1.4",
        title: "1.4: Multi-step workflows with enforcement and handoff",
        knowledge: [
          "Programmatic enforcement (hooks, prerequisite gates) vs prompt-based guidance for workflow ordering",
          "When deterministic compliance is required (identity verification before financial ops), prompts alone have a non-zero failure rate",
          "Structured handoff protocols for escalation: customer details, root cause analysis, recommended actions"
        ],
        skills: [
          "Implement programmatic prerequisites that block downstream tools until prerequisites complete (e.g., block process_refund until get_customer returns verified ID)",
          "Decompose multi-concern requests into distinct items, investigate each in parallel, then synthesize a unified resolution",
          "Compile structured handoff summaries (customer ID, root cause, amount, recommended action) when escalating to humans"
        ],
        keyPoint: "For CRITICAL business rules, use programmatic enforcement (hooks), not prompt instructions. Prompts are probabilistic; hooks are deterministic.",
        details: `
          <h4>Programmatic vs Prompt-Based Enforcement</h4>
          <p>This is one of the most important distinctions on the exam. There are two ways to enforce workflow ordering:</p>
          <ul>
            <li><strong>Prompt-based:</strong> Tell Claude in the system prompt "always verify identity before processing refunds." This is <em>probabilistic</em> — it works most of the time, but has a non-zero failure rate.</li>
            <li><strong>Programmatic:</strong> Use hooks or prerequisite gates in code to <em>block</em> downstream tools until prerequisites complete. This is <em>deterministic</em> — it physically cannot be bypassed.</li>
          </ul>
          <pre><code>// Programmatic prerequisite gate
function beforeToolCall(toolName, args) {
  if (toolName === "process_refund") {
    if (!state.customerVerified) {
      return { blocked: true, reason: "Must verify customer first" };
    }
  }
  return { blocked: false };
}</code></pre>

          <h4>When Each Approach Is Appropriate</h4>
          <ul>
            <li><strong>Programmatic enforcement:</strong> Financial operations, identity verification, security-critical steps, compliance requirements — anything where failure has real consequences.</li>
            <li><strong>Prompt-based guidance:</strong> Soft preferences, style guidelines, recommended (but not required) ordering.</li>
          </ul>

          <h4>Multi-Concern Request Decomposition</h4>
          <p>When a customer raises multiple issues in one message ("I need a refund for order #123 AND my shipping address is wrong on order #456"), the agent should:</p>
          <ol>
            <li>Decompose the request into distinct items</li>
            <li>Investigate each in parallel using shared context</li>
            <li>Synthesize a unified resolution addressing all concerns</li>
          </ol>

          <h4>Structured Handoff Summaries</h4>
          <p>When escalating to a human agent, compile a structured summary because the human typically <strong>cannot see the conversation transcript</strong>:</p>
          <pre><code>{
  "customer_id": "C-12345",
  "root_cause": "Refund exceeds $500 policy limit",
  "order_id": "ORD-67890",
  "refund_amount": "$723.50",
  "recommended_action": "Approve exception — loyal customer, 3yr history",
  "steps_completed": ["Identity verified", "Order confirmed", "Return initiated"],
  "customer_sentiment": "Frustrated but cooperative"
}</code></pre>
          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Escalating with just "Customer needs help with a refund." The human agent has no context and must start over.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> When a question asks about ensuring identity verification always happens before financial operations, the correct answer involves programmatic enforcement (hooks/gates), NOT prompt instructions. Prompts are probabilistic and have a non-zero failure rate for critical operations.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 1: Customer Support</span> This is the primary scenario. The agent must verify identity via <code>get_customer</code> before calling <code>process_refund</code>. Programmatic gates enforce this.</p>

          <h4>Deep Insight: Hook vs Prompt Decision Matrix</h4>
          <p>The exam loves testing whether you choose hooks or prompts for a given scenario. Use this decision matrix:</p>
          <pre><code>Use HOOKS (programmatic) when:
  ✅ Financial operations (refunds, payments, transfers)
  ✅ Identity verification prerequisites
  ✅ Security-critical gates (permission checks)
  ✅ Compliance requirements (audit-mandated order)
  ✅ Failure has legal/financial consequences
  ✅ You need 100% guaranteed enforcement

Use PROMPTS (guidance) when:
  ✅ Tone/style preferences ("be empathetic")
  ✅ Response format suggestions
  ✅ Soft workflow recommendations
  ✅ Non-critical ordering preferences
  ✅ Failure is inconvenient but not harmful</code></pre>
          <p><strong>The 12% trap:</strong> The exam often describes scenarios where prompt-based enforcement works "most of the time" (88-95%) but fails in critical edge cases. The key insight is that for financial/security operations, even a 5% failure rate is unacceptable. The correct answer is always hooks for critical business logic, regardless of how well prompts "usually" work.</p>
          <p><strong>Multi-concern decomposition subtlety:</strong> When a customer raises 3 issues, investigate all 3 in parallel using shared context (not sequentially). But synthesize into ONE unified response addressing all concerns. The exam tests whether you understand parallel investigation with unified resolution.</p>
        `
      },
      {
        id: "t1.5",
        title: "1.5: Agent SDK hooks for interception and normalization",
        knowledge: [
          "PostToolUse hooks intercept tool results for transformation before the model processes them",
          "Tool call interception hooks enforce compliance rules (e.g., block refunds above threshold)",
          "Hooks provide deterministic guarantees; prompt instructions provide only probabilistic compliance"
        ],
        skills: [
          "Implement PostToolUse hooks to normalize data formats (Unix timestamps, ISO 8601, status codes) from different MCP tools",
          "Implement tool call interception to block policy-violating actions and redirect to alternative workflows",
          "Choose hooks over prompt-based enforcement when business rules require guaranteed compliance"
        ],
        keyPoint: "Hooks = guaranteed compliance. Prompts = best-effort compliance. For financial/security operations, always use hooks.",
        details: `
          <h4>What Are Agent SDK Hooks?</h4>
          <p>Hooks are code-level interceptors that run at specific points in the agent lifecycle. They give you <strong>deterministic control</strong> over what the agent can do, regardless of what the prompt says.</p>

          <h4>Key Hook Types</h4>
          <ul>
            <li><strong>PostToolUse hooks:</strong> Run AFTER a tool returns its result but BEFORE Claude processes it. Use these for data normalization and transformation.</li>
            <li><strong>Tool call interception hooks:</strong> Run BEFORE a tool executes. Use these to block policy-violating actions.</li>
          </ul>

          <h4>PostToolUse: Data Normalization</h4>
          <p>When your agent calls multiple MCP tools that return different data formats, PostToolUse hooks normalize everything before Claude sees it:</p>
          <pre><code>// PostToolUse hook — normalize dates
function postToolUse(toolName, result) {
  if (result.timestamp) {
    // Convert Unix timestamp → ISO 8601
    result.timestamp = new Date(result.timestamp * 1000).toISOString();
  }
  if (result.status_code) {
    // Convert numeric status → human-readable
    result.status = STATUS_MAP[result.status_code];
  }
  return result;  // Claude sees the normalized version
}</code></pre>
          <p>Why this matters: if one MCP tool returns <code>1703980800</code> (Unix timestamp) and another returns <code>"2024-01-01T00:00:00Z"</code> (ISO 8601), Claude might get confused. The hook normalizes both to a consistent format.</p>

          <h4>Tool Call Interception: Policy Enforcement</h4>
          <p>Interception hooks block tool calls that violate business rules BEFORE they execute:</p>
          <pre><code>// Tool call interception — block large refunds
function beforeToolCall(toolName, args) {
  if (toolName === "process_refund" && args.amount > 500) {
    return {
      blocked: true,
      redirect: "escalate_to_human",
      reason: "Refunds over $500 require human approval"
    };
  }
  return { blocked: false };
}</code></pre>
          <p>The refund physically cannot go through. It doesn't matter what the prompt says or how Claude reasons — the hook blocks it.</p>

          <h4>Hooks vs Prompts: The Core Distinction</h4>
          <ul>
            <li><strong>Hooks:</strong> Deterministic. 100% compliance. Cannot be bypassed by the model. Use for financial limits, security rules, compliance requirements.</li>
            <li><strong>Prompts:</strong> Probabilistic. High but not perfect compliance. The model might occasionally ignore instructions. Use for soft guidelines and preferences.</li>
          </ul>

          <div class="wrong-answer">
            <strong>Common wrong answer:</strong> "Add a system prompt instruction telling Claude to never process refunds over $500." This is probabilistic — Claude will usually comply, but it's not guaranteed. For financial operations, use hooks.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> The exam loves asking "how do you GUARANTEE compliance with [business rule]?" The answer is always hooks, never prompt instructions. If you see "guaranteed" or "deterministic" in the question, think hooks.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 1: Customer Support</span> PostToolUse normalizes customer data from different backend systems. Interception hooks block refunds above the threshold and redirect to human escalation.</p>

          <h4>Deep Insight: Complete Hook Lifecycle</h4>
          <p>Claude Code supports four hook points, each firing at a different stage:</p>
          <ul>
            <li><strong>PreToolUse:</strong> Before tool executes — block protected file edits, enforce prerequisites, validate parameters</li>
            <li><strong>PostToolUse:</strong> After tool returns, before model processes result — auto-format/lint after Edit, normalize data, filter verbose output (e.g., <code>cargo test</code> reduced to pass/fail only)</li>
            <li><strong>SessionStart:</strong> When session begins — inject dynamic context like git branch, environment variables, project state</li>
            <li><strong>Notification:</strong> When task completes — push notification (e.g., macOS notification on task done)</li>
          </ul>
          <p><strong>Key advantage:</strong> Hooks execute <strong>outside context</strong> — they cost zero tokens. This makes them the ideal layer for deterministic governance, audit logging, and output filtering.</p>
        `
      },
      {
        id: "t1.6",
        title: "1.6: Task decomposition strategies",
        knowledge: [
          "Fixed sequential pipelines (prompt chaining) vs dynamic adaptive decomposition based on intermediate findings",
          "Prompt chaining: break reviews into sequential steps (per-file, then cross-file integration pass)",
          "Adaptive plans generate subtasks based on what is discovered at each step"
        ],
        skills: [
          "Select prompt chaining for predictable multi-aspect reviews; dynamic decomposition for open-ended investigation",
          "Split large code reviews into per-file local passes + a separate cross-file integration pass to avoid attention dilution",
          "Decompose open-ended tasks by first mapping structure, identifying high-impact areas, then creating a prioritized adaptive plan"
        ],
        keyPoint: "Per-file analysis + cross-file integration pass prevents attention dilution and contradictory findings in large reviews.",
        details: `
          <h4>Two Decomposition Strategies</h4>
          <p>The exam tests your ability to choose the right decomposition strategy for the situation:</p>
          <ul>
            <li><strong>Prompt chaining (fixed sequential pipeline):</strong> Predictable, ordered steps where each step's output feeds the next. Good for structured, repeatable workflows.</li>
            <li><strong>Dynamic adaptive decomposition:</strong> The plan evolves based on what's discovered at each step. Good for open-ended investigation tasks.</li>
          </ul>

          <h4>Prompt Chaining Example: Code Review</h4>
          <pre><code>Step 1: Per-file analysis (each file independently)
  ├── file_a.py → local issues (bugs, style, complexity)
  ├── file_b.py → local issues
  └── file_c.py → local issues

Step 2: Cross-file integration pass
  └── Analyze data flow ACROSS files
      (API contracts, shared state, import chains)</code></pre>
          <p>Why split? <strong>Attention dilution.</strong> If you ask Claude to review 10 files at once, it may miss issues in the middle files ("lost in the middle" effect) or produce contradictory findings. Per-file passes focus attention; the integration pass catches cross-file issues.</p>

          <h4>Dynamic Decomposition Example: Legacy Codebase Testing</h4>
          <pre><code>1. Map the codebase structure (discover modules, dependencies)
2. Identify high-impact areas (most changed, most depended on)
3. Create prioritized test plan based on findings
4. Start writing tests — adapt plan as you discover:
   - Hidden dependencies you didn't expect
   - Code paths that need refactoring before testing
   - Integration points that need mock setup</code></pre>
          <p>The plan at step 4 looks different than what you'd have planned at step 1, because you learned things along the way.</p>

          <h4>When to Use Each Strategy</h4>
          <ul>
            <li><strong>Prompt chaining:</strong> Code reviews, document processing pipelines, multi-aspect evaluations, data extraction → transformation → validation</li>
            <li><strong>Dynamic decomposition:</strong> "Add comprehensive tests," "investigate this bug," "explore this codebase," research tasks</li>
          </ul>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Using a fixed pipeline for open-ended investigation ("Step 1: Read all files. Step 2: Write all tests."). Open-ended tasks need adaptive plans that respond to discoveries.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If the question mentions a large code review with multiple files, the correct answer almost always involves splitting into per-file passes + a cross-file integration pass. This is the canonical pattern for avoiding attention dilution.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 5: CI/CD Code Review</span> Automated code reviews in CI should use per-file analysis + cross-file integration passes.</p>
          <p><span class="scenario-tag">Scenario 4: Developer Productivity</span> Exploring unfamiliar codebases uses dynamic decomposition — adapt the plan as you discover the structure.</p>

          <h4>Deep Insight: The Attention Dilution Threshold</h4>
          <p>The exam tests the <em>boundary</em> between when single-pass and multi-pass decomposition is needed:</p>
          <pre><code>Single-pass review (no decomposition needed):
  ✅ 1-3 files, < 500 lines total
  ✅ All files in the same module/directory
  ✅ Changes are self-contained

Multi-pass decomposition REQUIRED:
  ✅ 4+ files OR > 1000 lines total
  ✅ Files span multiple modules/services
  ✅ Cross-cutting changes (API contract + client + tests)
  ✅ "Lost in the middle" risk is high</code></pre>
          <p><strong>Exam gotcha — prompt chaining vs dynamic decomposition:</strong> If the question describes a task with known, predictable steps (code review, data pipeline, document processing), the answer is <strong>prompt chaining</strong>. If the question describes exploration, investigation, or debugging with unknown scope, the answer is <strong>dynamic decomposition</strong>. The trap: using a fixed pipeline for open-ended investigation locks you into a plan that becomes wrong as you discover new information.</p>
          <p><strong>The cross-file integration pass</strong> is specifically looking for: API contract mismatches between caller and callee, shared state mutations across modules, import chain correctness, and data type inconsistencies across boundaries. Per-file passes can't catch these because they only see one file at a time.</p>
        `
      },
      {
        id: "t1.7",
        title: "1.7: Session state, resumption, and forking",
        knowledge: [
          "--resume <session-name> continues a specific prior conversation",
          "fork_session creates independent branches from a shared analysis baseline",
          "Inform agent about changes to previously analyzed files when resuming",
          "Starting fresh with a structured summary is more reliable than resuming with stale tool results"
        ],
        skills: [
          "Use --resume with session names for continuing named investigation sessions",
          "Use fork_session to compare approaches (e.g., two testing strategies from shared codebase analysis)",
          "Choose resumption when prior context is mostly valid; fresh start with summaries when tool results are stale",
          "Inform resumed sessions about specific file changes for targeted re-analysis"
        ],
        keyPoint: "Resume when context is still valid. Start fresh with injected summaries when old tool results are stale.",
        details: `
          <h4>Session Management Options</h4>
          <p>Claude Code provides three session management strategies:</p>
          <ul>
            <li><code>--resume &lt;session-name&gt;</code> — Continue an existing named session with its full history</li>
            <li><code>fork_session</code> — Branch off from a shared baseline to explore divergent approaches</li>
            <li><strong>Fresh start with summaries</strong> — Start a new session but inject key findings from the previous one</li>
          </ul>

          <h4>When to Resume vs Start Fresh</h4>
          <pre><code>Resume (--resume):
  ✅ Prior context is mostly still valid
  ✅ Files haven't changed much since last session
  ✅ You want to continue exactly where you left off
  ✅ Named session: --resume my-investigation

Start Fresh with Summaries:
  ✅ Old tool results are stale (files changed, data updated)
  ✅ Context window was near exhaustion
  ✅ You want a clean slate but need key findings
  ✅ More reliable than resuming with outdated info</code></pre>
          <p>The key tradeoff: resuming preserves full context but risks stale data. Starting fresh avoids stale data but loses detailed history (which you compensate for with structured summaries).</p>

          <h4>fork_session: Exploring Divergent Approaches</h4>
          <p><code>fork_session</code> creates an independent branch from the current session state. Both the original and the fork continue independently:</p>
          <pre><code>Session: "analyze-codebase"
  │
  ├── fork: "approach-A" (try refactoring with strategy A)
  └── fork: "approach-B" (try refactoring with strategy B)
  
Both forks share the same codebase analysis as their starting point,
but they diverge from there.</code></pre>
          <p>Use cases: comparing testing strategies, evaluating different refactoring approaches, "what if" explorations.</p>

          <h4>Informing Resumed Sessions About Changes</h4>
          <p>When resuming after code modifications, tell Claude what changed:</p>
          <pre><code>// Good: specific about changes
"Since our last session, I've modified auth.py to add 
rate limiting (lines 45-60) and updated the user model 
in models.py. Please re-analyze these files."

// Bad: vague
"Some things changed, please look again."</code></pre>
          <p>Specific change descriptions enable <strong>targeted re-analysis</strong> instead of requiring full re-exploration of the entire codebase.</p>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Always resuming old sessions even when files have been heavily modified. Stale tool results (e.g., file contents that no longer match) lead to incorrect reasoning and recommendations.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> The exam tests the tradeoff between resume and fresh start. If the question mentions "files have been modified since the last session" or "tool results are outdated," the correct answer is usually "start fresh with structured summaries," not "resume the old session."
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 4: Developer Productivity</span> Long codebase exploration sessions benefit from named sessions (<code>--resume</code>) and fork_session for comparing approaches.</p>
          <p><span class="scenario-tag">Scenario 2: Code Generation</span> Multi-day development work may need session resumption or fresh starts with summaries depending on how much code changed overnight.</p>

          <h4>Deep Insight: HANDOFF.md and Session Continuity Strategies</h4>
          <p>The exam tests whether you understand the <strong>three-strategy hierarchy</strong> for session continuity, from simplest to most robust:</p>
          <pre><code>Strategy 1: --resume (simplest)
  When: same day, files unchanged, context not exhausted
  Risk: stale tool outputs if files changed

Strategy 2: HANDOFF.md pattern (recommended for multi-day)
  When: ending a session, context near limit, switching days
  Before ending: Claude writes HANDOFF.md with:
    - Current progress and findings
    - Architectural decisions made (and WHY)
    - What was tried and failed
    - Open issues and recommended next steps
  Next session: "Read HANDOFF.md and continue"

Strategy 3: Compact Instructions in CLAUDE.md (for ongoing)
  When: project-level decisions that must survive ALL sessions
  Add to CLAUDE.md: "Always preserve during compaction:
    - Auth uses JWT with 30min expiry
    - Database is PostgreSQL via Prisma
    - API follows REST conventions in /api/v2/"</code></pre>
          <p><strong>Exam trap — fork_session timing:</strong> You can only fork from the <em>current</em> session state. You can't fork from a historical point. If you need to compare approaches, fork BEFORE starting implementation, not after. Once you've implemented approach A, the fork will include all of approach A's changes.</p>
          <p><strong>The --worktree flag:</strong> When forking sessions that involve file modifications, <code>--worktree</code> creates a separate git worktree so the forked session's file changes don't conflict with the main session. Use <code>sparsePaths</code> to limit which files the worktree checks out.</p>
        `
      }
    ]
  },
  {
    id: "d2",
    domain: 2,
    title: "Tool Design & MCP Integration",
    weight: 18,
    tagClass: "tag-d2",
    tasks: [
      {
        id: "t2.1",
        title: "2.1: Design effective tool interfaces",
        knowledge: [
          "Tool descriptions are the PRIMARY mechanism LLMs use for tool selection -- minimal descriptions lead to unreliable selection",
          "Include input formats, example queries, edge cases, and boundary explanations in descriptions",
          "Ambiguous or overlapping descriptions cause misrouting (e.g., analyze_content vs analyze_document)",
          "System prompt wording with keyword-sensitive instructions can create unintended tool associations"
        ],
        skills: [
          "Write descriptions that differentiate each tool's purpose, inputs, outputs, and when to use it vs alternatives",
          "Rename tools and update descriptions to eliminate functional overlap",
          "Split generic tools into purpose-specific tools with defined I/O contracts",
          "Review system prompts for keyword-sensitive instructions that override tool descriptions"
        ],
        keyPoint: "When tools are being selected incorrectly, the FIRST thing to fix is tool descriptions -- not routing layers or consolidation.",
        details: `
          <h4>Why Tool Descriptions Matter So Much</h4>
          <p>Tool descriptions are the <strong>primary mechanism</strong> Claude uses to decide which tool to call. Think of descriptions as the tool's "resume" — Claude reads them and decides which tool is best for the job. If the descriptions are vague, Claude makes bad choices.</p>

          <h4>Anatomy of a Good Tool Description</h4>
          <pre><code>// BAD — minimal description
{
  name: "analyze_content",
  description: "Analyzes content"
}

// GOOD — comprehensive description
{
  name: "extract_web_results",
  description: "Extracts structured data from web search results. 
    Input: raw HTML or search API response. 
    Output: array of {title, url, snippet, date}.
    Use this for web search results ONLY. 
    For uploaded documents, use extract_document_data instead.
    Handles: Google, Bing, and DuckDuckGo result formats."
}</code></pre>

          <h4>Common Tool Description Problems</h4>
          <ul>
            <li><strong>Overlap:</strong> <code>analyze_content</code> vs <code>analyze_document</code> with near-identical descriptions → Claude picks randomly</li>
            <li><strong>Too minimal:</strong> <code>"Analyzes data"</code> → Claude can't distinguish when to use it vs alternatives</li>
            <li><strong>Missing boundaries:</strong> No indication of when NOT to use the tool → Claude uses it for everything</li>
            <li><strong>Missing input/output specs:</strong> Claude sends wrong format or doesn't know what to expect back</li>
          </ul>

          <h4>Fixing Tool Selection Issues (Priority Order)</h4>
          <ol>
            <li><strong>First:</strong> Improve tool descriptions — add purpose, inputs, outputs, boundaries, examples</li>
            <li><strong>Second:</strong> Rename tools to eliminate ambiguity (e.g., <code>analyze_content</code> → <code>extract_web_results</code>)</li>
            <li><strong>Third:</strong> Split generic tools into purpose-specific tools with clear I/O contracts</li>
            <li><strong>Fourth:</strong> Check system prompt for keyword-sensitive instructions creating unintended associations</li>
          </ol>
          <div class="wrong-answer">
            <strong>Wrong approach:</strong> When tools are being misrouted, adding a routing layer or consolidating tools into one mega-tool. Fix the descriptions FIRST — it's almost always the root cause.
          </div>

          <h4>System Prompt Keyword Sensitivity</h4>
          <p>System prompt wording can accidentally create tool associations:</p>
          <pre><code>// System prompt says: "When the user asks to analyze anything, 
// provide a thorough analysis."
// Problem: The word "analyze" makes Claude prefer any tool 
// with "analyze" in its name, overriding better tool matches.</code></pre>
          <p>Review system prompts for keywords that match tool names — they can override well-written descriptions.</p>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If the scenario describes tools being selected incorrectly and asks what to fix first, the answer is ALWAYS tool descriptions. Not routing logic, not tool consolidation, not adding more tools. Descriptions first.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 3: Multi-Agent Research</span> Web search tool vs document analysis tool must have clear descriptions so the coordinator routes correctly.</p>
          <p><span class="scenario-tag">Scenario 4: Developer Productivity</span> Built-in tools (Grep vs Glob vs Read) already have good descriptions, but custom MCP tools need equally clear ones.</p>

          <h4>Deep Insight: The Three MCP Primitives</h4>
          <p>MCP defines three distinct primitives — the exam may test which one to use:</p>
          <table class="ref-table">
            <thead><tr><th>Primitive</th><th>Direction</th><th>Purpose</th><th>Example</th></tr></thead>
            <tbody>
              <tr><td><strong>Tools</strong></td><td>Model-invoked</td><td>Actions with side effects or dynamic data retrieval</td><td><code>search_orders</code>, <code>process_refund</code></td></tr>
              <tr><td><strong>Resources</strong></td><td>Application-provided</td><td>Static or semi-static data (read-only context)</td><td>Company policy docs, API specs, config files</td></tr>
              <tr><td><strong>Prompts</strong></td><td>User-facing templates</td><td>Pre-built interaction patterns that guide model behavior</td><td>"Summarize this document", "Review this PR"</td></tr>
            </tbody>
          </table>
          <p><strong>Key distinctions:</strong></p>
          <ul>
            <li><strong>Tools</strong> are <em>model-invoked</em> — Claude decides when to call them. They perform actions or fetch dynamic data.</li>
            <li><strong>Resources</strong> are <em>application-controlled</em> — the host application decides when to inject them into context. They provide static reference data (policy documents, schemas, config). The model doesn't "call" a resource; it's injected.</li>
            <li><strong>Prompts</strong> are <em>user-facing templates</em> — they structure how the user interacts with the model. Think of them as reusable prompt templates exposed by the MCP server.</li>
          </ul>
          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a scenario asks "how to provide read-only policy documents to the agent," the answer is MCP <strong>Resources</strong>, not Tools. Resources are for static context injection. Tools are for actions. If it asks "how to give users pre-built interaction patterns," that's MCP <strong>Prompts</strong>.
          </div>
          <div class="wrong-answer">
            <strong>Common mistake:</strong> Using Tools for everything. If data is static (company policies, API schemas), it should be a Resource, not a Tool. Tools add to the tool definition token budget (~200 tokens each); Resources are injected on-demand without that overhead.
          </div>
        `
      },
      {
        id: "t2.2",
        title: "2.2: Structured error responses for MCP tools",
        knowledge: [
          "MCP isError flag pattern for communicating failures to the agent",
          "Error types: transient (timeouts), validation (invalid input), business (policy violations), permission",
          "Uniform 'Operation failed' errors prevent the agent from making recovery decisions",
          "Distinguish retryable vs non-retryable errors with structured metadata"
        ],
        skills: [
          "Return structured metadata: errorCategory, isRetryable boolean, human-readable descriptions",
          "Include retriable: false and customer-friendly explanations for business rule violations",
          "Implement local recovery in subagents for transient failures; propagate only unresolvable errors with partial results",
          "Distinguish access failures (needing retry) from valid empty results (successful query, no matches)"
        ],
        keyPoint: "Never return generic errors. Never silently suppress errors. Never terminate entire workflow on single failure. Always return structured error context.",
        details: `
          <h4>The MCP isError Flag</h4>
          <p>MCP tools communicate failures using the <code>isError</code> flag in their response. When a tool returns <code>isError: true</code>, the agent knows something went wrong and can decide how to respond.</p>

          <h4>Four Error Categories</h4>
          <ul>
            <li><strong>Transient:</strong> Timeouts, service unavailability. <em>Usually retryable.</em></li>
            <li><strong>Validation:</strong> Invalid input format, missing required fields. <em>Fix input and retry.</em></li>
            <li><strong>Business:</strong> Policy violations (refund exceeds limit, account suspended). <em>Not retryable — needs alternative workflow.</em></li>
            <li><strong>Permission:</strong> Insufficient access rights. <em>Not retryable — needs escalation.</em></li>
          </ul>

          <h4>Structured Error Response Pattern</h4>
          <pre><code>// GOOD — structured error with actionable metadata
{
  isError: true,
  content: "Refund exceeds policy limit",
  metadata: {
    errorCategory: "business",
    isRetryable: false,
    attempted: "process_refund($723.50)",
    limit: "$500.00",
    alternative: "escalate_to_human",
    customerMessage: "This refund requires manager approval. 
                      I'll connect you with a supervisor."
  }
}

// BAD — generic error
{
  isError: true,
  content: "Operation failed"
}</code></pre>

          <h4>Why Generic Errors Are Harmful</h4>
          <p>When a tool returns "Operation failed" with no details, the agent cannot:</p>
          <ul>
            <li>Decide whether to retry (is it transient? or permanent?)</li>
            <li>Try an alternative approach (what alternatives exist?)</li>
            <li>Communicate meaningfully to the user (what went wrong?)</li>
            <li>Route the error correctly (escalate? retry? give up?)</li>
          </ul>

          <h4>Access Failure vs Valid Empty Result</h4>
          <p>This distinction is heavily tested:</p>
          <pre><code>// Access failure — the search COULDN'T execute
{ isError: true, errorCategory: "transient", 
  message: "Database timeout" }
// → Agent should RETRY

// Valid empty result — the search executed but found nothing
{ isError: false, results: [], 
  message: "No orders found matching criteria" }
// → Agent should tell user "no results found" (NOT retry)</code></pre>
          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Returning empty results (<code>[]</code>) for both failures and genuine "no matches" scenarios. The agent can't tell the difference and might tell the user "no orders found" when actually the database was down.
          </div>

          <h4>Error Recovery in Multi-Agent Systems</h4>
          <ul>
            <li><strong>Subagents handle local recovery</strong> for transient errors (retry 2-3 times)</li>
            <li><strong>Propagate to coordinator</strong> only errors that can't be resolved locally</li>
            <li>Always include <strong>partial results</strong> and <strong>what was attempted</strong> when propagating</li>
          </ul>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Three things to NEVER do with errors: (1) return generic "Operation failed," (2) silently suppress errors by returning empty results as success, (3) terminate the entire workflow because one tool failed. The correct pattern is always structured error metadata with actionable context.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 1: Customer Support</span> <code>process_refund</code> might fail for business reasons (amount too high) or transient reasons (payment system timeout). The agent needs to distinguish these to respond appropriately.</p>
          <p><span class="scenario-tag">Scenario 3: Multi-Agent Research</span> If the web search subagent times out, it should retry locally. If it still fails, propagate the error with partial results to the coordinator.</p>

          <h4>Deep Insight: The Error Response Completeness Test</h4>
          <p>The exam tests whether error responses contain enough information for recovery. Use this checklist:</p>
          <pre><code>Complete error response (all 6 fields):
  1. isError: true
  2. errorCategory: "transient" | "validation" | "business" | "permission"
  3. isRetryable: true | false
  4. attempted: "what operation was tried"
  5. context: { limit, threshold, alternative }
  6. customerMessage: "human-readable explanation"

Incomplete responses (exam traps):
  ❌ { isError: true, content: "Failed" }  — no category, no retry info
  ❌ { results: [] }  — suppresses error as empty success
  ❌ throw new Error("timeout")  — kills entire pipeline</code></pre>
          <p><strong>The "empty results" trap is the #1 tested pattern:</strong> A subagent that returns <code>[]</code> for both "no results found" and "database was down" makes intelligent recovery impossible. The coordinator has no way to distinguish "this data doesn't exist" from "we couldn't reach the database." The exam will present both options and the correct answer always distinguishes them.</p>
          <p><strong>Business error subtlety:</strong> Business errors (refund exceeds policy limit) should include a <code>customerMessage</code> field with an explanation suitable for the end user AND an <code>alternative</code> field suggesting the next step (e.g., "escalate_to_human"). This lets the agent both explain the situation to the customer and take the correct next action.</p>
        `
      },
      {
        id: "t2.3",
        title: "2.3: Distribute tools across agents and configure tool_choice",
        knowledge: [
          "Too many tools (e.g., 18 instead of 4-5) degrades selection reliability",
          "Agents with tools outside their specialization tend to misuse them",
          "Scoped tool access: only tools needed for the role, with limited cross-role tools for high-frequency needs",
          "tool_choice: 'auto' (may return text), 'any' (must call a tool), forced selection (must call specific tool)"
        ],
        skills: [
          "Restrict each subagent's tool set to those relevant to its role",
          "Replace generic tools with constrained alternatives (e.g., fetch_url -> load_document)",
          "Provide scoped cross-role tools for high-frequency needs (e.g., verify_fact for synthesis agent)",
          "Use forced tool selection to ensure a specific tool runs first, then process subsequent steps in follow-up turns",
          "Set tool_choice: 'any' to guarantee the model calls a tool rather than returning text"
        ],
        keyPoint: "4-5 well-scoped tools per agent. 'auto' = might skip tools. 'any' = must use a tool. Forced = must use THIS tool.",
        details: `
          <h4>The Tool Count Problem</h4>
          <p>Giving an agent too many tools degrades its tool selection reliability. With 18 tools, Claude has to read 18 descriptions and make a complex decision. With 4-5 focused tools, the decision is much simpler and more reliable.</p>
          <pre><code>// BAD — synthesis agent with too many tools
synthesisAgent.tools = [
  "web_search", "fetch_url", "analyze_document", 
  "extract_data", "summarize", "translate", 
  "write_report", "send_email", "query_database",
  "verify_fact", "calculate", "format_table",
  "create_chart", "upload_file", "notify_user",
  "log_event", "cache_result", "compress_data"
]  // 18 tools — synthesis agent might try to web_search!

// GOOD — focused tool set for synthesis
synthesisAgent.tools = [
  "read_findings",    // Read research findings
  "write_report",     // Write final report
  "verify_fact",      // Quick fact verification (scoped cross-role tool)
  "format_table"      // Format data as tables
]  // 4 tools — clear and focused</code></pre>

          <h4>Scoped Tool Access</h4>
          <p>Each subagent gets only the tools it needs for its role:</p>
          <ul>
            <li><strong>Web search agent:</strong> web_search, fetch_url, extract_content</li>
            <li><strong>Document analysis agent:</strong> read_document, extract_data, summarize</li>
            <li><strong>Synthesis agent:</strong> read_findings, write_report, verify_fact, format_table</li>
          </ul>
          <p><strong>Scoped cross-role tools:</strong> Sometimes an agent needs occasional access to tools outside its primary role. For example, the synthesis agent might need <code>verify_fact</code> for quick checks. Provide this as a scoped, constrained version rather than giving full access to all search tools.</p>

          <h4>tool_choice Configuration</h4>
          <p>This is a <strong>high-frequency exam topic</strong>. Know the three options:</p>
          <pre><code>// "auto" — Claude may call a tool OR return text
tool_choice: "auto"
// Use when: you want Claude to decide if a tool is needed

// "any" — Claude MUST call a tool (can choose which one)
tool_choice: "any"
// Use when: you always want structured output, not text

// Forced — Claude MUST call THIS specific tool
tool_choice: { type: "tool", name: "extract_metadata" }
// Use when: a specific tool must run first (prerequisites)</code></pre>

          <h4>When to Use Each tool_choice</h4>
          <ul>
            <li><code>"auto"</code>: General conversation where tools are optional. Risk: Claude might return text when you wanted a tool call.</li>
            <li><code>"any"</code>: You have multiple extraction schemas and don't know which applies. Guarantees a tool is called but Claude picks which one.</li>
            <li><strong>Forced:</strong> A prerequisite tool must run first (e.g., <code>extract_metadata</code> before enrichment). Then switch to "auto" for subsequent steps.</li>
          </ul>

          <div class="wrong-answer">
            <strong>Wrong answer pattern:</strong> Using <code>tool_choice: "auto"</code> when you need guaranteed structured output. "Auto" means Claude might just return text instead of calling a tool. Use <code>"any"</code> or forced selection to guarantee a tool call.
          </div>

          <h4>Replacing Generic Tools</h4>
          <p>Replace overly generic tools with constrained alternatives:</p>
          <pre><code>// Generic — agent could fetch anything
{ name: "fetch_url", description: "Fetches any URL" }

// Constrained — validates document URLs only
{ name: "load_document", 
  description: "Loads a document from a verified document URL. 
  Validates URL is from approved document sources. 
  Use for PDF, DOCX, HTML documents only." }</code></pre>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Remember the three tool_choice values and their guarantees: "auto" = NO guarantee of tool use. "any" = GUARANTEED tool use, model picks which. Forced = GUARANTEED specific tool. Questions often test whether you know "auto" doesn't guarantee a tool call.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 3: Multi-Agent Research</span> Each subagent (web, docs, synthesis) gets only its relevant tools. The coordinator has the Task tool for delegation.</p>
          <p><span class="scenario-tag">Scenario 6: Data Extraction</span> Use forced tool selection to ensure <code>extract_metadata</code> runs before enrichment tools.</p>

          <h4>Deep Insight: tool_choice State Machine Pattern</h4>
          <p>The exam tests a critical multi-turn pattern: changing <code>tool_choice</code> between turns to enforce a workflow sequence:</p>
          <pre><code>Turn 1: tool_choice = { type: "tool", name: "classify_document" }
  → Forces classification first. Model MUST classify.

Turn 2: tool_choice = "any"
  → Model picks the right extraction tool based on classification.

Turn 3: tool_choice = "auto"
  → Model may call validation tool OR return final result.</code></pre>
          <p>This creates a <strong>state machine</strong> where each turn's tool_choice constrains what can happen. The exam specifically tests whether you understand that forced selection applies to ONE turn — you must change it for subsequent turns.</p>
          <p><strong>The "18 tools" number is an exam signal:</strong> Whenever a question mentions an agent with many tools (15-20+) and poor selection accuracy, the answer is ALWAYS to reduce the tool count to 4-5 focused tools. The distractors will suggest "improve tool descriptions" or "add routing logic" — while descriptions matter, tool count reduction is the primary fix when there are too many tools.</p>
          <p><strong>Scoped cross-role tools trap:</strong> The synthesis agent needs <code>verify_fact</code> for quick lookups. The wrong answer gives it full web search access. The right answer gives it a constrained <code>verify_fact</code> tool that only handles simple lookups, while complex research still flows through the coordinator. This is the <strong>least-privilege principle</strong> applied to tool access.</p>
        `
      },
      {
        id: "t2.4",
        title: "2.4: Integrate MCP servers into Claude Code and agent workflows",
        knowledge: [
          "Project-level: .mcp.json (shared via version control) vs User-level: ~/.claude.json (personal)",
          "Environment variable expansion in .mcp.json (e.g., ${GITHUB_TOKEN}) for credential management",
          "Tools from all configured MCP servers are discovered at connection time and available simultaneously",
          "MCP resources expose content catalogs (issue summaries, schemas) to reduce exploratory tool calls"
        ],
        skills: [
          "Configure shared MCP servers in .mcp.json with environment variable expansion",
          "Configure personal/experimental servers in ~/.claude.json",
          "Enhance MCP tool descriptions to prevent agent from preferring built-in tools over more capable MCP tools",
          "Choose community MCP servers over custom implementations for standard integrations",
          "Expose content catalogs as MCP resources for agent visibility without exploratory calls"
        ],
        keyPoint: ".mcp.json = shared team tools (version controlled). ~/.claude.json = personal tools. Use ${ENV_VARS} for secrets.",
        details: `
          <h4>Two MCP Server Scopes</h4>
          <p>MCP servers can be configured at two levels:</p>
          <ul>
            <li><strong>Project-level: <code>.mcp.json</code></strong> — Shared via version control. Every team member gets the same tools. Use for team-standard integrations (GitHub, Jira, database).</li>
            <li><strong>User-level: <code>~/.claude.json</code></strong> — Personal only. Not version controlled. Use for experimental servers, personal API keys, tools you're testing.</li>
          </ul>
          <pre><code>// .mcp.json (project-level, committed to repo)
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}"  // env var expansion
      }
    },
    "jira": {
      "command": "mcp-server-jira",
      "env": {
        "JIRA_API_KEY": "\${JIRA_API_KEY}"
      }
    }
  }
}

// ~/.claude.json (user-level, NOT committed)
{
  "mcpServers": {
    "my-experimental-server": {
      "command": "node",
      "args": ["./my-server.js"]
    }
  }
}</code></pre>

          <h4>Environment Variable Expansion</h4>
          <p>Use <code>\${ENV_VAR}</code> syntax in <code>.mcp.json</code> for credentials. This way the config file is safe to commit — secrets come from each developer's environment, not the file itself.</p>
          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Hardcoding API keys in <code>.mcp.json</code>. Since this file is version controlled, secrets would be committed to the repo. Always use <code>\${ENV_VAR}</code> expansion.
          </div>

          <h4>Tool Discovery at Connection Time</h4>
          <p>Tools from ALL configured MCP servers are discovered when Claude Code connects and are available simultaneously. You don't need to "activate" specific servers — they're all active by default.</p>

          <h4>MCP Resources</h4>
          <p>MCP resources expose <strong>content catalogs</strong> — read-only data that gives the agent visibility without needing exploratory tool calls:</p>
          <ul>
            <li>Issue summaries and project structure from Jira/GitHub</li>
            <li>Database schemas</li>
            <li>Documentation hierarchies</li>
            <li>API endpoint catalogs</li>
          </ul>
          <p>Without resources, the agent would need to make multiple tool calls just to discover what's available. Resources provide this upfront.</p>

          <h4>Community vs Custom MCP Servers</h4>
          <p>For standard integrations (GitHub, Jira, Slack, databases), prefer <strong>community MCP servers</strong> over building custom ones. Reserve custom implementations for team-specific workflows that don't have community solutions.</p>

          <h4>Enhancing MCP Tool Descriptions</h4>
          <p>If Claude keeps preferring built-in tools (like Grep) over more capable MCP tools, the fix is to <strong>enhance the MCP tool's description</strong> to explain its capabilities and why it's better for certain tasks:</p>
          <pre><code>// Enhanced MCP tool description
"search_codebase: Searches the indexed codebase using semantic 
understanding. Returns contextually relevant results with 
dependency analysis. MORE EFFECTIVE than grep for understanding 
code relationships, finding all callers of a function including 
through wrapper modules. Use this instead of Grep when you need 
to understand code flow, not just find text matches."</code></pre>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> The scope question comes up often: "A new team member isn't seeing the team's MCP tools." The answer is almost always that the tools are configured in user-level (<code>~/.claude.json</code>) instead of project-level (<code>.mcp.json</code>). Project-level = shared. User-level = personal.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 4: Developer Productivity</span> Teams configure shared MCP servers (GitHub, CI tools) in <code>.mcp.json</code> so all developers have the same tooling.</p>
          <p><span class="scenario-tag">Scenario 2: Code Generation</span> Claude Code with MCP integrations for project management, testing frameworks, and deployment tools.</p>

          <h4>Deep Insight: MCP Token Overhead & defer_loading</h4>
          <p><strong>The hidden killer:</strong> Each MCP server contributes 20-30 tool definitions x ~200 tokens each = <strong>4-6K tokens per server</strong>. With 5 servers connected, that's ~25K tokens (12.5% of your total budget) consumed before any work begins. Use <code>/context</code> to see this breakdown and <code>/mcp</code> to disconnect idle servers.</p>
          <p><strong>defer_loading pattern:</strong> Set <code>defer_loading: true</code> on MCP tool definitions to create stub definitions with only the description. Full schemas are loaded on-demand only after the model selects the tool via ToolSearch. This dramatically reduces fixed overhead and keeps the prompt cache prefix stable.</p>
          <p><strong>Tool output flooding:</strong> Commands like <code>cargo test</code> (1000+ lines), <code>git log</code>, or <code>find</code> can flood context with verbose output. Use PostToolUse hooks to filter output before Claude sees it — e.g., pipe through <code>head -30</code> or reduce test output to pass/fail only (the RTK pattern).</p>
        `
      },
      {
        id: "t2.5",
        title: "2.5: Select and apply built-in tools effectively",
        knowledge: [
          "Grep: search file CONTENTS (patterns, function names, error messages, imports)",
          "Glob: find files by NAME/PATH patterns (e.g., **/*.test.tsx)",
          "Read/Write: full file operations. Edit: targeted modifications using unique text matching",
          "When Edit fails (non-unique match): use Read + Write as fallback"
        ],
        skills: [
          "Select Grep for searching code content across a codebase",
          "Select Glob for finding files matching naming patterns",
          "Use Read then Write when Edit cannot find unique anchor text",
          "Build understanding incrementally: Grep to find entry points -> Read to trace flows (not reading all files upfront)",
          "Trace function usage across wrappers by first identifying exported names, then searching for each"
        ],
        keyPoint: "Grep = WHAT's inside files. Glob = WHERE files are. Build understanding incrementally, don't read everything upfront.",
        details: `
          <h4>The Built-In Tool Selection Matrix</h4>
          <p>Knowing which tool to use for which task is a core exam skill:</p>
          <pre><code>┌──────────┬─────────────────────────────────────────────┐
│ Tool     │ When to Use                                 │
├──────────┼─────────────────────────────────────────────┤
│ Grep     │ Search file CONTENTS                        │
│          │ "Find all files that call processRefund()"  │
│          │ "Find error messages containing 'timeout'"  │
│          │ "Find all import statements for auth module" │
├──────────┼─────────────────────────────────────────────┤
│ Glob     │ Find files by NAME/PATH patterns            │
│          │ "Find all test files: **/*.test.tsx"         │
│          │ "Find all config files: **/config.*"         │
│          │ "Find all files in src/auth/"                │
├──────────┼─────────────────────────────────────────────┤
│ Read     │ Load full file contents into context         │
│          │ Read a specific file after finding it        │
├──────────┼─────────────────────────────────────────────┤
│ Write    │ Create or overwrite entire files             │
├──────────┼─────────────────────────────────────────────┤
│ Edit     │ Targeted modification using unique text      │
│          │ Replaces a specific string in a file         │
│          │ Fails if match text isn't unique!            │
├──────────┼─────────────────────────────────────────────┤
│ Bash     │ Run shell commands (git, npm, docker, etc.) │
└──────────┴─────────────────────────────────────────────┘</code></pre>

          <h4>The Key Distinction: Grep vs Glob</h4>
          <p>This is the #1 tested distinction in this task statement:</p>
          <ul>
            <li><strong>Grep</strong> = WHAT's inside files (content search). "Which files contain the string <code>processRefund</code>?"</li>
            <li><strong>Glob</strong> = WHERE files are (name/path matching). "Which files are named <code>*.test.tsx</code>?"</li>
          </ul>
          <p>Mnemonic: <strong>Grep = content. Glob = location.</strong></p>

          <h4>When Edit Fails: Read + Write Fallback</h4>
          <p>Edit works by finding a unique text match in the file and replacing it. If the text appears multiple times (not unique), Edit fails. The fallback:</p>
          <pre><code>1. Read the entire file
2. Modify the content in memory (with full context to disambiguate)
3. Write the entire file back</code></pre>

          <h4>Incremental Understanding (Critical Pattern)</h4>
          <p>Don't read every file upfront. Build understanding step by step:</p>
          <pre><code>1. Grep to find entry points
   → "Where is processRefund called?" → finds 3 files

2. Read the most relevant file
   → Discover it calls validateOrder() from order.js

3. Grep for validateOrder
   → Finds it's defined in services/order.js

4. Read services/order.js
   → Now you understand the full flow</code></pre>
          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Reading all files in the project upfront. This wastes context window tokens and includes massive amounts of irrelevant code. Build understanding incrementally by following the trail.
          </div>

          <h4>Tracing Function Usage Across Wrappers</h4>
          <p>Functions are often re-exported through wrapper modules. To trace all usages:</p>
          <pre><code>1. Find where the function is defined (Grep for "function processRefund")
2. Find all exported names from that module (Read the export statements)
3. Grep for EACH exported name across the codebase
4. If it's re-exported from a wrapper, grep for the wrapper's export too</code></pre>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a question asks "which tool should you use to find all files that call function X?" the answer is Grep (content search). If it asks "which tool should you use to find all test files?" the answer is Glob (pattern matching on file names).
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 4: Developer Productivity</span> This is the primary scenario. Exploring unfamiliar codebases requires mastery of the built-in tool selection: Grep for tracing code flow, Glob for finding test files and configs, Read for understanding specific files.</p>
          <p><span class="scenario-tag">Scenario 2: Code Generation</span> Before generating code, Claude should use Grep/Glob to understand existing patterns in the codebase.</p>

          <h4>Deep Insight: The Incremental Discovery Anti-Pattern</h4>
          <p>The exam heavily tests whether you understand <strong>incremental discovery vs upfront loading</strong>. Here's the decision matrix:</p>
          <pre><code>Incremental (CORRECT for exploration):
  Grep "processRefund" → found in 3 files
  Read most relevant file → discover it calls validateOrder()
  Grep "validateOrder" → trace to services/order.js
  Read services/order.js → now understand full flow
  Total: 4 tool calls, ~200 lines of relevant context

Upfront loading (WRONG for exploration):
  Read src/*.ts → 50 files, 15,000 lines
  Context window: overwhelmed with irrelevant code
  "Lost in the middle" effect: key functions missed</code></pre>
          <p><strong>Exception:</strong> Upfront loading IS correct when you already know exactly which 2-3 files you need. The anti-pattern is reading "all files" or "everything in a directory" during exploration.</p>
          <p><strong>The Edit fallback pattern:</strong> When <code>Edit</code> fails because the target string appears multiple times, the exam expects you to use <code>Read</code> + <code>Write</code> as a fallback (read the full file, modify in memory with full context to disambiguate, write back). The trap answer is "use a more specific search string" — while sometimes possible, Read+Write is the reliable general fallback.</p>
          <p><strong>Grep vs Glob decision shortcut:</strong> If the question asks "find files that <em>contain</em> X" → Grep. If the question asks "find files that <em>match pattern</em> X" → Glob. The word "contain" always means Grep (content search). The word "match" or "named" always means Glob (path pattern).</p>
        `
      }
    ]
  },
  {
    id: "d3",
    domain: 3,
    title: "Claude Code Configuration & Workflows",
    weight: 20,
    tagClass: "tag-d3",
    tasks: [
      {
        id: "t3.1",
        title: "3.1: Configure CLAUDE.md hierarchy and modular organization",
        knowledge: [
          "Hierarchy: user-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md or root), directory-level (subdirectory CLAUDE.md)",
          "User-level settings are NOT shared with teammates via version control",
          "@import syntax references external files to keep CLAUDE.md modular",
          ".claude/rules/ directory for topic-specific rule files as alternative to monolithic CLAUDE.md"
        ],
        skills: [
          "Diagnose config hierarchy issues (e.g., new team member missing instructions because they're in user-level, not project-level)",
          "Use @import to selectively include relevant standards files in each package's CLAUDE.md",
          "Split large CLAUDE.md into focused files in .claude/rules/ (testing.md, api-conventions.md, deployment.md)",
          "Use /memory command to verify which memory files are loaded"
        ],
        keyPoint: "New team member not getting instructions? Check if rules are in user-level (~/) instead of project-level (.claude/).",
        details: `
          <h4>The CLAUDE.md Hierarchy</h4>
          <p>Claude Code loads configuration from three levels, each with a different scope:</p>
          <pre><code>Level 1: User-level     ~/.claude/CLAUDE.md
         → Personal preferences (YOUR machine only)
         → NOT shared via version control
         → e.g., "I prefer verbose explanations"

Level 2: Project-level  .claude/CLAUDE.md  or  ./CLAUDE.md
         → Shared team standards (committed to repo)
         → Every team member gets these
         → e.g., "Use TypeScript strict mode"

Level 3: Directory-level  src/api/CLAUDE.md
         → Conventions for specific subdirectories
         → Loaded when editing files in that directory
         → e.g., "API routes use express middleware pattern"</code></pre>

          <h4>The Most Common Hierarchy Bug</h4>
          <p>This is a <strong>top exam scenario</strong>: "A new team member joins and Claude Code doesn't follow team conventions. What went wrong?"</p>
          <p>Answer: The conventions are in <code>~/.claude/CLAUDE.md</code> (user-level) instead of <code>.claude/CLAUDE.md</code> (project-level). User-level files live on the original developer's machine and are NOT shared via version control.</p>

          <h4>@import for Modular Organization</h4>
          <p>Large monolithic CLAUDE.md files become unwieldy. Use <code>@import</code> to split them:</p>
          <pre><code># .claude/CLAUDE.md (root)
@import ./standards/testing.md
@import ./standards/api-conventions.md
@import ./standards/deployment.md

# Each package can import only what's relevant:
# packages/frontend/.claude/CLAUDE.md
@import ../../standards/testing.md
@import ../../standards/frontend-patterns.md</code></pre>
          <p>This way each package loads only the relevant standards, not everything.</p>

          <h4>.claude/rules/ Directory</h4>
          <p>An alternative to @import: place topic-specific rule files in <code>.claude/rules/</code>:</p>
          <pre><code>.claude/
  rules/
    testing.md          ← Testing conventions
    api-conventions.md  ← API patterns  
    deployment.md       ← Deployment rules
    security.md         ← Security requirements</code></pre>
          <p>These can also have YAML frontmatter for path-scoping (covered in t3.3).</p>

          <h4>The /memory Command</h4>
          <p>Use <code>/memory</code> to see which memory files are currently loaded. This is your diagnostic tool when Claude seems to be ignoring instructions — check if the expected files are actually loaded.</p>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Hierarchy questions almost always test the user-level vs project-level distinction. If someone says "my teammate doesn't get the same Claude behavior" — the answer is always about scope: user-level files aren't shared. Move them to project-level.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 2: Code Generation</span> Team-wide coding standards go in project-level CLAUDE.md. Personal preferences (editor style, verbosity) go in user-level.</p>
          <p><span class="scenario-tag">Scenario 5: CI/CD</span> CI-invoked Claude Code reads project-level CLAUDE.md for testing standards, review criteria, and fixture conventions.</p>

          <h4>Deep Insight: CLAUDE.md Sizing & Compact Instructions</h4>
          <p><strong>Benchmark:</strong> Anthropic's own CLAUDE.md is ~2.5K tokens. Use this as your sizing target. CLAUDE.md is <strong>semi-fixed context</strong> — it's loaded on every request, so every token here costs you on every single API call.</p>
          <p><strong>Compact Instructions pattern:</strong> Add a section to CLAUDE.md titled "Compact Instructions" that explicitly tells the compactor what to preserve during <code>/compact</code>. Without this, compaction drops architectural decisions and keeps verbose tool output. Example:</p>
          <pre><code># Compact Instructions
When compacting, always preserve:
- Architectural decisions and rationale
- API design choices
- Failure modes discovered
- File paths and function names identified
- Any constraints or invariants established</code></pre>
          <p><strong>Move details out:</strong> If CLAUDE.md is getting long, move language-specific rules to <code>.claude/rules/</code> (path-loaded, not always resident) and domain knowledge to Skills (on-demand). Keep CLAUDE.md for project-wide contracts only.</p>
        `
      },
      {
        id: "t3.2",
        title: "3.2: Custom slash commands and skills",
        knowledge: [
          "Project-scoped commands: .claude/commands/ (shared via version control)",
          "User-scoped commands: ~/.claude/commands/ (personal)",
          "Skills: .claude/skills/ with SKILL.md supporting frontmatter: context: fork, allowed-tools, argument-hint",
          "context: fork runs skills in isolated sub-agent context preventing pollution of main conversation"
        ],
        skills: [
          "Create project-scoped commands in .claude/commands/ for team-wide availability",
          "Use context: fork to isolate verbose or exploratory skills from the main session",
          "Configure allowed-tools in SKILL.md to restrict tool access (e.g., limit to file write only)",
          "Use argument-hint to prompt for required parameters when invoked without arguments",
          "Choose skills (on-demand task-specific) vs CLAUDE.md (always-loaded universal standards)"
        ],
        keyPoint: "context: fork isolates skill output. allowed-tools restricts what a skill can do. Skills = on-demand; CLAUDE.md = always active.",
        details: `
          <h4>Custom Slash Commands</h4>
          <p>Slash commands are markdown files that define reusable workflows triggered by <code>/command-name</code>:</p>
          <pre><code>Two scopes:
  .claude/commands/    ← Project-scoped (shared via version control)
  ~/.claude/commands/  ← User-scoped (personal only)

Example: .claude/commands/review.md
─────────────────────────────────────
Review this file for security vulnerabilities:
- Check for SQL injection
- Check for XSS vulnerabilities  
- Check for authentication bypasses
Provide findings as a numbered list with severity ratings.

Usage: /review</code></pre>

          <h4>Skills (Advanced Commands)</h4>
          <p>Skills live in <code>.claude/skills/</code> and have a <code>SKILL.md</code> file with powerful frontmatter options:</p>
          <pre><code>.claude/skills/
  analyze-codebase/
    SKILL.md     ← Skill definition with frontmatter</code></pre>
          <pre><code># .claude/skills/analyze-codebase/SKILL.md
---
context: fork
allowed-tools:
  - Read
  - Glob
  - Grep
argument-hint: "path to analyze"
---

Analyze the codebase structure at the given path.
Map all modules, dependencies, and entry points.
Return a structured summary of the architecture.</code></pre>

          <h4>Key Frontmatter Options</h4>
          <ul>
            <li><strong><code>context: fork</code></strong> — Runs the skill in an <strong>isolated sub-agent context</strong>. The skill's verbose output doesn't pollute your main conversation. The sub-agent returns a summary.</li>
            <li><strong><code>allowed-tools</code></strong> — Restricts which tools the skill can use. For safety: limit a file-writing skill to just <code>Write</code>, preventing it from running <code>Bash</code> commands.</li>
            <li><strong><code>argument-hint</code></strong> — Prompts the user for a required parameter if they invoke the skill without arguments.</li>
          </ul>

          <h4>context: fork — Why It Matters</h4>
          <p>Without <code>context: fork</code>, a skill that reads 50 files and produces detailed analysis dumps all that output into your main conversation context. This can:</p>
          <ul>
            <li>Exhaust your context window quickly</li>
            <li>Dilute the conversation with irrelevant details</li>
            <li>Make subsequent interactions slower and less focused</li>
          </ul>
          <p>With <code>context: fork</code>, the skill runs in isolation and returns only a summary to the main session.</p>

          <h4>Skills vs CLAUDE.md — When to Use Each</h4>
          <pre><code>CLAUDE.md:
  ✅ Always-loaded universal standards
  ✅ Coding conventions, testing rules, style guides
  ✅ Applies to EVERY interaction automatically

Skills:
  ✅ On-demand task-specific workflows
  ✅ Invoked explicitly when needed
  ✅ Codebase analysis, review workflows, scaffolding
  ✅ Can be isolated with context: fork</code></pre>
          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Putting task-specific workflows (like "analyze codebase") in CLAUDE.md. This loads unnecessary context in every interaction. Use skills for on-demand tasks; CLAUDE.md for universal standards.
          </div>

          <h4>Personal Skill Variants</h4>
          <p>If you want a personal variant of a team skill, create it in <code>~/.claude/skills/</code> with a different name. This avoids overriding the team's version while giving you customization.</p>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> When a question asks about isolating verbose exploration from the main session, the answer is <code>context: fork</code>. When asked about restricting a skill's capabilities, it's <code>allowed-tools</code>. These two frontmatter options are the most tested skill concepts.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 2: Code Generation</span> Team-wide slash commands (<code>.claude/commands/</code>) for code review, test generation, and scaffolding patterns.</p>
          <p><span class="scenario-tag">Scenario 4: Developer Productivity</span> Skills with <code>context: fork</code> for codebase exploration — isolate verbose output and return summaries.</p>

          <h4>Deep Insight: Three Skill Types (Design Patterns)</h4>
          <p>Skills fall into three categories, each with distinct design patterns:</p>
          <ul>
            <li><strong>Checklist (quality gate):</strong> Pre-flight verification — all items must pass. Example: <code>release-check</code>. Short, deterministic, pass/fail per item.</li>
            <li><strong>Workflow (standardized operation):</strong> High-risk operations with explicit rollback steps. Example: <code>config-migration</code>. Set <code>disable-model-invocation: true</code> so it can only be triggered explicitly.</li>
            <li><strong>Domain Expert (decision framework):</strong> Structured evidence collection + decision matrix. Example: <code>runtime-diagnosis</code>. Collects evidence via fixed path, not guessing.</li>
          </ul>
          <p><strong>Descriptor optimization:</strong> Keep skill descriptors short (~9 tokens, not ~45). Every descriptor is <strong>always in context</strong> (fixed cost), so verbosity wastes tokens on every single request. Bad: "This skill helps review pull requests with a focus on code correctness and best practices for production systems." Good: "Use for PR reviews with focus on correctness."</p>
          <div class="wrong-answer">
            <strong>Anti-pattern:</strong> One skill that covers everything (review + deploy + debug + docs). This is too broad, triggers incorrectly, and wastes context. Split into focused single-purpose skills.
          </div>

          <h4>Deep Insight: Enterprise Configuration — managed-settings.json</h4>
          <p>In enterprise environments, IT administrators can enforce Claude Code settings via <code>managed-settings.json</code> — the <strong>highest-precedence</strong> configuration layer:</p>
          <pre><code>Settings Precedence (highest → lowest):
1. managed-settings.json (IT admin, system-level) ← CANNOT be overridden
2. Enterprise policy / Organization settings
3. Project .claude/settings.json
4. User ~/.claude/settings.json
5. Command-line flags</code></pre>
          <p><strong>Key enterprise lockdown settings:</strong></p>
          <ul>
            <li><code>allowManagedMcpServersOnly</code> — Only IT-approved MCP servers can be used</li>
            <li><code>strictKnownMarketplaces</code> — Restrict tool installations to approved marketplaces</li>
            <li><code>hostPattern</code> — Restrict which hosts/domains MCP servers can connect to</li>
            <li><code>network.allowedDomains</code> — Whitelist of allowed network domains</li>
            <li><code>availableModels</code> — Restrict which models can be used</li>
            <li><code>respectGitignore</code> — Enforce .gitignore compliance</li>
          </ul>
          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a scenario describes an organization wanting to restrict which MCP servers developers can use, the answer is <code>managed-settings.json</code> with <code>allowManagedMcpServersOnly: true</code>. This is the ONLY way to enforce it — project settings can be overridden by users.
          </div>

          <h4>Deep Insight: .claude/agents/ Directory</h4>
          <p>The <code>.claude/agents/</code> directory is a project-scoped location for <strong>custom AI subagent definitions</strong>. These are reusable agent configurations that can be shared via version control:</p>
          <pre><code>.claude/
  agents/
    researcher.md     ← Research-focused agent definition
    reviewer.md       ← Code review agent
    architect.md      ← Architecture analysis agent</code></pre>
          <p>Unlike skills (task-specific workflows), agents in this directory define <strong>persistent roles</strong> that can be invoked by a coordinator. They complement the <code>.claude/commands/</code> and <code>.claude/skills/</code> directories in the project configuration structure.</p>

          <h4>Deep Insight: The /status Command</h4>
          <p>Use <code>/status</code> to see which configuration layers are currently active and their origins. This is your diagnostic tool when settings aren't behaving as expected — it shows whether a setting comes from managed-settings.json, project settings, user settings, or command-line flags.</p>
        `
      },
      {
        id: "t3.3",
        title: "3.3: Path-specific rules for conditional convention loading",
        knowledge: [
          ".claude/rules/ files with YAML frontmatter paths field containing glob patterns",
          "Path-scoped rules load only when editing matching files, reducing irrelevant context and tokens",
          "Glob-pattern rules are better than directory-level CLAUDE.md for conventions spanning multiple directories"
        ],
        skills: [
          "Create .claude/rules/ files with YAML frontmatter (e.g., paths: ['terraform/**/*'])",
          "Use glob patterns for file-type conventions regardless of location (e.g., **/*.test.tsx)",
          "Choose path-specific rules over subdirectory CLAUDE.md when conventions span the codebase"
        ],
        keyPoint: "Test conventions in **/*.test.tsx files across many directories? Use .claude/rules/ with glob patterns, NOT subdirectory CLAUDE.md files.",
        details: `
          <h4>Path-Specific Rules</h4>
          <p>Files in <code>.claude/rules/</code> can have YAML frontmatter with a <code>paths</code> field. The rules only load when you're editing files that match the glob patterns:</p>
          <pre><code># .claude/rules/terraform.md
---
paths:
  - "terraform/**/*"
---

When editing Terraform files:
- Use modules for reusable infrastructure
- Always include tags for cost tracking
- Use variables.tf for all input variables
- Run terraform fmt before committing</code></pre>
          <p>These rules only load when editing files under <code>terraform/</code>. They don't consume tokens when you're editing React components or Python scripts.</p>

          <h4>Glob Patterns for Cross-Directory Conventions</h4>
          <p>The killer use case: conventions that apply to a file <em>type</em> regardless of where it lives:</p>
          <pre><code># .claude/rules/testing.md
---
paths:
  - "**/*.test.tsx"
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

When writing tests:
- Use describe/it blocks with clear descriptions
- Mock external dependencies, not internal modules
- Test behavior, not implementation details
- Include edge cases for null, undefined, empty arrays</code></pre>
          <p>This applies to test files in <code>src/components/</code>, <code>src/utils/</code>, <code>src/api/</code> — everywhere. You don't need a CLAUDE.md in every directory.</p>

          <h4>Path Rules vs Directory CLAUDE.md</h4>
          <pre><code>Directory CLAUDE.md (src/api/CLAUDE.md):
  ✅ Good for: rules specific to ONE directory
  ❌ Bad for: rules that span many directories

Path-specific rules (.claude/rules/ with globs):
  ✅ Good for: rules by file TYPE across the codebase
  ✅ Good for: infrastructure files (terraform/**)
  ✅ Good for: test files (**/*.test.tsx)
  ✅ Reduces token usage — only loaded when relevant</code></pre>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Creating a CLAUDE.md file in every directory that contains test files just to apply testing conventions. If you have test files in 20 directories, that's 20 CLAUDE.md files to maintain. Use ONE path-specific rule with <code>**/*.test.tsx</code> instead.
          </div>

          <h4>Token Efficiency</h4>
          <p>Path-scoped rules reduce irrelevant context. Without path scoping, all rules load for every file you edit. With path scoping:</p>
          <ul>
            <li>Editing <code>main.py</code> → only Python rules load</li>
            <li>Editing <code>infra/main.tf</code> → only Terraform rules load</li>
            <li>Editing <code>src/App.test.tsx</code> → only testing rules load</li>
          </ul>
          <p>Less irrelevant context = better Claude performance and lower token usage.</p>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> When a question describes conventions that need to apply to files spread across many directories (like test files), the correct answer is .claude/rules/ with glob patterns. Creating CLAUDE.md files in every subdirectory is the wrong answer — it's unmaintainable.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 2: Code Generation</span> Path-specific rules ensure Claude follows different conventions for different file types: React components, API routes, test files, config files.</p>
          <p><span class="scenario-tag">Scenario 5: CI/CD</span> CI review prompts can reference path-specific rules to ensure review criteria match the file type being reviewed.</p>

          <h4>Deep Insight: Rule Loading Mechanics and Token Cost</h4>
          <p>Understanding <em>when</em> rules load is critical for the exam:</p>
          <pre><code>Always loaded (fixed cost):
  ✅ Root CLAUDE.md — loaded for EVERY request
  ✅ User-level ~/.claude/CLAUDE.md — loaded for EVERY request
  ✅ Skill descriptors — always in context (keep ~9 tokens each!)

Conditionally loaded (path-scoped):
  ✅ .claude/rules/ with paths: [...] — only when editing matching files
  ✅ Directory-level CLAUDE.md — only when editing files in that directory

Never loaded automatically:
  ✅ Skills (SKILL.md) — only when explicitly invoked
  ✅ Subagent definitions (.claude/agents/) — only when spawned</code></pre>
          <p><strong>Exam trap — "when to use directory CLAUDE.md":</strong> The only correct use case for a subdirectory CLAUDE.md is rules that apply ONLY to that single directory AND nowhere else. The moment a convention spans multiple directories (like test conventions), switch to <code>.claude/rules/</code> with glob patterns. The exam will present scenarios with 15+ directories needing the same convention — the answer is always one rules file with a glob, never 15 CLAUDE.md files.</p>
          <p><strong>The @import connection:</strong> If your root CLAUDE.md becomes too large (hurting cache efficiency), use <code>@import</code> to split it into modules. But remember: @imported files are still loaded for every request. @import helps organization, not conditional loading. Only <code>.claude/rules/</code> provides true conditional loading.</p>
        `
      },
      {
        id: "t3.4",
        title: "3.4: Plan mode vs direct execution",
        knowledge: [
          "Plan mode: complex tasks, large-scale changes, multiple valid approaches, architectural decisions, multi-file modifications",
          "Direct execution: simple, well-scoped changes (single validation check, clear bug fix)",
          "Plan mode enables safe exploration before committing to changes, preventing costly rework",
          "Explore subagent isolates verbose discovery output and returns summaries to preserve main context"
        ],
        skills: [
          "Select plan mode for architectural implications (microservice restructuring, library migrations, multi-approach decisions)",
          "Select direct execution for well-understood changes with clear scope (one-file bug fix, single validation)",
          "Use Explore subagent for verbose discovery to prevent context exhaustion",
          "Combine plan mode for investigation with direct execution for implementation"
        ],
        keyPoint: "If the task has multiple valid approaches or touches many files -> plan mode. If it's a clear single-file fix -> direct execution.",
        details: `
          <h4>Plan Mode vs Direct Execution</h4>
          <p>This is about choosing the right execution strategy before making changes:</p>
          <pre><code>Plan Mode:                          Direct Execution:
  ✅ Complex tasks                    ✅ Simple, clear tasks
  ✅ Multiple valid approaches        ✅ One obvious approach
  ✅ Large-scale changes              ✅ Single-file changes
  ✅ Architectural decisions          ✅ Bug fix with clear stack trace
  ✅ Multi-file modifications         ✅ Adding a validation check
  ✅ Library migrations               ✅ Fixing a typo
  ✅ Unknown codebase areas           ✅ Well-understood code</code></pre>

          <h4>Plan Mode in Detail</h4>
          <p>Plan mode enables safe exploration BEFORE committing to changes. It's like architectural design before construction:</p>
          <pre><code>Plan Mode Workflow:
1. Explore the codebase (read files, understand structure)
2. Identify affected areas and dependencies
3. Evaluate multiple approaches (tradeoffs, risks)
4. Present a plan for review
5. Execute the approved plan

Direct Execution Workflow:
1. Understand the change needed
2. Make the change
3. Done</code></pre>

          <h4>The Explore Subagent</h4>
          <p>The Explore subagent is purpose-built for the discovery phase of plan mode. It:</p>
          <ul>
            <li>Runs in <strong>isolated context</strong> — verbose discovery output stays separate</li>
            <li>Returns <strong>summaries</strong> to the main conversation</li>
            <li>Prevents context window exhaustion during multi-phase tasks</li>
          </ul>
          <p>Without the Explore subagent, reading 30 files during discovery would fill up your main context window, leaving no room for the actual implementation.</p>

          <h4>Combining Plan + Direct Execution</h4>
          <p>The most powerful pattern: use plan mode for investigation, then direct execution for implementation:</p>
          <pre><code>Phase 1 (Plan Mode):
  "Investigate how to migrate from library A to library B.
   Identify all affected files, breaking changes, and 
   suggest an approach."

Phase 2 (Direct Execution):
  "Implement the migration plan: update imports in these 
   5 files, modify the config, update tests."</code></pre>

          <h4>Decision Framework</h4>
          <p>Ask these questions to decide:</p>
          <ol>
            <li>Is there more than one valid approach? → Plan mode</li>
            <li>Does it touch more than 2-3 files? → Plan mode</li>
            <li>Are there architectural implications? → Plan mode</li>
            <li>Is the fix obvious from the error? → Direct execution</li>
            <li>Is it a single function/file change? → Direct execution</li>
          </ol>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Using plan mode for "add a null check to line 42 of auth.js." This is a clear, single-file fix — plan mode adds unnecessary overhead. Just do it.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Questions describe a scenario and ask whether to use plan mode or direct execution. Key signals: "microservice restructuring," "library migration," "45+ files," "multiple approaches" → plan mode. "Single validation check," "clear bug fix," "one function" → direct execution.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 2: Code Generation</span> Use plan mode for large refactoring tasks; direct execution for quick bug fixes and single-function changes.</p>
          <p><span class="scenario-tag">Scenario 4: Developer Productivity</span> The Explore subagent helps developers understand unfamiliar codebases without exhausting context.</p>

          <h4>Deep Insight: Plan Mode Internals</h4>
          <p><strong>EnterPlanMode is a tool call</strong>, not a mode switch. When Claude enters plan mode (via Shift+Tab x2 or autonomously), it calls the <code>EnterPlanMode</code> tool. Critically, this does NOT change the available tool set — which means the <strong>prompt cache prefix is preserved</strong>. This is by design: plan mode adds read-only exploration without invalidating the expensive cached prefix (system + tools + history).</p>
          <p><strong>Cache preservation implication:</strong> If plan mode changed the tool set, every entry/exit would invalidate the prompt cache for all prior tokens. By keeping it as a tool call, Anthropic avoids this cost.</p>
        `
      },
      {
        id: "t3.5",
        title: "3.5: Iterative refinement techniques",
        knowledge: [
          "Concrete input/output examples are the most effective way to communicate expected transformations",
          "Test-driven iteration: write tests first, iterate by sharing test failures to guide improvement",
          "Interview pattern: have Claude ask questions to surface considerations before implementing",
          "Interacting issues -> single message. Independent issues -> fix sequentially."
        ],
        skills: [
          "Provide 2-3 concrete input/output examples when prose descriptions produce inconsistent results",
          "Write test suites first (behavior, edge cases, performance), then iterate by sharing failures",
          "Use interview pattern in unfamiliar domains (e.g., cache strategies, failure modes)",
          "Provide specific test cases with example input and expected output for edge case fixes",
          "Address interacting issues together; independent issues sequentially"
        ],
        keyPoint: "Inconsistent output? Provide concrete input/output examples. Unfamiliar domain? Use the interview pattern.",
        details: `
          <h4>Four Iterative Refinement Techniques</h4>
          <p>These are the techniques for progressively improving Claude's output quality:</p>

          <h4>1. Concrete Input/Output Examples</h4>
          <p>The <strong>most effective</strong> technique when prose descriptions produce inconsistent results:</p>
          <pre><code>// Instead of: "Convert dates to ISO format"
// Provide examples:

Input:  "Jan 5, 2024"      → Output: "2024-01-05"
Input:  "5/1/24"            → Output: "2024-01-05"  
Input:  "January 5th 2024"  → Output: "2024-01-05"
Input:  "2024.01.05"        → Output: "2024-01-05"</code></pre>
          <p>2-3 examples showing the transformation eliminate ambiguity that paragraphs of instructions can't resolve.</p>

          <h4>2. Test-Driven Iteration</h4>
          <p>Write tests FIRST, then iterate by sharing failures:</p>
          <pre><code>Step 1: Write test suite
  - Expected behavior tests
  - Edge case tests (null, empty, boundary values)
  - Performance requirements

Step 2: Claude implements
  → 3 tests fail

Step 3: Share SPECIFIC failures
  "Test 'handles null input' failed:
   Expected: return empty array
   Got: TypeError: Cannot read property 'map' of null"

Step 4: Claude fixes → repeat until all tests pass</code></pre>
          <p>Sharing specific test failures gives Claude precise, actionable feedback to improve.</p>

          <h4>3. The Interview Pattern</h4>
          <p>For unfamiliar domains, have Claude ask questions BEFORE implementing:</p>
          <pre><code>You: "Build a caching system for our API"

Claude (interview mode):
  "Before I implement, let me ask a few questions:
   1. What's your cache invalidation strategy? (TTL, event-based, manual)
   2. What failure mode is acceptable? (stale data vs cache miss)
   3. What's the expected cache hit ratio target?
   4. Do you need distributed caching or single-node?
   5. What data formats need caching? (JSON, binary, streams)"</code></pre>
          <p>This surfaces considerations you might not have thought of. Use it when YOU (the developer) are also unfamiliar with the domain.</p>

          <h4>4. Issue Batching Strategy</h4>
          <pre><code>Interacting issues (fix together in ONE message):
  "The auth middleware is both skipping validation 
   AND not setting the user context, causing downstream 
   permission errors."
  → These issues interact, so fix them together.

Independent issues (fix sequentially):
  "The login page has a CSS bug AND the API has a typo 
   in the error message."
  → Unrelated issues, fix one at a time for cleaner iterations.</code></pre>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Sending vague feedback like "the output is wrong" or "try again." Provide SPECIFIC input/output examples, test failures, or concrete criteria for what needs to change.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If the question says "Claude produces inconsistent output despite detailed instructions," the answer is concrete input/output examples (not more instructions). If the question says "implementing in an unfamiliar domain," the answer is the interview pattern.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 2: Code Generation</span> Test-driven iteration: write tests first, then have Claude iterate on the implementation by sharing test failures.</p>
          <p><span class="scenario-tag">Scenario 6: Data Extraction</span> Concrete input/output examples are critical for teaching Claude how to extract data from varied document formats.</p>

          <h4>Deep Insight: Choosing the Right Refinement Technique</h4>
          <p>The exam tests technique selection based on the <em>symptom</em>. Memorize this mapping:</p>
          <pre><code>Symptom → Technique:

"Inconsistent output format"
  → Few-shot examples (2-4 showing exact format)

"Works sometimes but not for edge cases"
  → Concrete input/output examples for the failing edges

"Don't know what to ask for"
  → Interview pattern (Claude asks clarifying questions first)

"Implementation has bugs"
  → Test-driven iteration (share specific test failures)

"Multiple issues in the code"
  → Interacting issues = single message
  → Independent issues = sequential messages

"Vague feedback isn't helping"
  → Provide SPECIFIC test cases with input + expected output</code></pre>
          <p><strong>The "more instructions" trap:</strong> When a question says "Claude produces inconsistent output despite detailed instructions," the wrong answer is ALWAYS "add more instructions" or "make instructions more detailed." The correct answer is to switch from instructions to <strong>concrete examples</strong>. If instructions already failed, more instructions won't help — the problem is ambiguity that only examples can resolve.</p>
          <p><strong>Interview pattern subtlety:</strong> The interview pattern is NOT for when Claude doesn't understand the task. It's for when the <em>developer</em> hasn't thought through all the requirements. Claude surfaces considerations the developer missed (cache invalidation strategies, failure modes, edge cases). This is a <strong>design technique</strong>, not a debugging technique.</p>
        `
      },
      {
        id: "t3.6",
        title: "3.6: Integrate Claude Code into CI/CD pipelines",
        knowledge: [
          "-p / --print flag runs Claude Code in non-interactive mode (prevents CI hangs!)",
          "--output-format json and --json-schema enforce structured output in CI",
          "CLAUDE.md provides project context (testing standards, fixtures, review criteria) to CI-invoked Claude Code",
          "Same session that generated code is less effective at reviewing its own changes vs an independent instance"
        ],
        skills: [
          "Run Claude Code in CI with -p flag to prevent interactive input hangs",
          "Use --output-format json + --json-schema for machine-parseable structured findings",
          "Include prior review findings when re-running to avoid duplicate comments",
          "Provide existing test files in context so test generation avoids duplicate scenarios",
          "Document testing standards and available fixtures in CLAUDE.md for quality test generation"
        ],
        keyPoint: "CI/CD = use -p flag. Self-review is weak; use a second independent instance. Include prior findings to avoid duplicate comments.",
        details: `
          <h4>The -p Flag (Non-Interactive Mode)</h4>
          <p>This is the <strong>#1 thing to know</strong> for CI/CD integration:</p>
          <pre><code># WRONG — hangs in CI waiting for user input
claude "Review this PR"

# RIGHT — non-interactive mode
claude -p "Review this PR"
# Also: claude --print "Review this PR"</code></pre>
          <p>The <code>-p</code> (or <code>--print</code>) flag runs Claude Code in non-interactive mode. Without it, Claude Code waits for interactive input and your CI pipeline hangs forever.</p>

          <h4>Structured Output for CI</h4>
          <p>CI systems need machine-parseable output, not conversational text:</p>
          <pre><code># JSON output with schema enforcement
claude -p \\
  --output-format json \\
  --json-schema '{"type":"object","properties":{
    "findings": {"type":"array","items":{
      "type":"object","properties":{
        "file":{"type":"string"},
        "line":{"type":"number"},
        "severity":{"type":"string","enum":["critical","warning","info"]},
        "message":{"type":"string"},
        "suggested_fix":{"type":"string"}
      }
    }},
    "summary":{"type":"string"}
  }}' \\
  "Review this PR for bugs and security issues"</code></pre>
          <p>This output can be automatically parsed and posted as inline PR comments.</p>

          <h4>Self-Review Limitation</h4>
          <p>The same Claude session that generated code is <strong>less effective at reviewing it</strong>. Why? It retains the reasoning context from generation — it "remembers" why it made each decision, making it less likely to question those decisions.</p>
          <pre><code>// Weak: same session generates and reviews
Session A: "Write auth middleware" → generates code
Session A: "Now review your code" → biased review

// Strong: separate session reviews independently
Session A: "Write auth middleware" → generates code
Session B: "Review this code" → unbiased review
           (Session B has no knowledge of Session A's reasoning)</code></pre>

          <h4>Avoiding Duplicate Comments</h4>
          <p>When re-running CI reviews after new commits, include prior findings in context:</p>
          <pre><code>claude -p "Review this PR. 
Previous review findings (already addressed or acknowledged):
- Line 45: Missing null check (FIXED in commit abc123)
- Line 89: SQL injection risk (acknowledged, using prepared statements)

Report only NEW or still-unaddressed issues."</code></pre>
          <p>Without this, Claude will keep flagging the same issues every run, creating noise.</p>

          <h4>CLAUDE.md for CI Context</h4>
          <p>CLAUDE.md provides project context to CI-invoked Claude Code:</p>
          <ul>
            <li>Testing standards and frameworks</li>
            <li>Available fixtures and test utilities</li>
            <li>Review criteria and severity definitions</li>
            <li>Code style conventions</li>
          </ul>
          <p>This prevents Claude from generating tests that duplicate existing coverage or using patterns inconsistent with the project.</p>

          <h4>Test Generation in CI</h4>
          <pre><code># Provide existing tests so Claude doesn't generate duplicates
claude -p "Generate tests for src/auth.ts. 
  Existing test file: $(cat src/auth.test.ts)
  Available fixtures: $(cat test/fixtures/README.md)
  Testing standards are in CLAUDE.md."</code></pre>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Running Claude Code in CI without the <code>-p</code> flag. The pipeline will hang indefinitely waiting for interactive input. Always use <code>-p</code> for CI.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> CI/CD questions test three things: (1) <code>-p</code> flag for non-interactive mode, (2) separate instances for review vs generation, and (3) including prior findings to avoid duplicate comments. If you know these three, you'll get most CI/CD questions right.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 5: CI/CD</span> This IS the primary scenario. Automated code reviews, test generation, PR feedback — all use <code>-p</code> with structured output.</p>

          <h4>Deep Insight: CI/CD Pipeline Architecture Patterns</h4>
          <p>The exam tests three CI/CD integration patterns at increasing sophistication:</p>
          <pre><code>Pattern 1: Simple PR Review
  claude -p "Review this PR for bugs" > review.json
  → One-shot, no state, post as PR comment

Pattern 2: Incremental Review (avoid duplicate comments)
  claude -p "Review this PR.
    Previous findings: [list of already-addressed items]
    Report only NEW issues." > review.json
  → Passes prior findings to avoid noise

Pattern 3: Generate + Independent Review
  Session A: claude -p "Write tests for src/auth.ts"
  Session B: claude -p "Review this test file for quality"
  → Separate sessions eliminate self-review bias</code></pre>
          <p><strong>The --append-system-prompt flag:</strong> In CI, you often need to inject pipeline-specific context (branch name, PR title, changed files) without modifying CLAUDE.md. Use <code>--append-system-prompt</code> to add CI-specific instructions on top of the existing system prompt. It <strong>appends</strong>, not replaces — the base CLAUDE.md instructions remain intact.</p>
          <p><strong>Self-review is the #1 CI trap:</strong> The exam presents scenarios where the same Claude session generates code and then reviews it. This is ALWAYS the wrong answer. The same session retains reasoning context from generation, making it biased toward its own decisions. The correct answer is always a <strong>separate, independent Claude instance</strong> for review — it has no knowledge of why the code was written that way, so it evaluates purely on merit.</p>
          <p><strong>JSON schema enforcement:</strong> For CI output that must be machine-parseable, combine <code>--output-format json</code> with <code>--json-schema</code>. This guarantees the output structure matches what your pipeline expects, preventing parsing failures. Without the schema, Claude might return valid JSON with unexpected field names.</p>
        `
      }
    ]
  },
  {
    id: "d4",
    domain: 4,
    title: "Prompt Engineering & Structured Output",
    weight: 20,
    tagClass: "tag-d4",
    tasks: [
      {
        id: "t4.1",
        title: "4.1: Explicit criteria to improve precision and reduce false positives",
        knowledge: [
          "Explicit criteria >> vague instructions. 'Flag only when claimed behavior contradicts actual code' >> 'check comments are accurate'",
          "'Be conservative' or 'only report high-confidence findings' does NOT improve precision vs specific categorical criteria",
          "High false positive rates in one category undermine developer trust in accurate categories"
        ],
        skills: [
          "Write specific review criteria defining which issues to report (bugs, security) vs skip (minor style)",
          "Temporarily disable high-false-positive categories to restore trust while improving those prompts",
          "Define explicit severity criteria with concrete code examples for each severity level"
        ],
        keyPoint: "'Be conservative' is useless. Define SPECIFIC categories: what to flag, what to skip, with concrete examples for each severity.",
        details: `
          <h4>The Problem with Vague Instructions</h4>
          <p>Consider these two prompts for a code review agent:</p>
          <pre><code>// VAGUE — doesn't improve precision
"Be conservative. Only report high-confidence findings."

// EXPLICIT — actually improves precision
"Report these issues:
  - CRITICAL: SQL injection, XSS, authentication bypass
  - WARNING: Null pointer risks, resource leaks, race conditions
  
DO NOT report:
  - Minor style differences (spacing, naming preferences)
  - Local patterns that differ from project conventions but work correctly
  - Missing comments on self-explanatory code"</code></pre>
          <p>"Be conservative" and "only report high-confidence findings" are subjective — Claude interprets them differently each time. Specific categories give Claude a concrete decision framework.</p>

          <h4>Why False Positives Destroy Trust</h4>
          <p>If your code review agent has a 50% false positive rate on style issues, developers will:</p>
          <ol>
            <li>Start ignoring ALL findings (including real bugs)</li>
            <li>Lose trust in the accurate categories too</li>
            <li>Eventually disable the tool entirely</li>
          </ol>
          <p>High false positive rates in ONE category undermine confidence in ALL categories.</p>

          <h4>The Fix: Category-Level Control</h4>
          <pre><code>Strategy 1: Define explicit categories
  "Flag: bugs, security vulnerabilities, data loss risks
   Skip: style preferences, naming conventions, comment quality"

Strategy 2: Temporarily disable problematic categories
  If "comment accuracy" has 60% false positives:
  → Disable that category entirely
  → Fix the prompt/examples for that category
  → Re-enable once false positive rate drops

Strategy 3: Severity criteria with concrete examples
  "CRITICAL (must fix):
    Example: user input passed directly to SQL query
  WARNING (should fix):
    Example: catch block swallows exception without logging
  INFO (consider):
    Example: function over 50 lines could be split"</code></pre>

          <div class="wrong-answer">
            <strong>Approaches that DON'T work:</strong>
            <ul>
              <li>"Be more conservative" — still vague, doesn't change behavior predictably</li>
              <li>"Only report high-confidence findings" — Claude can't reliably self-assess confidence</li>
              <li>"Report fewer false positives" — circular instruction with no actionable criteria</li>
            </ul>
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a question describes a code review tool with high false positive rates and asks how to fix it, the answer is NEVER "add a confidence threshold" or "tell it to be conservative." The answer is always explicit categorical criteria with concrete examples defining what to flag vs skip.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 5: CI/CD Code Review</span> This is the primary scenario. Automated PR reviews need precise criteria to produce actionable feedback without drowning developers in false positives.</p>

          <h4>Deep Insight: The False Positive Cascade Effect</h4>
          <p>The exam tests your understanding of why false positive rates matter beyond just annoyance:</p>
          <pre><code>False Positive Cascade:
  1. Tool reports 20 findings per PR
  2. 10 are false positives (50% FP rate)
  3. Developers start ignoring ALL findings
  4. Real bugs slip through because of "cry wolf" effect
  5. Team disables the tool entirely
  6. Zero automated coverage → worse than before

The Fix (category-level triage):
  1. Track FP rate per CATEGORY (not aggregate)
  2. "Comment accuracy" has 60% FP → DISABLE temporarily
  3. "SQL injection" has 2% FP → keep enabled
  4. Fix the "comment accuracy" prompt/examples
  5. Re-enable once FP rate drops below threshold</code></pre>
          <p><strong>Exam signal words:</strong> When a question mentions "developer trust," "adoption declined," or "team stopped using the tool," the root cause is always false positives. The fix is always explicit categorical criteria — never "be more conservative" or "add a confidence threshold."</p>
          <p><strong>The severity hierarchy matters:</strong> Define severity levels with CONCRETE code examples, not abstract descriptions. "CRITICAL: user input passed directly to SQL query without sanitization" is actionable. "CRITICAL: very serious security issues" is not. The exam tests whether you understand that severity must be anchored to specific patterns, not vibes.</p>
        `
      },
      {
        id: "t4.2",
        title: "4.2: Few-shot prompting for consistency and quality",
        knowledge: [
          "Few-shot examples are the MOST effective technique for consistent, actionable output when instructions alone fail",
          "Few-shot examples demonstrate ambiguous-case handling and enable generalization to novel patterns",
          "Effective for reducing hallucination in extraction tasks (informal measurements, varied document structures)"
        ],
        skills: [
          "Create 2-4 targeted examples for ambiguous scenarios showing reasoning for chosen action",
          "Include examples demonstrating desired output format (location, issue, severity, fix)",
          "Provide examples distinguishing acceptable patterns from genuine issues",
          "Use examples for varied document structures (inline citations vs bibliographies)",
          "Add examples showing correct extraction from varied formats to fix empty/null extraction"
        ],
        keyPoint: "When detailed instructions produce inconsistent results, 2-4 targeted few-shot examples are the most effective fix.",
        details: `
          <h4>Why Few-Shot Examples Work</h4>
          <p>When Claude produces inconsistent output despite detailed instructions, the problem is usually <strong>ambiguity</strong> — the instructions can be interpreted multiple ways. Few-shot examples resolve this by showing Claude exactly what you want:</p>
          <pre><code>// Instructions alone (ambiguous):
"Extract measurements from documents. Handle informal formats."

// With few-shot examples (unambiguous):
Example 1:
  Input: "The room is about 12 by 15 feet"
  Output: { width: 12, length: 15, unit: "feet", precision: "approximate" }

Example 2:
  Input: "Ceiling height: 8'"
  Output: { height: 8, unit: "feet", precision: "exact" }

Example 3:
  Input: "The property spans roughly 2 acres"
  Output: { area: 2, unit: "acres", precision: "approximate" }</code></pre>
          <p>Notice how the examples teach Claude to handle informal measurements, abbreviations, and approximate values — things that are hard to describe in prose.</p>

          <h4>What Good Few-Shot Examples Demonstrate</h4>
          <ul>
            <li><strong>Ambiguous case handling:</strong> How to decide between two plausible actions</li>
            <li><strong>Output format:</strong> Exact structure (fields, types, formatting)</li>
            <li><strong>Boundary cases:</strong> What counts as "acceptable" vs a "genuine issue"</li>
            <li><strong>Reasoning:</strong> WHY one action was chosen over alternatives</li>
          </ul>

          <h4>Few-Shot for Code Review</h4>
          <pre><code>Example: Acceptable pattern (don't flag)
  Code: try { await db.save(user); } catch (e) { return null; }
  Decision: SKIP — intentional error swallowing in this codebase
  Reasoning: Project convention uses null returns for save failures

Example: Genuine issue (flag)
  Code: try { await processPayment(amount); } catch (e) { }
  Decision: FLAG — WARNING severity
  Reasoning: Payment errors silently swallowed, customer charged 
             but no record saved. Financial impact.</code></pre>
          <p>These examples teach Claude to distinguish between acceptable patterns and genuine issues — something instructions alone often can't convey.</p>

          <h4>Few-Shot for Data Extraction</h4>
          <p>Particularly effective for reducing hallucination with varied document structures:</p>
          <pre><code>Example: Inline citation format
  Input: "Smith (2023) found that 67% of participants..."
  Output: { author: "Smith", year: 2023, stat: "67%", type: "inline" }

Example: Bibliography format
  Input: "[12] J. Smith, 'Study Results', Journal of X, 2023"
  Output: { author: "J. Smith", year: 2023, title: "Study Results", 
            type: "bibliography", ref_num: 12 }

Example: Missing information (don't fabricate!)
  Input: "The study found significant improvement"
  Output: { stat: null, type: "qualitative", 
            note: "No numerical value provided" }</code></pre>

          <h4>How Many Examples?</h4>
          <p><strong>2-4 targeted examples</strong> is the sweet spot. Too few and Claude doesn't see the pattern. Too many and you waste context tokens. Focus on the ambiguous cases — you don't need examples for obvious cases.</p>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Responding to inconsistent output by adding MORE detailed instructions. If detailed instructions already failed, adding more words won't help. Switch to concrete examples instead.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Few-shot examples are the answer whenever the question mentions "inconsistent output," "hallucination in extraction," "ambiguous cases," or "the model doesn't follow the format reliably." They are the MOST effective technique for consistency.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 6: Data Extraction</span> Few-shot examples are critical for handling varied document formats — inline citations vs bibliographies, informal measurements, and incomplete data.</p>
          <p><span class="scenario-tag">Scenario 5: CI/CD Code Review</span> Examples showing which code patterns to flag vs skip dramatically improve review precision.</p>

          <h4>Deep Insight: Few-Shot Example Design Principles</h4>
          <p>The exam tests not just WHEN to use few-shot examples, but HOW to design them effectively:</p>
          <pre><code>Principle 1: Show the HARD cases, not the easy ones
  ❌ Example: "Invoice #123" → { number: "123" }  (trivial)
  ✅ Example: "Inv. No.: 00123-A" → { number: "00123-A" }  (edge case)

Principle 2: Show the REASONING, not just I/O
  ❌ Input: "about 12 feet" → Output: { value: 12, precision: "approximate" }
  ✅ Input: "about 12 feet" → Output: { value: 12, precision: "approximate" }
     Reasoning: "about" indicates approximate measurement

Principle 3: Show NEGATIVE examples (what NOT to extract)
  ✅ Input: "The study found significant improvement"
     Output: { stat: null, note: "No numerical value — don't fabricate" }

Principle 4: Match your actual data distribution
  If 80% of your documents are invoices, have 2+ invoice examples
  If 5% are handwritten, still include 1 handwritten example
  (because that's where errors concentrate)</code></pre>
          <p><strong>The "too many examples" trap:</strong> More than 4-5 examples usually wastes context tokens without improving quality. The exam may present an option like "add 20 examples to cover all edge cases." This is wrong — 2-4 targeted examples covering the ambiguous cases is the sweet spot. After 4-5, you get diminishing returns and context waste.</p>
          <p><strong>Few-shot vs instructions decision point:</strong> Start with instructions. If Claude produces consistent output → done. If Claude produces inconsistent output → add few-shot examples. If Claude still fails → the task may require tool_use with JSON schemas for structural enforcement. This is the <strong>escalation ladder</strong> the exam expects you to follow.</p>
        `
      },
      {
        id: "t4.3",
        title: "4.3: Enforce structured output using tool_use and JSON schemas",
        knowledge: [
          "tool_use with JSON schemas = most reliable for guaranteed schema-compliant output (eliminates syntax errors)",
          "tool_choice: 'auto' (may return text), 'any' (must call some tool), forced (must call specific tool)",
          "Strict schemas eliminate SYNTAX errors but NOT semantic errors (line items not summing to total)",
          "Schema design: required vs optional fields, enum + 'other' + detail string for extensibility"
        ],
        skills: [
          "Define extraction tools with JSON schemas as input parameters",
          "Set tool_choice: 'any' when multiple schemas exist and document type is unknown",
          "Force specific tool with tool_choice: {type: 'tool', name: '...'} for prerequisite extraction",
          "Design optional/nullable fields when source may not contain info (prevents fabrication)",
          "Add 'unclear' enum values for ambiguous cases, 'other' + detail for extensible categories",
          "Include format normalization rules alongside strict output schemas"
        ],
        keyPoint: "tool_use + JSON schema = no syntax errors. Make fields nullable when info might be missing to prevent fabrication.",
        details: `
          <h4>Why tool_use for Structured Output?</h4>
          <p>When you need Claude to return data in a specific JSON format, <code>tool_use</code> with a JSON schema is the most reliable approach. It <strong>eliminates JSON syntax errors entirely</strong> — no missing commas, no unclosed brackets, no malformed strings.</p>
          <pre><code>// Define an extraction "tool" with a JSON schema
{
  name: "extract_invoice",
  description: "Extract structured data from an invoice",
  input_schema: {
    type: "object",
    properties: {
      vendor: { type: "string" },
      invoice_number: { type: "string" },
      total: { type: "number" },
      line_items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            description: { type: "string" },
            amount: { type: "number" }
          }
        }
      }
    },
    required: ["vendor", "invoice_number", "total"]
  }
}</code></pre>
          <p>Claude's response will always be valid JSON matching this schema. No parsing errors.</p>

          <h4>tool_choice: The Three Options (Again)</h4>
          <p>This is tested so frequently it's worth repeating in this context:</p>
          <pre><code>"auto"   → Claude MAY return text instead of calling the tool
           Use when: tool use is optional

"any"    → Claude MUST call a tool (picks which one)
           Use when: you have multiple extraction schemas
           and don't know which document type you're processing

forced   → Claude MUST call THIS specific tool
{ type: "tool", name: "extract_invoice" }
           Use when: a specific extraction must happen first</code></pre>

          <h4>Syntax Errors vs Semantic Errors</h4>
          <p>Crucial distinction the exam tests:</p>
          <pre><code>JSON Schema Eliminates:        JSON Schema Does NOT Prevent:
  ✅ Missing brackets            ❌ Line items that don't sum to total
  ✅ Missing commas              ❌ Values in wrong fields
  ✅ Invalid JSON syntax          ❌ Fabricated values
  ✅ Wrong data types             ❌ Incorrect amounts/dates
  ✅ Missing required fields      ❌ Contradictory data</code></pre>
          <p>Schema validation handles <em>structure</em>. You still need <em>semantic</em> validation (business logic checks) separately.</p>

          <h4>Nullable/Optional Fields — Preventing Fabrication</h4>
          <p>This is a <strong>critical design principle</strong>: if a field might not exist in the source document, make it nullable:</p>
          <pre><code>// BAD — required field forces fabrication
{ "fax_number": { type: "string" } }  // required!
// Claude might fabricate a fax number if the document doesn't have one

// GOOD — nullable field allows honest "no data"
{ "fax_number": { type: ["string", "null"] } }
// Claude returns null when no fax number is in the document</code></pre>

          <h4>Extensible Enums</h4>
          <p>For categorization fields, use enum + "other" + detail string:</p>
          <pre><code>{
  "document_type": {
    "type": "string",
    "enum": ["invoice", "receipt", "contract", "other"]
  },
  "document_type_detail": {
    "type": ["string", "null"],
    "description": "If type is 'other', describe the document type"
  },
  "confidence": {
    "type": "string",
    "enum": ["high", "medium", "low", "unclear"]
  }
}</code></pre>
          <p>The "other" + detail pattern handles edge cases gracefully. The "unclear" enum value gives Claude an honest escape for ambiguous cases.</p>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Making all fields required when the source documents might not contain that information. This forces Claude to fabricate data to satisfy the schema. Make fields nullable/optional to prevent hallucination.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a question describes Claude fabricating values for fields that don't exist in the document, the answer is to make those fields optional/nullable. If it describes JSON syntax errors, the answer is tool_use with JSON schema. These are different problems with different solutions.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 6: Data Extraction</span> This IS the primary scenario. Structured extraction from invoices, contracts, and unstructured documents using tool_use + JSON schemas.</p>
          <p><span class="scenario-tag">Scenario 5: CI/CD</span> <code>--json-schema</code> in CI ensures structured output that can be automatically parsed for PR comments.</p>

          <h4>Deep Insight: Best-of-N Pattern</h4>
          <p>The <strong>Best-of-N</strong> pattern generates multiple independent outputs and selects the best one. It's a quality/reliability technique for high-stakes extractions:</p>
          <pre><code>// Best-of-N workflow:
1. Generate N independent extractions (e.g., N=3)
   - Each extraction uses the SAME prompt + document
   - Each runs in a SEPARATE context (no shared state)
2. Compare outputs:
   - If all N agree → high confidence, use the result
   - If N-1 agree → use majority, flag the outlier
   - If no agreement → escalate to human review
3. Select the best based on agreement + validation</code></pre>
          <p><strong>When to use Best-of-N:</strong></p>
          <ul>
            <li>High-value document extraction where errors are costly (financial, legal, medical)</li>
            <li>Ambiguous source documents where a single pass may miss or misinterpret information</li>
            <li>Validation is difficult to automate (no ground truth to check against)</li>
          </ul>
          <p><strong>When NOT to use it:</strong></p>
          <ul>
            <li>Simple, well-structured documents (wastes tokens for minimal quality gain)</li>
            <li>When programmatic validation can catch errors (retry-with-feedback is cheaper)</li>
            <li>Latency-sensitive applications (N parallel calls = N× cost)</li>
          </ul>
          <div class="exam-tip">
            <strong>Exam Tip:</strong> Best-of-N is the answer when the scenario describes "high-stakes extraction where validation is hard" or "need confidence without ground truth." It's NOT the answer for simple format errors (use retry-with-feedback) or when you have validation rules (use programmatic checks).
          </div>
        `
      },
      {
        id: "t4.4",
        title: "4.4: Validation, retry, and feedback loops",
        knowledge: [
          "Retry-with-error-feedback: append specific validation errors to prompt on retry",
          "Retries are ineffective when info is absent from source (vs format/structural errors where retries work)",
          "Feedback loops: track detected_pattern field to analyze dismissal patterns",
          "Semantic validation (values don't sum) vs schema syntax errors (eliminated by tool_use)"
        ],
        skills: [
          "Implement follow-up requests with: original document + failed extraction + specific validation errors",
          "Identify when retries will fail (info absent from source) vs succeed (format mismatches, structural errors)",
          "Add detected_pattern to findings for analyzing false positive patterns",
          "Design self-correction: extract calculated_total alongside stated_total to flag discrepancies"
        ],
        keyPoint: "Retry works for format/structure errors. Retry does NOT work when the info simply isn't in the document.",
        details: `
          <h4>Retry-with-Error-Feedback Pattern</h4>
          <p>When Claude's extraction fails validation, the retry pattern is:</p>
          <pre><code>1. Send document + extraction prompt → get initial output
2. Validate output → find specific errors
3. Send: original document + failed output + specific errors
4. Claude self-corrects based on the error feedback
5. Re-validate → repeat if needed</code></pre>
          <p>The key: include the <strong>specific validation errors</strong> in the retry prompt, not just "try again."</p>
          <pre><code>// BAD retry prompt
"The extraction was wrong. Try again."

// GOOD retry prompt
"Your extraction had these errors:
  1. line_items total ($1,234) doesn't match stated_total ($1,244)
  2. vendor_address is missing the ZIP code — it's on page 2
  3. invoice_date format should be YYYY-MM-DD, you returned 'Jan 5'
  
Here is the original document again: [document]
Here is your previous extraction: [extraction]
Please correct these specific issues."</code></pre>

          <h4>When Retries Work vs Don't Work</h4>
          <pre><code>Retries WORK for:                  Retries DON'T WORK for:
  ✅ Format mismatches               ❌ Info not in the document
  ✅ Structural output errors         ❌ Data in an external doc
  ✅ Math errors (sums don't match)   ❌ Truly ambiguous source
  ✅ Missed data on another page      ❌ Contradictory source data
  ✅ Wrong date format                ❌ Redacted/illegible sections</code></pre>
          <p>The critical insight: if the information simply doesn't exist in the document, retrying won't help — Claude can't extract what isn't there. Retries work when the data IS present but was incorrectly processed.</p>

          <h4>Feedback Loop Design</h4>
          <p>For ongoing quality improvement, track patterns in model errors:</p>
          <pre><code>{
  "finding": "Potential null pointer on line 42",
  "severity": "warning",
  "detected_pattern": "unchecked_optional_access",
  "confidence": "medium"
}

// When developers dismiss findings, analyze by detected_pattern:
// "unchecked_optional_access" dismissed 80% of the time
// → This pattern has too many false positives
// → Improve the prompt/examples for this pattern</code></pre>
          <p>The <code>detected_pattern</code> field enables systematic analysis of which patterns produce false positives.</p>

          <h4>Semantic Self-Correction</h4>
          <p>Design extraction to catch its own errors:</p>
          <pre><code>{
  "stated_total": 1244.00,     // What the document says
  "calculated_total": 1234.00, // Sum of extracted line items
  "totals_match": false,       // Flag discrepancy
  "conflict_detected": true    // Boolean for downstream processing
}</code></pre>
          <p>Extracting both the stated value AND the calculated value lets you detect discrepancies automatically.</p>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Retrying indefinitely when the information doesn't exist in the document. If the document doesn't contain a fax number, retrying 5 times won't create one. Return null/empty for missing data.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> The key distinction tested: retries work for processing errors (wrong format, missed data that IS present). Retries DON'T work for absence errors (data not in the document). If the question describes retrying for missing data, that's the wrong answer.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 6: Data Extraction</span> Retry-with-feedback is core to extraction pipelines. Validate, identify specific errors, retry with targeted feedback.</p>
          <p><span class="scenario-tag">Scenario 5: CI/CD</span> The <code>detected_pattern</code> field enables tracking false positive rates over time to improve review prompts.</p>

          <h4>Deep Insight: The Retry Decision Tree</h4>
          <p>The exam tests whether you can quickly determine if a retry will help. Use this decision tree:</p>
          <pre><code>Extraction failed validation →
  Q: Is the required data IN the document?
    YES → Q: Was it a format/structure error?
      YES → RETRY with specific error feedback ✅
      NO → Q: Was it a math/logic error?
        YES → RETRY asking model to recalculate ✅
        NO → INVESTIGATE — may need different approach
    NO → DON'T RETRY ❌
      → Return null/empty for that field
      → Move on to next document</code></pre>
          <p><strong>The "calculated vs stated" pattern:</strong> For financial documents, always extract BOTH the stated total (what the document claims) and a calculated total (sum of line items). If they disagree, flag the discrepancy. This is a self-correction mechanism — the model catches its own extraction errors AND catches genuine document errors (invoice with wrong total). The exam loves this pattern because it shows semantic validation beyond schema compliance.</p>
          <p><strong>Retry prompt structure:</strong> The exam tests whether retry prompts include all three components: (1) the original document, (2) the failed extraction, and (3) specific validation errors. Missing any one of these makes the retry less effective. The most common exam trap is a retry that says "try again" without including the specific errors — this forces the model to guess what went wrong.</p>
        `
      },
      {
        id: "t4.5",
        title: "4.5: Batch processing strategies",
        knowledge: [
          "Message Batches API: 50% cost savings, up to 24-hour processing, no latency SLA",
          "Appropriate for: overnight reports, weekly audits, nightly test generation. NOT for: blocking pre-merge checks",
          "Batch API does NOT support multi-turn tool calling within a single request",
          "custom_id fields correlate batch request/response pairs"
        ],
        skills: [
          "Match API to workflow: synchronous for blocking pre-merge, batch for overnight/weekly",
          "Calculate submission frequency based on SLA constraints (e.g., 4-hour windows for 30-hour SLA)",
          "Handle batch failures: resubmit only failed documents by custom_id with modifications",
          "Refine prompts on a sample set before batch-processing large volumes"
        ],
        keyPoint: "Batch API = 50% cheaper but up to 24h wait. Never use for blocking workflows. Use custom_id to track and resubmit failures.",
        details: `
          <h4>Message Batches API Overview</h4>
          <p>The Batch API offers <strong>50% cost savings</strong> in exchange for <strong>no latency guarantee</strong> (up to 24 hours processing time):</p>
          <pre><code>Synchronous API:          Message Batches API:
  ✅ Immediate response      ✅ 50% cost savings
  ✅ Guaranteed latency      ❌ Up to 24-hour processing
  ✅ Multi-turn tool use     ❌ No multi-turn tool calling
  ❌ Full price              ✅ Bulk processing</code></pre>

          <h4>When to Use Each API</h4>
          <pre><code>Synchronous API:                    Batch API:
  ✅ Pre-merge checks (blocking)       ✅ Overnight code quality reports
  ✅ Interactive code review            ✅ Weekly security audits
  ✅ Real-time user interactions        ✅ Nightly test generation
  ✅ Anything needing immediate results ✅ Monthly compliance scans
                                        ✅ Large dataset extraction</code></pre>
          <div class="wrong-answer">
            <strong>Critical wrong answer:</strong> Using the Batch API for pre-merge checks. These are BLOCKING workflows — the PR can't merge until the check completes. With up to 24-hour processing time, developers would wait all day for their PR check. Always use the synchronous API for blocking workflows.
          </div>

          <h4>No Multi-Turn Tool Calling</h4>
          <p>The Batch API <strong>cannot</strong> execute tools mid-request and return results. Each batch request is a single-turn interaction. If your workflow needs Claude to call a tool, see the result, then call another tool, you must use the synchronous API.</p>

          <h4>custom_id for Tracking</h4>
          <p>Each request in a batch has a <code>custom_id</code> that correlates the request with its response:</p>
          <pre><code>// Batch submission
[
  { custom_id: "invoice-001", messages: [...] },
  { custom_id: "invoice-002", messages: [...] },
  { custom_id: "invoice-003", messages: [...] }
]

// Batch results
[
  { custom_id: "invoice-001", result: { ... }, status: "success" },
  { custom_id: "invoice-002", result: { ... }, status: "success" },
  { custom_id: "invoice-003", status: "error", error: "context_exceeded" }
]

// Resubmit only failures
[
  { custom_id: "invoice-003", messages: [chunked_version] }
]</code></pre>

          <h4>Batch Submission Timing</h4>
          <p>Calculate submission frequency based on SLA constraints:</p>
          <pre><code>If your SLA says "results within 30 hours"
And batch processing takes UP TO 24 hours
Then submit every 6 hours maximum
(6h wait + 24h processing = 30h worst case)</code></pre>

          <h4>Prompt Refinement Before Batch</h4>
          <p>Always refine your prompt on a <strong>small sample set</strong> before running a large batch. If your prompt has issues, you'll waste an entire batch run (and money) on bad extractions:</p>
          <pre><code>1. Test prompt on 10-20 documents
2. Check quality, fix issues
3. Re-test on sample
4. Once satisfied, submit full batch of 10,000 documents</code></pre>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Batch API questions almost always test: (1) it's NEVER for blocking workflows, (2) it doesn't support multi-turn tool calling, and (3) use custom_id to resubmit failures. If a distractor suggests using Batch for pre-merge checks, that's always wrong.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 6: Data Extraction</span> Processing 10,000 invoices overnight → perfect batch use case. Use custom_id to track and resubmit failures.</p>
          <p><span class="scenario-tag">Scenario 5: CI/CD</span> Pre-merge checks must use synchronous API. Nightly code quality reports can use batch API.</p>

          <h4>Deep Insight: Batch API Constraints and Edge Cases</h4>
          <p>The exam tests nuanced understanding of batch API limitations:</p>
          <pre><code>Batch API CAN do:
  ✅ Single-turn message processing
  ✅ Tool use (single-turn only — model calls tool, you get result)
  ✅ System prompts and JSON schemas
  ✅ Different prompts per request in same batch
  ✅ Mixed model versions within a batch

Batch API CANNOT do:
  ❌ Multi-turn conversations within a request
  ❌ Agentic loops (tool_use → result → next tool_use)
  ❌ Streaming responses
  ❌ Guaranteed completion time (up to 24h)
  ❌ Cancel individual requests (only entire batch)</code></pre>
          <p><strong>The timing calculation trap:</strong> If your SLA says "results within 30 hours" and batch processing takes up to 24 hours, your maximum submission interval is <code>SLA - batch_max = 30 - 24 = 6 hours</code>. The exam may present this as a math problem where one distractor uses 30 hours (ignoring processing time) and another uses 24 hours (conflating SLA with processing).</p>
          <p><strong>The "prompt refinement before batch" principle:</strong> Always test your extraction prompt on 10-20 representative documents BEFORE submitting a 10,000-document batch. If the prompt has a 15% error rate on your sample, you'll waste an entire batch run processing 10,000 documents with a bad prompt. Refine iteratively on small samples, THEN batch. The exam tests this by offering "submit the full batch and fix errors afterward" as a distractor.</p>
          <p><strong>custom_id resubmission:</strong> When a batch completes with some failures, resubmit ONLY the failed requests by their custom_id — don't re-run the entire batch. This is both cheaper and faster.</p>
        `
      },
      {
        id: "t4.6",
        title: "4.6: Multi-instance and multi-pass review",
        knowledge: [
          "Self-review limitation: model retains reasoning context, less likely to question its own decisions in same session",
          "Independent review instances (without prior reasoning) are more effective for catching subtle issues",
          "Multi-pass: per-file local analysis + cross-file integration passes avoid attention dilution"
        ],
        skills: [
          "Use a second independent Claude instance to review generated code without generator's reasoning context",
          "Split large multi-file reviews into per-file passes + separate integration passes for cross-file data flow",
          "Run verification passes where model self-reports confidence alongside each finding"
        ],
        keyPoint: "Self-review is weak because the model retains its generation reasoning. Use a SEPARATE instance for code review.",
        details: `
          <h4>The Self-Review Problem</h4>
          <p>When Claude generates code and then reviews it in the same session, it retains the <strong>reasoning context</strong> from generation. It "remembers" why it made each decision, which makes it less likely to question those decisions:</p>
          <pre><code>Session A:
  Claude: "I'll use a recursive approach because [reasoning]"
  Claude: *generates recursive code*
  You:    "Now review your code for issues"
  Claude: "The code looks good. The recursive approach is 
           appropriate because [same reasoning as before]"
  // Claude is biased — it won't question its own reasoning</code></pre>

          <h4>The Solution: Independent Review Instance</h4>
          <pre><code>Session A (Generator):
  Claude: *generates code*

Session B (Reviewer — NO knowledge of Session A):
  Claude: "I see several issues with this code:
    1. Recursive approach has O(2^n) complexity for n > 30
    2. No base case guard for negative inputs
    3. Stack overflow risk for large inputs"
  // Session B has no bias — it evaluates the code on its merits</code></pre>
          <p>The reviewer has no access to the generator's reasoning, so it evaluates the code purely on what it sees.</p>

          <h4>Multi-Pass Review Architecture</h4>
          <p>For large multi-file changes, split reviews into focused passes:</p>
          <pre><code>Pass 1: Per-file local analysis
  ├── Review file_a.py for local issues
  ├── Review file_b.py for local issues
  └── Review file_c.py for local issues
  Each file reviewed in isolation — full attention on local issues

Pass 2: Cross-file integration analysis
  └── Review how files A, B, C interact
      - Data flow across modules
      - API contracts between services
      - Shared state consistency
      - Import chain correctness</code></pre>
          <p>Why split? <strong>Attention dilution.</strong> Reviewing 10 files in one pass means Claude gives less attention to each. Per-file passes ensure thorough local analysis. The integration pass catches cross-cutting issues.</p>

          <h4>Confidence-Based Review Routing</h4>
          <p>Have the model self-report confidence alongside each finding:</p>
          <pre><code>{
  "finding": "Potential SQL injection on line 42",
  "severity": "critical",
  "confidence": "high",
  "reasoning": "User input passed directly to query without sanitization"
}

{
  "finding": "Possible performance issue in loop",
  "severity": "warning",
  "confidence": "low",
  "reasoning": "Unclear if this loop runs on large datasets"
}</code></pre>
          <p>Route high-confidence findings directly to developers. Route low-confidence findings to a human reviewer for triage. This optimizes limited reviewer capacity.</p>

          <div class="wrong-answer">
            <strong>Wrong approaches to self-review:</strong>
            <ul>
              <li>"Use extended thinking for self-review" — still same session, same bias</li>
              <li>"Add 'review your code critically' to the prompt" — instruction doesn't eliminate reasoning bias</li>
              <li>"Use temperature 0 for review" — temperature doesn't address the reasoning context problem</li>
            </ul>
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Self-review questions always have the same answer: use a SEPARATE, INDEPENDENT instance without the generator's reasoning context. Any answer that tries to improve self-review within the same session (extended thinking, critical prompts, temperature changes) is wrong.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 5: CI/CD</span> CI pipelines should use a separate Claude instance for review — not the same session that generated the code.</p>
          <p><span class="scenario-tag">Scenario 2: Code Generation</span> After Claude generates code, use a separate instance for quality review before merging.</p>

          <h4>Deep Insight: Why Self-Review Fails and Independent Review Succeeds</h4>
          <p>The exam tests this at a deeper level than "use a separate session." Understanding WHY helps you handle variant questions:</p>
          <pre><code>Self-review fails because of ANCHORING BIAS:
  Session A generates: recursive fibonacci
  Session A reviews:   "Recursion is appropriate here because..."
  → The model is anchored to its own reasoning chain
  → It will defend its decisions, not challenge them

Independent review succeeds because of FRESH EVALUATION:
  Session B sees:      recursive fibonacci (no reasoning context)
  Session B reviews:   "This has O(2^n) complexity. Consider memoization."
  → No prior commitment to the recursive approach
  → Evaluates purely on code quality</code></pre>
          <p><strong>Extended thinking doesn't fix self-review:</strong> An exam trap offers "enable extended thinking for more thorough self-review." This sounds plausible but is wrong — extended thinking is still within the same session, so the anchoring bias persists. More thinking time doesn't help when the starting point is biased.</p>
          <p><strong>The Best-of-N connection:</strong> Multi-instance review is related to the Best-of-N pattern (t4.3 Deep Insight). Generate N independent solutions, then use an independent evaluator to select the best one. The evaluator must be separate from all generators — same principle as independent code review.</p>
          <p><strong>Multi-pass architecture:</strong> Per-file passes should run as independent instances (each file reviewed without knowledge of other files' review results). This prevents cross-contamination where a finding in file A biases the review of file B. The cross-file integration pass is the ONE place where findings from all files are combined.</p>
        `
      }
    ]
  },
  {
    id: "d5",
    domain: 5,
    title: "Context Management & Reliability",
    weight: 15,
    tagClass: "tag-d5",
    tasks: [
      {
        id: "t5.1",
        title: "5.1: Preserve critical information across long interactions",
        knowledge: [
          "Progressive summarization risks: condensing amounts, dates, percentages into vague summaries",
          "'Lost in the middle' effect: models process beginning and end reliably, may miss middle sections",
          "Tool results accumulate and consume tokens disproportionately (40+ fields when only 5 are relevant)",
          "Complete conversation history must be passed in subsequent API requests for coherence"
        ],
        skills: [
          "Extract transactional facts (amounts, dates, IDs, statuses) into a persistent 'case facts' block outside summarized history",
          "Trim verbose tool outputs to only relevant fields before they accumulate",
          "Place key findings at the beginning of aggregated inputs; use explicit section headers",
          "Require subagents to include metadata (dates, sources, methods) in structured outputs",
          "Modify upstream agents to return structured data (key facts, citations, scores) instead of verbose content"
        ],
        keyPoint: "Extract exact values into a 'case facts' block. Trim tool outputs to relevant fields. Put key findings at the start to avoid 'lost in the middle'.",
        details: `
          <h4>The Context Preservation Problem</h4>
          <p>In long conversations, critical information gets lost. Three mechanisms cause this:</p>
          <ol>
            <li><strong>Progressive summarization:</strong> When conversation history is summarized, exact values (amounts, dates, IDs) get condensed into vague phrases like "the customer's recent order" instead of "Order #ORD-67890 for $723.50 placed on 2024-01-15"</li>
            <li><strong>"Lost in the middle" effect:</strong> Claude processes the beginning and end of long inputs reliably, but may miss information buried in the middle sections</li>
            <li><strong>Token accumulation:</strong> Tool results pile up — an order lookup returns 40+ fields when you only need 5. Context fills with irrelevant data.</li>
          </ol>

          <h4>Solution 1: Case Facts Block</h4>
          <p>Extract transactional facts into a persistent block that stays in EVERY prompt, outside summarized history:</p>
          <pre><code>== CASE FACTS (do not summarize) ==
Customer: Jane Smith (C-12345)
Issue 1: Order #ORD-67890, $723.50, shipped 2024-01-15
  Status: Delivered damaged, return initiated
Issue 2: Order #ORD-12345, $89.99, shipped 2024-01-10
  Status: Wrong item, replacement requested
Verification: ID verified via security questions
================================</code></pre>
          <p>Even if the conversation history gets summarized, these exact values persist. No vague "the customer's order" — always the exact amount, date, and ID.</p>

          <h4>Solution 2: Trim Tool Outputs</h4>
          <p>Before tool results enter the conversation, strip irrelevant fields:</p>
          <pre><code>// RAW tool result (40+ fields)
{
  order_id: "ORD-67890",
  customer_id: "C-12345",
  created_at: "2024-01-15T10:30:00Z",
  items: [...],
  shipping_method: "standard",
  tracking_number: "1Z999AA10123456784",
  internal_sku: "SKU-789",
  warehouse_id: "WH-03",
  picking_zone: "B-14",
  pack_station: "PS-07",
  ... 30 more internal fields
}

// TRIMMED result (5 relevant fields)
{
  order_id: "ORD-67890",
  total: 723.50,
  status: "delivered",
  shipping_date: "2024-01-15",
  return_eligible: true
}</code></pre>

          <h4>Solution 3: Position Key Findings at Start</h4>
          <p>To combat "lost in the middle," place the most important information at the <strong>beginning</strong> of aggregated inputs:</p>
          <pre><code>== KEY FINDINGS (most important) ==
1. Revenue declined 12% QoQ
2. Three data sources show conflicting market share numbers
3. Regulatory filing deadline is January 31

== DETAILED RESULTS ==
[Section 1: Revenue analysis...]
[Section 2: Market share data...]
[Section 3: Regulatory requirements...]</code></pre>
          <p>Use explicit section headers and put summaries up top. Don't bury critical findings in page 5 of a 10-page aggregation.</p>

          <h4>Subagent Output Requirements</h4>
          <p>Require subagents to include metadata in their structured outputs:</p>
          <pre><code>{
  "finding": "Revenue grew 23% YoY",
  "source": "Q4 Financial Report",
  "date": "2024-01-15",
  "page": 12,
  "method": "Compared Q4 2023 vs Q4 2022 revenue figures"
}</code></pre>
          <p>Without this metadata, the coordinator can't verify claims, attribute sources, or assess reliability.</p>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Letting tool results accumulate unfiltered. After 10 order lookups with 40+ fields each, you've consumed thousands of tokens with mostly irrelevant data. Always trim before inserting into context.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Context management questions often describe a scenario where an agent "forgets" important details partway through a conversation. The answer involves: (1) case facts block for exact values, (2) trimming tool outputs, and/or (3) positioning key findings at the start. Never just "add more context" — manage what's already there.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 1: Customer Support</span> Multi-issue support sessions need case facts blocks to preserve each issue's details (order numbers, amounts, statuses).</p>
          <p><span class="scenario-tag">Scenario 3: Multi-Agent Research</span> Upstream agents return structured data (key facts, citations, scores) instead of verbose content, respecting downstream context budgets.</p>

          <h4>Deep Insight: "Lost in the Middle" Effect</h4>
          <p>Research shows that LLMs have a <strong>U-shaped attention curve</strong> — they process the <strong>beginning</strong> and <strong>end</strong> of long contexts reliably, but <strong>attention degrades for content in the middle</strong>:</p>
          <pre><code>Attention Level:
  HIGH ████████░░░░░░░░░░░░░░████████
       ↑ Beginning         Middle ↓         End ↑
       Strong attention   WEAK attention   Strong attention</code></pre>
          <p><strong>Practical implications:</strong></p>
          <ul>
            <li>Critical instructions, case facts, and key findings should go at the <strong>beginning</strong> of context</li>
            <li>The current user message naturally goes at the <strong>end</strong> (also high attention)</li>
            <li>Verbose tool results, historical conversation turns, and supporting details can go in the <strong>middle</strong> (where attention is lowest)</li>
          </ul>
          <p><strong>Mitigation strategies:</strong></p>
          <ol>
            <li><strong>Primacy placement:</strong> System prompt → case facts block → key findings at the very start</li>
            <li><strong>Explicit section headers:</strong> Break up long middle sections with clear delimiters (<code>== SECTION NAME ==</code>) to create attention anchors</li>
            <li><strong>Redundancy for critical data:</strong> Repeat the most important facts both at the start AND in the current query</li>
            <li><strong>Trim aggressively:</strong> Reduce middle-section volume — less content in the middle means less opportunity for lost attention</li>
          </ol>
          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a question describes an agent "missing" or "forgetting" information that IS in the context (not summarized away), the likely cause is Lost in the Middle — and the fix is repositioning that information to the beginning. This is different from context overflow (where info is actually gone). Lost in the Middle means the info is <em>present but not attended to</em>.
          </div>
          <div class="wrong-answer">
            <strong>Wrong fix:</strong> "Increase context window size" does not fix Lost in the Middle — it makes it WORSE by adding more middle content. The fix is restructuring, not expanding.
          </div>
        `
      },
      {
        id: "t5.2",
        title: "5.2: Escalation and ambiguity resolution patterns",
        knowledge: [
          "Escalation triggers: customer requests human, policy exceptions/gaps, inability to make progress",
          "Escalate immediately when customer explicitly demands it; offer resolution when issue is straightforward",
          "Sentiment-based escalation and self-reported confidence scores are UNRELIABLE proxies for complexity",
          "Multiple customer matches -> ask for more identifiers, don't select heuristically"
        ],
        skills: [
          "Add explicit escalation criteria with few-shot examples to system prompt",
          "Honor explicit customer requests for human agents immediately without investigating first",
          "Acknowledge frustration while offering resolution when within capability; escalate if customer reiterates",
          "Escalate when policy is ambiguous or silent on the specific request",
          "Ask for additional identifiers when multiple matches found, don't guess"
        ],
        keyPoint: "Customer says 'give me a human' -> escalate immediately. Sentiment analysis and confidence scores are unreliable for escalation decisions.",
        details: `
          <h4>Escalation Triggers</h4>
          <p>When should an agent escalate to a human? There are three clear triggers:</p>
          <ol>
            <li><strong>Customer explicitly requests a human</strong> — Escalate IMMEDIATELY. Don't try to investigate first.</li>
            <li><strong>Policy exception or gap</strong> — The customer's request isn't covered by existing policy.</li>
            <li><strong>Inability to make progress</strong> — The agent is stuck and can't resolve the issue.</li>
          </ol>

          <h4>Explicit Request = Immediate Escalation</h4>
          <pre><code>Customer: "I want to speak to a manager."

// WRONG
Agent: "Let me first look into your issue to see if I can help..."
// This ignores the customer's explicit request!

// RIGHT
Agent: "I'll connect you with a supervisor right away. Let me 
       compile a summary of your issue so they can help you quickly."
// Honors the request, prepares a handoff summary</code></pre>
          <p>This is non-negotiable. If the customer explicitly asks for a human, escalate. Don't investigate first.</p>

          <h4>The Frustration Nuance</h4>
          <p>When a customer is frustrated but hasn't explicitly asked for a human:</p>
          <pre><code>Customer: "This is ridiculous! I've been waiting for a week!"

Agent: "I completely understand your frustration — a week is 
       too long to wait. Let me look into this right now and 
       see what I can do to resolve it."
// Acknowledge frustration, offer resolution

Customer: "No, I just want to talk to someone!"

Agent: "Absolutely, I'll connect you with a supervisor now."
// NOW escalate — customer reiterated preference</code></pre>
          <p>Pattern: Acknowledge frustration → Offer resolution → If customer reiterates → Escalate.</p>

          <h4>What NOT to Use for Escalation Decisions</h4>
          <div class="wrong-answer">
            <strong>Unreliable escalation signals:</strong>
            <ul>
              <li><strong>Sentiment analysis:</strong> Angry customers may have simple issues. Calm customers may have complex ones. Sentiment doesn't predict case complexity.</li>
              <li><strong>Self-reported confidence scores:</strong> The model's confidence in its own assessment is not a reliable proxy for case difficulty or need for escalation.</li>
            </ul>
          </div>

          <h4>Policy Gap Escalation</h4>
          <pre><code>Customer: "Your competitor offers price matching. Can you match it?"

// Agent checks policy → policy only covers own-site price adjustments
// Policy is SILENT on competitor price matching

Agent: "I don't have the authority to match competitor prices, but 
       let me connect you with a specialist who can review this 
       with you."
// Escalate because policy doesn't cover this case</code></pre>
          <p>When policy is ambiguous or silent on the specific request, escalate rather than guess.</p>

          <h4>Multiple Customer Matches</h4>
          <pre><code>// Tool returns 3 customers named "John Smith"
// WRONG: Pick the one with the most recent order
// RIGHT: Ask for additional identifiers

Agent: "I found several accounts under that name. Could you 
       provide your email address or the last 4 digits of your 
       phone number so I can pull up the right account?"</code></pre>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Escalation questions have predictable answer patterns: (1) "Customer asks for human" → escalate immediately, (2) "Sentiment-based escalation" → wrong answer, (3) "Confidence-based escalation" → wrong answer, (4) "Policy doesn't cover this case" → escalate.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 1: Customer Support</span> This IS the primary scenario. The support agent must balance first-contact resolution (80% target) with knowing when to escalate.</p>

          <h4>Deep Insight: Escalation Decision Flowchart</h4>
          <p>The exam tests escalation decisions in nuanced scenarios. Use this complete flowchart:</p>
          <pre><code>Customer message received →
  Q: Did customer explicitly request a human?
    YES → ESCALATE IMMEDIATELY (don't investigate first)
    NO → Q: Is the request within policy?
      YES → Q: Can the agent resolve it?
        YES → RESOLVE (first-contact resolution)
        NO → Q: Is progress being made?
          YES → Continue attempting
          NO → ESCALATE (inability to progress)
      NO → Q: Is policy silent or ambiguous?
        YES → ESCALATE (policy gap)
        NO → DECLINE per policy, explain why

  At ANY point:
    Customer says "I want a human" → ESCALATE IMMEDIATELY
    Customer reiterates frustration after offer → ESCALATE</code></pre>
          <p><strong>The "investigate first" trap:</strong> When a customer says "give me a manager," the WRONG answer is "Let me look into your issue first to see if I can help." Even if the agent CAN resolve the issue, the customer has explicitly asked for a human. Investigating first ignores the customer's stated preference and makes the interaction worse. Always honor explicit requests immediately.</p>
          <p><strong>Frustration acknowledgment pattern:</strong> Customer is frustrated but hasn't asked for a human → acknowledge frustration + offer resolution. Customer reiterates "just give me a person" → escalate. The exam tests this two-step pattern specifically. The wrong answer escalates on the first sign of frustration (overreaction). The other wrong answer keeps offering resolution after the customer has reiterated (ignoring the customer).</p>
          <p><strong>Multiple customer matches:</strong> Never select a customer heuristically (e.g., "most recent order"). Always ask for additional identifiers. The exam presents this as a tempting shortcut that creates real risk — acting on the wrong account could expose another customer's data.</p>
        `
      },
      {
        id: "t5.3",
        title: "5.3: Error propagation in multi-agent systems",
        knowledge: [
          "Structured error context (failure type, attempted query, partial results, alternatives) enables intelligent recovery",
          "Distinguish access failures (timeouts) from valid empty results (no matches)",
          "Generic 'search unavailable' hides valuable context from coordinator",
          "Anti-patterns: silently suppressing errors OR terminating entire workflow on single failure"
        ],
        skills: [
          "Return structured error context: failure type, what was attempted, partial results, alternatives",
          "Distinguish access failures from valid empty results in error reporting",
          "Subagents handle local recovery for transient failures; propagate only unresolvable errors with partial results",
          "Annotate synthesis output with coverage gaps due to unavailable sources"
        ],
        keyPoint: "Never suppress errors silently. Never terminate the entire workflow on one failure. Return structured error context for intelligent recovery.",
        details: `
          <h4>Error Propagation in Multi-Agent Systems</h4>
          <p>When a subagent encounters an error, how it communicates that error to the coordinator determines the system's recovery capability.</p>

          <h4>The Two Anti-Patterns</h4>
          <div class="wrong-answer">
            <strong>Anti-pattern 1: Silent error suppression</strong>
            <pre><code>// Subagent encounters database timeout
// Returns empty results as if query succeeded
return { results: [], status: "success" }
// Coordinator thinks "no results found" — WRONG!
// Actually: database was down</code></pre>
          </div>
          <div class="wrong-answer">
            <strong>Anti-pattern 2: Terminate entire workflow</strong>
            <pre><code>// One subagent fails
// Entire research pipeline stops
throw new Error("Web search failed — aborting all research")
// Lost: partial results from other subagents that DID succeed</code></pre>
          </div>

          <h4>The Correct Pattern: Structured Error Context</h4>
          <pre><code>// Subagent returns structured error information
{
  status: "partial_failure",
  error: {
    type: "transient",
    source: "web_search",
    attempted: "Search for 'AI market trends 2024'",
    message: "Search API timeout after 30s",
    isRetryable: true
  },
  partial_results: [
    { title: "AI Market Report", url: "...", snippet: "..." }
    // One result retrieved before timeout
  ],
  alternatives: [
    "Retry with simplified query",
    "Use cached results from previous search",
    "Try alternative search provider"
  ]
}</code></pre>
          <p>With this structured context, the coordinator can make intelligent decisions: retry the search, use partial results, try an alternative, or work around the gap.</p>

          <h4>Access Failure vs Valid Empty Result (Revisited)</h4>
          <p>This distinction is tested repeatedly across multiple task statements because it's so important:</p>
          <pre><code>// Access failure
{ isError: true, type: "transient", 
  message: "Database connection refused" }
// → Coordinator should retry or use alternative source

// Valid empty result
{ isError: false, results: [], 
  message: "Query returned 0 matching records" }
// → Coordinator should report "no data available" (not retry)</code></pre>

          <h4>Local Recovery Before Propagation</h4>
          <p>Subagents should handle local recovery for transient failures BEFORE propagating to the coordinator:</p>
          <pre><code>Subagent error handling:
1. Attempt operation
2. If transient failure → retry 2-3 times locally
3. If still failing → propagate to coordinator with:
   - What was attempted
   - Number of retries
   - Partial results (if any)
   - Suggested alternatives
4. Only propagate UNRESOLVABLE errors</code></pre>

          <h4>Coverage Gap Annotation</h4>
          <p>When synthesizing results and some sources were unavailable, annotate the gaps:</p>
          <pre><code>== Research Synthesis ==
Section 1: Market Analysis [Complete]
  Sources: Bloomberg, Reuters, SEC filings

Section 2: Competitor Analysis [PARTIAL — gap noted]
  Sources: Public filings only
  Gap: Unable to access Gartner report (API timeout)
  Impact: Market share estimates may be incomplete

Section 3: Regulatory Outlook [Complete]
  Sources: Federal Register, industry publications</code></pre>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Error propagation questions always have the same answer structure: (1) return structured error context, (2) include what was attempted + partial results + alternatives, (3) never suppress silently, (4) never terminate the entire workflow. If a distractor mentions "return empty results" or "abort the pipeline," it's wrong.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 3: Multi-Agent Research</span> Web search subagent times out → returns partial results + structured error → coordinator decides whether to retry or work with what's available.</p>
          <p><span class="scenario-tag">Scenario 1: Customer Support</span> Backend service unavailable → agent reports the issue to the customer and escalates rather than silently returning incorrect data.</p>

          <h4>Deep Insight: Error Recovery Strategy Selection</h4>
          <p>The exam tests which recovery strategy to use based on the error type and system state:</p>
          <pre><code>Error Type → Recovery Strategy:

Transient (timeout, 503):
  1. Subagent retries locally (2-3 attempts)
  2. If still failing → propagate with partial results
  3. Coordinator: retry with simplified query OR use alternative source

Validation (bad input):
  1. Subagent does NOT retry (same input = same failure)
  2. Propagate with error details + the invalid input
  3. Coordinator: fix input and resubmit to same subagent

Business (policy violation):
  1. Subagent does NOT retry
  2. Propagate with limit/threshold that was exceeded
  3. Coordinator: try alternative workflow or escalate

Permission (access denied):
  1. Subagent does NOT retry
  2. Propagate immediately
  3. Coordinator: escalate to human or use alternative source</code></pre>
          <p><strong>The partial results principle:</strong> Even when a subagent fails, it should include any data it managed to collect before the failure. "I searched 3 of 5 databases before timing out, here are results from the 3 that succeeded" is vastly more useful than "search failed." The coordinator can decide whether partial data is sufficient or if missing sources are critical.</p>
          <p><strong>Coverage gap annotation:</strong> When synthesis proceeds with incomplete data (because a source was unavailable), the final report MUST annotate which sections have coverage gaps and why. "Section 2: PARTIAL — Gartner report unavailable due to API timeout. Market share estimates based on public filings only." Without this annotation, the consumer of the report doesn't know which conclusions are well-supported and which are based on incomplete data.</p>
        `
      },
      {
        id: "t5.4",
        title: "5.4: Manage context in large codebase exploration",
        knowledge: [
          "Context degradation: models give inconsistent answers and reference 'typical patterns' instead of specific discovered classes",
          "Scratchpad files persist key findings across context boundaries",
          "Subagent delegation isolates verbose exploration; main agent coordinates high-level understanding",
          "Structured state persistence for crash recovery: agents export state, coordinator loads manifest on resume"
        ],
        skills: [
          "Spawn subagents for specific investigations while main agent preserves coordination",
          "Maintain scratchpad files recording key findings; reference them for subsequent questions",
          "Summarize findings from one phase before spawning sub-agents for the next, injecting summaries",
          "Design crash recovery using structured agent state exports (manifests)",
          "Use /compact to reduce context during extended exploration sessions"
        ],
        keyPoint: "Long session getting inconsistent? Use scratchpad files for persistence. Use /compact. Delegate verbose exploration to subagents.",
        details: `
          <h4>Signs of Context Degradation</h4>
          <p>How do you know your context is getting exhausted?</p>
          <ul>
            <li>Claude gives <strong>inconsistent answers</strong> about things it correctly identified earlier</li>
            <li>Claude references <strong>"typical patterns"</strong> instead of specific classes/functions it already discovered</li>
            <li>Claude <strong>re-reads files</strong> it already read, or asks about things already established</li>
            <li>Quality of responses <strong>degrades gradually</strong> over the session</li>
          </ul>

          <h4>Solution 1: Scratchpad Files</h4>
          <p>Write key findings to a scratchpad file that persists across context boundaries:</p>
          <pre><code>// scratchpad.md
# Codebase Investigation Notes

## Architecture
- Entry point: src/index.ts
- Router: src/routes/index.ts (express-based)
- Auth: src/middleware/auth.ts (JWT, 30min expiry)

## Key Findings
- Database: PostgreSQL via Prisma ORM
- User model at src/models/user.ts (47 fields!)
- Payment processing: src/services/payment.ts
  - Uses Stripe API
  - Webhook handler at src/routes/webhooks.ts

## Open Questions
- How does the cache invalidation work?
- What triggers the nightly batch job?</code></pre>
          <p>When context degrades or you use <code>/compact</code>, reference the scratchpad to restore key context.</p>

          <h4>Solution 2: /compact Command</h4>
          <p><code>/compact</code> compresses the conversation context during long sessions. Use it proactively when you notice the session getting long, BEFORE degradation starts. After compacting, reference your scratchpad to ensure key findings aren't lost.</p>

          <h4>Solution 3: Subagent Delegation</h4>
          <p>The most powerful pattern: delegate verbose exploration to subagents while the main agent stays focused on coordination:</p>
          <pre><code>Main Agent (coordinator — clean context):
  "Investigate the auth system"
    → Spawns subagent for auth investigation
    ← Receives structured summary: "JWT-based, 30min expiry, 
       refresh tokens in Redis, middleware at auth.ts:45"

  "Investigate the payment system"  
    → Spawns subagent for payment investigation
    ← Receives structured summary: "Stripe integration, 
       webhook handler at webhooks.ts, retry logic at payment.ts:120"

  Main agent retains SUMMARIES (clean, small)
  Subagents handled the verbose file reading (isolated context)</code></pre>

          <h4>Structured State for Crash Recovery</h4>
          <p>For critical long-running investigations, design crash recovery using structured state exports:</p>
          <pre><code>{
  "phase": "analysis",
  "completed_modules": ["auth", "payment", "user"],
  "pending_modules": ["notification", "logging"],
  "key_findings": { ... },
  "open_questions": [ ... ],
  "timestamp": "2024-01-15T10:30:00Z"
}
// Save to manifest.json → coordinator loads on resume</code></pre>

          <h4>The Incremental Strategy</h4>
          <pre><code>1. Explore with subagents (isolated verbose context)
2. Record findings in scratchpad (persistent file)
3. Use /compact when context gets long
4. Reference scratchpad after compaction
5. Continue investigation with clean context</code></pre>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Continuing a long exploration session without any context management. After reading 50+ files, the context is exhausted and Claude starts giving vague, inconsistent answers. Use scratchpads, /compact, and subagent delegation proactively.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If the scenario describes "Claude giving inconsistent answers" or "referencing typical patterns instead of specific findings," the answer involves context management: scratchpad files, /compact, or subagent delegation. These are the three tools for fighting context degradation.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 4: Developer Productivity</span> This IS the primary scenario. Long codebase exploration sessions need scratchpads, /compact, and subagent delegation to stay effective.</p>
          <p><span class="scenario-tag">Scenario 3: Multi-Agent Research</span> The coordinator delegates verbose research to subagents, maintaining clean coordination context.</p>

          <h4>Deep Insight: Advanced Context Management Techniques</h4>
          <p><strong>The HANDOFF.md Pattern:</strong> Before ending a session or when context is nearly full, ask Claude to write a HANDOFF.md file summarizing: current progress, approaches tried (what worked and failed), open issues, and recommended next steps. The next session reads this file instead of relying on compaction quality. This is far more reliable than <code>--resume</code> with stale tool outputs.</p>
          <p><strong>The Compaction Trap:</strong> Default <code>/compact</code> drops architecture decisions because it prioritizes "re-readable" content (tool outputs, code). Fix: add a <strong>Compact Instructions</strong> section to CLAUDE.md specifying what to preserve (architectural decisions, API design choices, failure modes discovered).</p>
          <p><strong>The /context Command:</strong> Use <code>/context</code> to see your actual token budget breakdown — this reveals hidden costs like MCP tool definitions eating 10-20K tokens. Essential for diagnosing "why is my context full?" situations.</p>
          <p><strong>Five-Layer Context Strategy:</strong></p>
          <ul>
            <li><strong>Always resident</strong> (CLAUDE.md) — project contract, hard constraints</li>
            <li><strong>Path-loaded</strong> (.claude/rules/) — language/file-type specific</li>
            <li><strong>On-demand</strong> (Skills) — workflows, loaded only when triggered</li>
            <li><strong>Isolated</strong> (Subagents) — bulk exploration, only summaries return</li>
            <li><strong>Outside context</strong> (Hooks) — deterministic scripts, zero token cost</li>
          </ul>
        `
      },
      {
        id: "t5.5",
        title: "5.5: Human review workflows and confidence calibration",
        knowledge: [
          "97% overall accuracy may mask poor performance on specific document types or fields",
          "Stratified random sampling measures error rates in high-confidence extractions",
          "Field-level confidence scores calibrated using labeled validation sets",
          "Validate accuracy by document type AND field before automating"
        ],
        skills: [
          "Implement stratified random sampling of high-confidence extractions for ongoing error measurement",
          "Analyze accuracy by document type and field to verify consistent performance before reducing review",
          "Output field-level confidence scores; calibrate review thresholds using labeled validation sets",
          "Route low-confidence or ambiguous extractions to human review, prioritizing limited reviewer capacity"
        ],
        keyPoint: "Don't trust aggregate accuracy (97%). Break down by document type and field. Use stratified sampling to catch hidden error patterns.",
        details: `
          <h4>The Aggregate Accuracy Trap</h4>
          <p>Your extraction system shows 97% overall accuracy. Sounds great, right? But what if:</p>
          <pre><code>Accuracy by document type:
  Invoices:    99.5%  ← Great!
  Receipts:    98.0%  ← Good
  Contracts:   97.0%  ← Okay
  Handwritten: 71.0%  ← Terrible!
  
Aggregate: 97% (because invoices are 80% of volume)
But handwritten documents are completely unreliable!</code></pre>
          <p>The 97% aggregate masks a serious problem. You'd automate the whole pipeline thinking it works, then discover catastrophic failures on certain document types.</p>

          <h4>Stratified Analysis: Document Type AND Field</h4>
          <p>Break down accuracy by two dimensions:</p>
          <pre><code>             | vendor | amount | date  | items |
─────────────┼────────┼────────┼───────┼───────┤
Invoices     | 99.9%  | 99.5%  | 99.0% | 98.0% |
Receipts     | 98.0%  | 97.0%  | 95.0% | 90.0% |
Contracts    | 97.0%  | N/A    | 94.0% | N/A   |
Handwritten  | 85.0%  | 71.0%  | 68.0% | 55.0% |</code></pre>
          <p>Now you can see: handwritten items extraction is only 55% accurate. You'd route those to human review while automating the rest.</p>

          <h4>Stratified Random Sampling</h4>
          <p>Even for high-confidence extractions, sample regularly to catch drift:</p>
          <pre><code>Sampling strategy:
  1. Sample 5% of ALL extractions randomly
  2. Sample 20% of "edge case" document types
  3. Sample 50% of low-confidence extractions
  4. Human reviewer checks each sample
  5. Track error rates over time by stratum</code></pre>
          <p>This catches problems that might develop over time (document format changes, new edge cases) before they affect a large volume.</p>

          <h4>Field-Level Confidence Scores</h4>
          <pre><code>{
  "vendor": { "value": "Acme Corp", "confidence": 0.98 },
  "amount": { "value": 1234.50, "confidence": 0.95 },
  "date":   { "value": "2024-01-15", "confidence": 0.92 },
  "fax":    { "value": "555-0100", "confidence": 0.31 }
}
// Route to human review when ANY field drops below threshold
// Calibrate thresholds using labeled validation sets</code></pre>
          <p>Calibrate confidence thresholds using labeled validation sets — don't just trust the model's self-reported confidence at face value.</p>

          <h4>Human Review Routing</h4>
          <pre><code>High confidence (all fields > 0.9):
  → Auto-accept with spot-check sampling

Mixed confidence (some fields < 0.9):
  → Route to human for low-confidence fields only

Low confidence (multiple fields < 0.7):
  → Full human review

Document type never seen before:
  → Always route to human until accuracy validated</code></pre>
          <p>This optimizes limited reviewer capacity — humans focus on the cases most likely to contain errors.</p>

          <div class="wrong-answer">
            <strong>Wrong approach:</strong> Using aggregate accuracy (97%) to justify automating all extraction. Always verify accuracy by document type AND by field before reducing human review. A 97% aggregate can hide 71% accuracy on specific types.
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> If a question mentions "97% accuracy" and asks about reducing human review, the correct answer involves breaking down by document type and field first. Any answer that says "97% is sufficient to automate everything" is wrong.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 6: Data Extraction</span> This IS the primary scenario. Extraction systems must validate accuracy at granular levels before automating human review away.</p>

          <h4>Deep Insight: The Automation Confidence Ladder</h4>
          <p>The exam tests when it's safe to reduce human review. Use this ladder:</p>
          <pre><code>Level 1: Full human review (new system, unknown accuracy)
  → ALL extractions reviewed by humans
  → Build labeled validation set (500+ documents)

Level 2: Stratified review (accuracy validated by type)
  → High-accuracy types (invoices 99.5%): spot-check 5%
  → Medium-accuracy types (receipts 95%): review 20%
  → Low-accuracy types (handwritten 71%): review 100%

Level 3: Confidence-based routing (calibrated thresholds)
  → High confidence (all fields > 0.9): auto-accept + 5% sampling
  → Mixed confidence (some < 0.9): route low-confidence fields only
  → Low confidence (multiple < 0.7): full human review

Level 4: Autonomous with monitoring (mature system)
  → Ongoing stratified random sampling (5% of all)
  → Drift detection: alert if error rate increases
  → New document types: ALWAYS start at Level 1</code></pre>
          <p><strong>The "97% trap" is the most common exam pattern in D5:</strong> A question states "the system achieves 97% overall accuracy." The wrong answer says this is sufficient for full automation. The right answer says you must break down by document type AND by field. 97% aggregate can mask 71% accuracy on specific types. The exam uses this exact pattern repeatedly.</p>
          <p><strong>Confidence calibration:</strong> Field-level confidence scores must be calibrated against a labeled validation set — you can't trust the model's self-reported confidence at face value. If the model says 95% confident but is only correct 80% of the time at that threshold, the threshold is miscalibrated. Calibration requires periodic revalidation as document distributions shift.</p>
          <p><strong>New document types reset to Level 1:</strong> Even if your system handles invoices at 99.5%, a new document type (e.g., purchase orders) must start with full human review until accuracy is independently validated for that type.</p>
        `
      },
      {
        id: "t5.6",
        title: "5.6: Preserve provenance and handle uncertainty in multi-source synthesis",
        knowledge: [
          "Source attribution is lost when summarization compresses findings without claim-source mappings",
          "Structured claim-source mappings must be preserved and merged through synthesis steps",
          "Conflicting stats from credible sources: annotate conflicts with attribution, don't arbitrarily pick one",
          "Require publication/collection dates to prevent temporal misinterpretation"
        ],
        skills: [
          "Require subagents to output claim-source mappings (URLs, doc names, excerpts) preserved through synthesis",
          "Structure reports distinguishing well-established findings from contested ones",
          "Include conflicting values with explicit annotations; let coordinator reconcile before synthesis",
          "Require publication dates in outputs for correct temporal interpretation",
          "Render different content types appropriately (financial as tables, news as prose, technical as lists)"
        ],
        keyPoint: "Never lose source attribution during synthesis. Preserve conflicting data with annotations. Always include publication dates.",
        details: `
          <h4>The Attribution Problem</h4>
          <p>When a multi-agent system synthesizes findings from multiple sources, source attribution is easily lost:</p>
          <pre><code>// Subagent 1 returns:
"Revenue grew 23% (Bloomberg, Jan 2024)"
"Revenue grew 19% (Reuters, Dec 2023)"

// Bad synthesis (attribution lost):
"Revenue grew approximately 20%"
// Which source? What date? Why the discrepancy? All lost.

// Good synthesis (attribution preserved):
"Revenue growth estimates vary by source:
  - Bloomberg (Jan 2024): 23% YoY growth
  - Reuters (Dec 2023): 19% YoY growth
  Note: Discrepancy may reflect different reporting periods"</code></pre>

          <h4>Claim-Source Mappings</h4>
          <p>Require subagents to output structured claim-source mappings that survive the synthesis pipeline:</p>
          <pre><code>// Subagent output format
{
  "claims": [
    {
      "claim": "Revenue grew 23% YoY",
      "source": "Bloomberg Terminal",
      "url": "https://bloomberg.com/...",
      "date": "2024-01-15",
      "excerpt": "Full-year revenue reached $4.2B, up 23% from..."
    },
    {
      "claim": "Market share reached 34%",
      "source": "Gartner Report Q4 2023",
      "url": null,
      "date": "2023-12-20",
      "excerpt": "Company X maintained leading position with 34%..."
    }
  ]
}</code></pre>
          <p>These mappings must be <strong>preserved and merged</strong> through each synthesis step — not collapsed into unattributed prose.</p>

          <h4>Handling Conflicting Data</h4>
          <p>When credible sources conflict, DON'T arbitrarily pick one:</p>
          <pre><code>// WRONG — picked one source arbitrarily
"Market share is 34%"

// RIGHT — annotated conflict with attribution
"Market share estimates:
  Gartner (Q4 2023): 34%
  IDC (Q4 2023): 31%
  Note: Discrepancy likely due to different market 
  definitions (Gartner includes cloud; IDC does not)"</code></pre>
          <p>The coordinator should reconcile or annotate conflicts before the final synthesis, not sweep them under the rug.</p>

          <h4>Publication Dates Are Critical</h4>
          <p>Without dates, temporal misinterpretation is inevitable:</p>
          <pre><code>// Without dates — misleading
"Revenue is $4.2B and growing 23%"
// Is this current? From 2022? From a forecast?

// With dates — clear
"Revenue was $4.2B in FY2023 (Bloomberg, Jan 2024), 
representing 23% growth over FY2022"</code></pre>
          <p>Always require publication/collection dates in subagent outputs. This prevents stale data from being presented as current.</p>

          <h4>Content-Type Specific Rendering</h4>
          <p>Different content types should be rendered appropriately:</p>
          <pre><code>Financial data  → Tables with precise numbers
News/events     → Chronological prose with dates
Technical specs → Structured lists with values
Market analysis → Comparison tables with source attribution
Mixed content   → Appropriate format for each section</code></pre>

          <h4>Well-Established vs Contested Findings</h4>
          <pre><code>== Well-Established (multiple sources agree) ==
- Company revenue: $4.2B (Bloomberg, Reuters, SEC filing — all agree)
- Employee count: ~12,000 (annual report)

== Contested (sources disagree) ==
- Market share: 31-34% (see source comparison above)
- Growth forecast: 15-25% (analyst estimates vary widely)</code></pre>
          <p>Distinguish findings where sources agree from those where they disagree. This builds trust and helps readers calibrate their confidence.</p>

          <div class="wrong-answer">
            <strong>Wrong approaches:</strong>
            <ul>
              <li>Summarizing findings without sources ("Revenue grew about 20%")</li>
              <li>Picking one conflicting source without explanation</li>
              <li>Omitting dates from synthesized claims</li>
              <li>Mixing current and outdated data without labels</li>
            </ul>
          </div>

          <div class="exam-tip">
            <strong>Exam Tip:</strong> Provenance questions test three things: (1) preserve claim-source mappings through synthesis, (2) annotate conflicts rather than picking arbitrarily, (3) always include publication dates. If a distractor suggests "summarize findings into a clean paragraph," that's wrong — it loses attribution.
          </div>

          <h4>Scenario Connections</h4>
          <p><span class="scenario-tag">Scenario 3: Multi-Agent Research</span> This IS the primary scenario. Research reports must preserve source attribution, handle conflicts transparently, and include dates for every claim.</p>

          <h4>Deep Insight: The Attribution Preservation Pipeline</h4>
          <p>The exam tests how attribution survives through the multi-agent synthesis pipeline:</p>
          <pre><code>Stage 1: Research subagent outputs
  { claim: "Revenue $4.2B", source: "Bloomberg", date: "2024-01-15",
    url: "https://...", excerpt: "Full-year revenue reached..." }

Stage 2: Coordinator aggregates (attribution preserved)
  findings = [subagent_1.claims, subagent_2.claims, ...]
  // Each claim still has its source mapping

Stage 3: Synthesis subagent receives attributed findings
  prompt: "Synthesize these findings. PRESERVE source attribution.
           For each claim, include [Source, Date]."

Stage 4: Final report (attribution visible to reader)
  "Revenue was $4.2B (Bloomberg, Jan 2024), representing
   23% growth (Reuters, Dec 2023)."

ANTI-PATTERN (attribution lost at Stage 3):
  prompt: "Summarize these research findings into a clean paragraph."
  output: "Revenue grew approximately 20%"
  // Source? Date? Precision? All lost.</code></pre>
          <p><strong>The "clean paragraph" trap:</strong> When the exam describes a synthesis prompt that asks for a "clean" or "polished" summary, this is often the wrong answer. Clean summaries tend to drop source attribution, conflate conflicting data into averages, and omit dates. The correct approach preserves the messy reality: conflicts, multiple sources, date ranges.</p>
          <p><strong>Conflicting data handling rule:</strong> When Bloomberg says 23% and Reuters says 19%, NEVER average them (21%) or pick one. Always include both with attribution and an annotation explaining the likely reason for the discrepancy (different reporting periods, different market definitions, different methodologies). The exam tests this by offering "report the average" as a plausible distractor.</p>
          <p><strong>Publication dates prevent temporal confusion:</strong> "Revenue is $4.2B" is dangerous without a date — readers assume it's current. "Revenue was $4.2B in FY2023 (reported Jan 2024)" is clear. The exam specifically tests whether you require dates in subagent outputs to prevent stale data from being presented as current.</p>
        `
      }
    ]
  }
];
