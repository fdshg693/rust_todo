# Guidlines for Writing Custom Agent settings

When creating custom agents, it is important to define their capabilities and behavior clearly. This ensures that the agent performs tasks effectively and as intended.

## tools
Specifies the list of tools available to the agent.
Limiting tools to the minimum required set improves agent accuracy and reduces unexpected behaviors.

## Recommended Tools

| Tool | Purpose | When to Include |
|------|---------|-----------------|
| `runSubagent` | Invokes other agents for task delegation | **Always** — Essential for handling complex, multi-step tasks |
| `todos` | Manages TODO lists and task tracking | **Always** — Critical for project task management and progress tracking |
| `fetch` | Retrieves information from the web | **When needed** — Include when the agent requires up-to-date external information |
| `edit` | Modifies code and files | **Always** — Exclude only if you explicitly want to prevent file modifications |
| `runCommands` | Executes terminal/shell commands | **Use sparingly** — Can cause unpredictable behavior; include only for specific needs like builds, linting, or formatting |

## prompt
Write clear, structured instructions that define the agent's behavior and constraints.

## Syntax Reference

- **Tool references**: Use `#tool:<tool_name>` to explicitly reference tools from the tools list
- **File references**: Use `path/to/specific/file` to point the agent to relevant files in the repository

## Best Practices

1. **Provide context**: Include paths to core files and documentation so the agent understands the project structure
2. **Use knowledge files**: Store detailed context in `.copilot/knowledge/` directory and reference those documents in your prompt
3. **Be explicit**: State expected behaviors, constraints, and output formats clearly
4. **Define scope**: Specify what the agent should and should not do
5. **Force runSubagent・todos**: Explicity mention in the prompt so that the agent should always use `#tool:runSubagent` and `#tool:todos` for tasks.