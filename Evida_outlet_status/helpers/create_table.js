const client = require('../config/database');

const create_outlet_data_table = async () => {
  const create_outlet_data_query = `
    CREATE TABLE IF NOT EXISTS public.outlet_data
    (
      id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
      ebox_id text COLLATE pg_catalog."default",
      ebox_name text,
      box_status text COLLATE pg_catalog."default",
      outlet_id integer,
      outlet_status integer,
      "timestamp" timestamp without time zone,
      current_system real,
      current_device real,
      voltage_system real,
      voltage_device real,
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
    await client.query(create_outlet_data_query);
  } catch (err) {
    console.error('Error executing query', err.stack);
  };
};

const create_outlets_table = async () => {
  const create_outlets_query = `
    CREATE TABLE IF NOT EXISTS public.outlets
    (
        name text COLLATE pg_catalog."default" NOT NULL,
        outlet_status integer,
        update_time timestamp without time zone,
        CONSTRAINT outlets_pkey PRIMARY KEY (name)
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.outlets
    OWNER to postgres;
  `;

  try {
    await client.query(create_outlets_query);
  } catch (err) {
    console.error('Error executing query', err.stack);
  };
};

module.exports = {
  create_outlet_data_table,
  create_outlets_table,
}