#!/usr/bin/env python3
"""
StudyTube Chrome Extension Build & Packaging Script
===================================================
Automates manifest validation, file integrity verification, and production packaging
for the StudyTube Manifest V3 Chrome Extension.

Usage:
    python dist/package_build.py
"""

import os
import sys
import json
import zipfile
import hashlib
from pathlib import Path

# Paths configuration
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = WORKSPACE_ROOT / "studytube"
DIST_DIR = WORKSPACE_ROOT / "dist"
MANIFEST_PATH = SOURCE_DIR / "manifest.json"

REQUIRED_MANIFEST_KEYS = [
    "manifest_version",
    "name",
    "version",
    "description",
    "icons",
    "action",
    "background",
    "content_scripts",
    "permissions"
]

EXCLUDE_PATTERNS = [
    ".git",
    ".DS_Store",
    "Thumbs.db",
    "__pycache__",
    ".user_uploaded",
    "*.pyc"
]

def print_header(title: str):
    print("\n" + "=" * 60)
    print(f" {title.upper()} ")
    print("=" * 60)

def validate_manifest() -> dict:
    print_header("1. Validating manifest.json")
    if not MANIFEST_PATH.exists():
        print(f"❌ Error: manifest.json not found at {MANIFEST_PATH}")
        sys.exit(1)

    try:
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    except Exception as e:
        print(f"❌ Error parsing manifest.json: {e}")
        sys.exit(1)

    # Check manifest version
    mv = manifest.get("manifest_version")
    if mv != 3:
        print(f"❌ Manifest version must be 3, found: {mv}")
        sys.exit(1)
    print(f"  ✅ Manifest Version: {mv} (Compliant with Chrome Web Store V3 mandate)")

    # Check required keys
    for key in REQUIRED_MANIFEST_KEYS:
        if key not in manifest:
            print(f"❌ Missing required manifest key: {key}")
            sys.exit(1)
        print(f"  ✅ Found key: {key}")

    # Check version string
    version = manifest.get("version", "0.0.0")
    print(f"  ✅ Extension Version: {version}")

    # Verify referenced files
    print("\n  Checking referenced resource paths:")
    referenced_files = []

    # Icons
    icons = manifest.get("icons", {})
    for size, icon_path in icons.items():
        referenced_files.append((f"Icon {size}px", SOURCE_DIR / icon_path))

    # Action popup & default icons
    action = manifest.get("action", {})
    if "default_popup" in action:
        referenced_files.append(("Action Popup", SOURCE_DIR / action["default_popup"]))
    for size, icon_path in action.get("default_icon", {}).items():
        referenced_files.append((f"Action Icon {size}px", SOURCE_DIR / icon_path))

    # Background service worker
    bg = manifest.get("background", {})
    if "service_worker" in bg:
        referenced_files.append(("Service Worker", SOURCE_DIR / bg["service_worker"]))

    # Content scripts & styles
    content_scripts = manifest.get("content_scripts", [])
    for cs in content_scripts:
        for js in cs.get("js", []):
            referenced_files.append(("Content Script", SOURCE_DIR / js))
        for css in cs.get("css", []):
            referenced_files.append(("Content CSS", SOURCE_DIR / css))

    # Web accessible resources
    war = manifest.get("web_accessible_resources", [])
    for entry in war:
        for res in entry.get("resources", []):
            referenced_files.append(("Web Accessible Resource", SOURCE_DIR / res))

    missing_count = 0
    for label, file_path in referenced_files:
        if file_path.exists():
            print(f"    ✅ [{label}] {file_path.relative_to(SOURCE_DIR)} ({file_path.stat().st_size} bytes)")
        else:
            print(f"    ❌ [{label}] MISSING: {file_path.relative_to(SOURCE_DIR)}")
            missing_count += 1

    if missing_count > 0:
        print(f"\n❌ Manifest validation failed with {missing_count} missing file(s).")
        sys.exit(1)

    print("\n  ✅ All manifest file references verified successfully.")
    return manifest

def build_zip_package(version: str) -> Path:
    print_header("2. Building Production ZIP Package")
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    
    zip_filename = f"studytube-v{version}.zip"
    zip_path = DIST_DIR / zip_filename
    root_zip_path = WORKSPACE_ROOT / "studytube.zip"

    # Temporary remove if exists
    if zip_path.exists():
        zip_path.unlink()
    if root_zip_path.exists():
        root_zip_path.unlink()

    total_uncompressed = 0
    packed_files = []

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(SOURCE_DIR):
            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(SOURCE_DIR)

                # Skip excluded patterns
                if any(rel_path.match(pat) for pat in EXCLUDE_PATTERNS):
                    continue

                # Exclude root docs from the store zip package to save size
                if rel_path.name in ["README.md", "PRIVACY_POLICY.md", "CWS_STORE_LISTING.md"]:
                    # Include if you want, but CWS only needs runtime files
                    pass

                file_size = file_path.stat().st_size
                total_uncompressed += file_size
                zipf.write(file_path, arcname=rel_path)
                packed_files.append((rel_path, file_size))

    # Also make a copy to root studytube.zip for easy drag-and-drop
    import shutil
    shutil.copyfile(zip_path, root_zip_path)

    print(f"  Package successfully assembled at:\n  -> {zip_path}\n  -> {root_zip_path}")
    print(f"\n  Files bundled ({len(packed_files)} total):")
    for rel_path, size in sorted(packed_files, key=lambda x: str(x[0])):
        print(f"    📦 {str(rel_path):<35} ({size:>8} bytes)")

    compressed_size = zip_path.stat().st_size
    ratio = (1.0 - (compressed_size / total_uncompressed)) * 100 if total_uncompressed else 0

    print(f"\n  📊 Uncompressed Size : {total_uncompressed / 1024:.2f} KB ({total_uncompressed} bytes)")
    print(f"  📊 Compressed Size   : {compressed_size / 1024:.2f} KB ({compressed_size} bytes)")
    print(f"  📊 Compression Ratio : {ratio:.1f}% reduction")

    return zip_path

def calculate_checksum(file_path: Path):
    print_header("3. Integrity & Cryptographic Checksum")
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    sha256 = hasher.hexdigest()

    md5_hasher = hashlib.md5()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            md5_hasher.update(chunk)
    md5 = md5_hasher.hexdigest()

    print(f"  Target File : {file_path.name}")
    print(f"  SHA-256     : {sha256}")
    print(f"  MD5         : {md5}")

    # Write checksum file
    checksum_file = DIST_DIR / f"{file_path.name}.sha256"
    with open(checksum_file, "w", encoding="utf-8") as f:
        f.write(f"{sha256}  {file_path.name}\n")
    print(f"  ✅ SHA-256 written to: {checksum_file.name}")

def main():
    print("🚀 StudyTube Release Packager v1.0.0")
    print(f"Workspace Root: {WORKSPACE_ROOT}")
    
    manifest = validate_manifest()
    version = manifest.get("version", "1.0.0")
    zip_path = build_zip_package(version)
    calculate_checksum(zip_path)

    print_header("BUILD COMPLETE — READY FOR CWS SUBMISSION")
    print("All checks passed. Extension is compliant, verified, and packaged.")

if __name__ == "__main__":
    main()

