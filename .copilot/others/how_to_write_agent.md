# Guidlines for Writing Custom Agent settings

When creating custom agents, it is important to define their capabilities and behavior clearly. This ensures that the agent performs tasks effectively and as intended.

## tools
Specifies the list of tools available to the agent.
Limiting tools to the minimum required set improves agent accuracy and reduces unexpected behaviors.

### Recommended Tools

| Tool | Purpose | When to Include |
|------|---------|-----------------|
| `runSubagent` | Invokes other agents for task delegation | **Always** — Essential for handling complex, multi-step tasks |
| `todos` | Manages TODO lists and task tracking | **Always** — Critical for project task management and progress tracking |
| `fetch` | Retrieves information from the web | **When needed** — Include when the agent requires up-to-date external information |
| `edit` | Modifies code and files | **Always** — Exclude only if you explicitly want to prevent file modifications |
| `runCommands` | Executes terminal/shell commands | **Use sparingly** — Can cause unpredictable behavior; include only for specific needs like builds, linting, or formatting |

## Prompt

Write clear, structured instructions that define the agent's behavior and constraints.

---

### Syntax Reference

| Type | Syntax | Description |
|------|--------|-------------|
| Tool references | `#tool:<tool_name>` | Explicitly reference tools from the tools list |
| File references | `path/to/file` | Point the agent to relevant files in the repository |

---

### Best Practices

#### 1. Provide Context with Knowledge Files

- Store detailed context in the `.copilot/knowledge/` directory and reference those documents in your prompt
- Include paths to core documentation so the agent understands the project structure
- **Avoid hardcoding paths to source code files** — source code changes frequently, leading to broken references
- Instead, reference knowledge files that provide stable context about the codebase

#### 2. Be Explicit

- State expected behaviors, constraints, and output formats clearly
- Define success criteria and edge cases
- Specify error handling expectations

#### 3. Define Scope

- Clearly specify what the agent **should** do
- Explicitly state what the agent **should not** do
- Set boundaries for decision-making autonomy

#### 4. Mandate Tool Usage

Always instruct the agent to use the following tools:

- `#tool:runSubagent` — for delegating subtasks
- `#tool:todos` — for task tracking and management

Example instruction:
> "You MUST use `#tool:runSubagent` for complex subtasks and `#tool:todos` to track progress."

---

### Example Prompt Structure
```text
## Role
[Define the agent's role and primary responsibility]

## Context
[Reference knowledge files: .copilot/knowledge/architecture.md]

## Constraints
- [Constraint 1]
- [Constraint 2]

## Required Tools
- Always use #tool:runSubagent for subtasks
- Always use #tool:todos to manage task progress

## Output Format
[Specify expected output structure]
```