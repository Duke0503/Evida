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
) => {
  const insert_query = `
    INSERT INTO boxes (
      box_id, 
      box_name,
      province_box,
      district_box,
      location_box,
      gps_location,
      consump_fee
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  const values = [
    box_id, 
    box_name,
    province_box,
    district_box,
    location_box,
    gps_location,
    consump_fee,
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
  wallet_amount
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
      wallet_amount
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  const values = [
    user_id,
    user_name,
    email,
    phone_number,
    bike_brand,
    bike_model,
    joining_date,
    wallet_amount
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
  consumed,
  activation_fee,
  reason_closed
) => {
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
      consumed,
      activation_fee,
      reason_closed
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
    consumed,
    activation_fee,
    reason_closed
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