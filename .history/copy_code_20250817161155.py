import os, sys, subprocess

IGNORE_DIRS = {
    "__pycache__", "node_modules", ".git", ".idea", ".vscode",
    "dist", "build", ".pytest_cache", ".mypy_cache",
    ".venv", "venv", "env", ".history"
}
IGNORE_EXTS = {
    ".log", ".tmp", ".pyc", ".zip", ".tar", ".gz", ".exe",
    ".png", ".jpg", ".jpeg", ".gif", ".mp4", ".mov", ".avi",
}

def find_repo_root(start_path=None):
    path = os.path.abspath(start_path or os.getcwd())
    orig = path
    while True:
        if os.path.isdir(os.path.join(path, ".git")):
            return path
        parent = os.path.dirname(path)
        if parent == path:
            return orig
        path = parent

def build_dump(repo_root: str) -> str:
    out = []
    out.append("Directory structure:\n")
    for root, dirs, files in os.walk(repo_root):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        level = os.path.relpath(root, repo_root).count(os.sep)
        indent = "    " * level
        out.append(f"{indent}{os.path.basename(root)}/")
        sub_indent = "    " * (level + 1)
        for file in sorted(files):
            if os.path.splitext(file)[1].lower() not in IGNORE_EXTS:
                out.append(f"{sub_indent}{file}")

    out.append("\n\nFile contents:\n")
    for root, dirs, files in os.walk(repo_root):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in sorted(files):
            if os.path.splitext(file)[1].lower() in IGNORE_EXTS:
                continue
            p = os.path.join(root, file)
            rel = os.path.relpath(p, repo_root)
            out.append(f"\n--- {rel} ---\n")
            try:
                with open(p, "r", encoding="utf-8", errors="ignore") as f:
                    out.append(f.read())
            except Exception as e:
                out.append(f"[Error reading {rel}: {e}]")
    final = "\n".join(out)
    return final

def copy_to_clipboard(text: str):
    if os.name == "nt":  # Windows
        # 'clip' reads from stdin and sets the Windows clipboard
        subprocess.run("clip", input=text, text=True, check=True)
        print("Copied to clipboard via Windows 'clip'.")
        return

    # Linux (Ubuntu). Prefer wl-copy (Wayland), else xclip (X11).
    # We keep it simple: just try wl-copy, then xclip, else error.
    from shutil import which
    if which("wl-copy"):
        subprocess.run(["wl-copy"], input=text, text=True, check=True)
        print("Copied to clipboard via 'wl-copy'.")
        return
    if which("xclip"):
        subprocess.run(["xclip", "-selection", "clipboard"], input=text, text=True, check=True)
        print("Copied to clipboard via 'xclip'.")
        return

    raise RuntimeError("No clipboard tool found. Install 'wl-clipboard' (Wayland) or 'xclip' (X11).")

def main():
    start = sys.argv[1] if len(sys.argv) > 1 else None
    repo_root = find_repo_root(start)
    print(f"[info] repo root: {repo_root}")
    payload = build_dump(repo_root)
    copy_to_clipboard(payload)
    print("✅ Repo structure + code copied.")

if __name__ == "__main__":
    main()
