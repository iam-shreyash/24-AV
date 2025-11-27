# Installation Troubleshooting Guide

## Common Installation Errors

### Error: `pydantic-core` metadata generation failed

This error occurs when pip cannot build `pydantic-core` from source. Here are solutions:

#### Solution 1: Update pip and build tools (Recommended)
```powershell
cd backend
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

#### Solution 2: Install pydantic-core separately
```powershell
cd backend
pip install pydantic-core
pip install -r requirements.txt
```

#### Solution 3: Use pre-built wheels
```powershell
cd backend
pip install --only-binary :all: pydantic
pip install -r requirements.txt
```

#### Solution 4: Install Microsoft Visual C++ Build Tools
If the above don't work, you may need build tools:
1. Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Install "C++ build tools" workload
3. Restart terminal and try again

#### Solution 5: Use Python 3.11 or 3.12
Python 3.14 is very new. Consider using Python 3.11 or 3.12 for better compatibility:
```powershell
# Check your Python version
python --version

# If using Python 3.14, consider installing Python 3.12
# Download from: https://www.python.org/downloads/
```

### Error: `psycopg2-binary` installation fails

#### Solution: Install PostgreSQL development libraries
```powershell
# Windows: psycopg2-binary should work without additional setup
# If it fails, try:
pip install psycopg2-binary --no-cache-dir
```

### Error: `reportlab` installation fails

#### Solution: Install dependencies
```powershell
pip install reportlab --upgrade
```

### General Installation Tips

1. **Always activate virtual environment first:**
   ```powershell
   cd backend
   .\.venv\Scripts\Activate.ps1
   ```

2. **Install packages one by one if bulk install fails:**
   ```powershell
   pip install fastapi
   pip install uvicorn
   pip install sqlalchemy
   # etc.
   ```

3. **Clear pip cache:**
   ```powershell
   pip cache purge
   pip install -r requirements.txt
   ```

4. **Use --no-cache-dir flag:**
   ```powershell
   pip install -r requirements.txt --no-cache-dir
   ```

5. **Check Python version compatibility:**
   - Python 3.9+ recommended
   - Python 3.11 or 3.12 works best
   - Python 3.14 may have compatibility issues

### Still Having Issues?

1. Check Python version: `python --version`
2. Check pip version: `pip --version`
3. Update both: `python -m pip install --upgrade pip`
4. Try installing in a fresh virtual environment:
   ```powershell
   cd backend
   Remove-Item -Recurse -Force .venv
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install --upgrade pip setuptools wheel
   pip install -r requirements.txt
   ```

