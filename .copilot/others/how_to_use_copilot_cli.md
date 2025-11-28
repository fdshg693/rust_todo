# Copilot CLIを使ってエージェントを操作する方法

## 参考文献
https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/use-copilot-cli

## 基本CLI
```powershell
copilot --agent={agent-name} --prompt "{your-prompt-here}"
```
{agent-name}に入れらるエージェント名は、`.github\agents`フォルダ配下のファイル名（拡張子である`.agent.md`を除く）です。
`.github\agents\coder.backend.agent.md`-> `coder.backend`

## 注意事項
2025/11/28現在、Github Coplot CLIからカスタムエージェントのフロントマターを解釈する際に、
toolsの箇所を正しく認識しない不具合があるようです。
現状、toolsの箇所を書かずにデフォルトで全Toolを有効化させてエージェントを動作させることのみが可能です。