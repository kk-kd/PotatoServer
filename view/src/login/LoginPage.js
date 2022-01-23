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
      const token = await loginUser({
        username,
        password
      });
      setToken(JSON.parse(token)?.token);
      console.log('Token set to ' + JSON.parse(token)?.token);
    }
    catch (error) {
      throw alert("Login Failed. Please Try Again")
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