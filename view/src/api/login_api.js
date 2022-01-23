import axios from 'axios'

// returns token for successful login, 401 for failure
export default async function loginUser(credentials) {
    axios.post('http://localhost:3000/', {
      username: credentials.username,
      password: credentials.password
    })
    .then(response => {
      if (response.status === 200) {
        console.log("Login Was Successful");
        return response.data.token
      }
    })
    .catch(function (error) {
      console.log(error)
    });
  }


