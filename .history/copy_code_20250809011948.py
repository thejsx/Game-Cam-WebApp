import os
import pyperclip

def copy_dev_code_with_structure(src_dir):
    """
    Creates a text output containing:
    1. A filtered directory tree
    2. All relevant file contents
    Then copies the output to clipboard.
    """

    ignore_dirs = {
        '__pycache__', 'node_modules', '.git', '.idea', '.vscode',
        'dist', 'build', '.pytest_cache', '.mypy_cache',
        '.venv', 'venv', 'env', '.history'
    }
    ignore_exts = {'.log', '.tmp', '.pyc', '.zip', '.tar', '.gz', '.exe'}

    output_lines = []

    # --- Step 1: Directory tree ---
    output_lines.append("Directory structure:\n")
    for root, dirs, files in os.walk(src_dir):
        # Filter dirs in-place
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        # Relative indent
        level = os.path.relpath(root, src_dir).count(os.sep)
        indent = '    ' * level
        output_lines.append(f"{indent}{os.path.basename(root)}/")

        sub_indent = '    ' * (level + 1)
        for file in files:
            if os.path.splitext(file)[1] not in ignore_exts:
                output_lines.append(f"{sub_indent}{file}")

    # --- Step 2: File contents ---
    output_lines.append("\n\nFile contents:\n")
    for root, dirs, files in os.walk(src_dir):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext not in ignore_exts:
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        rel_path = os.path.relpath(file_path, src_dir)
                        output_lines.append(f"\n--- {rel_path} ---\n")
                        output_lines.append(f.read())
                except Exception as e:
                    output_lines.append(f"\n--- {rel_path} ---\n[Error reading file: {e}]")

    # --- Step 3: Copy to clipboard ---
    final_output = "\n".join(output_lines)
    pyperclip.copy(final_output)
    print("✅ Dev code + structure copied to clipboard.")

# Example usage:
# copy_dev_code_with_structure("path/to/your/repo")
