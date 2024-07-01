const convert_unix_to_date_time = (unix_timestamp) => {
  const date = new Date(unix_timestamp * 1000);
  return {
    date: date.toISOString().split('T')[0],
    time: date.toISOString().split('T')[1].split('.')[0]
  };
};

module.exports = {
  convert_unix_to_date_time,
}