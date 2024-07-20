const client = require('../config/database');
const { convert_unix_to_date_time } = require('./convert_unix_to_date_time');

const insert_ebox_query = async(
  box_id, 
  box_name,
  province_box,
  district_box,
  location_box,
  gps_location,
  consump_fee,
  available,
  status,
  created_at,
  updated_at
) => {
  const insert_query = `
    INSERT INTO boxes (
      box_id, 
      box_name,
      province_box,
      district_box,
      location_box,
      gps_location,
      consump_fee,
      available,
      status,
      created_at,
      updated_at
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (box_id) DO UPDATE
    SET 
      box_name = EXCLUDED.box_name,
      province_box = EXCLUDED.province_box,
      district_box = EXCLUDED.district_box,
      location_box = EXCLUDED.location_box,
      gps_location = EXCLUDED.gps_location,
      consump_fee = EXCLUDED.consump_fee,
      available = EXCLUDED.available,
      status = EXCLUDED.status,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at
    WHERE public.boxes.updated_at IS DISTINCT FROM EXCLUDED.updated_at;
  `;

  const values = [
    box_id, 
    box_name,
    province_box,
    district_box,
    location_box,
    gps_location,
    consump_fee,
    available,
    status,
    created_at,
    updated_at
  ];

  try {
    await client.query(insert_query, values);
  } catch (err) {
    console.error('Error inserting row', err);
  };
};

const insert_user_query = async(
  user_id,
  user_name,
  email,
  phone_number,
  bike_brand,
  bike_model,
  joining_date,
  wallet_amount,
  activated,
  enabled,
  is_read_term,
  street,
  city,
  country,
  state,
  postal_code,
  created_at,
  updated_at
) => {
  const insert_query = `
    INSERT INTO app_user (
      user_id,
      user_name,
      email,
      phone_number,
      bike_brand,
      bike_model,
      joining_date,
      wallet_amount,
      activated,
      enabled,
      is_read_term,
      street,
      city,
      country,
      state,
      postal_code,
      created_at,
      updated_at
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    ON CONFLICT (user_id) DO UPDATE SET
      user_name = EXCLUDED.user_name,
      email = EXCLUDED.email,
      phone_number = EXCLUDED.phone_number,
      bike_brand = EXCLUDED.bike_brand,
      bike_model = EXCLUDED.bike_model,
      joining_date = EXCLUDED.joining_date,
      wallet_amount = EXCLUDED.wallet_amount,
      activated = EXCLUDED.activated,
      enabled = EXCLUDED.enabled,
      is_read_term = EXCLUDED.is_read_term,
      street = EXCLUDED.street,
      city = EXCLUDED.city,
      country = EXCLUDED.country,
      state = EXCLUDED.state,
      postal_code = EXCLUDED.postal_code,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at
    WHERE app_user.updated_at IS DISTINCT FROM EXCLUDED.updated_at;
  `;

  const values = [
    user_id,
    user_name,
    email,
    phone_number,
    bike_brand,
    bike_model,
    joining_date,
    wallet_amount,
    activated,
    enabled,
    is_read_term,
    street,
    city,
    country,
    state,
    postal_code,
    created_at,
    updated_at
  ];

  try {
    await client.query(insert_query, values);
  } catch (err) {
    console.error('Error inserting row', err);
  };
};

const insert_transaction_query = async(
  id,
  invoice_id,
  start_time,
  end_time,
  user_id,
  box_id,
  outlet_id,
  wattage_consumed,
  total_fee,
  status,
  discount_amount,
  promotion_code,
  promotion_discount,
  activation_fee,
  paid,
  total_consumed_fee,
  reason_closed,
  created_at,
  updated_at
) => {
  console.log(reason_closed)
  const { date: startDate, time: startTime } = convert_unix_to_date_time(start_time);
  const { date: endDate, time: endTime } = convert_unix_to_date_time(end_time);

  const insert_query = `
    INSERT INTO transactions (
      id,
      invoice_id,
      start_date,
      start_time,
      end_date,
      end_time,
      user_id,
      box_id,
      outlet_id,
      wattage_consumed,
      total_fee,
      status,
      discount_amount,
      promotion_code,
      promotion_discount,
      activation_fee,
      paid,
      total_consumed_fee,
      reason_closed,
      created_at,
      updated_at
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    ON CONFLICT (id, invoice_id) DO UPDATE SET
      start_date = EXCLUDED.start_date,
      start_time = EXCLUDED.start_time,
      end_date = EXCLUDED.end_date,
      end_time = EXCLUDED.end_time,
      user_id = EXCLUDED.user_id,
      box_id = EXCLUDED.box_id,
      outlet_id = EXCLUDED.outlet_id,
      wattage_consumed = EXCLUDED.wattage_consumed,
      total_fee = EXCLUDED.total_fee,
      status = EXCLUDED.status,
      discount_amount = EXCLUDED.discount_amount,
      promotion_code = EXCLUDED.promotion_code,
      promotion_discount = EXCLUDED.promotion_discount,
      activation_fee = EXCLUDED.activation_fee,
      paid = EXCLUDED.paid,
      total_consumed_fee = EXCLUDED.total_consumed_fee,
      reason_closed = EXCLUDED.reason_closed,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at
    WHERE transactions.updated_at IS DISTINCT FROM EXCLUDED.updated_at;    
  `;

  const values = [
    id,
    invoice_id,
    startDate, 
    startTime, 
    endDate, 
    endTime,
    user_id,
    box_id,
    outlet_id,
    wattage_consumed,
    total_fee,
    status,
    discount_amount,
    promotion_code,
    promotion_discount,
    activation_fee,
    paid,
    total_consumed_fee,
    reason_closed,
    created_at,
    updated_at
  ];

  try {
    await client.query(insert_query, values);
  } catch (err) {
    console.error('Error inserting row', err);
  };
};

module.exports = {
  insert_ebox_query,
  insert_user_query,
  insert_transaction_query,
}