const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = /\.(jpeg|jpg|png|webp)$/i;

const fileFilter = (req, file, cb) => {
  const isValidMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isValidExt = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));

  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    const error = new Error('Format file tidak valid. Hanya gambar JPEG, PNG, atau WEBP yang diperbolehkan.');
    error.status = 400;
    cb(error);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

module.exports = upload;
