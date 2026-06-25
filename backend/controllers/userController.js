const { User } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const ALLOWED_ROLES = ['user', 'admin', 'super_admin'];

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: `Role tidak valid. Hanya boleh: ${ALLOWED_ROLES.join(', ')}` });
    }

    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'Role updated', user: { id: user.id, role: user.role } });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !name.trim() || !email || !email.trim()) {
    return res.status(400).json({ message: 'Nama dan Email wajib diisi' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid.' });
  }

  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Cek jika email dirubah dan email baru sudah dipakai orang lain
    if (email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh akun lain.' });
      }
    }

    user.name = name.trim();
    user.email = email.trim();
    await user.save();

    // Hasilkan token baru dengan data ter-update
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Profil berhasil diperbarui',
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};
