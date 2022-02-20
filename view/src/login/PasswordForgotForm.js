
import "./PasswordForgotForm.css"
import { useEffect, useState, Fragment } from "react";
import { resetPassword, forgetPassword } from "../api/axios_wrapper";
import { Link, useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';



export const PasswordForgotForm = () => {

    const action_text =  "Send Password Reset Email"
  
    const [email, setEmail] = useState("");
    
    let navigate = useNavigate(); 

    const validate_entries = () => {
        return {valid: true, error: ''}
    }
    
   
    const handleForgotPasswordFormSubmit = (e) => {
        console.log("submitting with email = " + email)
        let valid_results = validate_entries();
        if (valid_results.valid) {
            CallForgotPassword(email)
        }
        else {
            alert(valid_results.error)
        }

    }
    
    async function CallForgotPassword (e) {
        let form_results = {
          email: email,
        }
        console.log(form_results)
 
        try {
            let response = await forgetPassword(form_results);          
        } catch (error) {
            let message = error.response.data;
            throw alert (message);
        }
    
        alert("Check your email for a link to reset your password");
        navigate('/Login');
      }
    
      

    return <div id = 'content'>
       
        <h1>  {action_text} </h1>

        <label id = 'input-label' for = "email"> Email: </label>      
        <input
            id = 'input-input'
            type="text"
            maxLength="100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />

        
        <button className = "submitbutton" type="button" onClick= {(e) => {handleForgotPasswordFormSubmit(e)}}> {action_text} </button>
        <button className = "submitbutton" type="button" onClick= {(e) => {navigate('/LogIn');}}> {"Back to Login"} </button>
    </div>
    }