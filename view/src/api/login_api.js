import axios from 'axios'

// returns dictionary with keys status (201,401,404) and data (the token)
export default async function loginUser(credentials) {
  let status = 200
  let token = await axios.post('http://localhost:3000/', {
      username: credentials.username,
      password: credentials.password
  }).catch(error => {
      status = error.response.status;
  }); 
  return {'status': 200, 'data': '8124'}
  //return {'status': status, 'data': token}
  }


