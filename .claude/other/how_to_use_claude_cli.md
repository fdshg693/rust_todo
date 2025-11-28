https://code.claude.com/docs/en/cli-reference

claude -p --model claude-sonnet-4-5 --system-prompt-file .claude/prompts/system-prompt.txt "what is volcano?" --disallowedTools "Bash" "Edit" "Glob" "Grep" "KillShell" "NotebookEdit" "Read" "Skill" "SlashCommand" "Task" "Write" --max-turns 5

claude -p: 必ず指定するオプションで対話モードを無効にします。
--model claude-sonnet-4-5 | claude-haiku-4-5 | claude-opus-4-5

以下のオプションのどちらかを指定します:
--system-prompt-file: システムプロンプトを指定します。
--system-prompt: システムプロンプトを直接指定します。

--disallowedTools: 使用を禁止するToolを指定します。複数指定可能です。
指定しない場合は、全てのToolが使用可能となります。
--max-turns: エージェントの最大ターン数を指定します。