# AI-Powered Content Management System

A full-stack application with FastAPI backend and modern frontend for AI-powered content management.

## 🚀 Features

- **Backend**: FastAPI with Python 3.9+
- **Frontend**: Modern React-based UI
- **AI Integration**: LangChain, OpenAI, and more
- **Database**: SurrealDB with SQLite
- **Authentication**: JWT-based authentication

## 🛠️ Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- pip
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/varunkrunch/newback.git
   cd newback
   ```

2. **Backend Setup**
   ```bash
   cd fastapi_backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements-backend.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

## 🚦 Running the Application

### Backend
```bash
cd fastapi_backend
uvicorn main:app --reload
```

### Frontend
```bash
cd fastapi_backend/frontend
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
