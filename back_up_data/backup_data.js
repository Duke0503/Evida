const { exec } = require('child_process');
const compress = require('gzipme');
const fs = require('fs');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

const username = process.env.DB_USERNAME;
const database = process.env.DB_NAME;

const date = new Date();
const currentDate = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}.${date.getHours()}.${date.getMinutes()}`;
const fileName = `database-backup-${currentDate}.tar`;
const fileNameGzip = `${fileName}.tar.gz`;

function backup() {
    const command = `pg_dump -U ${username} -d ${database} -f ${fileName} -F t`;

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log("Backup completed");

            // Compress the backup file
            compress(fileName)
                .then(() => {
                    fs.unlinkSync(fileName);
                    console.log("Backup file compressed and original deleted");
                    resolve();
                })
                .catch(compressErr => {
                    console.error("Error compressing backup:", compressErr);
                    reject(compressErr);
                });
        });
    });
}

function restore() {
    // Implement restore functionality if needed
}

function deleteDatabaseData() {
    // Implement delete database data functionality if needed
}

function startSchedule() {
    cron.schedule('* * * * *', async () => {
        try {
            await backup();
            // await sendToBackupServer(); // Uncomment and implement if needed
            // await deleteDatabaseData(); // Uncomment and implement if needed
        } catch (err) {
            console.error("Error during scheduled backup:", err);
        }
    }, {});
}

module.exports = {
    startSchedule
};
