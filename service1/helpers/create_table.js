const client = require('../config/database');

const create_app_user_table = async () => {
  const create_app_user_query = `
    CREATE TABLE IF NOT EXISTS public.app_user
    (
      user_id bigint NOT NULL,
      user_name text COLLATE pg_catalog."default",
      email text COLLATE pg_catalog."default",
      phone_number text COLLATE pg_catalog."default",
      bike_brand text COLLATE pg_catalog."default",
      bike_model text COLLATE pg_catalog."default",
      joining_date timestamp with time zone,
      wallet_amount real,
      activated boolean,
      enabled boolean,
      is_read_term boolean,
      street text COLLATE pg_catalog."default",
      city text COLLATE pg_catalog."default",
      country text COLLATE pg_catalog."default",
      state text COLLATE pg_catalog."default",
      postal_code text COLLATE pg_catalog."default",
      created_at timestamp with time zone,
      updated_at timestamp with time zone,
      CONSTRAINT app_user_pkey PRIMARY KEY (user_id)
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.app_user
      OWNER to postgres;
  `
  try {
    await client.query(create_app_user_query);
  } catch (err) {
    console.error('Error executing query', err.stack);
  };
};

const create_boxes_table = async () => {
  const create_boxes_table_query = `
    CREATE TABLE IF NOT EXISTS public.boxes
    (
      box_id text COLLATE pg_catalog."default" NOT NULL,
      box_name text COLLATE pg_catalog."default",
      province_box text COLLATE pg_catalog."default",
      district_box text COLLATE pg_catalog."default",
      location_box text COLLATE pg_catalog."default",
      gps_location text COLLATE pg_catalog."default",
      consump_fee integer,
      available text COLLATE pg_catalog."default",
      status boolean,
      created_at timestamp with time zone,
      updated_at timestamp with time zone,
      CONSTRAINT boxes_pkey PRIMARY KEY (box_id)
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.boxes
      OWNER to postgres;
  `
  try {
    await client.query(create_boxes_table_query);
  } catch (err) {
    console.error('Error executing query', err.stack);
  };
};

const create_transaction_table = async () => {
  const create_transaction_table_query = `
    CREATE TABLE IF NOT EXISTS public.transactions
    (
      id bigint NOT NULL,
      invoice_id text COLLATE pg_catalog."default" NOT NULL,
      start_date date,
      start_time time with time zone,
      end_date date,
      end_time time with time zone,
      user_id bigint,
      box_id text COLLATE pg_catalog."default",
      outlet_id text COLLATE pg_catalog."default",
      wattage_consumed real,
      total_fee real,
      status boolean,
      discount_amount real,
      promotion_code text COLLATE pg_catalog."default",
      promotion_discount real,
      activation_fee real,
      paid real,
      total_consumed_fee real,
      reason_closed text COLLATE pg_catalog."default",
      created_at timestamp with time zone,
      updated_at timestamp with time zone,
      CONSTRAINT transactions_pkey PRIMARY KEY (id, invoice_id)
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.transactions
      OWNER to postgres;
  `
  try {
    await client.query(create_transaction_table_query);
  } catch (err) {
    console.error('Error executing query', err.stack);
  };
};

const create_active_outlet_table = async () => {
  const create_active_outlet_table_query = `
CREATE TABLE IF NOT EXISTS public.active_outlet
(
  id SERIAL PRIMARY KEY,
  box_id text COLLATE pg_catalog."default" NOT NULL,
  number_of_active_outlets int,
  CONSTRAINT unique_box_id UNIQUE (box_id)
)
TABLESPACE pg_default;
  `
  try {
    await client.query(create_active_outlet_table_query);
  } catch (err) {
    console.error('Error executing query', err.stack);
  };
};

module.exports = {
  create_app_user_table,
  create_boxes_table,
  create_transaction_table,
  create_active_outlet_table,
}