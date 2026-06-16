USE ynov_ci;

SET NAMES utf8mb4;

UPDATE users
SET firstName = 'Clément'
WHERE email = 'clement.machtelinckx@example.com';

UPDATE users
SET firstName = 'Léa'
WHERE email = 'lea.richard@example.com';

UPDATE users
SET firstName = 'Chloé'
WHERE email = 'chloe.moreau@example.com';
