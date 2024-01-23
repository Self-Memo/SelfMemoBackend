const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('D:\\Repositories\\TU-Graz\\Master\\1.Semester\\IAWEB\\Self-Memo-GIT\\SelfMemoBackend\\test.db');

module.exports = db;