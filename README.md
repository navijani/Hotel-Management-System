# Hotel Management System

A full-stack Hotel Management System built with a React/TypeScript frontend and a Node.js/Express backend, utilizing a MySQL database.

## 🚀 Technologies Used

**Frontend:**
- React 19
- TypeScript
- Vite
- Material UI (MUI)
- React Router DOM

**Backend:**
- Node.js
- Express
- MySQL2
- CORS
- dotenv

## 📁 Project Structure

```text
Hotel Management System/
├── backend/            # Node.js & Express backend server
│   ├── package.json    # Backend dependencies
│   └── server.js       # Main server entry point
└── frontend/           # React & Vite frontend application
    ├── package.json    # Frontend dependencies
    ├── src/            # React source code (components, pages, etc.)
    └── vite.config.ts  # Vite configuration
```

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A MySQL database instance

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Hotel Management System"
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and configure your database connection:
   ```env
   DB_HOST=your_database_host
   DB_PORT=4000
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=hotelmanegmentsystem
   PORT=5000
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend API will run on http://localhost:5000*

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend app will run on http://localhost:5173*

## 📡 API Endpoints

The backend currently exposes the following endpoints:

- `GET /api/test` - Test the database connection
- `GET /api/rooms` - Fetch all rooms from the `Room` database table

## 🔒 Security Note

- Always keep your `.env` variables secure. A `.gitignore` file is included in the backend directory to prevent accidental commits of your database credentials to GitHub.
