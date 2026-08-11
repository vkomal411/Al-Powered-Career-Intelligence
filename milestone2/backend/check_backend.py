import glob
import py_compile
import sys

files = glob.glob("app/**/*.py", recursive=True) + ["run_tests.py"] + glob.glob("tests/**/*.py", recursive=True)
errors = []

for f in files:
    try:
        py_compile.compile(f, doraise=True)
    except Exception as exc:
        errors.append((f, str(exc)))

if errors:
    print(f"FAILED: Found {len(errors)} syntax/compile errors:")
    for f, err in errors:
        print(f"  {f}: {err}")
    sys.exit(1)
else:
    print(f"SUCCESS: All {len(files)} Python backend files compiled cleanly with 0 errors!")
