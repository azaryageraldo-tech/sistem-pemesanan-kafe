// Menggunakan package mysql2
const mysql = require('mysql2');
// Menggunakan package dotenv untuk mengakses file .env
require('dotenv').config();

// Membuat koneksi pool ke database
// Pool lebih efisien daripada koneksi tunggal
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Ekspor koneksi dalam bentuk promise agar bisa digunakan di file lain
module.exports = pool.promise();