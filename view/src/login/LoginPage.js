import "./login.css";
import { useState } from "react";
import PropTypes from "prop-types";
import loginUserValidator from "../api/login_api";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ setLoggedIn }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  let navigate = useNavigate();

  async function handleLoginSubmit(e) {
    e.preventDefault(); // prevents page reload on submission
    if (!(username && password)) {
      throw alert("Please input a username and password");
    }
    try {
      let login_response = await loginUserValidator({
        email: username,
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
      <img
        className="header-image"
        src={"./cute_potato.png"}
        alt="Cute Potato!"
      />
      <h2 className="site-title-wrapper">Welcome to Potato Web Service.</h2>
      <h5 className="site-title-wrapper">
        Your Premier School Bus Logistics Platform
      </h5>
      <div class="card border-dark core-login-forms">
        <div class="card-body">
          <form onSubmit={handleLoginSubmit}>
            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label center">
                Username
              </label>
              <input
                type="email"
                class="form-control login-input-core"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                onChange={(e) => setUserName(e.target.value)}
              />
              <div id="emailHelp" class="form-text">
                {" "}
                First time parent user login? Get your username and password
                from your school administrator!
              </div>
            </div>
            <div class="mb-3">
              <label for="exampleInputPassword1" class="form-label center">
                Password
              </label>
              <input
                type="password"
                class="form-control login-input-core"
                id="exampleInputPassword1"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="center">
              <button className="btn btn-outline-primary" type="submit">
                Submit
              </button>
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={(e) => {
                  navigate("/PasswordForgot/");
                }}
              >
                {" "}
                {"Forgot Password"}{" "}
              </button>
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={(e) => {
                  navigate("/PasswordReset/");
                }}
              >
                {" "}
                {"Reset Password"}{" "}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
