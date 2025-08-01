const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk mendaftarkan user baru (untuk testing)
const register = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    await db.query(query, [username, hashedPassword, role]);
    res.status(201).json({ message: 'User berhasil didaftarkan' });
  } catch (error) {
    res.status(500).json({ message: 'Server eror', error });
  }
};

// Fungsi untuk login
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Cari user berdasarkan username
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Username tidak ditemukan' });
    }

    const user = users[0];

    // Bandingkan password yang diinput dengan yang ada di database
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // Jika password cocok, buat token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token berlaku selama 1 jam
    );

    res.json({ message: 'Login berhasil', token });
  } catch (error) {
    res.status(500).json({ message: 'Server eror', error });
  }
};

module.exports = { register, login };