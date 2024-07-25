const { Client } = require('pg');
const { db2Config } = require('../config/database');

const createOutletDataTable = async () => {
  const client = new Client(db2Config);

  const createOutletDataQuery = `
    CREATE TABLE IF NOT EXISTS public.outlet_data
    (
      id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
      ebox_id text COLLATE pg_catalog."default",
      ebox_name text,
      box_status text COLLATE pg_catalog."default",
      outlet_id integer,
      outlet_status integer,
      system_status integer,
      "timestamp" timestamp with time zone,
      user_id integer,
      user_name text,
      outlet_current real,
      current_external_meter real,
      outlet_voltage real,
      voltage_external_meter real,
      power_factor real,
      power_consumption real,
      created_at timestamp with time zone,
      updated_at timestamp with time zone,
      CONSTRAINT outlet_data_pkey PRIMARY KEY (id)
    )
    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.outlet_data
    OWNER to postgres;
  `;

  try {
    await client.connect();
    await client.query(createOutletDataQuery);
  } catch (err) {
    console.error('Error creating outlet_data table:', err.stack);
  } finally {
    await client.end();
  }
};

module.exports = { createOutletDataTable };
