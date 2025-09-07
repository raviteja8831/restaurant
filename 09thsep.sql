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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement`
--

LOCK TABLES `announcement` WRITE;
/*!40000 ALTER TABLE `announcement` DISABLE KEYS */;
INSERT INTO `announcement` VALUES (1,'Welcome to The Gourmet Spot! Enjoy our new menu.',1,'2025-08-01 10:00:00','2025-08-01 10:00:00'),(2,'Cafe Aroma now serves breakfast all day!',2,'2025-08-01 10:00:00','2025-08-01 10:00:00');
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
  `icon` varchar(255) DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `restaurantId` (`restaurantId`),
  CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES (1,'Lunch Menu',1,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL,1),(2,'Breakfast Menu',2,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL,1),(3,'Dinner Menu',3,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL,1);
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;

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
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menuId` (`menuId`),
  CONSTRAINT `menuitem_ibfk_1` FOREIGN KEY (`menuId`) REFERENCES `menu` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menuitem`
--

LOCK TABLES `menuitem` WRITE;
/*!40000 ALTER TABLE `menuitem` DISABLE KEYS */;
INSERT INTO `menuitem` VALUES (1,'Masala Dosa',50,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(2,'Plain Dosa',40,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(3,'Rave Dosa',45,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(4,'Paper Dosa',55,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(5,'Masala Paper Dosa',60,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(6,'Set Dosa',50,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(7,'Pesarttu',55,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(8,'Cheese Dosa',70,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(9,'Neer Dosa',45,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(10,'Adai Dosa',50,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(11,'Oats Dosa',55,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(12,'Masala Oats Dosa',60,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(13,'Moong Dal Dosa',55,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(14,'Jowar Dosa',55,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(15,'Butter Dosa',65,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(16,'Masala Butter Dosa',70,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(17,'Paneer Dosa',75,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(18,'Masala Paneer Dosa',80,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1),(19,'Poori',40,'veg',1,'2025-09-06 09:20:00','2025-09-06 09:20:00',1);
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
  CONSTRAINT `order_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `order_ibfk_4` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,2,1,200,'completed','2025-09-07 09:20:00','2025-09-06 09:20:00'),(2,2,1,150,'completed','2025-09-07 09:15:00','2025-09-06 09:15:00'),(3,2,1,100,'completed','2025-09-07 09:10:00','2025-09-06 09:10:00'),(4,2,1,50,'completed','2025-09-07 09:08:00','2025-09-06 09:08:00');
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
  `menuitemId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `menuitemId` (`menuitemId`),
  CONSTRAINT `ordersproduct_ibfk_3` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ordersproduct_ibfk_4` FOREIGN KEY (`menuitemId`) REFERENCES `menuitem` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordersproduct`
--

LOCK TABLES `ordersproduct` WRITE;
/*!40000 ALTER TABLE `ordersproduct` DISABLE KEYS */;
INSERT INTO `ordersproduct` VALUES (2,4,1,1,'2025-09-06 09:20:00','2025-09-06 09:20:00'),(3,3,2,6,'2025-09-06 09:15:00','2025-09-06 09:15:00'),(4,6,3,2,'2025-09-06 09:10:00','2025-09-06 09:10:00'),(5,1,4,11,'2025-09-06 09:08:00','2025-09-06 09:08:00');
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
  CONSTRAINT `qrcode_ibfk_1` FOREIGN KEY (`restTableId`) REFERENCES `restauranttable` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `qrcode_ibfk_2` FOREIGN KEY (`restTableId`) REFERENCES `restauranttable` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qrcode`
--

LOCK TABLES `qrcode` WRITE;
/*!40000 ALTER TABLE `qrcode` DISABLE KEYS */;
INSERT INTO `qrcode` VALUES (1,'QR1',1,'2025-08-01 10:00:00','2025-08-01 10:00:00'),(2,'QR2',2,'2025-08-01 10:00:00','2025-08-01 10:00:00'),(3,'QR3',3,'2025-08-01 10:00:00','2025-08-01 10:00:00');
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
  `ambianceImage` varchar(255) DEFAULT NULL,
  `logoImage` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `restaurantType` varchar(255) DEFAULT NULL COMMENT 'Comma separated values for service types (table,self,both)',
  `foodType` varchar(255) DEFAULT NULL COMMENT 'Comma separated values for food types (veg,nonveg,both)',
  `enableBuffet` tinyint(1) DEFAULT '0',
  `typeId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `typeId` (`typeId`),
  CONSTRAINT `restaurant_ibfk_1` FOREIGN KEY (`typeId`) REFERENCES `restauranttype` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant`
--

LOCK TABLES `restaurant` WRITE;
/*!40000 ALTER TABLE `restaurant` DISABLE KEYS */;
INSERT INTO `restaurant` VALUES (1,'The Gourmet Spot','123 Main St, Cityville','ambiance1.jpg','logo1.png','2025-08-01 10:00:00','2025-08-01 10:00:00',NULL,NULL,0,NULL),(2,'Cafe Aroma','456 Coffee Ave, Townsville','ambiance2.jpg','logo2.png','2025-08-01 10:00:00','2025-08-01 10:00:00',NULL,NULL,0,NULL),(3,'Burger Express','789 Fast Ln, Burgertown','ambiance3.jpg','logo3.png','2025-08-01 10:00:00','2025-08-01 10:00:00',NULL,NULL,0,NULL),(14,'','',NULL,NULL,'2025-08-31 01:21:58','2025-08-31 01:21:58',NULL,NULL,0,NULL),(15,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:03:32','2025-08-31 03:03:32',NULL,NULL,0,NULL),(16,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:03:36','2025-08-31 03:03:36',NULL,NULL,0,NULL),(17,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:03:52','2025-08-31 03:03:52',NULL,NULL,0,NULL),(18,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:06:24','2025-08-31 03:06:24',NULL,NULL,0,NULL),(19,'teja','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:23:20','2025-08-31 03:23:20',NULL,NULL,0,NULL),(20,'teja','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:31:29','2025-08-31 03:31:29','table,self','veg,nonveg',1,NULL),(21,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:46:18','2025-08-31 03:46:18','table,self','veg,nonveg',1,NULL),(22,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:49:08','2025-08-31 03:49:08','table,self','veg,nonveg',1,NULL),(23,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:49:14','2025-08-31 03:49:14','table,self','veg,nonveg',1,NULL),(24,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:50:10','2025-08-31 03:50:10','table,self','veg,nonveg',1,NULL),(25,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:51:06','2025-08-31 03:51:06','table,self','veg,nonveg',1,NULL),(26,'','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:53:31','2025-08-31 03:53:31','table,self','nonveg',0,NULL),(27,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:53:49','2025-08-31 03:53:49','table,self','veg,nonveg',1,NULL),(28,'Siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 03:55:39','2025-08-31 03:55:39','table,self','veg,nonveg',1,NULL),(29,'siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 04:01:34','2025-08-31 04:01:34','table,self','veg,nonveg',1,NULL),(30,'siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 04:08:02','2025-08-31 04:08:02','','',1,NULL),(31,'siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 04:12:13','2025-08-31 04:12:13','table,self','veg,nonveg',0,NULL),(32,'siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 04:17:20','2025-08-31 04:17:20','table,self','veg,nonveg',1,NULL),(33,'siddhu','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 04:17:34','2025-08-31 04:17:34','table,self','veg,nonveg',1,NULL),(34,'Ravindra Restaurant','1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',NULL,NULL,'2025-08-31 10:48:07','2025-08-31 10:48:07','table,self','veg,nonveg',0,NULL);
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
  CONSTRAINT `restaurantrating_ibfk_3` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `restaurantrating_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurantrating`
--

LOCK TABLES `restaurantrating` WRITE;
/*!40000 ALTER TABLE `restaurantrating` DISABLE KEYS */;
INSERT INTO `restaurantrating` VALUES (1,1,3,4.5,'2025-08-01 13:00:00','2025-08-01 13:00:00'),(2,2,2,5,'2025-08-01 13:10:00','2025-08-01 13:10:00');
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
  CONSTRAINT `restaurantreview_ibfk_3` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `restaurantreview_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurantreview`
--

LOCK TABLES `restaurantreview` WRITE;
/*!40000 ALTER TABLE `restaurantreview` DISABLE KEYS */;
INSERT INTO `restaurantreview` VALUES (1,1,1,'Amazing food and great service!','2025-08-01 13:05:00','2025-08-01 13:05:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restauranttable`
--

LOCK TABLES `restauranttable` WRITE;
/*!40000 ALTER TABLE `restauranttable` DISABLE KEYS */;
INSERT INTO `restauranttable` VALUES (1,'Table 1','free','QR1',1,'2025-08-01 10:00:00','2025-08-01 10:00:00'),(2,'Table 2','occupied','QR2',1,'2025-08-01 10:00:00','2025-08-01 10:00:00'),(3,'Table 3','free','QR3',2,'2025-08-01 10:00:00','2025-08-01 10:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restauranttype`
--

LOCK TABLES `restauranttype` WRITE;
/*!40000 ALTER TABLE `restauranttype` DISABLE KEYS */;
INSERT INTO `restauranttype` VALUES (1,'Table Service','2025-08-01 10:00:00','2025-08-01 10:00:00'),(2,'Self Service','2025-08-01 10:00:00','2025-08-01 10:00:00'),(3,'Veg','2025-08-01 10:00:00','2025-08-01 10:00:00'),(4,'Non Veg','2025-08-01 10:00:00','2025-08-01 10:00:00');
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
  `restaurantId` int NOT NULL,
  `role_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `phone_2` (`phone`),
  UNIQUE KEY `phone_3` (`phone`),
  UNIQUE KEY `phone_4` (`phone`),
  UNIQUE KEY `phone_5` (`phone`),
  UNIQUE KEY `phone_6` (`phone`),
  UNIQUE KEY `phone_7` (`phone`),
  UNIQUE KEY `phone_8` (`phone`),
  UNIQUE KEY `phone_9` (`phone`),
  UNIQUE KEY `phone_10` (`phone`),
  UNIQUE KEY `phone_11` (`phone`),
  KEY `restaurantId` (`restaurantId`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `restaurantuser_ibfk_21` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `restaurantuser_ibfk_22` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurantuser`
--

LOCK TABLES `restaurantuser` WRITE;
/*!40000 ALTER TABLE `restaurantuser` DISABLE KEYS */;
INSERT INTO `restaurantuser` VALUES (1,'9998887777','Alice','Smith',1,1,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL),(2,'8887776666','Bob','Johnson',1,2,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL),(3,'7776665555','Charlie','Brown',2,3,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL),(4,'6665554444','Diana','Prince',3,1,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL),(20,'9898989898','ravi','teja',33,1,'2025-08-31 04:17:34','2025-08-31 04:17:34',NULL),(21,'9090909090','Shiva','',33,2,'2025-08-31 09:58:49','2025-08-31 09:58:49','$2a$10$TtyLDqc3o.Jwly8F2zQONORgXtdxSirK/xZoTwYU/FVNPG4.wqKSy'),(22,'8080808080','Ravindra','Y',34,1,'2025-08-31 10:48:07','2025-08-31 10:48:07','123456'),(23,'7070707070','Siddhu','',33,2,'2025-08-31 10:48:59','2025-08-31 10:48:59','$2a$10$mvAgp.5ndTgZ8phwmBKfxO2FquTGeGmQgM426s5C.NMtbcFnbVJLS'),(24,'6868686868','Naveen','',33,2,'2025-08-31 17:29:52','2025-08-31 17:29:52','$2a$10$ly6Ky2ENkwaC3cA16tEbAeKNWYV2kgWde4SkKuqzSnt6T9ckjHUTC');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Manager','2025-08-01 10:00:00','2025-08-01 10:00:00'),(2,'Chef','2025-08-01 10:00:00','2025-08-01 10:00:00'),(3,'Customer','2025-08-01 10:00:00','2025-08-01 10:00:00');
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
  `email` varchar(255) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `restaurantType` varchar(255) DEFAULT NULL COMMENT 'Comma separated values for service types (table,self,both)',
  `foodType` varchar(255) DEFAULT NULL COMMENT 'Comma separated values for food types (veg,nonveg,both)',
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `phone_2` (`phone`),
  UNIQUE KEY `phone_3` (`phone`),
  UNIQUE KEY `phone_4` (`phone`),
  UNIQUE KEY `phone_5` (`phone`),
  UNIQUE KEY `phone_6` (`phone`),
  UNIQUE KEY `phone_7` (`phone`),
  UNIQUE KEY `phone_8` (`phone`),
  UNIQUE KEY `phone_9` (`phone`),
  UNIQUE KEY `phone_10` (`phone`),
  UNIQUE KEY `phone_11` (`phone`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  KEY `role_id` (`role_id`),
  KEY `userId` (`userId`),
  CONSTRAINT `user_ibfk_10` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_12` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_14` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_16` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_17` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_6` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_8` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_userId_foreign_idx` FOREIGN KEY (`userId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'9998887777','Alice','Smith','alice.smith@example.com',1,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL,NULL,NULL),(2,'8887776666','Bob','Johnson','bob.johnson@example.com',2,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL,NULL,NULL),(3,'7776665555','Charlie','Brown','charlie.brown@example.com',3,'2025-08-01 10:00:00','2025-08-01 10:00:00',NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_menuitem`
--

DROP TABLE IF EXISTS `user_menuitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_menuitem` (
  `userId` int NOT NULL,
  `menuitemId` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `uodatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menuitemId` (`menuitemId`),
  KEY `user_menuitem_ibfk_1_idx` (`userId`),
  CONSTRAINT `user_menuitem_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `restaurantuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_menuitem_ibfk_2` FOREIGN KEY (`menuitemId`) REFERENCES `menuitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_menuitem`
--

LOCK TABLES `user_menuitem` WRITE;
/*!40000 ALTER TABLE `user_menuitem` DISABLE KEYS */;
INSERT INTO `user_menuitem` VALUES (2,1,1,NULL,NULL),(2,2,2,NULL,NULL),(2,3,3,NULL,NULL),(2,4,4,NULL,NULL),(2,5,5,NULL,NULL),(2,6,6,NULL,NULL),(2,7,7,NULL,NULL),(2,8,8,NULL,NULL),(2,9,9,NULL,NULL),(2,10,10,NULL,NULL),(2,11,11,NULL,NULL),(2,12,12,NULL,NULL),(2,13,13,NULL,NULL),(2,14,14,NULL,NULL),(2,15,15,NULL,NULL),(2,16,16,NULL,NULL),(2,17,17,NULL,NULL),(2,18,18,NULL,NULL),(2,19,19,NULL,NULL);
/*!40000 ALTER TABLE `user_menuitem` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-07 10:06:34
