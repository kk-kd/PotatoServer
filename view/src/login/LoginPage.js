import "./login.css";
import { useState } from "react";
import PropTypes from "prop-types";
import loginUser from "../api/login_api";

export default function Login({ setLoggedIn }) {
  const [ username, setUserName ] = useState();
  const [ password, setPassword ] = useState();

  async function handleLoginSubmit(e) {
    e.preventDefault(); // prevents page reload on submission
    if (!(username && password)) {
      throw alert("Please input a username and password");
    }
    try {
      let login_response = await loginUser({
        username: username,
        password: password,
      }).catch((error) => {
        //avoids warning
      });
      let token = login_response.token;
      let status = login_response.status;

      if (status === 200) {
        sessionStorage.setItem("token", token);
        setLoggedIn(true);
      } else if (status === 404) {
        throw alert("Login Failed Because the Server was Not Reached.");
      } else if (status === 401) {
        throw alert(
          "Login Failed Because username and password did not match records"
        );
      }
    } catch {
      // avoids warning
    }
  }

  return (
    <div className="login-wrapper">
      <h1>Please Log In</h1>
      <form onSubmit={handleLoginSubmit}>
        <label className="input">
          <p>Username:</p>
          <input type="text" onChange={(e) => setUserName(e.target.value)} />
        </label>
        <label className="input">
          <p> Password: </p>
          <input type="password" onChange={(e) => setPassword(e.target.value)} />
        </label>
        <div>
          <button className="submitbutton" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
