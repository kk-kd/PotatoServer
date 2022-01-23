import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';
import loginUser from '../api/login_api';


export default function Login( {setToken} ) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleLoginSubmit = async e => {
    e.preventDefault();
    console.log("Form Submitted with username " + username + " and password " + password)
      try {
        let token = await loginUser({
          'username': username,
          'password': password
        });
        console.log("Token = " + token)
        setToken(JSON.parse(token)?.token);
      }
      catch (error) {
        console.log(error)
        if (error.response.status === 404) {
          throw alert("Login Failed because server was not found. Please check your internet connection and try again.");
        }
        else if (error.response.status === 400) {
          throw alert("The username and password you entered do not match those in our system. Please Try Again");
        };  
      } 
  }

  return(
    <div className="login-wrapper">
    <h1>Please Log In</h1>
    <form onSubmit={handleLoginSubmit}>
      <label className="input">
        <p>Username:</p>
        <input type="text" onChange={e => setUserName(e.target.value)}/>
      </label>
      <label className="input">
        <p> Password: </p>
        <input type="text" onChange={e => setPassword(e.target.value)}/>
      </label>
      <div>
        <button className = "submitbutton" type="submit">Submit</button>
      </div>
    </form>
    </div>
  )
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}