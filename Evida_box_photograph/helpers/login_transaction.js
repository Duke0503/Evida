const axios = require('axios');

let stored_headers = null;
let last_login_time = null;

const login_transaction = async () => {
  return new Promise(async (resolve, reject) => {
    const login_user = {
      username: process.env.USERNAME_API_TRANSACTION,
      password: process.env.PASSWORD_API_TRANSACTION,
    };
    await axios.post(process.env.API_LOGIN_TRANSACTION, login_user)
    .then(response_login => {
      const token_authorization = response_login.data.token;
  
      const headers = {
        'Authorization': `Bearer ${token_authorization}`
      }

      resolve(headers);
    })
    .catch(error => {
      reject(error);
    });
  });  
}  

const get_headers = async () => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (!stored_headers || (now - last_login_time) > ONE_DAY) {
    stored_headers = await login_transaction();
    last_login_time = now;
  }
  return stored_headers;
}

module.exports = { 
  login_transaction, 
  get_headers
};