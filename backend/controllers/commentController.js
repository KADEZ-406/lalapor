const { Comment } = require('../models');
const sanitizeHtml = require('sanitize-html');

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
};

exports.create = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { id: laporan_id } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Isi komentar tidak boleh kosong.' });
    }

    const sanitizedContent = sanitizeInput(content);
    if (!sanitizedContent) {
      return res.status(400).json({ message: 'Komentar tidak valid.' });
    }

    const comment = await Comment.create({
      laporan_id,
      user_id: req.userId,
      content: sanitizedContent
    });

    res.status(201).json({ message: 'Comment added', data: comment });
  } catch (error) {
    next(error);
  }
};
