import os
import shutil

def copy_dev_code(src_dir, dest_dir):
    """
    Copies dev-relevant code from src_dir to dest_dir,
    ignoring unnecessary directories like build artifacts, caches, and envs.
    """
    ignore_dirs = {
        '__pycache__', 'node_modules', '.git', '.idea', '.vscode',
        'dist', 'build', '.pytest_cache', '.mypy_cache',
        '.venv', 'venv', 'env', '.DS_Store', '.history'
    }
    ignore_exts = {'.log', '.tmp', '.pyc'}

    def ignore_function(dir_path, contents):
        ignored = []
        for name in contents:
            full_path = os.path.join(dir_path, name)
            if name in ignore_dirs:
                ignored.append(name)
            elif os.path.splitext(name)[1] in ignore_exts:
                ignored.append(name)
        return ignored

    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)

    shutil.copytree(src_dir, dest_dir, ignore=ignore_function)
    print(f"Copied dev code from {src_dir} to {dest_dir}, excluding unnecessary dirs/files.")

# Example usage:
# copy_dev_code("path/to/your/repo", "path/to/dev_code_copy")
