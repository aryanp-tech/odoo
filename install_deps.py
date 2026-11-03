"""
Install Odoo dependencies compatible with Python 3.15.
Packages pinned to old versions that can't build on Python 3.15
are replaced with their latest compatible versions.
"""
import subprocess
import sys

python = sys.executable

# Packages that are broken at their pinned version on Python 3.12+/3.15
# (removed distutils, no pre-built wheels, etc.) -> install latest instead
UPGRADE_TO_LATEST = {
    "libsass",
    "Pillow",
    "gevent",
    "greenlet",
    "MarkupSafe",
    "Mako",
}

# These require C compiler and have no py3.15 wheel at their pinned version.
# Install latest which ships wheels.
LATEST_VERSIONS = [
    "libsass",
    "Pillow",
    "gevent",
    "greenlet",
    "MarkupSafe",
    "Mako",
]

# Read the pinned requirements, keeping only packages that aren't in UPGRADE_TO_LATEST
pinned = []
with open("requirements.txt") as f:
    for line in f:
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith(";"):
            continue
        # Get package name (before ==, >=, ;, etc.)
        pkg_name = stripped.split("==")[0].split(">=")[0].split(";")[0].strip()
        if pkg_name in UPGRADE_TO_LATEST:
            continue  # will install latest below
        pinned.append(stripped)

print("=" * 60)
print("Step 1: Installing pinned packages from requirements.txt")
print("=" * 60)
result = subprocess.run(
    [python, "-m", "pip", "install"] + pinned,
    capture_output=False
)
if result.returncode != 0:
    print("\n[WARN] Some pinned installs failed. Continuing...")

print("\n" + "=" * 60)
print("Step 2: Installing latest versions of py3.12+-incompatible packages")
print("=" * 60)
for pkg in LATEST_VERSIONS:
    print(f"\n  Installing latest {pkg}...")
    r = subprocess.run(
        [python, "-m", "pip", "install", "--upgrade", pkg],
        capture_output=False
    )
    if r.returncode != 0:
        print(f"  [WARN] Failed to install {pkg}")

print("\n" + "=" * 60)
print("Step 3: Verifying key imports")
print("=" * 60)
imports_to_check = [
    "werkzeug", "lxml", "PIL", "gevent", "greenlet",
    "passlib", "psycopg2", "PyPDF2", "reportlab",
    "Babel", "jinja2", "markupsafe", "mako",
]
failed = []
for mod in imports_to_check:
    try:
        __import__(mod)
        print(f"  OK  {mod}")
    except ImportError as e:
        print(f"  FAIL {mod}: {e}")
        failed.append(mod)

print("\n" + "=" * 60)
if failed:
    print(f"Still missing: {failed}")
else:
    print("All key dependencies are importable!")
print("=" * 60)

