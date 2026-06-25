require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    // 1. Ensure the database exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    const dbName = process.env.DB_NAME || 'pengaduan_masyarakat';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    console.log(`Database "${dbName}" ensured (created if not existed).`);

    // 2. Import models and sync
    const { sequelize, User, Category } = require('./models');
    await sequelize.sync({ force: true });
    console.log('Database synced & dropped for fresh seeding!');

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('password123', salt);

    await User.bulkCreate([
      { name: 'Super Admin', email: 'super@admin.com', password: hashPassword, role: 'super_admin' },
      { name: 'Admin Dinas', email: 'admin@admin.com', password: hashPassword, role: 'admin' },
      { name: 'Budi Santoso', email: 'budi@user.com', password: hashPassword, role: 'user' },
      { name: '🤖 Lalapor Bot', email: 'bot@lalapor.com', password: hashPassword, role: 'admin' }
    ]);
    console.log('Users seeded.');

    await Category.bulkCreate([
      { name: 'Infrastruktur & Fasilitas Umum', description: 'Jalan rusak, fasilitas umum' },
      { name: 'Lingkungan & Kebersihan', description: 'Sampah, polusi, dll' },
      { name: 'Ketertiban & Keamanan', description: 'Kriminalitas, kemacetan parah' },
      { name: 'Layanan Publik', description: 'Kinerja layanan pemerintah' }
    ]);
    console.log('Categories seeded.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();

