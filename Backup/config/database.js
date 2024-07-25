module.exports = { dbConfig : {
    user: process.env.DB1_USERNAME,
    host: process.env.DB1_HOST || 'localhost',
    database: process.env.DB1_NAME,
    password: process.env.DB1_PASSWORD,
    port: process.env.DB1_PORT || 5432,
},

 db2Config : {
    user: process.env.DB2_USERNAME,
    host: process.env.DB2_HOST || 'localhost',
    database: process.env.DB2_NAME,
    password: process.env.DB2_PASSWORD,
    port: process.env.DB2_PORT || 5432,
},

};
