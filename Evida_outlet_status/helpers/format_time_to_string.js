const moment = require('moment-timezone');

const format_time_to_string = (date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD/MM/YYYY');
};

module.exports = { format_time_to_string };