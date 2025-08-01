const express = require('express');
const http = require('http'); // <-- Impor modul http bawaan Node.js
const { Server } = require("socket.io"); // <-- Impor Server dari socket.io
const cors = require('cors');

// Impor routes
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const httpServer = http.createServer(app); // <-- Buat server HTTP dari aplikasi Express
const io = new Server(httpServer, { // <-- Inisialisasi Socket.IO
  cors: {
    origin: "http://localhost:5173", // Izinkan koneksi dari frontend Vue
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());


// Middleware untuk meneruskan 'io' ke controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes Utama
app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di API Kafe.' });
});

// Gunakan routes
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/public', express.static('public'));
app.use('/api/reports', reportRoutes);

// Listener untuk koneksi Socket.IO
io.on('connection', (socket) => {
  console.log('User terhubung:', socket.id);
  socket.on('disconnect', () => {
    console.log('User terputus:', socket.id);
  });
});

// Jalankan server menggunakan httpServer, bukan app
httpServer.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});