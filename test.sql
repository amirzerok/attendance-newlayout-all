-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 07, 2025 at 12:35 AM
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
-- Database: `test`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `national_code` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `checkin_time` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `national_code`, `first_name`, `last_name`, `checkin_time`, `location`, `created_at`) VALUES
(1, '457264874', 'احمدرضا', 'آوندی ', '2025-02-06 15:09:12', 'کلاس 1 ', '2025-02-06 15:09:12');

-- --------------------------------------------------------

--
-- Table structure for table `last_seen`
--

CREATE TABLE `last_seen` (
  `id` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `nationalCode` varchar(20) NOT NULL,
  `checkin_time` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `last_seen`
--

INSERT INTO `last_seen` (`id`, `fullName`, `nationalCode`, `checkin_time`) VALUES
(1, 'احمد رضا اوندی', '457264874', '2024-02-07 10:30:00'),
(3, 'حسین محمدی', '1122334455', '2025-02-07 02:10:53');

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `representative` varchar(191) NOT NULL,
  `grade` varchar(191) NOT NULL,
  `major` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`id`, `title`, `representative`, `grade`, `major`, `createdAt`, `updatedAt`) VALUES
(1, 'new plcae1', 'a', 'دوازدهم', 'مکاترونیک', '2024-10-16 14:20:06.584', '2024-10-16 14:20:06.584'),
(4, 'johiuh', 'dhifjgosd', 'یازدهم', 'شبکه و نرم‌افزار', '2024-10-16 14:22:40.467', '2024-10-16 14:22:40.467');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `permissions`) VALUES
(1, 'Admin', '\"{\\\"viewPlaces\\\":true,\\\"editPlaces\\\":true,\\\"deletePlaces\\\":true,\\\"viewPersons\\\":true,\\\"editPersons\\\":true,\\\"deletePersons\\\":true,\\\"viewRoles\\\":true,\\\"editRoles\\\":true,\\\"deleteRoles\\\":true}\"'),
(3, 'teacher', '\"{\\\"viewPlaces\\\":true,\\\"editPlaces\\\":true,\\\"deletePlaces\\\":true,\\\"viewPersons\\\":true,\\\"editPersons\\\":true,\\\"deletePersons\\\":true,\\\"viewRoles\\\":true,\\\"editRoles\\\":true,\\\"deleteRoles\\\":true}\"'),
(4, 'user', '\"{\\\"viewPlaces\\\":false,\\\"editPlaces\\\":false,\\\"deletePlaces\\\":false,\\\"viewPersons\\\":false,\\\"editPersons\\\":false,\\\"deletePersons\\\":false,\\\"viewRoles\\\":false,\\\"editRoles\\\":false,\\\"deleteRoles\\\":false}\"');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `nationalCode` varchar(191) NOT NULL,
  `phoneNumber` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `roleId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `fullName`, `nationalCode`, `phoneNumber`, `password`, `roleId`) VALUES
(1, 'امیرعلی هاشمی پور', '3381608681', '09369890707', '$2b$12$F.VzTzQhGZ6uXod2oeNUuewqVFL/XiOD/8v47GtTHRleh5CN0ORrO', 1),
(17, 'احمد رضا آوندی ', '457264874', '457264874', '$2a$10$iW0REpw.qaek3yD.smg7bekGau7raguiJYE/mwD1DlNpbgx08hYVq', 4),
(18, 'علی پرویز', '3381676644', '09179644776', '$2a$10$QnQ12QEVidCR1GcKkeH7WOsUUJt2SZaNFH7VSAtyarF534yTDh/4.', 4);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0d218af0-4da2-4e9f-bc43-f5d815deb73d', 'b50c847d39bf502f3e0856561b224569e14b6aea49161c3617d0f8549ea4b7dd', '2024-10-16 12:56:08.705', '20240823181611_update_user_model', NULL, NULL, '2024-10-16 12:56:08.692', 1),
('2c530084-190e-42b0-9ee0-f936a92913af', '8b7e4ee3739b84ef1d23ee0e103f01503e6753c54c1df7942bb88e4fb72910cd', '2024-10-16 12:56:08.721', '20240823182412_update_user_model', NULL, NULL, '2024-10-16 12:56:08.708', 1),
('50e8ca06-0a33-48fa-b4a2-eb39aa9bb6d5', '204e89cc592d3ee27a62cfd7f8ffc16044c095a7d9a779b5a112e0f0055a5d91', '2024-10-16 12:56:08.689', '20240823175404_add_role_to_user', NULL, NULL, '2024-10-16 12:56:08.670', 1),
('54e4a691-529f-4f56-a160-38ceb522a591', '0b3b2df4bf4682c3664033bf294c5601e6bbf137885e2842958e534010c58977', '2024-10-16 13:57:29.575', '20241016135729_add_location_model', NULL, NULL, '2024-10-16 13:57:29.555', 1),
('6b6266aa-0ecd-44a1-b4aa-81eab4d47993', '6e3508852885b94bffb538042cd5f1c1570289ec41140fd794c50bdc5f1ae694', '2024-10-16 12:56:08.737', '20240823184258_add_password_field', NULL, NULL, '2024-10-16 12:56:08.724', 1),
('7b90e6f8-40c7-4ffa-9afd-98d8837eafc6', 'c035e8168bec9b53a5dfdaaccf5a7396841e23572868f339a9671308fd638fdb', '2024-10-16 12:56:08.666', '20240823173752_init', NULL, NULL, '2024-10-16 12:56:08.636', 1),
('da6c21c1-5c03-4d53-b0bb-14866f983c72', '294606d770b11945e244cfa78ef739e0a6ae52c09ba9d2dd9fccfcd9023739f7', '2024-10-16 12:56:08.850', '20240930154115_add_role_permissions', NULL, NULL, '2024-10-16 12:56:08.741', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `last_seen`
--
ALTER TABLE `last_seen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nationalCode` (`nationalCode`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_name_key` (`name`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_nationalCode_key` (`nationalCode`),
  ADD KEY `User_roleId_fkey` (`roleId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `last_seen`
--
ALTER TABLE `last_seen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
