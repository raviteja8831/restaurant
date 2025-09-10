-- Sample data for restaurant, tables (qrcodes), and orders
INSERT INTO restaurant (id, name, address) VALUES (1, 'Test Restaurant', '123 Main St');

INSERT INTO restaurantTable (id, name, status, qrcode, restaurantId) VALUES
(1, 'Table 1', 'free', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=1_Table%201', 1),
(2, 'Table 2', 'free', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=1_Table%202', 1);

INSERT INTO `order` (id, userId, restaurantId, total, status, tableId, name, contact, createdAt) VALUES
(1, 1, 1, 500, 'Paid', 1, 'Abhishek', '9664073525', '2025-09-08 07:12:00'),
(2, 2, 1, 300, 'Pending', 1, 'Prakash', '9664073525', '2025-09-08 07:12:00'),
(3, 1, 1, 800, 'Paid', 2, 'Karthick', '7667876534', '2025-09-08 07:12:00'),
(4, 2, 1, 600, 'Paid', 2, 'Amruth', '9664073525', '2025-09-08 07:12:00'),
(5, 1, 1, 500, 'Pending', 1, 'Abhishek', '9664073525', '2025-09-08 07:12:00'),
(6, 2, 1, 1200, 'Paid', 1, 'Prakash', '9664073525', '2025-09-08 07:12:00');

-- Add user sample
INSERT INTO user (id, phone, firstname, lastname, role_id) VALUES
(1, '9876543210', 'Abhishek', 'Kumar', 2),
(2, '9664073525', 'Prakash', 'Singh', 2);
