# How This Backend Connects to the Database

This project uses Node.js + Express + `mysql2/promise` to connect to a MySQL-compatible database. There is no separate database service, model directory, or migration directory: the connection and SQL statements are currently kept in `server.js`.

## The connection flow

```text
backend/.env
    -> dotenv.config() in server.js
    -> mysql.createPool({...})
    -> pool.getConnection() checks the connection
    -> API handlers call pool.query(...)
    -> /api/* responses are returned to the frontend
```

## Main connection code

| Location | What it does |
| --- | --- |
| [backend/.env](.env#L1-L10) | Stores the port and database settings. The important variables are `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. Do not commit this file or share its values. |
| [server.js](server.js#L2-L9) | Imports `mysql2/promise` and `dotenv`, then calls `dotenv.config()`. `dotenv` reads `backend/.env` and places its values in `process.env`. |
| [server.js](server.js#L33-L46) | Creates the MySQL connection pool. The pool is shared by all requests. It also enables TLS with a minimum TLS version of 1.2 and certificate verification. |
| [server.js](server.js#L49-L57) | Opens one pool connection at startup to verify that the database is reachable, then releases it. |
| [backend/package.json](package.json#L14-L21) | Declares `dotenv` and `mysql2` as backend dependencies. |
| [backend/package-lock.json](package-lock.json#L1-L25) | Locks the installed versions of those dependencies for repeatable installs. |
| [backend/.gitignore](.gitignore#L1-L2) | Prevents `.env` and `node_modules` from being committed. |
| [README.md](../README.md#L48) | Documents the backend setup, required `DB_*` variables, MySQL prerequisite, and the `/api/test` check. |

## What each pool setting means

In [server.js](server.js#L34-L46):

- `host`: the database server address from `DB_HOST`.
- `port`: the database port from `DB_PORT`; this project defaults to `4000`.
- `user`: the database username from `DB_USER`.
- `password`: the database password from `DB_PASSWORD`.
- `database`: the schema/database name from `DB_NAME`.
- `waitForConnections: true`: waits when all pooled connections are busy.
- `connectionLimit: 10`: allows up to ten active pooled connections.
- `queueLimit: 0`: does not impose a fixed limit on queued requests.
- `ssl`: requires TLS 1.2 or newer and rejects untrusted certificates.

The fallback values in `server.js` are only defaults. In normal use, the `.env` values should be present. The code does not create the database or tables; those must already exist on the MySQL server.

## Database-dependent API routes

All of these routes use the `pool` created in [server.js](server.js#L34-L46):

| Route and location | SQL/database work |
| --- | --- |
| `GET /api/test`, [server.js](server.js#L64-L73) | Runs `SELECT 1 + 1 AS solution`. This is the simplest connection test. |
| `POST /api/staff/signup`, [server.js](server.js#L88-L105) | Hashes the password, then inserts a row into `Staff`. `?` placeholders and the second array argument safely bind values. |
| `POST /api/staff/signin`, [server.js](server.js#L107-L125) | Selects a staff row from `Staff`, then compares the stored password hash with the submitted password. |
| `GET /api/staff`, [server.js](server.js#L127-L137) | Selects staff records ordered by `created_at`. |
| `PATCH /api/staff/:id/status`, [server.js](server.js#L139-L151) | Updates the `active` value for one `Staff` row. |
| `GET /api/rooms`, [server.js](server.js#L153-L163) | Selects every row from `Room`. |
| `POST /api/rooms`, [server.js](server.js#L165-L198) | Inserts a room into `Room`, including its uploaded image URL. Database errors are returned to the caller. |
| `POST /api/bookings`, [server.js](server.js#L200-L256) | Gets a dedicated connection, starts a transaction, checks/inserts a `GUEST`, inserts a `BOOKING`, commits on success, and rolls back on failure. |

## Pool queries versus transactions

Most routes use `await pool.query(...)`. The pool automatically borrows a connection, runs the SQL, and returns the connection to the pool.

Bookings are different. In [server.js](server.js#L204-L249), the handler calls `pool.getConnection()` and keeps the same connection for several dependent operations:

1. `beginTransaction()` starts an all-or-nothing operation.
2. It searches for an existing guest.
3. It inserts the guest if needed.
4. It inserts the booking.
5. `commit()` permanently saves all changes.
6. If a database error occurs, `rollback()` cancels the transaction.
7. `finally` calls `connection.release()` so the pooled connection can be reused.

## Frontend callers

These frontend files do not connect directly to MySQL. They call the Express API, which then executes the SQL above:

- [frontend/src/pages/AccessPortal.tsx](../frontend/src/pages/AccessPortal.tsx#L38-L45): staff signup/signin.
- [frontend/src/pages/AdminLogin.tsx](../frontend/src/pages/AdminLogin.tsx#L15-L19): administrator signin. This route uses environment credentials, not the database.
- [frontend/src/pages/guest/Book.tsx](../frontend/src/pages/guest/Book.tsx#L39-L39): creates a booking.
- [frontend/src/pages/guest/Rooms.tsx](../frontend/src/pages/guest/Rooms.tsx#L46-L46): reads rooms.
- [frontend/src/pages/system-admin/Dashboard.tsx](../frontend/src/pages/system-admin/Dashboard.tsx#L32-L45): reads staff and changes staff approval status.
- [frontend/src/pages/system-admin/Rooms.tsx](../frontend/src/pages/system-admin/Rooms.tsx#L42-L94): reads and creates rooms.

## How to test the connection

From the `backend` directory:

```powershell
npm install
npm run dev
```

Then open `http://localhost:5000/api/test`. A successful response contains a message saying the database connection was successful and a result of `2` from `SELECT 1 + 1`.

At startup, also look for:

```text
Successfully connected to the MySQL database.
```

If it fails, check the five `DB_*` variables, network access to the database host and port, the database user permissions, TLS requirements, and whether the named tables exist.

## Important security note

The `.env` file contains live-looking database and application secrets. Keep it private, rotate those credentials if they have been exposed, and use placeholder values in documentation or screenshots. The existing `.gitignore` is intended to keep `.env` out of Git.
