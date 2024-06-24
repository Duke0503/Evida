const moment = require('moment-timezone');

const format_time = (time) => {
  return moment(time).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD/MM/YYYY');
};

module.exports = { format_time };