"""
Test script to verify the AI Travel Planning Platform setup.
Run this after setup to ensure everything is configured correctly.
"""

import sys
import os
from pathlib import Path

def test_python_version():
    """Test if Python version is 3.8 or higher."""
    print("Testing Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Need 3.8+")
        return False

def test_imports():
    """Test if all required packages can be imported."""
    print("\nTesting package imports...")
    packages = {
        'fastapi': 'FastAPI',
        'uvicorn': 'Uvicorn',
        'pydantic': 'Pydantic',
        'streamlit': 'Streamlit',
        'requests': 'Requests',
        'dotenv': 'python-dotenv',
        'google.generativeai': 'google-generativeai'
    }
    
    all_ok = True
    for package, name in packages.items():
        try:
            __import__(package)
            print(f"✅ {name} - OK")
        except ImportError:
            print(f"❌ {name} - NOT INSTALLED")
            all_ok = False
    
    return all_ok

def test_env_file():
    """Test if .env file exists and has API key."""
    print("\nTesting environment configuration...")
    
    if not Path('.env').exists():
        print("❌ .env file not found")
        print("   Run: copy .env.example .env")
        return False
    
    print("✅ .env file exists")
    
    # Check if API key is set
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key == 'your_gemini_api_key_here':
        print("⚠️  GEMINI_API_KEY not configured")
        print("   Please add your API key to .env file")
        return False
    
    print("✅ GEMINI_API_KEY is configured")
    return True

def test_project_structure():
    """Test if all required files and directories exist."""
    print("\nTesting project structure...")
    
    required_paths = [
        'backend/main.py',
        'backend/schemas.py',
        'backend/utils.py',
        'backend/agents/budget_agent.py',
        'backend/agents/sustainability_agent.py',
        'backend/agents/preference_agent.py',
        'backend/agents/planner_agent.py',
        'frontend/app.py',
        'requirements.txt',
        'README.md'
    ]
    
    all_ok = True
    for path in required_paths:
        if Path(path).exists():
            print(f"✅ {path}")
        else:
            print(f"❌ {path} - MISSING")
            all_ok = False
    
    return all_ok

def test_backend_imports():
    """Test if backend modules can be imported."""
    print("\nTesting backend modules...")
    
    try:
        from backend.schemas import TravelRequest, TravelPlan
        print("✅ Backend schemas - OK")
    except Exception as e:
        print(f"❌ Backend schemas - ERROR: {e}")
        return False
    
    try:
        from backend.agents.budget_agent import BudgetAgent
        from backend.agents.sustainability_agent import SustainabilityAgent
        from backend.agents.preference_agent import PreferenceAgent
        from backend.agents.planner_agent import PlannerAgent
        print("✅ Backend agents - OK")
    except Exception as e:
        print(f"❌ Backend agents - ERROR: {e}")
        return False
    
    return True

def main():
    """Run all tests."""
    print("="*60)
    print("AI Travel Planning Platform - Setup Verification")
    print("="*60)
    
    results = []
    
    # Run tests
    results.append(("Python Version", test_python_version()))
    results.append(("Package Imports", test_imports()))
    results.append(("Environment Config", test_env_file()))
    results.append(("Project Structure", test_project_structure()))
    results.append(("Backend Modules", test_backend_imports()))
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    print("\n" + "="*60)
    if all_passed:
        print("🎉 All tests passed! Your setup is complete.")
        print("\nNext steps:")
        print("1. Make sure your Gemini API key is in .env")
        print("2. Run: start.bat")
        print("3. Open http://localhost:8501 in your browser")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("- Run: pip install -r requirements.txt")
        print("- Create .env from .env.example")
        print("- Add your Gemini API key to .env")
    print("="*60)

if __name__ == "__main__":
    main()
