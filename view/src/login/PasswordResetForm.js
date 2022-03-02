
import "./PasswordResetForm.css"
import { useEffect, useState, Fragment} from "react";
import { resetPassword } from "../api/axios_wrapper";
import { Link, useNavigate,  useParams } from "react-router-dom";
import TextField from '@mui/material/TextField';


export const PasswordResetForm = () => {

    const action_text =  "Set Password"

    // get token
    const {token} = useParams();
    sessionStorage.setItem("token", "exToken");
    
    const [password, setPassword] = useState("");
    const [passwordValidate, setPasswordValidate] = useState("");
    
    let navigate = useNavigate(); 

    const validate_entries = () => {
        if (!password) {
            return {valid: false, error: "Please Enter a New Password"}
        }
        else if (password !== passwordValidate) {
            return {valid: false, error: "Password and Password Re-entry Do not Match"}
        }
    
        return {valid: true, error: ""}
    }
    
   
    const handleResetPasswordFormSubmit = (e) => {
        let valid_results = validate_entries();
        console.log("submitting with new password= " + password)
        if (valid_results.valid) {
            CallResetPassword(e)
        }
        else {
            alert(valid_results.error)
        }

    }
    
    async function CallResetPassword (e) {
        let form_results = {
          newPassword: password,
          token: token
        }
        console.log(form_results)
 
        try {
            let response = await resetPassword(form_results);          
        } catch (error) {
            let message = error.response.data;
            throw alert (message);
        }
    
        alert("Password has been Set.");
        navigate('/Login');
      }
    

    return <div id = 'content'>
       
        <h2 id = "title">  {action_text} </h2>

        <label id = 'input-label-student' for = "email"> New Password: </label>      
        <input
            id = 'input-input-student'
            type="password"
            maxLength="100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <label id = 'input-label-student' for = "email"> Re-enter Password: </label>      
        <input
            id = 'input-input-student'
            type="password"
            maxLength="100"
            value={passwordValidate}
            onChange={(e) => setPasswordValidate(e.target.value)}
        />
        <p> </p>
        <p> </p>
        <p> </p>
        <p> </p>
        
        <button className = "submitbutton" type="button" onClick= {(e) => {handleResetPasswordFormSubmit(e)}}> Set </button>
        <button className = "submitbutton" type="button" onClick= {(e) => {navigate('/LogIn');}}> {"Back to Login"} </button>
       
    </div>
    }