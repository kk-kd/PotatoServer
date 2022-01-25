import axios from 'axios'

// returns dictionary with keys status (201,401,404) and data (the token)
export default async function loginUser(credentials) {
  let status = 200
  try {
    let token = await axios.post('/api/login', {
      email: credentials.username,
      password: credentials.password
    });
    return { "status" : token.status, "token" : token.data};
  } catch (e) {
    return { "status" : e.response.status };
  }
}
