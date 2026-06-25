const rateLimit = require('express-rate-limit');

// Limiter untuk registrasi & login (mencegah brute-force/spamming)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 30, // Maksimal 30 request per IP per 15 menit
  message: {
    message: 'Terlalu banyak percobaan akses dari IP Anda. Silakan coba lagi setelah 15 menit.'
  },
  standardHeaders: true, // Kembalikan info rate limit di header `RateLimit-*`
  legacyHeaders: false, // Nonaktifkan header `X-RateLimit-*` lama
});

// Limiter untuk pembuatan laporan baru (mencegah spamming upload media/file)
const createLaporanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 15, // Maksimal 15 laporan baru per IP per 15 menit
  message: {
    message: 'Batas pembuatan laporan tercapai. Silakan coba lagi setelah 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  createLaporanLimiter
};
