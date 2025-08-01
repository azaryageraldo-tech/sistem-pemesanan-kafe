const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// [UNTUK PELANGGAN] - Mengambil semua menu yang tersedia
const getAllMenus = async (req, res) => {
  try {
    const query = 'SELECT * FROM menus WHERE is_available = 1';
    const [menus] = await db.query(query);
    res.status(200).json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Eror' });
  }
};

// [UNTUK ADMIN] - Mengambil semua menu
const getAdminAllMenus = async (req, res) => {
  try {
    const query = 'SELECT * FROM menus ORDER BY id DESC';
    const [menus] = await db.query(query);
    res.status(200).json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Eror' });
  }
};

// [UNTUK ADMIN] - Membuat menu baru
const createMenu = async (req, res) => {
  const { name, description, price, category, is_available } = req.body;
  const imageFile = req.files && req.files.length > 0 ? req.files[0] : null;
  const image_url = imageFile ? `/public/uploads/${imageFile.filename}` : null;

  try {
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Nama, harga, dan kategori wajib diisi.' });
    }
    const query = 'INSERT INTO menus (name, description, price, category, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [name, description, price, category, image_url, is_available || 1]);
    res.status(201).json({ success: true, message: 'Menu berhasil ditambahkan', menuId: result.insertId });
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).json({ success: false, message: 'Server Eror' });
  }
};

// [UNTUK ADMIN] - Memperbarui menu
const updateMenu = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, is_available, existing_image_url } = req.body;
  let imageUrl = existing_image_url;

  if (req.files && req.files.length > 0) {
    const newImageFile = req.files[0];
    imageUrl = `/public/uploads/${newImageFile.filename}`;
    if (existing_image_url) {
      const oldImagePath = path.join(__dirname, '..', existing_image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
  }

  try {
    const query = `UPDATE menus SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ? WHERE id = ?`;
    await db.query(query, [name, description, price, category, imageUrl, is_available, id]);
    res.status(200).json({ success: true, message: 'Menu berhasil diperbarui' });
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(500).json({ success: false, message: 'Server Eror' });
  }
};

// [UNTUK ADMIN] - Menghapus menu
const deleteMenu = async (req, res) => {
  const { id } = req.params;
  try {
    const [menu] = await db.query('SELECT image_url FROM menus WHERE id = ?', [id]);
    const imageUrl = menu[0]?.image_url;
    
    await db.query('DELETE FROM menus WHERE id = ?', [id]);

    if (imageUrl) {
      const imagePath = path.join(__dirname, '..', imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.status(200).json({ success: true, message: 'Menu berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Eror' });
  }
};

module.exports = {
  getAllMenus,
  getAdminAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
};