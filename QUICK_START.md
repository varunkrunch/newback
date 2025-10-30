# ⚡ Quick Start Guide - Open Notebook

## 🎯 One-Command Setup (After Prerequisites)

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional)

---

## 🚀 Setup in 3 Steps

### 1️⃣ Start Database (Terminal 1)
```bash
docker run --name surrealdb -p 8000:8000 -d \
  surrealdb/surrealdb:latest start \
  --log trace --user root --pass root memory
```

### 2️⃣ Start Backend (Terminal 2)
```bash
cd fastapi_backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
./install-dependencies.sh
cp .env.example .env
# Edit .env and add your OpenAI API key
python run.py
```

### 3️⃣ Start Frontend (Terminal 3)
```bash
cd frontend-connector
npm install
cp .env.example .env.local
npm run dev
```

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8001 |
| **API Docs** | http://localhost:8001/docs |
| **SurrealDB** | http://localhost:8000 |

---

## ✅ Quick Test

```bash
# Test backend
curl http://localhost:8001/health

# Test frontend
open http://localhost:5173
```

---

## 🔑 Minimum Required

**You need at least ONE API key:**
- OpenAI: https://platform.openai.com/api-keys

Add to `fastapi_backend/.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

---

## ⚠️ SECURITY WARNING

**Your API keys are currently exposed in `.env`!**

**DO THIS NOW:**
1. Revoke exposed keys from provider dashboards
2. Generate new keys
3. Remove from git:
   ```bash
   cd fastapi_backend
   git rm --cached .env
   ```

---

## 🐛 Quick Fixes

### Port in use?
```bash
lsof -i :8001
kill -9 <PID>
```

### Can't connect to backend?
- Check backend is running: `curl http://localhost:8001/health`
- Verify frontend `.env.local` has: `VITE_API_BASE_URL=http://localhost:8001`

### Module not found?
```bash
source venv/bin/activate
pip install -r requirements-backend.txt
```

---

## 📚 Full Documentation

- **SETUP_SUMMARY.md** - Complete setup guide
- **DEPLOYMENT_GUIDE.md** - Deployment instructions
- **ISSUES_AND_FIXES.md** - All issues & solutions

---

## 🎯 Success Check

✅ All working if:
- Backend health returns OK
- Frontend loads
- Can create notebook
- Can upload file
- Chat responds (with API key)

---

**Need help?** Check SETUP_SUMMARY.md for detailed troubleshooting.
