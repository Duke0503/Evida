const axios = require('axios');

const login = async () => {
  return new Promise(async (resolve, reject) => {
    const login_user = {
      username: process.env.USERNAME_API,
      password: process.env.PASSWORD_API,
    };
    await axios.post(process.env.API_LOGIN, login_user)
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

module.exports = { login };