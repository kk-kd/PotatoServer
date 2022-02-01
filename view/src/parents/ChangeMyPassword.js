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
      alert("Please enter old password.")
    } else if (!newPassword) {
      alert("Please enter a new password.");
    } else if (newPassword !== newPasswordMatch) {
      console.log(newPassword);
      console.log(newPasswordMatch);
      alert("New password fields must match.")
    } else if (newPassword === oldPassword) {
      alert("New password must be different than old password");
    } else {
      changePassword();
    }
  }
  const changePassword = async () => {
    try {
      const passwordChanged = await changeUserPassword({
        oldPassword: oldPassword,
        newPassword: newPassword
      });
      alert("Password succesfully changed");
      navigate("/MyStudents")
    } catch (e) {
      alert(e.response.data);
    }
  }

  return (
      <div>
        <form onSubmit={e => submitChange(e)}>
          <label id="schoolInput">Old Password:
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              />
          </label>
          <label id="schoolInput">New Password:
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              />
          </label>
          <label id="schoolInput">Enter New Password Again:
            <input
              type="password"
              value={newPasswordMatch}
              onChange={e => setNewPasswordMatch(e.target.value)}
              />
          </label>
          <input
              type="submit"
              value="Submit"
          />
        </form>
      </div>
  )
}