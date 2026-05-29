-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 30, 2026 at 12:23 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laporan_psdku`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_laporan`
--

CREATE TABLE `audit_laporan` (
  `id` int(11) NOT NULL,
  `id_laporan` int(11) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `data_lama` text DEFAULT NULL,
  `data_baru` text DEFAULT NULL,
  `waktu` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventaris`
--

CREATE TABLE `inventaris` (
  `id` int(11) NOT NULL,
  `id_ruangan` int(11) DEFAULT NULL,
  `kode_barang` varchar(100) NOT NULL,
  `NUP` varchar(100) DEFAULT NULL,
  `nama_barang` varchar(150) NOT NULL,
  `merk` varchar(100) DEFAULT NULL,
  `tipe` varchar(100) DEFAULT NULL,
  `kategori` enum('Alat','Habis Pakai') NOT NULL DEFAULT 'Alat',
  `tanggal_buku_pertama` date DEFAULT NULL,
  `tanggal_perolehan` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventaris`
--

INSERT INTO `inventaris` (`id`, `id_ruangan`, `kode_barang`, `NUP`, `nama_barang`, `merk`, `tipe`, `kategori`, `tanggal_buku_pertama`, `tanggal_perolehan`) VALUES
(1, NULL, '3030205014', '1', 'Crimping Tolls', 'DIGILINK', 'DIGILINK', 'Alat', '2021-12-31', '2012-12-12'),
(2, NULL, '3030205014', '2', 'Crimping Tolls', 'DIGILINK', 'DIGILINK', 'Alat', '2021-12-31', '2012-12-12'),
(3, NULL, '3030205014', '3', 'Crimping Tolls', 'DIGILINK', 'DIGILINK', 'Alat', '2021-12-31', '2012-12-12'),
(4, NULL, '3030205014', '4', 'Crimping Tolls', 'DIGILINK', 'DIGILINK', 'Alat', '2021-12-31', '2012-12-12'),
(5, NULL, '3050104001', '1', 'Lemari Besi/Metal', 'VIP V-202 2 PINTU', 'VIP V-202 2 PINTU', 'Alat', '2021-12-31', '2013-12-12'),
(6, NULL, '3050104001', '2', 'Lemari Besi/Metal', 'VIP V-202 2 PINTU', 'VIP V-202 2 PINTU', 'Alat', '2021-12-31', '2013-12-12'),
(7, NULL, '3050104001', '3', 'Lemari Besi/Metal', 'VIP V-602 SLADING KACA', 'VIP V-602 SLADING KACA', 'Alat', '2021-12-31', '2013-12-12'),
(8, NULL, '3050104001', '4', 'Lemari Besi/Metal', 'VIP V-602 SLADING KACA', 'VIP V-602 SLADING KACA', 'Alat', '2021-12-31', '2013-12-12'),
(9, NULL, '3050105048', '1', 'LCD Projector/Infocus', 'BENQ', 'BENQ', 'Alat', '2021-12-31', '2012-12-12'),
(10, NULL, '3050105048', '2', 'LCD Projector/Infocus', 'BENQ', 'BENQ', 'Alat', '2021-12-31', '2012-12-12'),
(11, NULL, '3050105048', '3', 'LCD Projector/Infocus', 'BENQ', 'BENQ', 'Alat', '2021-12-31', '2012-12-12'),
(12, NULL, '3050105048', '4', 'LCD Projector/Infocus', 'BENQ', 'BENQ', 'Alat', '2021-12-31', '2012-12-12'),
(13, NULL, '3050105048', '5', 'LCD Projector/Infocus', 'BENQ', 'BENQ', 'Alat', '2021-12-31', '2012-12-12'),
(14, NULL, '3050105048', '6', 'LCD Projector/Infocus', 'BENQ', 'BENQ', 'Alat', '2021-12-31', '2012-12-12'),
(15, NULL, '3050105048', '7', 'LCD Projector/Infocus', 'BENQ', 'BENQ', 'Alat', '2021-12-31', '2013-12-23'),
(16, NULL, '3050105048', '8', 'LCD Projector/Infocus', 'BENQ', 'BENQ', 'Alat', '2021-12-31', '2013-12-23'),
(17, NULL, '3050105048', '9', 'LCD Projector/Infocus', 'BENQ', 'BENQ', 'Alat', '2021-12-31', '2013-12-23'),
(18, NULL, '3050105048', '10', 'LCD Projector/Infocus', 'Epson EBX 300', 'Epson EBX 300', 'Alat', '2021-12-31', '2016-12-27'),
(19, NULL, '3050105048', '11', 'LCD Projector/Infocus', 'Epson EBX 300', 'Epson EBX 300', 'Alat', '2021-12-31', '2016-12-27'),
(20, NULL, '3050105048', '12', 'LCD Projector/Infocus', 'EPSON EB-X400', 'EPSON EB-X400', 'Alat', '2021-12-31', '2019-11-27'),
(21, NULL, '3050105048', '13', 'LCD Projector/Infocus', 'Epson Proyektor EB-X400 Putih', 'Epson Proyektor EB-X400 Putih', 'Alat', '2021-12-31', '2018-05-21'),
(22, NULL, '3050105082', '1', 'Mesin Fogging', 'Mesin Fogging Kyoto', 'Mesin Fogging Kyoto', 'Alat', '2021-12-31', '2020-06-12'),
(23, NULL, '3050201002', '1', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'HIGH POINT CLERICAL DESK', 'Alat', '2021-12-31', '2013-12-12'),
(24, NULL, '3050201002', '2', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'HIGH POINT CLERICAL DESK', 'Alat', '2021-12-31', '2013-12-12'),
(25, NULL, '3050201002', '3', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'HIGH POINT CLERICAL DESK', 'Alat', '2021-12-31', '2013-12-12'),
(26, NULL, '3050201002', '4', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'HIGH POINT CLERICAL DESK', 'Alat', '2021-12-31', '2013-12-12'),
(27, NULL, '3050201002', '5', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'HIGH POINT CLERICAL DESK', 'Alat', '2021-12-31', '2013-12-12'),
(28, NULL, '3050201002', '6', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'HIGH POINT CLERICAL DESK', 'Alat', '2021-12-31', '2013-12-12'),
(29, NULL, '3050201002', '7', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'HIGH POINT CLERICAL DESK', 'Alat', '2021-12-31', '2013-12-12'),
(30, NULL, '3050201002', '8', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'HIGH POINT CLERICAL DESK', 'Alat', '2021-12-31', '2013-12-12'),
(31, NULL, '3050201002', '9', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'Keiko FB - Desk 6', 'Alat', '2021-12-31', '2020-12-15'),
(32, NULL, '3050201002', '10', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'Keiko FB - Desk 6', 'Alat', '2021-12-31', '2020-12-15'),
(33, NULL, '3050201002', '11', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'Keiko FB - Desk 6', 'Alat', '2021-12-31', '2020-12-15'),
(34, NULL, '3050201002', '12', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'Keiko FB - Desk 6', 'Alat', '2021-12-31', '2020-12-15'),
(35, NULL, '3050201002', '13', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'Keiko FB - Desk 6', 'Alat', '2021-12-31', '2020-12-15'),
(36, NULL, '3050201003', '1', 'Kursi Besi/Metal', 'MALVIN', 'MALVIN', 'Alat', '2021-12-31', '2013-12-12'),
(37, NULL, '3050201003', '2', 'Kursi Besi/Metal', 'MALVIN', 'MALVIN', 'Alat', '2021-12-31', '2013-12-12'),
(38, NULL, '3050201003', '3', 'Kursi Besi/Metal', 'MALVIN', 'MALVIN', 'Alat', '2021-12-31', '2013-12-12'),
(39, NULL, '3050201003', '4', 'Kursi Besi/Metal', 'MALVIN', 'MALVIN', 'Alat', '2021-12-31', '2013-12-12'),
(40, NULL, '3050201003', '5', 'Kursi Besi/Metal', 'MALVIN', 'MALVIN', 'Alat', '2021-12-31', '2013-12-12'),
(41, NULL, '3050201003', '6', 'Kursi Besi/Metal', 'MALVIN', 'MALVIN', 'Alat', '2021-12-31', '2013-12-12'),
(42, NULL, '3050201003', '7', 'Kursi Besi/Metal', 'MALVIN', 'MALVIN', 'Alat', '2021-12-31', '2013-12-12'),
(43, NULL, '3050201003', '8', 'Kursi Besi/Metal', 'MALVIN', 'MALVIN', 'Alat', '2021-12-31', '2013-12-12'),
(44, NULL, '3050201003', '9', 'Kursi Besi/Metal', 'MALVIN', 'MALVIN', 'Alat', '2021-12-31', '2013-12-12'),
(45, NULL, '3050201003', '59', 'Kursi Besi/Metal', 'HIGH POINT AY 405S', 'HIGH POINT AY 405S', 'Alat', '2021-12-31', '2013-12-12'),
(46, NULL, '3050201003', '60', 'Kursi Besi/Metal', 'HIGH POINT AY 405S', 'HIGH POINT AY 405S', 'Alat', '2021-12-31', '2013-12-12'),
(47, NULL, '3050201008', '1', 'Meja Rapat', 'HIGH POINT CONFERENCE TABLE', 'HIGH POINT CONFERENCE TABLE', 'Alat', '2021-12-31', '2013-12-12'),
(48, NULL, '3050201009', '1', 'Meja Komputer', 'CHITOSE', 'CHITOSE', 'Alat', '2021-12-31', '2013-12-12'),
(49, NULL, '3050201009', '2', 'Meja Komputer', 'CHITOSE', 'CHITOSE', 'Alat', '2021-12-31', '2013-12-12'),
(50, NULL, '3050201009', '3', 'Meja Komputer', 'CHITOSE', 'CHITOSE', 'Alat', '2021-12-31', '2013-12-12'),
(51, NULL, '3050201009', '4', 'Meja Komputer', 'CHITOSE', 'CHITOSE', 'Alat', '2021-12-31', '2013-12-12'),
(52, NULL, '3050201020', '1', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(53, NULL, '3050201020', '2', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(54, NULL, '3050201020', '3', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(55, NULL, '3050201020', '4', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(56, NULL, '3050201020', '5', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(57, NULL, '3050201020', '6', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(58, NULL, '3050201020', '7', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(59, NULL, '3050201020', '8', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(60, NULL, '3050201020', '9', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(61, NULL, '3050201020', '10', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(62, NULL, '3050201020', '11', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(63, NULL, '3050201020', '12', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(64, NULL, '3050201020', '13', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(65, NULL, '3050201020', '14', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(66, NULL, '3050201020', '15', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'kursi mahasiswa pipa holo', 'Alat', '2021-12-31', '2020-12-17'),
(67, NULL, '3050204004', '1', 'A.C. Split', '2 PK Panasonic', '2 PK Panasonic', 'Alat', '2021-12-31', '2021-04-08'),
(68, NULL, '3050204004', '2', 'A.C. Split', '2 PK Panasonic', '2 PK Panasonic', 'Alat', '2021-12-31', '2021-04-08'),
(69, NULL, '3050204004', '3', 'A.C. Split', '2 PK Panasonic', '2 PK Panasonic', 'Alat', '2021-12-31', '2021-04-08'),
(70, NULL, '3050204004', '4', 'A.C. Split', '2 PK Panasonic', '2 PK Panasonic', 'Alat', '2021-12-31', '2021-04-08'),
(71, NULL, '3050204004', '5', 'A.C. Split', 'Panasonic 2 PK CS/CU - YN18WKJ', 'Panasonic 2 PK CS/CU - YN18WKJ', 'Alat', '2021-12-31', '2021-08-30'),
(72, NULL, '3050204004', '6', 'A.C. Split', 'Panasonic 2 PK CS/CU - YN18WKJ', 'Panasonic 2 PK CS/CU - YN18WKJ', 'Alat', '2021-12-31', '2021-08-30'),
(73, NULL, '3050204004', '7', 'A.C. Split', 'Panasonic 2 PK CS/CU - YN18WKJ', 'Panasonic 2 PK CS/CU - YN18WKJ', 'Alat', '2021-12-31', '2021-08-30'),
(74, NULL, '3050206002', '1', 'Televisi', 'SAMSUNG', 'SAMSUNG', 'Alat', '2021-12-31', '2013-12-23'),
(75, NULL, '3050206002', '2', 'Televisi', 'SAMSUNG', 'SAMSUNG', 'Alat', '2021-12-31', '2013-12-23'),
(76, NULL, '3050206007', '1', 'Loudspeaker', 'JBL LSR 305', 'JBL LSR 305', 'Alat', '2021-12-31', '2016-10-14'),
(77, NULL, '3050206007', '2', 'Loudspeaker', 'Samson BT4', 'Samson BT4', 'Alat', '2021-12-31', '2016-10-14'),
(78, NULL, '3050206015', '1', 'Microphone Table Stand', 'Superior DD003B Stand', 'Superior DD003B Stand', 'Alat', '2021-12-31', '2016-12-27'),
(79, NULL, '3050206015', '2', 'Microphone Table Stand', 'Superior DD003B Stand', 'Superior DD003B Stand', 'Alat', '2021-12-31', '2016-12-27'),
(80, NULL, '3050206020', '1', 'Camera Video', 'SONY', 'SONY', 'Alat', '2021-12-31', '2012-12-18'),
(81, NULL, '3050206020', '2', 'Camera Video', 'SONY', 'SONY', 'Alat', '2021-12-31', '2012-12-18'),
(82, NULL, '3050206020', '3', 'Camera Video', 'SONY', 'SONY', 'Alat', '2021-12-31', '2012-12-18'),
(83, NULL, '3050206046', '1', 'Handy Cam', 'HDR-CX', 'HDR-CX', 'Alat', '2021-12-31', '2013-12-23'),
(84, NULL, '3050206046', '2', 'Handy Cam', 'HDR-CX', 'HDR-CX', 'Alat', '2021-12-31', '2013-12-23'),
(85, NULL, '3050206046', '3', 'Handy Cam', 'HDR-CX', 'HDR-CX', 'Alat', '2021-12-31', '2013-12-23'),
(86, NULL, '3050206046', '4', 'Handy Cam', 'HDR-CX', 'HDR-CX', 'Alat', '2021-12-31', '2013-12-23'),
(87, NULL, '3050206046', '5', 'Handy Cam', 'HDR-CX', 'HDR-CX', 'Alat', '2021-12-31', '2013-12-23'),
(88, NULL, '3050206072', '1', 'Lampu', 'EVERBRT SMART 300', 'EVERBRT SMART 300', 'Alat', '2021-12-31', '2013-12-23'),
(89, NULL, '3050206072', '2', 'Lampu', 'EVERBRT SMART 300', 'EVERBRT SMART 300', 'Alat', '2021-12-31', '2013-12-23'),
(90, NULL, '3050206072', '3', 'Lampu', 'EVERBRT SMART 300', 'EVERBRT SMART 300', 'Alat', '2021-12-31', '2013-12-23'),
(91, NULL, '3060101001', '1', 'Audio Mixing Console', 'YAMAHA', 'YAMAHA', 'Alat', '2021-12-31', '2013-12-23'),
(92, NULL, '3060101001', '2', 'Audio Mixing Console', 'YAMAHA', 'YAMAHA', 'Alat', '2021-12-31', '2013-12-23'),
(93, NULL, '3060101001', '3', 'Audio Mixing Console', 'YAMAHA', 'YAMAHA', 'Alat', '2021-12-31', '2013-12-23'),
(94, NULL, '3100102001', '1', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(95, NULL, '3100102001', '2', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(96, NULL, '3100102001', '3', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(97, NULL, '3100102001', '4', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(98, NULL, '3100102001', '5', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(99, NULL, '3100102001', '6', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(100, NULL, '3100102001', '7', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(101, NULL, '3100102001', '8', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(102, NULL, '3100102001', '9', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(103, NULL, '3100102001', '10', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(104, NULL, '3100102001', '11', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(105, NULL, '3100102001', '12', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(106, NULL, '3100102001', '13', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(107, NULL, '3100102001', '14', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(108, NULL, '3100102001', '15', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(109, NULL, '3100102001', '16', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(110, NULL, '3100102001', '17', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(111, NULL, '3100102001', '18', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(112, NULL, '3100102001', '19', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(113, NULL, '3100102001', '20', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(114, NULL, '3100102001', '21', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(115, NULL, '3100102001', '22', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(116, NULL, '3100102001', '23', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(117, NULL, '3100102001', '24', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(118, NULL, '3100102001', '25', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(119, NULL, '3100102001', '26', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(120, NULL, '3100102001', '27', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(121, NULL, '3100102001', '28', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(122, NULL, '3100102001', '29', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(123, NULL, '3100102001', '30', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(124, NULL, '3100102001', '31', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(125, NULL, '3100102001', '32', 'P.C Unit', 'HP PAVILION', 'HP PAVILION', 'Alat', '2021-12-31', '2012-12-12'),
(126, NULL, '3100102001', '33', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(127, NULL, '3100102001', '34', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(128, NULL, '3100102001', '35', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(129, NULL, '3100102001', '36', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(130, NULL, '3100102001', '37', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(131, NULL, '3100102001', '38', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(132, NULL, '3100102001', '39', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(133, NULL, '3100102001', '40', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(134, NULL, '3100102001', '41', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(135, NULL, '3100102001', '42', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(136, NULL, '3100102001', '43', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(137, NULL, '3100102001', '44', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(138, NULL, '3100102001', '45', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(139, NULL, '3100102001', '46', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(140, NULL, '3100102001', '47', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(141, NULL, '3100102001', '48', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(142, NULL, '3100102001', '49', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(143, NULL, '3100102001', '50', 'P.C Unit', 'ASUS CM6431', 'ASUS CM6431', 'Alat', '2021-12-31', '2012-12-12'),
(144, NULL, '3100102001', '66', 'P.C Unit', 'HP', 'HP', 'Alat', '2021-12-31', '2012-12-12'),
(145, NULL, '3100102001', '67', 'P.C Unit', 'HP', 'HP', 'Alat', '2021-12-31', '2012-12-12'),
(146, NULL, '3100102001', '68', 'P.C Unit', 'HP', 'HP', 'Alat', '2021-12-31', '2012-12-12'),
(147, NULL, '3100102001', '69', 'P.C Unit', 'HP', 'HP', 'Alat', '2021-12-31', '2012-12-12'),
(148, NULL, '3100102001', '70', 'P.C Unit', 'HP', 'HP', 'Alat', '2021-12-31', '2012-12-12'),
(149, NULL, '3100102001', '71', 'P.C Unit', 'HP', 'HP', 'Alat', '2021-12-31', '2012-12-12'),
(150, NULL, '3100102001', '72', 'P.C Unit', 'HP', 'HP', 'Alat', '2021-12-31', '2012-12-12'),
(151, NULL, '3100102001', '98', 'P.C Unit', 'DELL INSPIRON', 'DELL INSPIRON', 'Alat', '2021-12-31', '2013-12-23'),
(152, NULL, '3100102001', '99', 'P.C Unit', 'DELL INSPIRON', 'DELL INSPIRON', 'Alat', '2021-12-31', '2013-12-23'),
(153, NULL, '3100102001', '100', 'P.C Unit', 'DELL INSPIRON', 'DELL INSPIRON', 'Alat', '2021-12-31', '2013-12-23'),
(154, NULL, '3100102001', '101', 'P.C Unit', 'DELL INSPIRON', 'DELL INSPIRON', 'Alat', '2021-12-31', '2013-12-23'),
(155, NULL, '3100102001', '102', 'P.C Unit', 'DELL INSPIRON', 'DELL INSPIRON', 'Alat', '2021-12-31', '2013-12-23'),
(156, NULL, '3100102001', '103', 'P.C Unit', 'DELL INSPIRON', 'DELL INSPIRON', 'Alat', '2021-12-31', '2013-12-23'),
(157, NULL, '3100102001', '104', 'P.C Unit', 'DELL INSPIRON', 'DELL INSPIRON', 'Alat', '2021-12-31', '2013-12-23'),
(158, NULL, '3100102001', '105', 'P.C Unit', 'DELL INSPIRON', 'DELL INSPIRON', 'Alat', '2021-12-31', '2013-12-23'),
(159, NULL, '3100102001', '144', 'P.C Unit', 'ASUS V221', 'ASUS V221', 'Alat', '2021-12-31', '2018-10-30'),
(160, NULL, '3100102001', '145', 'P.C Unit', 'ASUS V221', 'ASUS V221', 'Alat', '2021-12-31', '2018-10-30'),
(161, NULL, '3100102001', '146', 'P.C Unit', 'ASUS V221', 'ASUS V221', 'Alat', '2021-12-31', '2018-10-30'),
(162, NULL, '3100102001', '147', 'P.C Unit', 'ASUS V221', 'ASUS V221', 'Alat', '2021-12-31', '2018-10-30'),
(163, NULL, '3100102001', '148', 'P.C Unit', 'ASUS V221', 'ASUS V221', 'Alat', '2021-12-31', '2018-10-30'),
(164, NULL, '3100102001', '156', 'P.C Unit', 'DELL INSPIRON 3881', 'DELL INSPIRON 3881', 'Alat', '2021-12-31', '2021-11-16'),
(165, NULL, '3100102001', '157', 'P.C Unit', 'DELL INSPIRON 3881', 'DELL INSPIRON 3881', 'Alat', '2021-12-31', '2021-11-16'),
(166, NULL, '3100102001', '158', 'P.C Unit', 'DELL INSPIRON 3881', 'DELL INSPIRON 3881', 'Alat', '2021-12-31', '2021-11-16'),
(167, NULL, '3100102001', '159', 'P.C Unit', 'DELL INSPIRON 3881', 'DELL INSPIRON 3881', 'Alat', '2021-12-31', '2021-11-16'),
(168, NULL, '3100102001', '160', 'P.C Unit', 'DELL INSPIRON 3881', 'DELL INSPIRON 3881', 'Alat', '2021-12-31', '2021-11-16'),
(169, NULL, '3100102001', '161', 'P.C Unit', 'DELL INSPIRON 3881', 'DELL INSPIRON 3881', 'Alat', '2021-12-31', '2021-11-16'),
(170, NULL, '3100102001', '162', 'P.C Unit', 'DELL INSPIRON 3881', 'DELL INSPIRON 3881', 'Alat', '2021-12-31', '2021-11-16'),
(171, NULL, '3100204002', '10', 'Router', 'MIKROTIK', 'MIKROTIK', 'Alat', '2021-12-31', '2012-12-12'),
(172, NULL, '3100204002', '11', 'Router', 'MIKROTIK', 'MIKROTIK', 'Alat', '2021-12-31', '2012-12-12'),
(173, NULL, '3100204023', '1', 'Wireless Access Point', 'DUAL BAND', 'DUAL BAND', 'Alat', '2021-12-31', '2012-12-12'),
(174, NULL, '3100204023', '2', 'Wireless Access Point', 'DUAL BAND', 'DUAL BAND', 'Alat', '2021-12-31', '2012-12-12'),
(175, NULL, '3100204024', '1', 'Switch', 'ALLIED TELESIS', 'ALLIED TELESIS', 'Alat', '2021-12-31', '2012-12-18'),
(176, NULL, '3100204024', '2', 'Switch', 'ALLIED TELESIS', 'ALLIED TELESIS', 'Alat', '2021-12-31', '2012-12-18'),
(177, NULL, 'Sn', '1', 'Spidol Hitam', 'Snowman', 'Snowman', 'Alat', '2026-05-29', '2026-05-29');

-- --------------------------------------------------------

--
-- Table structure for table `lantai`
--

CREATE TABLE `lantai` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lantai`
--

INSERT INTO `lantai` (`id`, `nama`) VALUES
(1, '1'),
(2, '2');

-- --------------------------------------------------------

--
-- Table structure for table `laporan`
--

CREATE TABLE `laporan` (
  `id` int(11) NOT NULL,
  `id_pelapor` int(11) DEFAULT NULL,
  `id_inventaris` int(11) DEFAULT NULL,
  `id_teknisi` int(11) DEFAULT NULL,
  `waktu_lapor` datetime DEFAULT current_timestamp(),
  `kategori` enum('kerusakan','kehilangan') NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `bukti_foto` varchar(255) DEFAULT NULL,
  `kondisi` decimal(5,2) DEFAULT NULL,
  `status` enum('diproses_internal','diproses_eksternal','pending','ditolak','selesai') DEFAULT 'pending',
  `prioritas` enum('Penting dan Mendesak','Penting tapi Tidak Mendesak','Tidak Penting tapi Mendesak','Tidak Penting dan Tidak Mendesak') DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `selesai_pada` datetime DEFAULT NULL,
  `rekomendasi_ai` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lokasi`
--

CREATE TABLE `lokasi` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lokasi`
--

INSERT INTO `lokasi` (`id`, `nama`) VALUES
(1, 'Pamolokan'),
(2, 'Batuan');

-- --------------------------------------------------------

--
-- Table structure for table `ruangan`
--

CREATE TABLE `ruangan` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kode_ruangan` varchar(50) NOT NULL,
  `id_lokasi` int(11) DEFAULT NULL,
  `id_lantai` int(11) DEFAULT NULL,
  `id_kaleb` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ruangan`
--

INSERT INTO `ruangan` (`id`, `nama`, `kode_ruangan`, `id_lokasi`, `id_lantai`, `id_kaleb`) VALUES
(1, 'Lab Atas', 'Lab-201', 2, 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `kata_sandi` varchar(255) NOT NULL,
  `role` enum('mahasiswa','dosen','satpam','tendik','plp','admin') NOT NULL,
  `kaleb` enum('0','1') DEFAULT '0',
  `status` enum('proses','aktif','nonaktif') DEFAULT 'proses'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `email`, `kata_sandi`, `role`, `kaleb`, `status`) VALUES
(1, 'Administrator', 'adminpsdku@pens.ac.id', '$2b$10$OTgdMCqMfIMn10xgoEPMnu4HDzzdHU9SXNAoCYR9JDycOkVvOuDlu', 'admin', '0', 'aktif'),
(2, 'bagas', 'bagasmhs@pens.ac.id', 'fghfgghtghtgh', 'mahasiswa', '0', 'aktif');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_laporan`
--
ALTER TABLE `audit_laporan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_laporan` (`id_laporan`);

--
-- Indexes for table `inventaris`
--
ALTER TABLE `inventaris`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_ruangan` (`id_ruangan`);

--
-- Indexes for table `lantai`
--
ALTER TABLE `lantai`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `laporan`
--
ALTER TABLE `laporan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_pelapor` (`id_pelapor`),
  ADD KEY `id_inventaris` (`id_inventaris`),
  ADD KEY `id_teknisi` (`id_teknisi`);

--
-- Indexes for table `lokasi`
--
ALTER TABLE `lokasi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ruangan`
--
ALTER TABLE `ruangan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_ruangan` (`kode_ruangan`),
  ADD KEY `id_lokasi` (`id_lokasi`),
  ADD KEY `id_lantai` (`id_lantai`),
  ADD KEY `id_kaleb` (`id_kaleb`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_laporan`
--
ALTER TABLE `audit_laporan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventaris`
--
ALTER TABLE `inventaris`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=178;

--
-- AUTO_INCREMENT for table `lantai`
--
ALTER TABLE `lantai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `laporan`
--
ALTER TABLE `laporan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lokasi`
--
ALTER TABLE `lokasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ruangan`
--
ALTER TABLE `ruangan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_laporan`
--
ALTER TABLE `audit_laporan`
  ADD CONSTRAINT `audit_laporan_ibfk_1` FOREIGN KEY (`id_laporan`) REFERENCES `laporan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventaris`
--
ALTER TABLE `inventaris`
  ADD CONSTRAINT `inventaris_ibfk_1` FOREIGN KEY (`id_ruangan`) REFERENCES `ruangan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `laporan`
--
ALTER TABLE `laporan`
  ADD CONSTRAINT `laporan_ibfk_1` FOREIGN KEY (`id_pelapor`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `laporan_ibfk_2` FOREIGN KEY (`id_inventaris`) REFERENCES `inventaris` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `laporan_ibfk_3` FOREIGN KEY (`id_teknisi`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `ruangan`
--
ALTER TABLE `ruangan`
  ADD CONSTRAINT `ruangan_ibfk_1` FOREIGN KEY (`id_lokasi`) REFERENCES `lokasi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ruangan_ibfk_2` FOREIGN KEY (`id_lantai`) REFERENCES `lantai` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ruangan_ibfk_3` FOREIGN KEY (`id_kaleb`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
