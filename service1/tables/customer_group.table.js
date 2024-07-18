const client = require('../config/database');

const customer_group = async () => {
  try {
    await client.query(`
DROP TABLE IF EXISTS customer_group;

CREATE TABLE customer_group (
    ID SERIAL PRIMARY KEY,
    GROUP_USER VARCHAR(255)
);

INSERT INTO customer_group(GROUP_USER) VALUES
('High consumed, charge frequently, unaware of promotion.'),
('High consumed, charge frequently, newly aware of promotion.'),
('High consumed, charge frequently, often use discounts.'),

('Low consumed, charge frequently, unaware of promotion.'),
('Low consumed, charge frequently, newly aware of promotion.'),
('Low consumed, charge frequently, often use discounts.'),

('Low consumed, charge occasionally, unaware of promotion.'),
('Low consumed, charge occasionally, newly aware of promotion.'),
('Low consumed, charge occasionally, often use discounts.'),

('High consumed, charge occasionally, unaware of promotion.'),
('High consumed, charge occasionally, newly aware of promotion.'),
('High consumed, charge occasionally, often use discounts.'),

('High consumed, charge rarely, unaware of promotion.'),
('High consumed, charge rarely, newly aware of promotion.'),
('High consumed, charge rarely, often use discounts.'),

('Low consumed, charge rarely, unaware of promotion.'),
('Low consumed, charge rarely, newly aware of promotion.'),
('Low consumed, charge rarely, often use discounts.'),

('High consumed, charge frequently, charging free'),
('Low consumed, charge frequently, charging free'),

('High consumed, charge occasionally, charging free'),
('Low consumed, charge occasionally, charging free'),

('High consumed, charge rarely, charging free'),
('Low consumed, charge rarely, charging free');
      `);
      console.log("Table group_user created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  customer_group,
}