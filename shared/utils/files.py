import os
import json
import csv
from pathlib import Path
from typing import Any, Dict, List, Optional
import tempfile
import shutil

def ensure_directory(path: str) -> Path:
    """Ensure directory exists, create if not"""
    dir_path = Path(path)
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path

def read_json(file_path: str) -> Dict:
    """Read JSON file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_json(file_path: str, data: Any, indent: int = 2) -> None:
    """Write JSON file"""
    ensure_directory(os.path.dirname(file_path))
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=indent, ensure_ascii=False)

def read_csv(file_path: str) -> List[Dict]:
    """Read CSV file as list of dicts"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f))

def write_csv(file_path: str, data: List[Dict], fieldnames: Optional[List[str]] = None) -> None:
    """Write CSV file"""
    if not data:
        return
    
    ensure_directory(os.path.dirname(file_path))
    
    if fieldnames is None:
        fieldnames = list(data[0].keys())
    
    with open(file_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def get_file_size(file_path: str) -> int:
    """Get file size in bytes"""
    return os.path.getsize(file_path)

def format_file_size(size_bytes: int) -> str:
    """Format file size to human readable"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"

def create_temp_file(suffix: str = "", prefix: str = "tmp") -> str:
    """Create temporary file"""
    fd, path = tempfile.mkstemp(suffix=suffix, prefix=prefix)
    os.close(fd)
    return path

def create_temp_directory(suffix: str = "", prefix: str = "tmp") -> str:
    """Create temporary directory"""
    return tempfile.mkdtemp(suffix=suffix, prefix=prefix)

def copy_file(src: str, dst: str) -> None:
    """Copy file"""
    ensure_directory(os.path.dirname(dst))
    shutil.copy2(src, dst)

def move_file(src: str, dst: str) -> None:
    """Move file"""
    ensure_directory(os.path.dirname(dst))
    shutil.move(src, dst)

def delete_file(file_path: str) -> bool:
    """Delete file if exists"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False

def list_files(directory: str, extension: Optional[str] = None, recursive: bool = False) -> List[str]:
    """List files in directory"""
    path = Path(directory)
    
    if not path.exists():
        return []
    
    if recursive:
        pattern = f"**/*{extension}" if extension else "**/*"
        files = [str(f) for f in path.glob(pattern) if f.is_file()]
    else:
        pattern = f"*{extension}" if extension else "*"
        files = [str(f) for f in path.glob(pattern) if f.is_file()]
    
    return sorted(files)
