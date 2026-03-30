# Study Plan for Claude Certified Architect – Foundations

Exam: multiple choice, 720/1000 to pass, 5 domains, 4 scenarios randomly picked from 6.

---

## Stage 0. Diagnostic (30 minutes)

**Goal:** identify your current level and weak areas before starting.

**Actions:**

1. Take the 15-minute Diagnostic → https://claudecertificationguide.com/diagnostic
2. Record your score for each of the 5 domains
3. Read the Official Exam Guide PDF (`...Exam+Guide.pdf` in the sharepoint folder) — sections: Introduction, Exam Scenarios, Content Outline

**Stage outcome:** a list of domains ranked from weakest to strongest. Complete all subsequent stages in full, but spend more time on weak domains.

---

## Stage 1. Foundation: Anthropic Academy courses (8–12 hours)

**Goal:** build a base in API, Claude Code, MCP, and Skills.

### 1.1 Claude Code in Action

- Link: https://anthropic.skilljar.com/claude-code-in-action
- Covers: CLAUDE.md, custom commands, context, MCP servers in Claude Code, hooks, SDK
- Domains: 1, 2, 3

### 1.2 Building with the Claude API

- Link: https://anthropic.skilljar.com/claude-with-the-anthropic-api
- Covers: agentic loops, `stop_reason`, `tool_use`, `tool_choice`, JSON schemas, system prompts, Message Batches API
- Domains: 1, 2, 4

### 1.3 Introduction to Model Context Protocol

- Link: https://anthropic.skilljar.com/introduction-to-model-context-protocol
- Covers: tools, resources, prompts, `isError`, tool descriptions, MCP servers in Python
- Domains: 2

### 1.4 Introduction to Agent Skills

- Link: https://anthropic.skilljar.com/introduction-to-agent-skills
- Covers: SKILL.md, `context: fork`, `allowed-tools`, `argument-hint`
- Domains: 3

### 1.5 Introduction to Subagents

- Link: https://anthropic.skilljar.com/introduction-to-subagents
- Covers: how sub-agents work, creating custom sub-agents (`/agents`), designing effective subagents, context delegation
- Domains: 1, 5

### 1.6 Model Context Protocol: Advanced Topics

- Link: https://anthropic.skilljar.com/model-context-protocol-advanced-topics
- Covers: sampling, transport (stdio, StreamableHTTP), production scaling
- Domains: 2

**Stage outcome:** all 6 courses completed, all built-in quizzes passed. Cumulative exam readiness: ~25% (introductory coverage of all 5 domains).

---

## Stage 2. Theory: Community Study Guide (10–15 hours)

**Goal:** close the gaps left by courses across all 5 domains.

- Link: https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.MD

### Chapter study order

| Chapter | Topic | Gaps covered |
|---|---|---|
| Ch. 1 | Claude API Fundamentals | Review of basics |
| Ch. 2 | Tools and Tool Use | Domain 2: JSON schemas, error handling |
| Ch. 3 | Claude Agent SDK | Domain 1: `AgentDefinition`, `Task` tool, `allowedTools`, `fork_session` |
| Ch. 4 | Model Context Protocol | Domain 2: `.mcp.json`, resources, scoping |
| Ch. 5 | Claude Code Configuration | Domain 3: `@import`, `.claude/rules/`, `/memory`, CI/CD flags |
| Ch. 6 | Prompt Engineering | Domain 4: few-shot, explicit criteria, validation loops |
| Ch. 7 | Message Batches API | Domain 4: `custom_id`, SLA, failure handling |
| Ch. 8 | Task Decomposition | Domain 1+4: prompt chaining, multi-pass review |
| Ch. 9 | Escalation & Human-in-the-Loop | Domain 5: triggers, handoff protocols |
| Ch. 10 | Error Handling in Multi-agent Systems | Domain 5: error categories, anti-patterns |
| Ch. 11 | Context Management | Domain 5: fact extraction, scratchpad, `/compact` |
| Ch. 12 | Preserving Provenance | Domain 5: claim-source mappings, conflicting data |
| Ch. 13 | Built-in Tools | Domain 2: Grep vs Glob vs Read, selection criteria |

**Stage outcome:** all 13 chapters read, 60+ questions from the guide solved with error analysis. Cumulative exam readiness: ~45% (deep theory across all 5 domains).

---

## Stage 3. Visual reinforcement: The Architect's Playbook (1–2 hours)

**Goal:** reinforce architectural patterns through visual diagrams and schemas.

- Link: https://drive.google.com/file/d/1luC0rnrET4tDYtS7xe5jUxMDZA-4qNf-/view
- Format: PDF, 27 pages with diagrams

Visual reference for production patterns and anti-patterns across 4 exam scenarios:

| Section | Reinforces topics |
|---|---|
| Structured Data Extraction | Resilient schemas, `calculated_total` vs `stated_total`, null handling (Tasks 4.3, 4.4) |
| Customer Support Orchestration | Escalation handoff, application-layer intercepts vs prompts, async session resumption (Tasks 1.4, 1.5, 5.2) |
| Developer Productivity | `fork_session` for A/B, scratchpad pattern, session resumption (Tasks 1.7, 5.4) |
| Multi-Agent Systems | Coordinator-subagent parallelization, `tool_choice` enforcement, structured intermediates (Tasks 1.2, 1.3, 2.3) |
| Reference Matrix + Blueprint | Summary cheat sheet: constraint → solution across all 4 domains |

**Stage outcome:** visual understanding of key patterns that text guides explain abstractly. Cumulative exam readiness: ~50% (theory reinforced with visual schemas).

---

## Stage 4. Intensive course: Architecture Exam Prep (12–16 hours)

**Goal:** deep dive into each domain with structured daily modules, targeted exercises, and a large bank of exam-format questions.

- Location: https://git.epam.com/epm-ease/anthropic-cert/arch-examp-prep

### Course modules (7 days × ~2 hours reading + ~2 hours exercises, all paths relative to `arch-examp-prep-main/`)

| Day | File | Topic | Domains |
|---|---|---|---|
| 1 | `course/01_day1_agentic_loops.md` | Agentic loop lifecycle, task decomposition, hooks, programmatic enforcement | D1 |
| 2 | `course/02_day2_multiagent.md` | Multi-agent systems, coordinator-subagent, parallelization | D1 |
| 3 | `course/03_day3_claude_code.md` | CLAUDE.md hierarchy, rules, skills, plan mode, CI/CD flags | D3 |
| 4 | `course/04_day4_prompt_engineering.md` | Few-shot prompting, tool_use, structured output, Batches API | D4 |
| 5 | `course/05_day5_tool_design_mcp.md` | Tool descriptions, MCP integration, isError, tool_choice | D2 |
| 6 | `course/06_day6_context_reliability.md` | Context preservation, escalation, error propagation, provenance | D5 |
| 7 | `course/07_day7_integration_exam.md` | Integration review, anti-patterns, exam strategy | All |

**Tip:** start with the days covering your weakest domains from the Diagnostic.

### Practice question bank (256 questions, all paths relative to `arch-examp-prep-main/`)

| File | Questions | Format |
|---|---|---|
| `exam-prep/domain-questions/1-agentic-architecture.md` | 15 | Domain-focused (do after Day 1) |
| `exam-prep/domain-questions/2-tool-design-mcp.md` | 10 | Domain-focused (do after Day 5) |
| `exam-prep/domain-questions/3-claude-code-config.md` | 12 | Domain-focused (do after Day 3) |
| `exam-prep/domain-questions/4-prompt-engineering.md` | 12 | Domain-focused (do after Day 4) |
| `exam-prep/domain-questions/5-context-management.md` | 9 | Domain-focused (do after Day 6) |
| `exam-prep/exam-questions-1.md` | 87 | Full mock exam (do after Day 7) |
| `exam-prep/exam-questions-2.md` | 52 | Full mock exam (do after Day 7) |
| `exam-prep/exam-questions-3.md` | 59 | Full mock exam (do after Day 7) |

### Learning cards & quick reference (all paths relative to `arch-examp-prep-main/`)

- 37 flashcards across 5 domains: `study-guides/learning-cards/domain-*.md`
- Quick reference (anti-patterns + best practices mind maps): `study-guides/learning-cards/quick-reference.md`
- HTML and PDF versions for portable review: `study-guides/learning-cards.html`, `study-guides/learning-cards.pdf`

**Stage outcome:** all 7 course modules completed with exercises, 58 domain questions + 198 mock exam questions solved with error analysis. Learning cards reviewed. Cumulative exam readiness: ~70% (structured practice with exam-format questions).

---

## Stage 5. Practice: hands-on exercises (35–55 hours)

**Goal:** convert knowledge into practical skills through hands-on projects.

### 5.1 Interactive tutoring with Claude (prompts from @hooeem on X/Twitter)

- Source: https://x.com/hooeem/status/2033198345045336559
- 5 ready-made prompts (one per domain) — copy from the article and paste into Claude to get an interactive lesson covering all task statements, exam traps, practice scenarios, a mini-exam, and a build exercise
- Start with prompts for your weakest domains from the Diagnostic
- Where to find: open the article → scroll to each domain heading → look for "If you have no idea how to get started go to Claude and paste this prompt" → copy the prompt block below it

### 5.2 Build exercises for weak domains

- Link: https://claudecertificationguide.com/build-exercises
- 30 exercises (one per task statement)
- Start with your weakest domains from the Diagnostic

### 5.3 Projects from the Official Exam Guide (PDF in the sharepoint folder)

Four projects described in the certification exam guide:

1. **Multi-Tool Agent with Escalation Logic** → Domains 1, 2, 5
2. **Configure Claude Code for Team Workflow** → Domains 3, 2
3. **Structured Data Extraction Pipeline** → Domains 4, 5
4. **Multi-Agent Research Pipeline** → Domains 1, 2, 5

**Stage outcome:** 5 interactive tutoring sessions completed, at least 4 Exam Guide projects completed + build exercises for weakest domains. Cumulative exam readiness: ~85% (theory converted to practical skills).

---

## Stage 6. Documentation: closing remaining gaps (8–15 hours)

**Goal:** study topics not covered by courses and guides, using primary sources.

| Topic | Link |
|---|---|
| Agent SDK Overview | https://docs.anthropic.com/en/docs/claude-code/sdk |
| Agent SDK — TypeScript | https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-typescript |
| Agent SDK — Python | https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-python |
| Agent SDK Python repo + examples | https://github.com/anthropics/anthropic-sdk-python |
| Subagents | https://docs.anthropic.com/en/docs/claude-code/sub-agents |
| Tool Use API | https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview |
| Claude Code CLI | https://docs.anthropic.com/en/docs/claude-code/cli-reference |
| Claude Code CLI Cheatsheet | https://shipyard.build/blog/claude-code-cheat-sheet/ |
| CLAUDE.md / Memory | https://docs.anthropic.com/en/docs/claude-code/memory |
| Creating the Perfect CLAUDE.md | https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/ |
| Prompt Engineering | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview |
| Long Context Tips | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips |
| Message Batches API | https://docs.claude.com/en/docs/build-with-claude/batch-processing |
| MCP Specification | https://modelcontextprotocol.io/docs/getting-started/intro |
| MCP Blog (2026 updates) | https://blog.modelcontextprotocol.io/ |
| Everything Claude Code repo | https://github.com/affaan-m/everything-claude-code |
| Anthropic Cookbook | https://github.com/anthropics/anthropic-cookbook |

**Stage outcome:** confident understanding of all 30 task statements from the Exam Guide. Cumulative exam readiness: ~92% (all gaps closed with primary sources).

---

## Stage 7. Testing: practice exams (10–15 hours)

**Goal:** simulate exam conditions, identify remaining weak spots.

All tests below should be solved with a timer, under exam-like conditions. Review every mistake after each test.

### 7.1 Official Practice Exam (Anthropic)

- Link: https://anthropic.skilljar.com/anthropic-certification-practice-exam/425721/scorm/17p1a5iqsma8x
- The only official practice test from Anthropic — do this first

### 7.2 Practice Test from Community Guide

- Link: https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.MD (test at the end of the guide)
- 45 questions across 4 scenarios
- Mark uncertain answers for review

### 7.3 Practice Exam on claudecertificationguide.com

- Link: https://claudecertificationguide.com/practice
- ~25 questions, 60-minute timer, 720 threshold
- Exam Traps section — analysis of common traps in wrong answers

### 7.4 AI Bazaar Quiz (from @jetpippo)

- Link: https://ai-bazaar-eight.vercel.app
- 65 scenario-based questions across 5 domains

### 7.5 Sample Questions from Official Exam Guide PDF

- 12 questions with explanations (see `...Exam+Guide.pdf` in the sharepoint folder, pp. 26–40)
- Verify all 12 are answered correctly

**Stage outcome:** scoring 850–900+ on practice exams (720 is the passing minimum, but aim higher to have a safety margin). If below target — return to Stage 6 for specific error topics. Cumulative exam readiness: ~97% (validated under exam conditions).

---

## Stage 8. Final review (1–2 hours)

**Goal:** last review before the exam.

1. Go through Quick Reference → https://claudecertificationguide.com/quick-reference
2. Go through Glossary → https://claudecertificationguide.com/glossary
3. Read the domain cheatsheet (✓/✗ format) → https://dynamicbalaji.medium.com/claude-certified-architect-foundations-certification-preparation-guide-c70546b51f51
4. Re-read your notes on mistakes from practice exams
5. Re-take the Diagnostic and compare with Stage 0 results

**Stage outcome:** Diagnostic shows confident results across all 5 domains. Cumulative exam readiness: ~100%.

---

## Stage 9. Take the exam

---

## 30-day study tracks

Three tracks for different time budgets. Everyone has 30 days; pick the track that matches your available hours per week. All tracks follow the same stage order — lighter tracks skip or compress lower-priority material.

| Track | Hours/week | Total | Target score | Who it's for |
|---|---|---|---|---|
| Fast Track | 8–11 | 32–46h | 720+ (pass) | Family, full project load, limited free time |
| Medium Track | 14–18 | 56–72h | 800+ | Some evenings/weekends available |
| Deep Dive | 20–27 | 80–107h | 850–900+ | On bench / can study during work hours |

### Fast Track (8–11 hours/week, ~32–46 hours total)

Goal: pass the exam. Focus on theory + question banks + practice exams. Skip projects and deep documentation.

**Week 1 — Courses & Guide (8–11h)**

| Activity | Hours |
|---|---|
| Stage 0: Diagnostic + Exam Guide intro sections | 1 |
| Stage 1: all 6 Academy courses | 7–10 |

**Week 2 — Theory & Patterns (8–11h)**

| Activity | Hours |
|---|---|
| Stage 2: Community Study Guide — all 13 chapters (read, skip guide questions for now) | 7–9 |
| Stage 3: Architect's Playbook | 1–2 |

**Week 3 — Question Banks (8–11h)**

| Activity | Hours |
|---|---|
| Stage 4: Exam Prep course Days 1–7 (briefly review strong domains, deep dive into weak) | 4–5 |
| Stage 4: domain questions (58) + mock exams (pick 1 set of ~60 questions) | 3–5 |
| Stage 5.1: interactive tutoring — 2 weakest domains only | 1–2 |

**Week 4 — Practice Exams & Review (8–11h)**

| Activity | Hours |
|---|---|
| Stage 7.1: Official Practice Exam (Anthropic) | 1–2 |
| Stage 7.2–7.3: Community Guide test + claudecertificationguide.com | 3–4 |
| Stage 7.4–7.5: AI Bazaar quiz + Exam Guide sample questions | 2–3 |
| Error analysis → re-read weak topics in Study Guide | 1–2 |
| Stage 8: Final review | 1 |

**End of Fast Track:** ~75% exam readiness. Enough to pass if courses and theory are studied carefully. Projects and documentation are skipped — rely on question-based learning instead.

**What's skipped:** Stage 5 projects, Stage 5 build exercises, Stage 6 documentation, 2/3 of Stage 4 mock exams, Stage 2 guide questions.

---

### Medium Track (14–18 hours/week, ~56–72 hours total)

Goal: confident pass with margin. Add question bank depth, 2 projects, and targeted documentation.

**Week 1 — Courses & Guide start (14–18h)**

| Activity | Hours |
|---|---|
| Stage 0: Diagnostic + Exam Guide intro sections | 1 |
| Stage 1: all 6 Academy courses | 8–10 |
| Stage 2: Community Study Guide chapters 1–7 | 5–6 |

**Week 2 — Theory & Exam Prep (14–18h)**

| Activity | Hours |
|---|---|
| Stage 2: chapters 8–13 + solve guide questions | 5–7 |
| Stage 3: Architect's Playbook | 1–2 |
| Stage 4: Exam Prep course Days 1–7 (briefly review strong domains, deep dive into weak) | 6–7 |

**Week 3 — Questions & Practice (14–18h)**

| Activity | Hours |
|---|---|
| Stage 4: domain questions (58) + mock exams (198 questions) | 4–6 |
| Stage 5.1: interactive tutoring — 3 weakest domains | 2–3 |
| Stage 5.3: 1 project (pick the one covering your weakest domains) | 6–8 |
| Stage 6: documentation — 2–3 topics where errors were made | 2–3 |

**Week 4 — Practice Exams & Polish (14–18h)**

| Activity | Hours |
|---|---|
| Stage 5.3: 2nd project (covering remaining weak domains) | 6–8 |
| Stage 7.1: Official Practice Exam (Anthropic) | 1–2 |
| Stage 7.2–7.5: all remaining practice exams | 4–5 |
| Error analysis → targeted Stage 6 review | 2–3 |
| Stage 8: Final review | 1–2 |

**End of Medium Track:** ~90% exam readiness. 2 projects done, all practice exams taken, key documentation gaps closed.

**Which 2 projects to pick:** Projects 1 & 4 cover D1+D2+D5. Projects 2 & 3 cover D3+D4+D5. Pick the pair targeting your weaker domains from the Diagnostic.

**What's skipped:** 2 projects, build exercises, ~half of Stage 6 documentation.

---

### Deep Dive (20–27 hours/week, ~80–107 hours total)

Goal: high score (850–900+). Near-full plan coverage with all projects and documentation.

**Week 1 — Foundation & Theory (20–27h)**

| Activity | Hours |
|---|---|
| Stage 0: Diagnostic + Exam Guide intro sections | 1 |
| Stage 1: all 6 Academy courses | 8–12 |
| Stage 2: Community Study Guide — all 13 chapters + solve 60+ questions | 10–12 |

**Week 2 — Exam Prep Intensive (20–27h)**

| Activity | Hours |
|---|---|
| Stage 3: Architect's Playbook | 1–2 |
| Stage 4: Exam Prep course Days 1–7 with all exercises | 10–12 |
| Stage 4: domain questions (58) + all 3 mock exams (198 questions) | 5–7 |
| Stage 4: Learning Cards review | 1–2 |
| Exam Guide: read remaining pages (task statements detail) | 2–3 |

**Week 3 — Hands-on & Documentation (20–27h)**

| Activity | Hours |
|---|---|
| Stage 5.1: interactive tutoring — all 5 domains | 4–5 |
| Stage 5.3: Project 1 (Multi-Tool Agent with Escalation) | 6–8 |
| Stage 5.3: Project 2 (Configure Claude Code for Team Workflow) | 4–6 |
| Stage 5.2: build exercises for 2 weakest domains | 2–3 |
| Stage 6: documentation — SDK, Tool Use, CLI, Prompt Engineering | 4–5 |

**Week 4 — Projects, Testing & Polish (20–27h)**

| Activity | Hours |
|---|---|
| Stage 5.3: Project 3 (Data Extraction Pipeline) | 5–7 |
| Stage 5.3: Project 4 (Multi-Agent Research Pipeline) | 5–7 |
| Stage 6: remaining documentation (MCP spec, Cookbook, Batches API) | 3–4 |
| Stage 7.1: Official Practice Exam (Anthropic) | 1–2 |
| Stage 7.2–7.5: all remaining practice exams | 4–5 |
| Re-take practice exams where score < 850 | 1–2 |
| Stage 8: Final review | 1–2 |

**End of Deep Dive:** ~100% exam readiness. All 4 projects done, full documentation covered, all practice exams taken and retaken.

**What's skipped:** almost nothing. If running ahead of schedule, spend extra time on practice exam error analysis and build exercises for all domains.

---

### If running behind on any track

Prioritize in this order (highest impact per hour):

1. Stage 4 mock exams (198 questions with error analysis) — reveals gaps fastest
2. Stage 7 practice exams — closest to real exam format
3. Stage 2 Study Guide — broadest coverage of all domains
4. Stage 5 projects — skip if scoring 720+ (Fast) / 800+ (Medium) on practice exams without them

### Upgrading between tracks

If you find more time mid-way, add activities from the next track up in this order: Stage 4 full mock exams → Stage 5 projects → Stage 6 documentation. If you're falling behind, drop activities in reverse order: Stage 6 → Stage 5 projects → Stage 4 course (keep questions).

---

## Reference

| Parameter | Value |
|---|---|
| Passing score | 720 / 1000 |
| Format | Multiple choice, 1 correct out of 4 |
| Scenarios | 4 random out of 6 |
| Wrong answer penalty | None (answer everything) |
| Estimated study time | 32–107 hours (see 30-day study tracks) |
| Expires in | 6 months |

### Optional Anthropic Academy course

Claude 101 — does not cover exam topics directly, but may provide useful background context.

### Anthropic Academy courses NOT needed

AI Fluency (all variants), Teaching AI Fluency, Introduction to Claude Cowork, Claude with Amazon Bedrock, Claude with Google Cloud's Vertex AI — do not cover exam topics.

### Important note

Community Study Guide and claudecertificationguide.com are unofficial resources, not endorsed by Anthropic. In case of discrepancies with docs.anthropic.com, trust the official documentation.
