-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: restaurant_service
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcement`
--

DROP TABLE IF EXISTS `announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` varchar(255) NOT NULL,
  `restaurantId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurantId` (`restaurantId`),
  CONSTRAINT `announcement_ibfk_1` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement`
--

LOCK TABLES `announcement` WRITE;
/*!40000 ALTER TABLE `announcement` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `restaurantId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurantId` (`restaurantId`),
  CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Insert test data for all tables
--

-- Insert roles
INSERT INTO `role` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
  (1, 'Manager', '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, 'Chef', '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (4, 'Customer', '2025-08-01 10:00:00', '2025-08-01 10:00:00');

-- Insert restaurant types
INSERT INTO `restauranttype` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
  (1, 'Table Service', '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, 'Self Service', '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (3, 'Veg', '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (4, 'Non Veg', '2025-08-01 10:00:00', '2025-08-01 10:00:00'),

-- Insert restaurants
INSERT INTO `restaurant` (`id`, `name`, `address`, `typeId`, `ambianceImage`, `logoImage`, `createdAt`, `updatedAt`) VALUES
  (1, 'The Gourmet Spot', '123 Main St, Cityville', 1, 'ambiance1.jpg', 'logo1.png', '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, 'Cafe Aroma', '456 Coffee Ave, Townsville', 2, 'ambiance2.jpg', 'logo2.png', '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (3, 'Burger Express', '789 Fast Ln, Burgertown', 3, 'ambiance3.jpg', 'logo3.png', '2025-08-01 10:00:00', '2025-08-01 10:00:00');

-- Insert users
INSERT INTO `user` (`id`, `phone`, `firstname`, `lastname`, `email`, `role_id`, `createdAt`, `updatedAt`) VALUES
  (1, '9998887777', 'Alice', 'Smith', 'alice.smith@example.com', 1, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, '8887776666', 'Bob', 'Johnson', 'bob.johnson@example.com', 2, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (3, '7776665555', 'Charlie', 'Brown', 'charlie.brown@example.com', 3, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (4, '6665554444', 'Diana', 'Prince', 'diana.prince@example.com', 4, '2025-08-01 10:00:00', '2025-08-01 10:00:00');

-- Insert restaurant users
INSERT INTO `restaurantuser` (`id`, `phone`, `firstname`, `lastname`, `email`, `restaurantId`, `role_id`, `createdAt`, `updatedAt`) VALUES
  (1, '9998887777', 'Alice', 'Smith', 'alice.smith@example.com', 1, 1, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, '8887776666', 'Bob', 'Johnson', 'bob.johnson@example.com', 1, 2, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (3, '7776665555', 'Charlie', 'Brown', 'charlie.brown@example.com', 2, 3, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (4, '6665554444', 'Diana', 'Prince', 'diana.prince@example.com', 3, 4, '2025-08-01 10:00:00', '2025-08-01 10:00:00');

-- Insert restaurant tables
INSERT INTO `restauranttable` (`id`, `name`, `status`, `qrcode`, `restaurantId`, `createdAt`, `updatedAt`) VALUES
  (1, 'Table 1', 'free', 'QR1', 1, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, 'Table 2', 'occupied', 'QR2', 1, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (3, 'Table 3', 'free', 'QR3', 2, '2025-08-01 10:00:00', '2025-08-01 10:00:00');

-- Insert QR codes
INSERT INTO `qrcode` (`id`, `value`, `restTableId`, `createdAt`, `updatedAt`) VALUES
  (1, 'QR1', 1, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, 'QR2', 2, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (3, 'QR3', 3, '2025-08-01 10:00:00', '2025-08-01 10:00:00');

-- Insert menus
INSERT INTO `menu` (`id`, `name`, `restaurantId`, `createdAt`, `updatedAt`) VALUES
  (1, 'Lunch Menu', 1, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, 'Breakfast Menu', 2, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (3, 'Dinner Menu', 3, '2025-08-01 10:00:00', '2025-08-01 10:00:00');

-- Insert menu items
INSERT INTO `menuitem` (`id`, `name`, `price`, `type`, `menuId`, `createdAt`, `updatedAt`) VALUES
  (1, 'Grilled Salmon', 18.99, 'Main Course', 1, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, 'Caesar Salad', 8.99, 'Starter', 1, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (3, 'Espresso', 2.99, 'Beverage', 2, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (4, 'Cheeseburger', 9.49, 'Main Course', 3, '2025-08-01 10:00:00', '2025-08-01 10:00:00');

-- Insert orders
INSERT INTO `order` (`id`, `userId`, `restaurantId`, `total`, `status`, `createdAt`, `updatedAt`) VALUES
  (1, 4, 1, 27.98, 'Completed', '2025-08-01 12:00:00', '2025-08-01 12:30:00'),
  (2, 4, 2, 2.99, 'Pending', '2025-08-01 09:00:00', '2025-08-01 09:05:00');

-- Insert ordersproduct
INSERT INTO `ordersproduct` (`id`, `quantity`, `orderId`, `productId`, `createdAt`, `updatedAt`) VALUES
  (1, 2, 1, 1, '2025-08-01 12:00:00', '2025-08-01 12:00:00'),
  (2, 1, 1, 2, '2025-08-01 12:00:00', '2025-08-01 12:00:00'),
  (3, 1, 2, 3, '2025-08-01 09:00:00', '2025-08-01 09:00:00');

-- Insert announcements
INSERT INTO `announcement` (`id`, `message`, `restaurantId`, `createdAt`, `updatedAt`) VALUES
  (1, 'Welcome to The Gourmet Spot! Enjoy our new menu.', 1, '2025-08-01 10:00:00', '2025-08-01 10:00:00'),
  (2, 'Cafe Aroma now serves breakfast all day!', 2, '2025-08-01 10:00:00', '2025-08-01 10:00:00');

-- Insert restaurant ratings
INSERT INTO `restaurantrating` (`id`, `restaurantId`, `userId`, `rating`, `createdAt`, `updatedAt`) VALUES
  (1, 1, 4, 4.5, '2025-08-01 13:00:00', '2025-08-01 13:00:00'),
  (2, 2, 4, 5.0, '2025-08-01 13:10:00', '2025-08-01 13:10:00');

-- Insert restaurant reviews
INSERT INTO `restaurantreview` (`id`, `restaurantId`, `userId`, `review`, `createdAt`, `updatedAt`) VALUES
  (1, 1, 4, 'Amazing food and great service!', '2025-08-01 13:05:00', '2025-08-01 13:05:00'),

--
-- Table structure for table `menuitem`
--

DROP TABLE IF EXISTS `menuitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menuitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` float NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `menuId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `menuId` (`menuId`),
  CONSTRAINT `menuitem_ibfk_1` FOREIGN KEY (`menuId`) REFERENCES `menu` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menuitem`
--

LOCK TABLES `menuitem` WRITE;
/*!40000 ALTER TABLE `menuitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `menuitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `restaurantId` int NOT NULL,
  `total` float NOT NULL,
  `status` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `restaurantId` (`restaurantId`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordersproduct`
--

DROP TABLE IF EXISTS `ordersproduct`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordersproduct` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int DEFAULT NULL,
  `orderId` int DEFAULT NULL,
  `productId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `productId` (`productId`),
  CONSTRAINT `ordersproduct_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ordersproduct_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `menuitem` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordersproduct`
--

LOCK TABLES `ordersproduct` WRITE;
/*!40000 ALTER TABLE `ordersproduct` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordersproduct` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qrcode`
--

DROP TABLE IF EXISTS `qrcode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qrcode` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(255) NOT NULL,
  `restTableId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `restTableId` (`restTableId`),
  CONSTRAINT `qrcode_ibfk_1` FOREIGN KEY (`restTableId`) REFERENCES `restauranttable` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qrcode`
--

LOCK TABLES `qrcode` WRITE;
/*!40000 ALTER TABLE `qrcode` DISABLE KEYS */;
/*!40000 ALTER TABLE `qrcode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant`
--

DROP TABLE IF EXISTS `restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `typeId` int NOT NULL,
  `ambianceImage` varchar(255) DEFAULT NULL,
  `logoImage` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `typeId` (`typeId`),
  CONSTRAINT `restaurant_ibfk_1` FOREIGN KEY (`typeId`) REFERENCES `restauranttype` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant`
--

LOCK TABLES `restaurant` WRITE;
/*!40000 ALTER TABLE `restaurant` DISABLE KEYS */;
/*!40000 ALTER TABLE `restaurant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurantrating`
--

DROP TABLE IF EXISTS `restaurantrating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurantrating` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurantId` int NOT NULL,
  `userId` int NOT NULL,
  `rating` float NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurantId` (`restaurantId`),
  KEY `userId` (`userId`),
  CONSTRAINT `restaurantrating_ibfk_1` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `restaurantrating_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurantrating`
--

LOCK TABLES `restaurantrating` WRITE;
/*!40000 ALTER TABLE `restaurantrating` DISABLE KEYS */;
/*!40000 ALTER TABLE `restaurantrating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurantreview`
--

DROP TABLE IF EXISTS `restaurantreview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurantreview` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurantId` int NOT NULL,
  `userId` int NOT NULL,
  `review` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurantId` (`restaurantId`),
  KEY `userId` (`userId`),
  CONSTRAINT `restaurantreview_ibfk_1` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `restaurantreview_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurantreview`
--

LOCK TABLES `restaurantreview` WRITE;
/*!40000 ALTER TABLE `restaurantreview` DISABLE KEYS */;
/*!40000 ALTER TABLE `restaurantreview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restauranttable`
--

DROP TABLE IF EXISTS `restauranttable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restauranttable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT 'free',
  `qrcode` varchar(255) DEFAULT NULL,
  `restaurantId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurantId` (`restaurantId`),
  CONSTRAINT `restauranttable_ibfk_1` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restauranttable`
--

LOCK TABLES `restauranttable` WRITE;
/*!40000 ALTER TABLE `restauranttable` DISABLE KEYS */;
/*!40000 ALTER TABLE `restauranttable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restauranttype`
--

DROP TABLE IF EXISTS `restauranttype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restauranttype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restauranttype`
--

LOCK TABLES `restauranttype` WRITE;
/*!40000 ALTER TABLE `restauranttype` DISABLE KEYS */;
/*!40000 ALTER TABLE `restauranttype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurantuser`
--

DROP TABLE IF EXISTS `restaurantuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurantuser` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `restaurantId` int NOT NULL,
  `role_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  KEY `restaurantId` (`restaurantId`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `restaurantuser_ibfk_1` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `restaurantuser_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurantuser`
--

LOCK TABLES `restaurantuser` WRITE;
/*!40000 ALTER TABLE `restaurantuser` DISABLE KEYS */;
/*!40000 ALTER TABLE `restaurantuser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-30 17:40:11
