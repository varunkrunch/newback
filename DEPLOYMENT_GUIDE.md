# 🚀 Complete Deployment & Testing Guide for Another Computer

This guide provides step-by-step instructions to set up and test the **Open Notebook** application (FastAPI backend + React frontend) on a fresh computer.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Testing the Application](#testing-the-application)
5. [Issues Found & Fixes](#issues-found--fixes)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software
- **Python 3.10+** (recommended: 3.11 or 3.12)
- **Node.js 18+** and npm
- **Git**
- **Docker** (optional but recommended for SurrealDB)

### Required API Keys
You'll need at least one of these API keys for AI features:
- **OpenAI API Key** (for GPT models and TTS)
- **Anthropic API Key** (optional, for Claude models)
- **Google API Key** (optional, for Gemini models)
- **Serper API Key** (optional, for web search)
- **TheAlpha API Key** (optional, for TTS/STT)

---

## 🔙 Backend Setup

### Step 1: Clone the Repository
```bash
# Clone your repository
git clone <your-repo-url>
cd <repo-name>/fastapi_backend
```

### Step 2: Install SurrealDB

#### Option A: Using Docker (Recommended)
```bash
docker run --name surrealdb -p 8000:8000 -d \
  surrealdb/surrealdb:latest start \
  --log trace --user root --pass root memory
```

#### Option B: Direct Installation
```bash
# macOS
brew install surrealdb/tap/surrealdb

# Linux
curl -sSf https://install.surrealdb.com | sh

# Windows
iwr https://windows.surrealdb.com -useb | iex

# Start SurrealDB
surrealdb start --log trace --user root --pass root memory
```

### Step 3: Set Up Python Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip
```

### Step 4: Install Dependencies
```bash
# Install git dependencies first
pip install git+https://github.com/lfnovo/surreal-lite-py.git
pip install git+https://github.com/lfnovo/podcastfy.git

# Fix NumPy compatibility
pip install "numpy>=1.22.4,<2.0.0" --force-reinstall

# Install main requirements
pip install -r requirements-backend.txt
```

**OR** use the automated script:
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### Step 5: Configure Environment Variables

Create a `.env` file in the `fastapi_backend` directory:

```bash
# Database Configuration
SURREAL_ADDRESS=localhost
SURREAL_PORT=8000
SURREAL_USER=root
SURREAL_PASS=root
SURREAL_NAMESPACE=open_notebook
SURREAL_DATABASE=open_notebook

# FastAPI Configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8001
FASTAPI_RELOAD=true

# AI API Keys (Add your actual keys)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
SERPER_API_KEY=your_serper_api_key_here
THEALPHA_API_KEY=your_thealpha_api_key_here
THEALPHA_API_BASE=https://thealpha.dev/api
```

### Step 6: Start the Backend Server
```bash
# Make sure you're in the fastapi_backend directory
# and virtual environment is activated
python run.py
```

The backend should start on `http://localhost:8001`

### Step 7: Verify Backend Installation
```bash
# Health check
curl http://localhost:8001/health

# View API docs
open http://localhost:8001/docs
```

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd ../frontend-connector
```

### Step 2: Install Dependencies
```bash
# Install Node.js dependencies
npm install

# OR if you prefer yarn
yarn install
```

### Step 3: Configure API Endpoint

**IMPORTANT**: Check the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8001';  // Should match backend port
```

**Current Issue**: The frontend is configured to use port `8003`, but the backend runs on port `8001`. You need to update this.

### Step 4: Start the Frontend Development Server
```bash
npm run dev

# OR
yarn dev
```

The frontend should start on `http://localhost:5173` (Vite default)

---

## 🧪 Testing the Application

### 1. Basic Backend Tests

#### Test Health Endpoint
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{"status": "healthy", "message": "Backend is running"}
```

#### Test Notebook Creation
```bash
curl -X POST "http://localhost:8001/api/v1/notebooks" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Notebook",
    "description": "Testing the API"
  }'
```

#### Test Notebook Listing
```bash
curl http://localhost:8001/api/v1/notebooks
```

### 2. Frontend Tests

1. **Open the frontend**: Navigate to `http://localhost:5173`
2. **Create a notebook**: Click "New Notebook" and create one
3. **Upload a source**: Upload a text file or PDF
4. **Test chat**: Try asking questions about your content
5. **Create notes**: Test the note creation feature
6. **Generate podcast**: Try generating a podcast (requires API keys)

### 3. Integration Tests

Run the provided test scripts:
```bash
cd fastapi_backend

# Test database connection
python test_db.py

# Test note endpoints
python test_note_endpoints.py

# Test models integration
python test_models_integration.py

# Quick comprehensive test
python quick_test.py
```

---

## 🐛 Issues Found & Fixes

### ❌ Critical Issues

#### 1. **Port Mismatch Between Frontend and Backend**
- **Issue**: Frontend API config uses port `8003`, backend runs on `8001`
- **Location**: `frontend-connector/src/services/api.ts` line 5
- **Fix Required**: Change `API_BASE_URL` to `'http://localhost:8001'`

#### 2. **Missing Local Dependencies**
- **Issue**: `requirements-backend.txt` references local packages that don't exist:
  ```
  -e ./surreal-lite-py
  -e ./podcastfy
  ```
- **Location**: `fastapi_backend/requirements-backend.txt` lines 20-21
- **Fix**: These should be installed from GitHub instead (handled by `install-dependencies.sh`)

#### 3. **Exposed API Keys in .env File**
- **Issue**: Real API keys are committed in `.env` file
- **Location**: `fastapi_backend/.env`
- **Security Risk**: HIGH - API keys should NEVER be committed to version control
- **Fix Required**: 
  1. Remove `.env` from git tracking
  2. Create `.env.example` template
  3. Revoke and regenerate exposed API keys

#### 4. **Missing .env File for Frontend**
- **Issue**: Frontend has no environment configuration
- **Location**: `frontend-connector/` directory
- **Fix Required**: Create `.env` or `.env.local` file with:
  ```
  VITE_API_BASE_URL=http://localhost:8001
  ```

### ⚠️ Minor Issues

#### 5. **Dockerfile CMD Path Incorrect**
- **Issue**: Dockerfile references `app.main:app` instead of `src.main:app`
- **Location**: `fastapi_backend/Dockerfile` line 32
- **Fix Required**: Change to `CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]`

#### 6. **Docker Compose Port Conflict**
- **Issue**: Docker Compose maps SurrealDB to port `8001`, conflicts with FastAPI
- **Location**: `fastapi_backend/docker-compose.yml` line 34
- **Fix Required**: Change to `"8000:8000"` or use different port

#### 7. **Unused Backup Files**
- **Issue**: Multiple backup files cluttering the codebase
- **Location**: 
  - `src/routers/chat_backup.py`
  - `src/routers/chat_old.py`
  - `src/routers/notes_backup.py`
- **Recommendation**: Remove or move to a `backups/` directory

#### 8. **Empty Test Directories**
- **Issue**: `test/` and `tests/` directories are empty
- **Location**: `fastapi_backend/test/` and `fastapi_backend/tests/`
- **Recommendation**: Consolidate test files into one directory

---

## ✅ Recommended Fixes

### Fix 1: Update Frontend API Configuration
```bash
cd frontend-connector
```

Edit `src/services/api.ts`:
```typescript
// Change line 5 from:
const API_BASE_URL = 'http://localhost:8003';
// To:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
```

Create `.env.local`:
```bash
echo "VITE_API_BASE_URL=http://localhost:8001" > .env.local
```

### Fix 2: Secure API Keys
```bash
cd fastapi_backend

# Create .env.example template
cat > .env.example << 'EOF'
# Database Configuration
SURREAL_ADDRESS=localhost
SURREAL_PORT=8000
SURREAL_USER=root
SURREAL_PASS=root
SURREAL_NAMESPACE=open_notebook
SURREAL_DATABASE=open_notebook

# FastAPI Configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8001
FASTAPI_RELOAD=true

# AI API Keys (Replace with your actual keys)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
SERPER_API_KEY=your_serper_api_key_here
THEALPHA_API_KEY=your_thealpha_api_key_here
THEALPHA_API_BASE=https://thealpha.dev/api
EOF

# Add .env to .gitignore
echo ".env" >> .gitignore
```

### Fix 3: Update Dockerfile
Edit `fastapi_backend/Dockerfile` line 32:
```dockerfile
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Fix 4: Clean Up Backup Files
```bash
cd fastapi_backend
mkdir -p backups
mv src/routers/*_backup.py backups/
mv src/routers/*_old.py backups/
```

---

## 🔍 Troubleshooting

### Backend Won't Start

#### Error: "ModuleNotFoundError"
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements-backend.txt
```

#### Error: "Port already in use"
```bash
# Find process using port 8001
lsof -i :8001  # macOS/Linux
netstat -ano | findstr :8001  # Windows

# Kill the process or change port in .env
```

#### Error: "Cannot connect to SurrealDB"
```bash
# Check if SurrealDB is running
curl http://localhost:8000/health

# If not running, start it:
docker start surrealdb
# OR
surrealdb start --log trace --user root --pass root memory
```

### Frontend Won't Start

#### Error: "EADDRINUSE"
```bash
# Port 5173 is in use, kill the process or use different port
npm run dev -- --port 3000
```

#### Error: "Cannot connect to backend"
- Check backend is running on correct port
- Verify `API_BASE_URL` in `src/services/api.ts`
- Check CORS settings in backend

### API Requests Failing

#### 404 Errors
- Verify endpoint paths match between frontend and backend
- Check backend logs for routing issues

#### CORS Errors
- Backend has CORS enabled for all origins in development
- If still having issues, check browser console for details

---

## 📊 Success Checklist

Your deployment is successful when:

- ✅ SurrealDB is running on port 8000
- ✅ Backend starts without errors on port 8001
- ✅ Backend health check returns 200 OK
- ✅ API documentation loads at http://localhost:8001/docs
- ✅ Frontend starts on port 5173 (or configured port)
- ✅ You can create notebooks from the frontend
- ✅ You can upload sources
- ✅ You can create notes
- ✅ Chat functionality works (with API keys configured)
- ✅ All test scripts pass

---

## 🎯 Quick Start Commands

### Start Everything (3 Terminal Windows)

**Terminal 1 - SurrealDB:**
```bash
docker run --name surrealdb -p 8000:8000 -d \
  surrealdb/surrealdb:latest start \
  --log trace --user root --pass root memory
```

**Terminal 2 - Backend:**
```bash
cd fastapi_backend
source venv/bin/activate
python run.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend-connector
npm run dev
```

---

## 📚 Additional Resources

- **Backend API Docs**: http://localhost:8001/docs
- **Backend ReDoc**: http://localhost:8001/redoc
- **SurrealDB Docs**: https://surrealdb.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev

---

## 🆘 Getting Help

If you encounter issues:

1. Check the logs in both backend and frontend terminals
2. Verify all prerequisites are installed
3. Ensure all environment variables are set correctly
4. Check that all ports are available and not blocked by firewall
5. Review the troubleshooting section above

---

**Last Updated**: October 30, 2024
**Version**: 1.0.0
