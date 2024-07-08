const moment = require('moment-timezone');

function getMidnightTimestamp() {
    const now = moment().tz('Asia/Ho_Chi_Minh'); // Sử dụng múi giờ của bạn
    const midnight = now.clone().startOf('day'); // Đặt thời gian là 12:00 AM của ngày hôm nay
    return midnight.format('YYYY-MM-DD_HH-mm-ss');
}

module.exports = getMidnightTimestamp;
