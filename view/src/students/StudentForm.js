
// import GoogleMapReact from "google-map-react";
import "./StudentForm.css"
import { useEffect, useState } from "react";
import { updateStudent } from "../api/axios_wrapper";
// import { Marker } from "../map/Marker";
// import {registerUser, saveStudent} from "../api/axios_wrapper";
// import { Link, useNavigate } from "react-router-dom";
// import { Users } from "./Users";
// import { filterAllUsers, filterAllSchools, getOneUser } from "../api/axios_wrapper";


export const StudentForm = ({addStudentToUser}) => {
  
    const [student, setStudent] = useState({});

    const handleStudentFormSubmit = (e) => {

        if (addStudentToUser) {
            console.log("Adding Student to User");
            addStudentToUser(student);
        }
        else {
            console.log("Make New Student")
        }
    }

    return <div id = 'content'>
        {addStudentToUser && <h4> Add New Student </h4>}
        {!addStudentToUser && <h1>  Make New Student</h1>}
        <label className="input">
              <p>First Name:</p>
                <input
                    type="text"
                    maxLength="100"
                    value={student.firstName}
                    onChange={(e) => setStudent({...student, firstName : e.target.value})}
                />
        </label> 
        <button className = "submitbutton" type="button" onClick= {(e) => {handleStudentFormSubmit(e)}}> Make Student </button>
    </div>
    }