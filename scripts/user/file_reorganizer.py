"""
.github配下のCopilot用設定ファイルを整理するためにユーザが実行するスクリプト。
File Reorganization Tool

Copies files from .github/agents and .github/prompts to a configurable output
directory, transforming filenames into a nested directory structure.

Transformation rules:
- Agent files: dots before .agent.md become directory separators
- Prompt files: dots before .prompt.md become directory separators

Usage: python scripts/file_reorganizer.py [output_dir]
"""

import argparse
import os
import shutil
from pathlib import Path


def transform_filename(filename: str, suffix: str) -> str:
    """
    Transform a filename by converting dots to directory separators.
    
    Example: coder.backend.agent.md -> coder/backend.agent.md
    """
    # Remove the suffix (e.g., .agent.md or .prompt.md)
    base = filename[:-len(suffix)]
    # Split by dots and rejoin with path separator
    parts = base.split('.')
    if len(parts) > 1:
        # All parts except the last become directories
        return os.path.join(*parts[:-1], parts[-1] + suffix)
    return filename


def copy_files(source_dir: Path, dest_dir: Path, suffix: str) -> int:
    """
    Copy files from source to destination with filename transformation.
    
    Returns the number of files copied.
    """
    count = 0
    if not source_dir.exists():
        print(f"Source directory not found: {source_dir}")
        return count
    
    for file in source_dir.glob(f"*{suffix}"):
        new_name = transform_filename(file.name, suffix)
        dest_path = dest_dir / new_name
        
        # Create parent directories if needed
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy the file
        shutil.copy2(file, dest_path)
        print(f"Copied: {file.name} -> {dest_path.relative_to(dest_dir.parent.parent)}")
        count += 1
    
    return count


def main():
    parser = argparse.ArgumentParser(
        description="Reorganize agent and prompt files into nested directories"
    )
    parser.add_argument(
        "output_dir",
        nargs="?",
        default=".copilot/temp_output",
        help="Target output directory (default: .copilot/temp_output)"
    )
    args = parser.parse_args()
    
    # Determine project root (parent of scripts directory)
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent
    
    output_dir = Path(args.output_dir)
    if not output_dir.is_absolute():
        output_dir = project_root / output_dir
    
    # Source directories
    agents_source = project_root / ".github" / "agents"
    prompts_source = project_root / ".github" / "prompts"
    
    # Destination directories
    agents_dest = output_dir / "agents"
    prompts_dest = output_dir / "prompts"
    
    print(f"Project root: {project_root}")
    print(f"Output directory: {output_dir}")
    print()
    
    # Process agent files
    print("Processing agent files...")
    agent_count = copy_files(agents_source, agents_dest, ".agent.md")
    
    print()
    
    # Process prompt files
    print("Processing prompt files...")
    prompt_count = copy_files(prompts_source, prompts_dest, ".prompt.md")
    
    print()
    print(f"Done! Copied {agent_count} agent files and {prompt_count} prompt files.")


if __name__ == "__main__":
    main()
