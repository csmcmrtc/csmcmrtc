"""
Simple setup verification script
"""

import sys

print("="*60)
print("AI Travel Planning Platform - Setup Check")
print("="*60)

# Check Python version
print("\n1. Python Version:")
version = sys.version_info
print(f"   Python {version.major}.{version.minor}.{version.micro}")
if version.major >= 3 and version.minor >= 8:
    print("   [OK] Version is compatible")
else:
    print("   [ERROR] Need Python 3.8+")

# Check imports
print("\n2. Required Packages:")
packages = [
    'fastapi',
    'uvicorn',
    'pydantic',
    'streamlit',
    'requests',
    'dotenv',
    'google.generativeai'
]

all_ok = True
for package in packages:
    try:
        __import__(package)
        print(f"   [OK] {package}")
    except ImportError:
        print(f"   [MISSING] {package}")
        all_ok = False

# Check .env file
print("\n3. Configuration:")
try:
    from pathlib import Path
    if Path('.env').exists():
        print("   [OK] .env file exists")
        from dotenv import load_dotenv
        import os
        load_dotenv()
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key and api_key != 'your_gemini_api_key_here':
            print("   [OK] API key is configured")
        else:
            print("   [WARNING] Please add your Gemini API key to .env")
    else:
        print("   [ERROR] .env file not found")
except Exception as e:
    print(f"   [ERROR] {e}")

# Check project structure
print("\n4. Project Files:")
required = [
    'backend/main.py',
    'backend/schemas.py',
    'frontend/app.py'
]

for file in required:
    if Path(file).exists():
        print(f"   [OK] {file}")
    else:
        print(f"   [MISSING] {file}")

print("\n" + "="*60)
if all_ok:
    print("Setup looks good!")
    print("\nNext steps:")
    print("1. Add your Gemini API key to .env file")
    print("2. Run: python -m backend.main (in one terminal)")
    print("3. Run: streamlit run frontend/app.py (in another terminal)")
else:
    print("Some packages are missing.")
    print("Run: pip install -r requirements.txt")
print("="*60)
