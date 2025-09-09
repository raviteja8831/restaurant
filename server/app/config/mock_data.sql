-- Insert test users
INSERT INTO users (firstname, lastname, phone, email, password) VALUES
('Praveen', 'Jadhav', '9660845632', 'praveen@example.com', 'hashedpassword123');

-- Insert test restaurants
INSERT INTO restaurant (name, address, typeId) VALUES
('Sai Hotel', 'No 45 Brigade Plaza First Floor Near Rt Bus Stand Opp Movieland Cinema Hall Bangalore 560038', 1),
('Kamat Hotel', 'Mysore Main road Bharat Petrol Station National Highway Bangalore 560038', 1),
('Udupi Kitchen Hotel', 'Bellary Main road Bharat Petrol Station National Highway Bangalore 560038', 1);

-- Insert test menu items
INSERT INTO menuitem (name, price, description, menuId) VALUES
('Tomato Soup', 80, 'Hot and spicy tomato soup', 1),
('Godi Manchuri', 120, 'Crispy manchurian', 1),
('Roti', 45, 'Fresh tandoor roti', 1),
('Veg Biriyani', 180, 'Aromatic veg biryani', 1),
('Curd Rice', 150, 'Fresh curd rice', 1),
('Desserts', 215, 'Assorted desserts', 1);

-- Insert test reviews
INSERT INTO restaurantReview (userId, restaurantId, review, rating, createdAt) VALUES
(1, 1, 'Excellent service and amazing food quality', 5, '2023-04-02'),
(1, 2, 'Great ambiance and tasty food', 5, '2023-02-02'),
(1, 3, 'Best south Indian food in the area', 5, '2023-01-25');

-- Insert test orders
INSERT INTO orders (userId, restaurantId, totalAmount, status, memberCount, createdAt) VALUES
(1, 1, 3000, 'COMPLETED', 5, '2023-04-02'),
(1, 2, 940, 'COMPLETED', 2, '2023-02-02'),
(1, 3, 2500, 'COMPLETED', 4, '2023-01-25');

-- Insert order items for Udupi Kitchen Hotel order
INSERT INTO orderProducts (orderId, menuitemId, quantity, price) VALUES
(3, 1, 4, 80),  -- Tomato Soup
(3, 2, 4, 120), -- Godi Manchuri
(3, 3, 4, 45),  -- Roti
(3, 4, 2, 180), -- Veg Biriyani
(3, 5, 2, 150), -- Curd Rice
(3, 6, 4, 215); -- Desserts
