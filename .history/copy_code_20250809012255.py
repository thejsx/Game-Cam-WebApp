import os
import subprocess

def find_repo_root(start_path=None):
    path = start_path or os.getcwd()
    while True:
        if os.path.isdir(os.path.join(path, ".git")):
            return path
        parent = os.path.dirname(path)
        if parent == path:
            return start_path or os.getcwd()  # fallback to where script ran
        path = parent

def copy_repo_to_clipboard():
    repo_root = find_repo_root()
    ignore_dirs = {
        '__pycache__', 'node_modules', '.git', '.idea', '.vscode',
        'dist', 'build', '.pytest_cache', '.mypy_cache',
        '.venv', 'venv', 'env'
    }
    ignore_exts = {'.log', '.tmp', '.pyc', '.zip', '.tar', '.gz', '.exe'}

    output_lines = []

    # Directory tree
    output_lines.append("Directory structure:\n")
    for root, dirs, files in os.walk(repo_root):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        level = os.path.relpath(root, repo_root).count(os.sep)
        indent = '    ' * level
        output_lines.append(f"{indent}{os.path.basename(root)}/")
        sub_indent = '    ' * (level + 1)
        for file in files:
            if os.path.splitext(file)[1] not in ignore_exts:
                output_lines.append(f"{sub_indent}{file}")

    # File contents
    output_lines.append("\n\nFile contents:\n")
    for root, dirs, files in os.walk(repo_root):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            if os.path.splitext(file)[1] not in ignore_exts:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, repo_root)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        output_lines.append(f"\n--- {rel_path} ---\n")
                        output_lines.append(f.read())
                except Exception as e:
                    output_lines.append(f"\n--- {rel_path} ---\n[Error reading file: {e}]")

    # Join all text
    final_output = "\n".join(output_lines)

    # Copy to clipboard (cross-platform)
    try:
        if os.name == "nt":
            subprocess.run("clip", text=True, input=final_output)
        elif os.name == "posix":
            subprocess.run("pbcopy" if subprocess.run("which pbcopy", shell=True, capture_output=True).returncode == 0 else "xclip -selection clipboard", shell=True, input=final_output, text=True)
        print("✅ Repo structure + code copied to clipboard.")
    except Exception as e:
        print(f"⚠ Failed to copy to clipboard: {e}")

if __name__ == "__main__":
    copy_repo_to_clipboard()
