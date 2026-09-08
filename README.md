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
   PAYHERE_MERCHANT_ID=xxxx
   PAYHERE_MERCHANT_KEY=xxxx
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

## 💳 Payment Testing

Use the sandbox payment cards below to simulate different payment outcomes during testing.

> For the cardholder name, CVV, and expiry date, any valid test values will work.

### Successful Payments

<table>
  <thead>
    <tr>
      <th>Card Type</th>
      <th>Card Number</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Visa</td>
      <td><code>4916217501611292</code></td>
      <td><button onclick="navigator.clipboard.writeText('4916217501611292'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button></td>
    </tr>
    <tr>
      <td>MasterCard</td>
      <td><code>5307732125531191</code></td>
      <td><button onclick="navigator.clipboard.writeText('5307732125531191'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button></td>
    </tr>
    <tr>
      <td>AMEX</td>
      <td><code>346781005510225</code></td>
      <td><button onclick="navigator.clipboard.writeText('346781005510225'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button></td>
    </tr>
  </tbody>
</table>

### Decline Scenarios

| Scenario | Card Type | Card Number | Copy |
| --- | --- | --- | --- |
| Insufficient Funds | Visa | <code>4024007194349121</code> | <button onclick="navigator.clipboard.writeText('4024007194349121'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Insufficient Funds | MasterCard | <code>5459051433777487</code> | <button onclick="navigator.clipboard.writeText('5459051433777487'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Insufficient Funds | AMEX | <code>370787711978928</code> | <button onclick="navigator.clipboard.writeText('370787711978928'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Limit Exceeded | Visa | <code>4929119799365646</code> | <button onclick="navigator.clipboard.writeText('4929119799365646'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Limit Exceeded | MasterCard | <code>5491182243178283</code> | <button onclick="navigator.clipboard.writeText('5491182243178283'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Limit Exceeded | AMEX | <code>340701811823469</code> | <button onclick="navigator.clipboard.writeText('340701811823469'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Do Not Honor | Visa | <code>4929768900837248</code> | <button onclick="navigator.clipboard.writeText('4929768900837248'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Do Not Honor | MasterCard | <code>5388172137367973</code> | <button onclick="navigator.clipboard.writeText('5388172137367973'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Do Not Honor | AMEX | <code>374664175202812</code> | <button onclick="navigator.clipboard.writeText('374664175202812'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Network Error | Visa | <code>4024007120869333</code> | <button onclick="navigator.clipboard.writeText('4024007120869333'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Network Error | MasterCard | <code>5237980565185003</code> | <button onclick="navigator.clipboard.writeText('5237980565185003'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |
| Network Error | AMEX | <code>373433500205887</code> | <button onclick="navigator.clipboard.writeText('373433500205887'); this.textContent='Copied'; setTimeout(() => this.textContent='Copy', 1200)">Copy</button> |

Any test card that is not listed above will result in a failed payment.
