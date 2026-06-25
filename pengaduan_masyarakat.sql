-- ====================================================================
-- Database Script: pengaduan_masyarakat
-- Project: Portal Pengaduan Masyarakat (Lalapor!)
-- Student: Muhammad Rezky Setiansyah (XI RPL 1)
-- School: SMK Taruna Bhakti Depok
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `pengaduan_masyarakat`;
USE `pengaduan_masyarakat`;

-- Disable foreign key checks to allow clean drops
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `upvotes`;
DROP TABLE IF EXISTS `laporan`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 1. Table Structure: users
-- --------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 2. Table Structure: categories
-- --------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 3. Table Structure: laporan
-- --------------------------------------------------------------------
CREATE TABLE `laporan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_laporan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_laporan_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 4. Table Structure: comments
-- --------------------------------------------------------------------
CREATE TABLE `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `laporan_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_comments_laporan` FOREIGN KEY (`laporan_id`) REFERENCES `laporan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 4b. Table Structure: upvotes
-- --------------------------------------------------------------------
CREATE TABLE `upvotes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `laporan_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_upvotes_laporan` FOREIGN KEY (`laporan_id`) REFERENCES `laporan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_upvotes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_user_laporan` (`user_id`, `laporan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 5. Data Seeding (DML)
-- --------------------------------------------------------------------

-- Seed Users (Password: password123, encrypted using bcrypt)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Super Admin', 'super@admin.com', '$2a$10$L.3u1Z.G/UoE2jS/UeRz/.5X2XG6v2h1bf8882532df11def94c83', 'super_admin'),
(2, 'Admin Dinas', 'admin@admin.com', '$2a$10$L.3u1Z.G/UoE2jS/UeRz/.5X2XG6v2h1bf8882532df11def94c83', 'admin'),
(3, 'Budi Santoso', 'budi@user.com', '$2a$10$L.3u1Z.G/UoE2jS/UeRz/.5X2XG6v2h1bf8882532df11def94c83', 'user'),
(4, '🤖 Lalapor Bot', 'bot@lalapor.com', '$2a$10$L.3u1Z.G/UoE2jS/UeRz/.5X2XG6v2h1bf8882532df11def94c83', 'admin');

-- Seed Categories
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Infrastruktur & Fasilitas Umum', 'Jalan rusak, jembatan berlubang, lampu penerangan jalan mati, fasilitas umum rusak.'),
(2, 'Lingkungan & Kebersihan', 'Penumpukan sampah liar, polusi udara, limbah sungai, penebangan pohon liar.'),
(3, 'Ketertiban & Keamanan', 'Kriminalitas jalanan, kemacetan lalu lintas parah, parkir liar, gangguan ketertiban umum.'),
(4, 'Layanan Publik', 'Keluhan kinerja dinas pemerintahan, pelayanan administratif lambat, pungli.');

-- Seed Sample Laporan
INSERT INTO `laporan` (`id`, `user_id`, `category_id`, `title`, `description`, `image`, `status`, `latitude`, `longitude`) VALUES
(1, 3, 1, 'Jalan Margonda Raya Berlubang Parah', 'Terdapat lubang berukuran cukup besar di lajur kiri dekat lampu merah yang sangat membahayakan pengendara motor saat malam hari.', '/uploads/jalan-rusak-17807498.jpg', 'approved', -6.37254000, 106.83244000),
(2, 3, 2, 'Sampah Menumpuk di Bantaran Sungai Ciliwung', 'Banyak sampah plastik menumpuk di bantaran sungai dekat jembatan, menimbulkan bau busuk dan menyumbat saluran air.', '/uploads/sampah-ciliwung-17807555.jpg', 'pending', -6.39854000, 106.82233000);

-- Seed Sample Comments
INSERT INTO `comments` (`id`, `laporan_id`, `user_id`, `content`) VALUES
(1, 1, 2, 'Laporan diterima. Petugas dinas pekerjaan umum telah dikirim untuk melakukan penambalan sementara malam ini.'),
(2, 1, 3, 'Terima kasih atas respon cepatnya, semoga penambalan segera selesai.'),
(3, 1, 4, '🤖 Lalapor Bot: Petugas lapangan telah dialokasikan ke lokasi pengaduan Margonda.');
