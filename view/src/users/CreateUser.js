import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";
import { Marker } from "../map/Marker";
import {registerUser, saveStudent} from "../api/axios_wrapper";
import { Link, useNavigate } from "react-router-dom";
import { Users } from "./Users";
import { filterAllUsers, filterAllSchools, getOneUser } from "../api/axios_wrapper";
import { UserForm } from "./UserForm";


export const CreateUser = () => {
  
    const [name, setName] = useState([]);

    return <div>
        {/* <p> Create User ! </p> */}
        <UserForm> </UserForm>

    </div>
    }