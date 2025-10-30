# 📦 Backend Requirements Updates

## Added Missing Dependencies

The following packages were missing from `requirements-backend.txt` and have been added:

### Core Missing Packages:

1. **`typing-extensions>=4.8.0`**
   - **Used in**: Multiple graph modules for `TypedDict`
   - **Files**: 
     - `src/open_notebook/graphs/transformation.py`
     - `src/open_notebook/graphs/prompt.py`
     - `src/open_notebook/graphs/source.py`
     - `src/open_notebook/graphs/chat.py`
     - `src/open_notebook/graphs/ask.py`

2. **`python-dateutil>=2.8.2`**
   - **Used in**: Podcast router for date parsing
   - **Files**: `src/routers/podcasts.py`
   - **Import**: `from dateutil import parser`

3. **`numpy>=1.22.4,<2.0.0`**
   - **Used by**: AI/ML libraries (langchain, embeddings)
   - **Note**: Version constraint to avoid compatibility issues

4. **`packaging>=23.0`**
   - **Used in**: Version comparison utilities
   - **Files**: `src/open_notebook/utils.py`
   - **Import**: `from packaging.version import parse as parse_version`

5. **`mutagen>=1.47.0`**
   - **Used in**: Podcast audio file metadata handling
   - **Files**: `src/open_notebook/plugins/podcasts.py`
   - **Import**: `from mutagen.mp3 import MP3`

6. **`langchain-text-splitters>=0.3.0`**
   - **Used in**: Text processing and chunking
   - **Files**: `src/open_notebook/utils.py`
   - **Import**: `from langchain_text_splitters import RecursiveCharacterTextSplitter`

---

## Documentation Improvements:

### Clarified Local Package Installation:
Updated the comments for `surreal-lite-py` and `podcastfy` to clearly indicate they should be installed from GitHub:

```bash
# Install from GitHub (recommended):
pip install git+https://github.com/lfnovo/surreal-lite-py.git
pip install git+https://github.com/lfnovo/podcastfy.git

# Or use the automated script:
./install-dependencies.sh
```

### Marked Streamlit as Optional:
Added note that Streamlit dependencies are only needed if using the Streamlit UI interface (not required for the FastAPI backend alone).

---

## Complete Updated Requirements File:

```txt
# Core Dependencies
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
python-multipart>=0.0.6
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
aiofiles>=23.2.1
python-dotenv>=1.0.1
pyyaml>=6.0.0

# Streamlit and UI (Optional - only needed if using Streamlit interface)
streamlit>=1.45.0
streamlit-tags>=1.2.8
streamlit-scrollable-textbox>=0.0.3
streamlit-monaco>=0.1.3

# Database
surrealdb>=1.0.0

# NOTE: The following packages should be installed from GitHub:
# pip install git+https://github.com/lfnovo/surreal-lite-py.git
# pip install git+https://github.com/lfnovo/podcastfy.git
# Or use install-dependencies.sh script which handles this automatically

# AI/ML Core
pydantic>=2.9.2
langchain>=0.3.3
langchain-community>=0.3.3
langchain-openai>=0.2.3
langchain-anthropic>=0.2.3
langgraph>=0.2.38
langgraph-checkpoint-sqlite>=2.0.0

# AI Providers
langchain-ollama>=0.2.0
langchain-google-genai>=2.0.1
langchain-groq>=0.2.1
langchain-mistralai>=0.2.1
langchain-deepseek>=0.1.3
langchain-google-vertexai>=2.0.10
groq>=0.12.0

# Content Processing
content-core>=1.0.2
ai-prompter>=0.3.0
esperanto>=2.0.4
python-magic>=0.4.27
python-magic-bin>=0.4.14; sys_platform == 'win32'
langchain-text-splitters>=0.3.0

# Utilities
requests>=2.31.0
loguru>=0.7.2
humanize>=4.11.0
nest-asyncio>=1.6.0
tomli>=2.0.2
httpx[socks]>=0.27.0
tiktoken>=0.8.0
typing-extensions>=4.8.0
python-dateutil>=2.8.2
numpy>=1.22.4,<2.0.0
packaging>=23.0
mutagen>=1.47.0
```

---

## Installation Instructions:

### Method 1: Using the Install Script (Recommended)
```bash
cd fastapi_backend
chmod +x install-dependencies.sh
./install-dependencies.sh
```

This script will:
1. Install git dependencies (surreal-lite-py, podcastfy)
2. Fix NumPy compatibility
3. Install all requirements from requirements-backend.txt

### Method 2: Manual Installation
```bash
cd fastapi_backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install git dependencies
pip install git+https://github.com/lfnovo/surreal-lite-py.git
pip install git+https://github.com/lfnovo/podcastfy.git

# Fix NumPy compatibility
pip install "numpy>=1.22.4,<2.0.0" --force-reinstall

# Install main requirements
pip install -r requirements-backend.txt
```

---

## Verification:

After installation, verify all packages are installed:

```bash
python -c "
import typing_extensions
import dateutil
import numpy
import packaging
import mutagen
import langchain_text_splitters
print('✅ All missing packages are now installed!')
"
```

---

## Summary of Changes:

| Package | Version | Purpose | Critical |
|---------|---------|---------|----------|
| typing-extensions | >=4.8.0 | Type hints (TypedDict) | ✅ Yes |
| python-dateutil | >=2.8.2 | Date parsing | ✅ Yes |
| numpy | >=1.22.4,<2.0.0 | AI/ML operations | ✅ Yes |
| packaging | >=23.0 | Version comparison | ⚠️ Medium |
| mutagen | >=1.47.0 | Audio metadata | ⚠️ Medium |
| langchain-text-splitters | >=0.3.0 | Text chunking | ✅ Yes |

**Total packages added: 6**

---

**Last Updated**: October 30, 2024  
**Status**: Complete ✅
