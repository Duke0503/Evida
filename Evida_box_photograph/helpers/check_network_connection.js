const ping = require('ping');

const check_network_connection = () => {
  return new Promise((resolve, reject) => {
    const host = 'google.com';
    const ping_host = () => {
      ping.sys.probe(host, isAlive => {
        if (isAlive) {
          console.log(`${host} is reachable.`);
          resolve(true);
        } else {
          console.log(`${host} is unreachable. Retrying...`);
          setTimeout(ping_host, 1000);
        }
      });
    };
    ping_host();
  });
};

module.exports = {
  check_network_connection,
}