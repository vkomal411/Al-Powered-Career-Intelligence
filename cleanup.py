#!/usr/bin/env python3
"""
Project Garbage Collection & Cache Purge Tool
=============================================
Recursively cleans cache directories, build artifacts, bytecode files, 
temporary logs, and runs Python memory garbage collection.
"""

import os
import shutil
import gc
import sys
from pathlib import Path

# Ensure UTF-8 output encoding for Windows compatibility
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Directories to purge recursively
TARGET_DIRS = {
    "__pycache__",
    ".pytest_cache",
    ".next",
    ".coverage",
    ".eslintcache",
    "htmlcov",
    ".mypy_cache"
}

# File extensions and explicit patterns to remove
TARGET_FILE_EXTENSIONS = {
    ".pyc",
    ".pyo",
    ".pyd",
    ".tsbuildinfo",
    ".tmp",
    ".log"
}

TARGET_FILENAMES = {
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini"
}

def format_bytes(size: int) -> str:
    """Format size in bytes to human-readable string."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.2f} {unit}"
        size /= 1024.0
    return f"{size:.2f} TB"

def get_dir_size(path: Path) -> int:
    """Calculate total size of directory in bytes."""
    total = 0
    try:
        for entry in path.rglob('*'):
            if entry.is_file():
                try:
                    total += entry.stat().st_size
                except OSError:
                    pass
    except OSError:
        pass
    return total

def run_project_garbage_collection(root_dir: Path):
    print(f"Starting Project Garbage Collection in: {root_dir}")
    print("=" * 65)

    files_removed = 0
    dirs_removed = 0
    bytes_freed = 0

    # 1. Purge matching directories
    for path in list(root_dir.rglob('*')):
        parts = path.parts
        if 'venv' in parts or '.venv' in parts or 'node_modules' in parts:
            continue

        if path.is_dir() and path.name in TARGET_DIRS:
            size = get_dir_size(path)
            try:
                shutil.rmtree(path)
                dirs_removed += 1
                bytes_freed += size
                print(f" [DIR DELETED]  {path.relative_to(root_dir)} ({format_bytes(size)})")
            except Exception as e:
                print(f" [DIR ERROR]    Failed to remove {path.relative_to(root_dir)}: {e}")

    # 2. Purge matching files
    for path in list(root_dir.rglob('*')):
        parts = path.parts
        if 'venv' in parts or '.venv' in parts or 'node_modules' in parts:
            continue

        if path.is_file():
            if path.suffix in TARGET_FILE_EXTENSIONS or path.name in TARGET_FILENAMES:
                try:
                    size = path.stat().st_size
                    path.unlink()
                    files_removed += 1
                    bytes_freed += size
                    print(f" [FILE DELETED] {path.relative_to(root_dir)} ({format_bytes(size)})")
                except Exception as e:
                    print(f" [FILE ERROR]   Failed to remove {path.relative_to(root_dir)}: {e}")

    # 3. Trigger Python Runtime Garbage Collection
    print("-" * 65)
    print("Running Python Runtime Garbage Collector (gc.collect())...")
    collected = gc.collect()
    print(f"   Unreachable memory objects collected: {collected}")

    print("=" * 65)
    print("Project Garbage Collection Summary:")
    print(f"   Directories Removed: {dirs_removed}")
    print(f"   Files Removed:       {files_removed}")
    print(f"   Disk Space Freed:    {format_bytes(bytes_freed)}")
    print("=" * 65)

if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent
    run_project_garbage_collection(project_root)
