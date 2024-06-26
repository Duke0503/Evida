// backup-database.js
const { exec } = require('child_process');
const cron = require('node-cron');

const backupDatabase = () => {
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USERNAME;
  const pgPass = process.env.DB_PASSWORD;

  const backupCommand = `pg_dump -U ${dbUser} ${dbName} > backup.sql`;

  exec(backupCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error creating backup:', error);
    } else {
      console.log('Backup created successfully:', stdout);
    }
  });
};

// Schedule backups (e.g., every day at midnight)
cron.schedule('* * * * *', backupDatabase);