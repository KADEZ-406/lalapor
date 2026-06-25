const { Category } = require('../models');

exports.getAll = async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
};

exports.create = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  }

  const category = await Category.create({ name: name.trim(), description });
  res.status(201).json(category);
};
