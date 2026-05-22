-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 22, 2026 at 03:49 AM
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
-- Database: `db_pengajuan`
--

-- --------------------------------------------------------

--
-- Table structure for table `inventaris`
--

CREATE TABLE `inventaris` (
  `id_inventaris` int(11) NOT NULL,
  `kode_barang` varchar(255) DEFAULT NULL,
  `nup` varchar(255) DEFAULT NULL,
  `nama_barang` varchar(255) DEFAULT NULL,
  `merk` varchar(255) DEFAULT NULL,
  `kategori` enum('alat','habis_pakai') DEFAULT NULL,
  `tanggal_buku_pertama` date DEFAULT NULL,
  `tanggal_perolehan` date DEFAULT NULL,
  `tipe` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventaris`
--

INSERT INTO `inventaris` (`id_inventaris`, `kode_barang`, `nup`, `nama_barang`, `merk`, `kategori`, `tanggal_buku_pertama`, `tanggal_perolehan`, `tipe`) VALUES
(1, '3030205014', '1', 'Crimping Tolls', 'DIGILINK', 'alat', '2021-12-31', '2012-12-12', 'DIGILINK'),
(2, '3030205014', '2', 'Crimping Tolls', 'DIGILINK', 'alat', '2021-12-31', '2012-12-12', 'DIGILINK'),
(3, '3030205014', '3', 'Crimping Tolls', 'DIGILINK', 'alat', '2021-12-31', '2012-12-12', 'DIGILINK'),
(4, '3030205014', '4', 'Crimping Tolls', 'DIGILINK', 'alat', '2021-12-31', '2012-12-12', 'DIGILINK'),
(5, '3050104001', '1', 'Lemari Besi/Metal', 'VIP V-202 2 PINTU', 'alat', '2021-12-31', '2012-12-12', 'VIP V-202 2 PINTU'),
(6, '3050104001', '2', 'Lemari Besi/Metal', 'VIP V-202 2 PINTU', 'alat', '2021-12-31', '2012-12-12', 'VIP V-202 2 PINTU'),
(7, '3050104001', '3', 'Lemari Besi/Metal', 'VIP V-602 SLADING KACA', 'alat', '2021-12-31', '2012-12-12', 'VIP V-602 SLADING KACA'),
(8, '3050104001', '4', 'Lemari Besi/Metal', 'VIP V-602 SLADING KACA', 'alat', '2021-12-31', '2012-12-12', 'VIP V-602 SLADING KACA'),
(9, '3050105048', '1', 'LCD Projector/Infocus', 'BENQ', 'alat', '2021-12-31', '2012-12-12', 'BENQ'),
(10, '3050105048', '2', 'LCD Projector/Infocus', 'BENQ', 'alat', '2021-12-31', '2012-12-12', 'BENQ'),
(11, '3050105048', '3', 'LCD Projector/Infocus', 'BENQ', 'alat', '2021-12-31', '2012-12-12', 'BENQ'),
(12, '3050105048', '4', 'LCD Projector/Infocus', 'BENQ', 'alat', '2021-12-31', '2012-12-12', 'BENQ'),
(13, '3050105048', '5', 'LCD Projector/Infocus', 'BENQ', 'alat', '2021-12-31', '2012-12-12', 'BENQ'),
(14, '3050105048', '6', 'LCD Projector/Infocus', 'BENQ', 'alat', '2021-12-31', '2012-12-12', 'BENQ'),
(15, '3050105048', '7', 'LCD Projector/Infocus', 'BENQ', 'alat', '2021-12-31', '2013-12-23', 'BENQ'),
(16, '3050105048', '8', 'LCD Projector/Infocus', 'BENQ', 'alat', '2021-12-31', '2013-12-23', 'BENQ'),
(17, '3050105048', '9', 'LCD Projector/Infocus', 'BENQ', 'alat', '2021-12-31', '2013-12-23', 'BENQ'),
(18, '3050105048', '10', 'LCD Projector/Infocus', 'Epson EBX 300', 'alat', '2021-12-31', '2016-12-27', 'Epson EBX 300'),
(19, '3050105048', '11', 'LCD Projector/Infocus', 'Epson EBX 300', 'alat', '2021-12-31', '2016-12-27', 'Epson EBX 300'),
(20, '3050105048', '12', 'LCD Projector/Infocus', 'EPSON EB-X400', 'alat', '2021-12-31', '2019-11-27', 'EPSON EB-X400'),
(21, '3050105048', '13', 'LCD Projector/Infocus', 'Epson Proyektor EB-X400 Putih', 'alat', '2021-12-31', '2018-05-21', 'Epson Proyektor EB-X400 Putih'),
(22, '3050105082', '1', 'Mesin Fogging', 'Mesin Fogging Kyoto', 'alat', '2021-12-31', '2020-06-12', 'Mesin Fogging Kyoto'),
(23, '3050201002', '1', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT CLERICAL DESK'),
(24, '3050201002', '2', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT CLERICAL DESK'),
(25, '3050201002', '3', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT CLERICAL DESK'),
(26, '3050201002', '4', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT CLERICAL DESK'),
(27, '3050201002', '5', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT CLERICAL DESK'),
(28, '3050201002', '6', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT CLERICAL DESK'),
(29, '3050201002', '7', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT CLERICAL DESK'),
(30, '3050201002', '8', 'Meja Kerja Kayu', 'HIGH POINT CLERICAL DESK', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT CLERICAL DESK'),
(31, '3050201002', '9', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'alat', '2021-12-31', '2020-12-15', 'Keiko FB - Desk 6'),
(32, '3050201002', '10', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'alat', '2021-12-31', '2020-12-15', 'Keiko FB - Desk 6'),
(33, '3050201002', '11', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'alat', '2021-12-31', '2020-12-15', 'Keiko FB - Desk 6'),
(34, '3050201002', '12', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'alat', '2021-12-31', '2020-12-15', 'Keiko FB - Desk 6'),
(35, '3050201002', '13', 'Meja Kerja Kayu', 'Keiko FB - Desk 6', 'alat', '2021-12-31', '2020-12-15', 'Keiko FB - Desk 6'),
(36, '3050201003', '1', 'Kursi Besi/Metal', 'MALVIN', 'alat', '2021-12-31', '2013-12-12', 'MALVIN'),
(37, '3050201003', '2', 'Kursi Besi/Metal', 'MALVIN', 'alat', '2021-12-31', '2013-12-12', 'MALVIN'),
(38, '3050201003', '3', 'Kursi Besi/Metal', 'MALVIN', 'alat', '2021-12-31', '2013-12-12', 'MALVIN'),
(39, '3050201003', '4', 'Kursi Besi/Metal', 'MALVIN', 'alat', '2021-12-31', '2013-12-12', 'MALVIN'),
(40, '3050201003', '5', 'Kursi Besi/Metal', 'MALVIN', 'alat', '2021-12-31', '2013-12-12', 'MALVIN'),
(41, '3050201003', '6', 'Kursi Besi/Metal', 'MALVIN', 'alat', '2021-12-31', '2013-12-12', 'MALVIN'),
(42, '3050201003', '7', 'Kursi Besi/Metal', 'MALVIN', 'alat', '2021-12-31', '2013-12-12', 'MALVIN'),
(43, '3050201003', '8', 'Kursi Besi/Metal', 'MALVIN', 'alat', '2021-12-31', '2013-12-12', 'MALVIN'),
(44, '3050201003', '9', 'Kursi Besi/Metal', 'MALVIN', 'alat', '2021-12-31', '2013-12-12', 'MALVIN'),
(45, '3050201003', '59', 'Kursi Besi/Metal', 'HIGH POINT AY 405S', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT AY 405S'),
(46, '3050201003', '60', 'Kursi Besi/Metal', 'HIGH POINT AY 405S', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT AY 405S'),
(47, '3050201008', '1', 'Meja Rapat', 'HIGH POINT CONFERENCE TABLE', 'alat', '2021-12-31', '2013-12-12', 'HIGH POINT CONFERENCE TABLE'),
(48, '3050201009', '1', 'Meja Komputer', 'CHITOSE', 'alat', '2021-12-31', '2013-12-12', 'CHITOSE'),
(49, '3050201009', '2', 'Meja Komputer', 'CHITOSE', 'alat', '2021-12-31', '2013-12-12', 'CHITOSE'),
(50, '3050201009', '3', 'Meja Komputer', 'CHITOSE', 'alat', '2021-12-31', '2013-12-12', 'CHITOSE'),
(51, '3050201009', '4', 'Meja Komputer', 'CHITOSE', 'alat', '2021-12-31', '2013-12-12', 'CHITOSE'),
(52, '3050201020', '1', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(53, '3050201020', '2', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(54, '3050201020', '3', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(55, '3050201020', '4', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(56, '3050201020', '5', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(57, '3050201020', '6', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(58, '3050201020', '7', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(59, '3050201020', '8', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(60, '3050201020', '9', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(61, '3050201020', '10', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(62, '3050201020', '11', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(63, '3050201020', '12', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(64, '3050201020', '13', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(65, '3050201020', '14', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(66, '3050201020', '15', 'Kursi Fiber Glas/Plastik', 'kursi mahasiswa pipa holo', 'alat', '2021-12-31', '2020-12-17', 'kursi mahasiswa pipa holo'),
(67, '3050204004', '1', 'A.C. Split', '2 PK Panasonic', 'alat', '2021-12-31', '2021-04-08', '2 PK Panasonic'),
(68, '3050204004', '2', 'A.C. Split', '2 PK Panasonic', 'alat', '2021-12-31', '2021-04-08', '2 PK Panasonic'),
(69, '3050204004', '3', 'A.C. Split', '2 PK Panasonic', 'alat', '2021-12-31', '2021-04-08', '2 PK Panasonic'),
(70, '3050204004', '4', 'A.C. Split', '2 PK Panasonic', 'alat', '2021-12-31', '2021-04-08', '2 PK Panasonic'),
(71, '3050204004', '5', 'A.C. Split', 'Panasonic 2 PK CS/CU - YN18WKJ', 'alat', '2021-12-31', '2021-08-30', 'Panasonic 2 PK CS/CU - YN18WKJ'),
(72, '3050204004', '6', 'A.C. Split', 'Panasonic 2 PK CS/CU - YN18WKJ', 'alat', '2021-12-31', '2021-08-30', 'Panasonic 2 PK CS/CU - YN18WKJ'),
(73, '3050204004', '7', 'A.C. Split', 'Panasonic 2 PK CS/CU - YN18WKJ', 'alat', '2021-12-31', '2021-08-30', 'Panasonic 2 PK CS/CU - YN18WKJ'),
(74, '3050206002', '1', 'Televisi', 'SAMSUNG', 'alat', '2021-12-31', '2013-12-23', 'SAMSUNG'),
(75, '3050206002', '2', 'Televisi', 'SAMSUNG', 'alat', '2021-12-31', '2013-12-23', 'SAMSUNG'),
(76, '3050206007', '1', 'Loudspeaker', 'JBL LSR 305', 'alat', '2021-12-31', '2016-10-14', 'JBL LSR 305'),
(77, '3050206007', '2', 'Loudspeaker', 'Samson BT4', 'alat', '2021-12-31', '2016-10-14', 'Samson BT4'),
(78, '3050206015', '1', 'Microphone Table Stand', 'Superior DD003B Stand', 'alat', '2021-12-31', '2016-12-27', 'Superior DD003B Stand'),
(79, '3050206015', '2', 'Microphone Table Stand', 'Superior DD003B Stand', 'alat', '2021-12-31', '2016-12-27', 'Superior DD003B Stand'),
(80, '3050206020', '1', 'Camera Video', 'SONY', 'alat', '2021-12-31', '2012-12-18', 'SONY'),
(81, '3050206020', '2', 'Camera Video', 'SONY', 'alat', '2021-12-31', '2012-12-18', 'SONY'),
(82, '3050206020', '3', 'Camera Video', 'SONY', 'alat', '2021-12-31', '2012-12-18', 'SONY'),
(83, '3050206046', '1', 'Handy Cam', 'HDR-CX', 'alat', '2021-12-31', '2013-12-23', 'HDR-CX'),
(84, '3050206046', '2', 'Handy Cam', 'HDR-CX', 'alat', '2021-12-31', '2013-12-23', 'HDR-CX'),
(85, '3050206046', '3', 'Handy Cam', 'HDR-CX', 'alat', '2021-12-31', '2013-12-23', 'HDR-CX'),
(86, '3050206046', '4', 'Handy Cam', 'HDR-CX', 'alat', '2021-12-31', '2013-12-23', 'HDR-CX'),
(87, '3050206046', '5', 'Handy Cam', 'HDR-CX', 'alat', '2021-12-31', '2013-12-23', 'HDR-CX'),
(88, '3050206072', '1', 'Lampu', 'EVERBRT SMART 300', 'alat', '2021-12-31', '2013-12-23', 'EVERBRT SMART 300'),
(89, '3050206072', '2', 'Lampu', 'EVERBRT SMART 300', 'alat', '2021-12-31', '2013-12-23', 'EVERBRT SMART 300'),
(90, '3050206072', '3', 'Lampu', 'EVERBRT SMART 300', 'alat', '2021-12-31', '2013-12-23', 'EVERBRT SMART 300'),
(91, '3060101001', '1', 'Audio Mixing Console', 'YAMAHA', 'alat', '2021-12-31', '2013-12-23', 'YAMAHA'),
(92, '3060101001', '2', 'Audio Mixing Console', 'YAMAHA', 'alat', '2021-12-31', '2013-12-23', 'YAMAHA'),
(93, '3060101001', '3', 'Audio Mixing Console', 'YAMAHA', 'alat', '2021-12-31', '2013-12-23', 'YAMAHA'),
(94, '3100102001', '1', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(95, '3100102001', '2', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(96, '3100102001', '3', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(97, '3100102001', '4', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(98, '3100102001', '5', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(99, '3100102001', '6', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(100, '3100102001', '7', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(101, '3100102001', '8', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(102, '3100102001', '9', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(103, '3100102001', '10', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(104, '3100102001', '11', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(105, '3100102001', '12', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(106, '3100102001', '13', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(107, '3100102001', '14', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(108, '3100102001', '15', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(109, '3100102001', '16', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(110, '3100102001', '17', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(111, '3100102001', '18', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(112, '3100102001', '19', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(113, '3100102001', '20', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(114, '3100102001', '21', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(115, '3100102001', '22', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(116, '3100102001', '23', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(117, '3100102001', '24', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(118, '3100102001', '25', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(119, '3100102001', '26', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(120, '3100102001', '27', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(121, '3100102001', '28', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(122, '3100102001', '29', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(123, '3100102001', '30', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(124, '3100102001', '31', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(125, '3100102001', '32', 'P.C Unit', 'HP PAVILION', 'alat', '2021-12-31', '2012-12-12', 'HP PAVILION'),
(126, '3100102001', '33', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(127, '3100102001', '34', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(128, '3100102001', '35', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(129, '3100102001', '36', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(130, '3100102001', '37', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(131, '3100102001', '38', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(132, '3100102001', '39', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(133, '3100102001', '40', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(134, '3100102001', '41', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(135, '3100102001', '42', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(136, '3100102001', '43', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(137, '3100102001', '44', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(138, '3100102001', '45', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(139, '3100102001', '46', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(140, '3100102001', '47', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(141, '3100102001', '48', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(142, '3100102001', '49', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(143, '3100102001', '50', 'P.C Unit', 'ASUS CM6431', 'alat', '2021-12-31', '2012-12-12', 'ASUS CM6431'),
(144, '3100102001', '66', 'P.C Unit', 'HP', 'alat', '2021-12-31', '2012-12-12', 'HP'),
(145, '3100102001', '67', 'P.C Unit', 'HP', 'alat', '2021-12-31', '2012-12-12', 'HP'),
(146, '3100102001', '68', 'P.C Unit', 'HP', 'alat', '2021-12-31', '2012-12-12', 'HP'),
(147, '3100102001', '69', 'P.C Unit', 'HP', 'alat', '2021-12-31', '2012-12-12', 'HP'),
(148, '3100102001', '70', 'P.C Unit', 'HP', 'alat', '2021-12-31', '2012-12-12', 'HP'),
(149, '3100102001', '71', 'P.C Unit', 'HP', 'alat', '2021-12-31', '2012-12-12', 'HP'),
(150, '3100102001', '72', 'P.C Unit', 'HP', 'alat', '2021-12-31', '2012-12-12', 'HP'),
(151, '3100102001', '98', 'P.C Unit', 'DELL INSPIRON', 'alat', '2021-12-31', '2013-12-23', 'DELL INSPIRON'),
(152, '3100102001', '99', 'P.C Unit', 'DELL INSPIRON', 'alat', '2021-12-31', '2013-12-23', 'DELL INSPIRON'),
(153, '3100102001', '100', 'P.C Unit', 'DELL INSPIRON', 'alat', '2021-12-31', '2013-12-23', 'DELL INSPIRON'),
(154, '3100102001', '101', 'P.C Unit', 'DELL INSPIRON', 'alat', '2021-12-31', '2013-12-23', 'DELL INSPIRON'),
(155, '3100102001', '102', 'P.C Unit', 'DELL INSPIRON', 'alat', '2021-12-31', '2013-12-23', 'DELL INSPIRON'),
(156, '3100102001', '103', 'P.C Unit', 'DELL INSPIRON', 'alat', '2021-12-31', '2013-12-23', 'DELL INSPIRON'),
(157, '3100102001', '104', 'P.C Unit', 'DELL INSPIRON', 'alat', '2021-12-31', '2013-12-23', 'DELL INSPIRON'),
(158, '3100102001', '105', 'P.C Unit', 'DELL INSPIRON', 'alat', '2021-12-31', '2013-12-23', 'DELL INSPIRON'),
(159, '3100102001', '144', 'P.C Unit', 'ASUS V221', 'alat', '2021-12-31', '2018-10-30', 'ASUS V221'),
(160, '3100102001', '145', 'P.C Unit', 'ASUS V221', 'alat', '2021-12-31', '2018-10-30', 'ASUS V221'),
(161, '3100102001', '146', 'P.C Unit', 'ASUS V221', 'alat', '2021-12-31', '2018-10-30', 'ASUS V221'),
(162, '3100102001', '147', 'P.C Unit', 'ASUS V221', 'alat', '2021-12-31', '2018-10-30', 'ASUS V221'),
(163, '3100102001', '148', 'P.C Unit', 'ASUS V221', 'alat', '2021-12-31', '2018-10-30', 'ASUS V221'),
(164, '3100102001', '156', 'P.C Unit', 'DELL INSPIRON 3881', 'alat', '2021-12-31', '2021-11-16', 'DELL INSPIRON 3881'),
(165, '3100102001', '157', 'P.C Unit', 'DELL INSPIRON 3881', 'alat', '2021-12-31', '2021-11-16', 'DELL INSPIRON 3881'),
(166, '3100102001', '158', 'P.C Unit', 'DELL INSPIRON 3881', 'alat', '2021-12-31', '2021-11-16', 'DELL INSPIRON 3881'),
(167, '3100102001', '159', 'P.C Unit', 'DELL INSPIRON 3881', 'alat', '2021-12-31', '2021-11-16', 'DELL INSPIRON 3881'),
(168, '3100102001', '160', 'P.C Unit', 'DELL INSPIRON 3881', 'alat', '2021-12-31', '2021-11-16', 'DELL INSPIRON 3881'),
(169, '3100102001', '161', 'P.C Unit', 'DELL INSPIRON 3881', 'alat', '2021-12-31', '2021-11-16', 'DELL INSPIRON 3881'),
(170, '3100102001', '162', 'P.C Unit', 'DELL INSPIRON 3881', 'alat', '2021-12-31', '2021-11-16', 'DELL INSPIRON 3881'),
(171, '3100204002', '10', 'Router', 'MIKROTIK', 'alat', '2021-12-31', '2012-12-12', 'MIKROTIK'),
(172, '3100204002', '11', 'Router', 'MIKROTIK', 'alat', '2021-12-31', '2012-12-12', 'MIKROTIK'),
(173, '3100204023', '1', 'Wireless Access Point', 'DUAL BAND', 'alat', '2021-12-31', '2012-12-12', 'DUAL BAND'),
(174, '3100204023', '2', 'Wireless Access Point', 'DUAL BAND', 'alat', '2021-12-31', '2012-12-12', 'DUAL BAND'),
(175, '3100204024', '1', 'Switch', 'ALLIED TELESIS', 'alat', '2021-12-31', '2012-12-18', 'ALLIED TELESIS'),
(176, '3100204024', '2', 'Switch', 'ALLIED TELESIS', 'alat', '2021-12-31', '2012-12-18', 'ALLIED TELESIS'),
(179, NULL, NULL, 'fan', NULL, NULL, NULL, NULL, NULL),
(180, NULL, NULL, 'Laptop', NULL, NULL, NULL, NULL, NULL),
(181, NULL, NULL, 'Laptop', NULL, NULL, NULL, NULL, NULL),
(182, NULL, NULL, 'Laptop', NULL, NULL, NULL, NULL, NULL),
(183, NULL, NULL, 'Laptop', NULL, NULL, NULL, NULL, NULL),
(184, NULL, NULL, 'Remote AC', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `laporan`
--

CREATE TABLE `laporan` (
  `id_laporan` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `id_inventaris` int(11) DEFAULT NULL,
  `id_ruangan` int(11) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `status` enum('diproses','ditolak','selesai') NOT NULL DEFAULT 'diproses',
  `bukti_foto` varchar(255) DEFAULT NULL,
  `kondisi` decimal(5,2) DEFAULT NULL,
  `keterangan_admin` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laporan`
--

INSERT INTO `laporan` (`id_laporan`, `id_user`, `id_inventaris`, `id_ruangan`, `tanggal`, `keterangan`, `status`, `bukti_foto`, `kondisi`, `keterangan_admin`) VALUES
(1, 5, 170, 1, '2026-05-15', 'barang lumayan rusak', 'selesai', '1778811916187-920918123.jpg', 75.00, 'sedang dicek teknisi'),
(2, 5, 176, 2, '2026-05-16', 'barang setengah rusak', 'selesai', '1778887959576-648245982.jpg', 50.00, 'sudah selesai '),
(3, 10, 1, 1, '2026-05-16', 'Kursi di ruang kelas mengalami kerusakan pada bagian kaki sebelah kanan sehingga tidak stabil saat digunakan.', 'selesai', '1779018491679-375065616.jpg', 90.00, 'oke'),
(4, 11, 53, 4, '2026-05-20', 'kursi setengah patah', 'diproses', '1779230793737-912394702.jpg', 50.00, NULL),
(5, 10, 66, 4, '2026-05-20', 'Sandaran kursi pada ruang perkuliahan rusak dan terlepas sebagian, menyebabkan kursi tidak nyaman digunakan saat kegiatan belajar mengajar berlangsung.', 'diproses', '1779260129542-123536781.jpg', 50.00, NULL),
(6, 10, 66, 4, '2026-05-20', 'Dudukan kursi mengalami retak dan baut penghubung longgar, sehingga kursi mengeluarkan bunyi dan kondisinya kurang layak digunakan.', 'selesai', '1779260209799-550026326.jpg', 40.00, 'oke'),
(7, 14, 150, 1, '2026-05-16', 'PC mengalami blue screen saat menjalankan aplikasi praktikum.', 'diproses', '1779410456298-265043643.png', 50.00, NULL),
(8, 14, 150, 1, '2026-05-22', 'PC mengalami blue screen saat menjalankan aplikasi praktikum.', 'diproses', '1779410570056-454966658.png', 50.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rekomendasi_pengajuan_barang`
--

CREATE TABLE `rekomendasi_pengajuan_barang` (
  `id_rekomendasi` int(11) NOT NULL,
  `id_ruangan` int(11) DEFAULT NULL,
  `barang_rekomendasi_diajukan` varchar(255) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `nama_barang` varchar(255) DEFAULT NULL,
  `alasan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rekomendasi_pengajuan_barang`
--

INSERT INTO `rekomendasi_pengajuan_barang` (`id_rekomendasi`, `id_ruangan`, `barang_rekomendasi_diajukan`, `tanggal`, `nama_barang`, `alasan`) VALUES
(1, 1, 'P.C Unit, LCD Projector/Infocus', '2026-05-15', 'P.C Unit', 'P.C Unit dalam kondisi lumayan rusak dan perlu penggantian.'),
(2, 1, 'Kursi Besi/Metal, Crimping Tolls', '2026-05-18', 'Kursi Besi/Metal', 'Laporan kerusakan kursi di ruang kelas dan perlunya alat tambahan.'),
(3, 1, 'Switch', '2026-05-18', 'Switch', 'Laporan kerusakan switch yang setengah rusak.'),
(4, 1, 'P.C Unit', '2026-05-18', 'P.C Unit', 'Laporan P.C Unit yang lumayan rusak.'),
(5, 1, 'LCD Projector/Infocus', '2026-05-18', 'LCD Projector/Infocus', 'Perlu proyektor untuk mendukung kegiatan belajar mengajar.'),
(6, 1, 'Kursi Besi/Metal, P.C Unit, Switch', '2026-05-18', 'Kursi Besi/Metal', 'Laporan kerusakan kursi dan switch setengah rusak, perlu penggantian.');

-- --------------------------------------------------------

--
-- Table structure for table `ruangan`
--

CREATE TABLE `ruangan` (
  `id_ruangan` int(11) NOT NULL,
  `nama_ruangan` varchar(255) DEFAULT NULL,
  `kode_ruangan` varchar(255) DEFAULT NULL,
  `lokasi` enum('pamolokan','batuan') DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ruangan`
--

INSERT INTO `ruangan` (`id_ruangan`, `nama_ruangan`, `kode_ruangan`, `lokasi`, `id_user`) VALUES
(1, 'Ruang Lab ', 'Lab.203', 'batuan', 17),
(2, 'Ruang Lab ', 'Lab.202', 'batuan', 16),
(4, 'Kelas', 'K-101', 'pamolokan', NULL),
(5, 'Kelas', 'K-102', 'pamolokan', NULL),
(6, 'Lab', 'Lab 205', 'pamolokan', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('mahasiswa','dosen','satpam','tendik','plp','admin') DEFAULT NULL,
  `kaleb` enum('0','1') DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `email`, `password`, `role`, `kaleb`) VALUES
(1, 'adminpsdku.pens.ac.id', '$2b$10$gMo9UChrNuL6W9AvYsq8HuIEVrFNG5tAeZQZEbvAecbp8q6.yNG.C', 'admin', '0'),
(2, 'fan@pens.ac.id', '$2b$10$Hqqd1VdkR8dVZbDuKFikWuLifwyqRzBDIgMsCXoVIRVaRq7DOQxw.', 'mahasiswa', '0'),
(3, 'daffa@pens.ac.id', '$2b$10$U104SspW8uh4GbgGTMpzmun/07cRxLMCOZbnOA4uQQvY4YFrUrHbe', 'mahasiswa', '0'),
(5, 'fa@pens.ac.id', '$2b$10$mHWVbNmRUmXJir7ZQ7TAnuXIOmJzBWkpN8H6I/p3ZYT0KKRQhtwIm', 'mahasiswa', '0'),
(6, 'a@pens.ac.id', '$2b$10$.C.DdZqrt9c88s0vdjprbu.bHTx1BwHHHohmrTG.dwpp1Cjb6VeIG', 'plp', '0'),
(7, 'dos@pens.ac.id', '$2b$10$tgOpYvkjLlq0cMAXz2nFG.ElqnfeAXPr/tH4LtMN20B/Z2d9hYYZC', 'dosen', '1'),
(8, 'q@pens.ac.id', '$2b$10$zjbHphmeS2dAjRz8x2eZsu.7qPzamAaGRzSWNiftvbZs0xWF.HamK', 'mahasiswa', '0'),
(9, 'su@pens.ac.id', '$2b$10$lsrjueG6y6un4RLPy3NHreRfcwzlaywuExCWxvXFCksc23a3AmaFW', 'mahasiswa', '0'),
(10, 'men@pens.ac.id', '$2b$10$0kQPmcDylXFB8i3Jq6nYH.LDBCTT3zDT7ojwQCcLPXqNvJx3emWQ6', 'mahasiswa', '0'),
(11, 'xyz@pens.ac.id', '$2b$10$ATA2WHHYSEZIaMNpq/GUs.POQ8XhmNgMaQcCATs92/sxr0s06lQGC', 'mahasiswa', '0'),
(13, 'plp@pens.ac.id', '$2b$10$bFfd5opCuLlGBQPKJHXex.YYGT7EZiiPKUeai./o4XFO7SFswT0Zu', 'plp', '0'),
(14, 'userdemo@pens.ac.id', '$2b$10$sZ7cJgP9MxeHAENO4z/GHekR1w9Gy1E1EgxEc2/jQNeS.Bg6FqHcS', 'mahasiswa', '0'),
(15, 'user2@pens.ac.id', '$2b$10$y5ULXoAWTUIBkKhdVeTJJeOwp84njFU6BzTM14nX5WEVIfK5NdxPK', 'mahasiswa', '0'),
(16, 'dosensatu@pens.ac.id', '$2b$10$1zliCbNqlQw3naOXNE.rS.F998X/WZXEjRN1MZLxLPzOvsZuP9/lW', 'dosen', '1'),
(17, 'dosendua@pens.ac.id', '$2b$10$RMVd/b1IiUuCNVkw0z4MgOzQFWULIk56rHhDAtAdcAOnf84VNxBHm', 'dosen', '1');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `inventaris`
--
ALTER TABLE `inventaris`
  ADD PRIMARY KEY (`id_inventaris`);

--
-- Indexes for table `laporan`
--
ALTER TABLE `laporan`
  ADD PRIMARY KEY (`id_laporan`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_inventaris` (`id_inventaris`),
  ADD KEY `id_ruangan` (`id_ruangan`);

--
-- Indexes for table `rekomendasi_pengajuan_barang`
--
ALTER TABLE `rekomendasi_pengajuan_barang`
  ADD PRIMARY KEY (`id_rekomendasi`),
  ADD KEY `id_ruangan` (`id_ruangan`);

--
-- Indexes for table `ruangan`
--
ALTER TABLE `ruangan`
  ADD PRIMARY KEY (`id_ruangan`),
  ADD UNIQUE KEY `kode_ruangan` (`kode_ruangan`),
  ADD KEY `fk_ruangan_user` (`id_user`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `inventaris`
--
ALTER TABLE `inventaris`
  MODIFY `id_inventaris` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=185;

--
-- AUTO_INCREMENT for table `laporan`
--
ALTER TABLE `laporan`
  MODIFY `id_laporan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `rekomendasi_pengajuan_barang`
--
ALTER TABLE `rekomendasi_pengajuan_barang`
  MODIFY `id_rekomendasi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `ruangan`
--
ALTER TABLE `ruangan`
  MODIFY `id_ruangan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `laporan`
--
ALTER TABLE `laporan`
  ADD CONSTRAINT `laporan_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `laporan_ibfk_2` FOREIGN KEY (`id_inventaris`) REFERENCES `inventaris` (`id_inventaris`),
  ADD CONSTRAINT `laporan_ibfk_3` FOREIGN KEY (`id_ruangan`) REFERENCES `ruangan` (`id_ruangan`);

--
-- Constraints for table `rekomendasi_pengajuan_barang`
--
ALTER TABLE `rekomendasi_pengajuan_barang`
  ADD CONSTRAINT `rekomendasi_pengajuan_barang_ibfk_1` FOREIGN KEY (`id_ruangan`) REFERENCES `ruangan` (`id_ruangan`);

--
-- Constraints for table `ruangan`
--
ALTER TABLE `ruangan`
  ADD CONSTRAINT `fk_ruangan_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
