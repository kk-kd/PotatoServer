import "./ChangeMyPassword.css";
import { useState } from "react";
import { changeUserPassword } from "./../api/axios_wrapper";
import { useNavigate } from "react-router-dom";

export const ChangeMyPassword = () => {
  const [oldPassword, setOldPassword] = useState();
  const [newPassword, setNewPassword] = useState();
  const [newPasswordMatch, setNewPasswordMatch] = useState();
  const navigate = useNavigate();
  const submitChange = (e) => {
    e.preventDefault();
    if (!oldPassword) {
      alert("Please enter old password.");
    } else if (!newPassword) {
      alert("Please enter a new password.");
    } else if (newPassword !== newPasswordMatch) {
      console.log(newPassword);
      console.log(newPasswordMatch);
      alert("New password fields must match.");
    } else if (newPassword === oldPassword) {
      alert("New password must be different than old password");
    } else {
      changePassword();
    }
  };
  const changePassword = async () => {
    try {
      const passwordChanged = await changeUserPassword({
        oldPassword: oldPassword,
        newPassword: newPassword,
      });
      alert("Password succesfully changed");
      navigate("/MyStudents");
    } catch (e) {
      alert(e.response.data);
    }
  };

  return (
    <div className="pass-wrapper">
      <div className="card border-dark core-login-forms-pass">
        <div class="card-body">
          <form onSubmit={(e) => submitChange(e)}>
            <div class="mb-3">
              <label
                for="exampleInputPassword2"
                class="form-label"
                id="schoolInput"
              >
                Old Password
              </label>

              <input
                type="password"
                class="form-control"
                id="exampleInputPassword2"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div class="mb-3">
              <label
                id="schoolInput"
                for="exampleInputPassword3"
                class="form-label"
              >
                New Password
              </label>
              <input
                type="password"
                class="form-control"
                id="exampleInputPassword3"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div class="mb-3">
              <label
                for="exampleInputPassword4"
                class="form-label"
                id="schoolInput"
              >
                Re-Enter New Password
              </label>
              <input
                type="password"
                class="form-control"
                id="exampleInputPassword4"
                value={newPasswordMatch}
                onChange={(e) => setNewPasswordMatch(e.target.value)}
              />
            </div>
            <input type="submit" value="Submit" />
          </form>
        </div>
      </div>
    </div>
  );
};
