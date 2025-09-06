-- Allotted menu items for chef (userId 2)
INSERT INTO `user_menuitem` (`userId`, `menuitemId`) VALUES
  (2, 1), -- Masala Dosa
  (2, 2), -- Plain Dosa
  (2, 3), -- Rave Dosa
  (2, 4), -- Paper Dosa
  (2, 5), -- Masala Paper Dosa
  (2, 6), -- Set Dosa
  (2, 7), -- Pesarttu
  (2, 8), -- Cheese Dosa
  (2, 9), -- Neer Dosa
  (2, 10), -- Adai Dosa
  (2, 11), -- Oats Dosa
  (2, 12), -- Masala Oats Dosa
  (2, 13), -- Moong Dal Dosa
  (2, 14), -- Jowar Dosa
  (2, 15), -- Butter Dosa
  (2, 16), -- Masala Butter Dosa
  (2, 17), -- Paneer Dosa
  (2, 18), -- Masala Paneer Dosa
  (2, 19); -- Poori

-- Menu items
INSERT INTO `menuitem` (`id`, `name`, `price`, `type`, `status`, `menuId`,`createdAt`, `updatedAt`) VALUES
  (1, 'Masala Dosa', 50, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (2, 'Plain Dosa', 40, 'veg', 1,1,  '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (3, 'Rave Dosa', 45, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (4, 'Paper Dosa', 55, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (5, 'Masala Paper Dosa', 60, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (6, 'Set Dosa', 50, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (7, 'Pesarttu', 55, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (8, 'Cheese Dosa', 70, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (9, 'Neer Dosa', 45, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (10, 'Adai Dosa', 50, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (11, 'Oats Dosa', 55, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (12, 'Masala Oats Dosa', 60, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (13, 'Moong Dal Dosa', 55, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (14, 'Jowar Dosa', 55, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (15, 'Butter Dosa', 65, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (16, 'Masala Butter Dosa', 70, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (17, 'Paneer Dosa', 75, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (18, 'Masala Paneer Dosa', 80, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (19, 'Poori', 40, 'veg', 1, 1, '2025-09-06 09:20:00', '2025-09-06 09:20:00');

-- Orders for today for chef (userId 2)
INSERT INTO `order` (`id`, `userId`, `restaurantId`, `total`, `status`, `createdAt`, `updatedAt`) VALUES
  (1, 2, 1, 200, 'completed', '2025-09-06 09:20:00', '2025-09-06 09:20:00'),
  (2, 2, 1, 150, 'completed', '2025-09-06 09:15:00', '2025-09-06 09:15:00'),
  (3, 2, 1, 100, 'completed', '2025-09-06 09:10:00', '2025-09-06 09:10:00'),
  (4, 2, 1, 50, 'completed', '2025-09-06 09:08:00', '2025-09-06 09:08:00');

-- Order products for today
INSERT INTO `OrdersProduct` (`orderId`, `menuitemId`, `quantity`, `createdAt`, `updatedAt`) VALUES
  (1, 1, 4, '2025-09-06 09:20:00', '2025-09-06 09:20:00'), -- Masala Dosa 4
  (2, 6, 3, '2025-09-06 09:15:00', '2025-09-06 09:15:00'), -- Set Dosa 3
  (3, 2, 6, '2025-09-06 09:10:00', '2025-09-06 09:10:00'), -- Plain Dosa 6
  (4, 11, 1, '2025-09-06 09:08:00', '2025-09-06 09:08:00'); -- Oats Dosa 1
