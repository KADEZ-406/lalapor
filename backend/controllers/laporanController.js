const { Laporan, User, Category, Comment, Upvote } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises; // Use promises for async I/O
const sanitizeHtml = require('sanitize-html');

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
};

exports.getStats = async (req, res, next) => {
  try {
    const result = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    // query count manual dengan group sequelize
    const stats = await Laporan.findAll({
      attributes: [
        'status',
        [Laporan.sequelize.fn('COUNT', Laporan.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    let total = 0;
    stats.forEach(item => {
      const status = item.status;
      const count = parseInt(item.getDataValue('count')) || 0;
      if (status in result) {
        result[status] = count;
        total += count;
      }
    });
    result.total = total;

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, status, user_id } = req.query;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    if (user_id) {
      where.user_id = user_id;
    }

    const { count, rows } = await Laporan.findAndCountAll({
      where,
      attributes: {
        include: [
          [
            Laporan.sequelize.literal(`(
              SELECT COUNT(*)
              FROM upvotes AS upvote
              WHERE upvote.laporan_id = Laporan.id
            )`),
            'upvotesCount'
          ],
          [
            Laporan.sequelize.literal(`(
              SELECT COUNT(*) > 0
              FROM upvotes AS upvote
              WHERE upvote.laporan_id = Laporan.id AND upvote.user_id = ${req.userId || 0}
            )`),
            'hasUpvoted'
          ]
        ]
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Comment, as: 'comments', attributes: ['id'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const plainRows = rows.map(r => {
      const data = r.get({ plain: true });
      data.upvotesCount = parseInt(data.upvotesCount) || 0;
      data.hasUpvoted = !!data.hasUpvoted;
      return data;
    });

    res.json({
      data: plainRows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id, {
      attributes: {
        include: [
          [
            Laporan.sequelize.literal(`(
              SELECT COUNT(*)
              FROM upvotes AS upvote
              WHERE upvote.laporan_id = Laporan.id
            )`),
            'upvotesCount'
          ],
          [
            Laporan.sequelize.literal(`(
              SELECT COUNT(*) > 0
              FROM upvotes AS upvote
              WHERE upvote.laporan_id = Laporan.id AND upvote.user_id = ${req.userId || 0}
            )`),
            'hasUpvoted'
          ]
        ]
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { 
          model: Comment, 
          as: 'comments', 
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] 
        }
      ]
    });
    
    if (!laporan) {
      return res.status(404).json({ message: 'Laporan not found' });
    }

    const plainLaporan = laporan.get({ plain: true });
    plainLaporan.upvotesCount = parseInt(plainLaporan.upvotesCount) || 0;
    plainLaporan.hasUpvoted = !!plainLaporan.hasUpvoted;

    res.json(plainLaporan);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, category_id, latitude, longitude } = req.body;
    
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);

    if (!sanitizedTitle || !sanitizedTitle.trim() || !sanitizedDescription || !sanitizedDescription.trim() || !category_id) {
      return res.status(400).json({ message: 'Judul, deskripsi, dan kategori wajib diisi.' });
    }

    const latVal = latitude ? parseFloat(latitude) : null;
    const lngVal = longitude ? parseFloat(longitude) : null;

    if ((latitude && isNaN(latVal)) || (longitude && isNaN(lngVal))) {
      return res.status(400).json({ message: 'Latitude dan Longitude harus berupa angka koordinat yang valid.' });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const laporan = await Laporan.create({
      user_id: req.userId,
      category_id,
      title: sanitizedTitle,
      description: sanitizedDescription,
      image: imagePath,
      status: 'pending',
      latitude: latVal,
      longitude: lngVal,
    });

    // Background task for Bot Reply
    setImmediate(async () => {
      try {
        let botId = global.cachedBotId;
        if (!botId) {
          const botUser = await User.findOne({ 
            where: { email: process.env.BOT_EMAIL || 'bot@lalapor.com' },
            attributes: ['id']
          });
          if (botUser) {
            botId = botUser.id;
            global.cachedBotId = botId;
          }
        }

        if (botId) {
          await Comment.create({
            laporan_id: laporan.id,
            user_id: botId,
            content: `Halo! Terima kasih atas laporan Anda. Saya Lalapor, asisten virtual sistem ini. Laporan Anda telah berhasil kami terima dan statusnya saat ini MENUNGGU PROSES. Kami juga telah mengirimkan notifikasi kepada Admin dan Petugas terkait untuk segera meninjau laporan ini. Mohon bersabar ya! 🚀`
          });
        }
      } catch (error) {
        console.error('[Lalapor Bot] Auto-reply failed:', error.message);
      }
    });

    res.status(201).json({ message: 'Laporan created', data: laporan });
  } catch (error) {
    console.error('[Create Laporan Error Detail]:', error);
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ALLOWED_STATUSES = ['pending', 'approved', 'rejected'];

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status tidak valid. Hanya boleh: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const laporan = await Laporan.findByPk(req.params.id);

    if (!laporan) {
      return res.status(404).json({ message: 'Laporan not found' });
    }

    laporan.status = status;
    await laporan.save();

    res.json({ message: 'Status updated', data: laporan });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id);
    
    if (!laporan) {
      return res.status(404).json({ message: 'Laporan not found' });
    }

    if (laporan.image) {
      const physicalPath = path.join(__dirname, '../', laporan.image);
      try {
        await fs.unlink(physicalPath);
      } catch (err) {
        console.error('Failed to delete file:', physicalPath, err.message);
      }
    }

    await laporan.destroy();
    res.json({ message: 'Laporan deleted' });
  } catch (error) {
    next(error);
  }
};

exports.toggleUpvote = async (req, res, next) => {
  try {
    const { id: laporan_id } = req.params;
    const user_id = req.userId;

    const laporan = await Laporan.findByPk(laporan_id);
    if (!laporan) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    const existingUpvote = await Upvote.findOne({
      where: { laporan_id, user_id }
    });

    if (existingUpvote) {
      // Downvote
      await existingUpvote.destroy();
      
      const count = await Upvote.count({ where: { laporan_id } });
      return res.json({ 
        message: 'Dukungan dibatalkan', 
        hasUpvoted: false, 
        upvotesCount: count 
      });
    } else {
      // Upvote
      await Upvote.create({ laporan_id, user_id });
      
      const count = await Upvote.count({ where: { laporan_id } });
      return res.json({ 
        message: 'Dukungan berhasil ditambahkan', 
        hasUpvoted: true, 
        upvotesCount: count 
      });
    }
  } catch (error) {
    next(error);
  }
};
