const client = require('../config/database');

const create_box_photograph_table = async () => {
  const create_box_photograph_query = `
    CREATE TABLE IF NOT EXISTS public.box_photograph
    (
      id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
      box_id text COLLATE pg_catalog."default",
      location_name text,
      box_connection text COLLATE pg_catalog."default",
      outlet_number integer,
      outlet_status integer,
      command integer,
      "timestamp" timestamp with time zone,
      user_id integer,
      user_name text,
      outlet_current real,
      external_meter_current  real,
      outlet_voltage real,
      external_meter_voltage real,
      outlet_power_factor real,
      outlet_power_consumption real,
      created_at timestamp with time zone,
      updated_at timestamp with time zone,
      CONSTRAINT box_photograph_pkey PRIMARY KEY (id)
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.box_photograph
    OWNER to postgres;

    CREATE INDEX IF NOT EXISTS idx_box_photograph_created_at ON box_photograph (created_at);

  `;

  try {
    await client.query(create_box_photograph_query);
  } catch (err) {
    console.error('Error executing query', err.stack);
  };
};

const create_outlet_status_table = async () => {
  const create_outlet_status_query = `
    CREATE TABLE IF NOT EXISTS public.outlet_status
    (
        name text COLLATE pg_catalog."default" NOT NULL,
        outlet_status integer,
        update_time timestamp with time zone,
        CONSTRAINT outlet_status_pkey PRIMARY KEY (name)
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.outlet_status
    OWNER to postgres;
  `;

  try {
    await client.query(create_outlet_status_query);
  } catch (err) {
    console.error('Error executing query', err.stack);
  };
};

const create_outlets_table = async () => {
  const create_outlet_status_query = `
    CREATE TABLE IF NOT EXISTS public.outlets
    (
      name text COLLATE pg_catalog."default" NOT NULL,
      box_id text COLLATE pg_catalog."default",
      location_name text,
      box_connection text COLLATE pg_catalog."default",
      outlet_number integer,
      outlet_status integer,
      command integer,
      "timestamp" timestamp with time zone,
      outlet_current real,
      external_meter_current real,
      outlet_voltage real,
      external_meter_voltage real,
      outlet_power_factor real,
      outlet_power_consumption real,
      created_at timestamp with time zone,
      updated_at timestamp with time zone,
      CONSTRAINT outlets_pkey PRIMARY KEY (name)
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.outlets
    OWNER to postgres;
  `;

  try {
    await client.query(create_outlet_status_query);
  } catch (err) {
    console.error('Error executing query', err.stack);
  };
};

module.exports = {
  create_box_photograph_table,
  create_outlet_status_table,
  create_outlets_table,
}