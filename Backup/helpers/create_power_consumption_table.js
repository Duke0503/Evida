const { Client } = require('pg');
const { db2Config } = require('../config/database');

const createPowerConsumptionTable = async () => {
  const client = new Client(db2Config);

  const createPowerConsumptionQuery = `
    CREATE TABLE IF NOT EXISTS public.power_consumption
    (
        id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
        ebox_id text COLLATE pg_catalog."default",
        ebox_name text COLLATE pg_catalog."default",
        outlet_0_status integer,
        outlet_1_status integer,
        outlet_2_status integer,
        outlet_3_status integer,
        outlet_4_status integer,
        outlet_5_status integer,
        outlet_6_status integer,
        outlet_7_status integer,
        outlet_8_status integer,
        outlet_9_status integer,
        ebox_status text COLLATE pg_catalog."default",
        power_consumption real,
        pme_value real,
        "timestamp" timestamp with time zone,
        created_at timestamp with time zone,
        updated_at timestamp with time zone,
        CONSTRAINT power_consumption_pkey PRIMARY KEY (id)
    )
    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.power_consumption
        OWNER to postgres;
  `;

  try {
    await client.connect();
    await client.query(createPowerConsumptionQuery);
  } catch (err) {
    console.error('Error creating power_consumption table:', err.stack);
  } finally {
    await client.end();
  }
};

module.exports = { createPowerConsumptionTable };
