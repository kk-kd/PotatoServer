import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";
import { Marker } from "./../map/Marker";
import {registerUser} from "../api/axios_wrapper";
import { Link, useNavigate } from "react-router-dom";
import { Users } from "./Users";
import { filterAllUsers } from "../api/axios_wrapper";
import {Radio, RadioGroup} from '@mui/material/Button';

export const CreateUser = () => {
  let navigate = useNavigate();

  const [filteredData, setFilteredData] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedUser, setSelectedUser] = useState();
  const [actionType, setActionType] = useState("");
  const [makeStudentForUser, setMakeStudentForUser] = useState(false); 
  const [makeUserForStudent, setMakeUserForStudent] = useState(false); 

  // user  
  const [ firstNameStudent, setFirstNameStudent ] = useState("");
  const [ middleNameStudent, setMiddleNameStudent ] = useState("");
  const [ lastNameStudent, setLastNameStudent ] = useState("");
  const [ school, setSchool ] = useState("");
  const [ studentid, setStudentId ] = useState("");


  const [ firstNameUser, setFirstNameUser ] = useState("");
  const [ middleNameUser, setMiddleNameUser ] = useState("");
  const [ lastNameUser, setLastNameUser ] = useState("");
  const [ password, setPassword] = useState("");
  const [ email, setEmail ] = useState("");
  const [ address, setAddress ] = useState("");
  const [ isAdmin, setisAdmin ] = useState(false);
  const [students, setStudents] = useState([{firstName: "firstName", studentid: "1"}, {firstName: "firstName2", studentid: "2"}]);


  // maps
  const [ showMap, setShowMap ] = useState(false);
  const [ lat, setLat ] = useState();
  const [ lng, setLng ] = useState();
  const [ map, setMap ] = useState();
  const [ apiLoaded, setApiLoaded ] = useState(false);
  const [ geocoder, setGeocoder ] = useState();
  const [ error, setError ] = useState(null);
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627
    },
    zoom: 13
  };

  async function handleCreateUser (e) {
    //e.preventDefault(); // prevents page reload on submission
    //checkMap(address)
   
    let form_results = {
      email: email,
      firstName: firstNameUser,
      middleName: middleNameUser,
      lastName: lastNameUser,
      address: address,
      isAdmin: isAdmin,
      password: password,
      students: students,
    }
    console.log("Creating User with entries:")
    console.log(form_results)
    try {
      let create_user_response = await registerUser(form_results); 
    } catch (error) {
        let message = error.response.data;
        throw alert (message);
    }
    alert("User Successfully Created");
  }

  async function handleCreateStudent (e) {
    //e.preventDefault(); // prevents page reload on submission
    //checkMap(address)
   
    let form_results = {
      email: email,
      firstName: firstNameUser,
      middleName: middleNameUser,
      lastName: lastNameUser,
      address: address,
      isAdmin: isAdmin,
      password: password,
    }
    console.log("Creating Student with entries:")
    console.log(form_results)
    // try {
    //   let create_user_response = await registerStudent(form_results); 
    // } catch (error) {
    //     let message = error.response.data;
    //     throw alert (message);
    // }
    // alert("User Successfully Created");
    // navigate('/Users/list');
  }
  
  const fetchFilteredData = async (value) => {
    try {
      const fetchedData = await filterAllUsers({
        page: 0,
        size: 10,
        sort: 'email',
        sortDir: "ASC",
        filterType: '',
        filterData: value
      });
      setFilteredData(fetchedData.data.users);
      console.log(filteredData);
    } catch (error) {
      alert(error.response.data);
    }
  };
  
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        const fetchedData = await filterAllUsers({
          page: 0,
          size: 10,
          sort: 'email',
          sortDir: "ASC",
          filterType: '',
          filterData: filterValue
        });
        setFilteredData(fetchedData.data.users);
        console.log(filteredData);
      } catch (error) {
        alert(error.response.data);
      }
    }
    if (filterValue) {
      fetchFilteredData();
    }
  
  }, [filterValue])

  const searchLocation = () => {
    geocoder.geocode( { 'address': address }, (results, status) => {
      if (status === "OK") {
        map.setCenter(results[0].geometry.location);
        setLng(results[0].geometry.location.lng());
        setLat(results[0].geometry.location.lat());
        setError(null);
        setAddress(address);
      } else if (status === "ZERO_RESULTS") {
        setError("No results for that address");
        console.log(status)
      } else {
        setError("Server Error. Try again later");
        console.log(status)
      }
    });
  }
  const handleApiLoaded = (map, maps) => {
    const geocoder = new maps.Geocoder();
    setGeocoder(geocoder);
    setMap(map);
    setApiLoaded(true);
    searchLocation();
  }
  const checkMap = (e) => {
    e.preventDefault();
    if (apiLoaded) {
      searchLocation()
    } else {
      setShowMap(true);
    }
  }

  async function handleStudentCreateFormButton (e) {
    let newStudent = {
      firstName: firstNameStudent, 
      middleName: middleNameStudent, 
      lastName: lastNameStudent,
      studentid: studentid, 
      school: school,
    }
    if ({makeStudentForUser}) {
      setStudents(arr => [...arr, newStudent]);
      setFirstNameStudent(""); 
      setMiddleNameStudent(""); 
      setLastNameStudent(""); 
      setStudentId(""); 
      setSchool("");
      alert("Successfully Added Student Info to User! Note: Students are created only when this form is submitted. To create a student independently, select 'Create New Student'")
    } 
    else {
      // make new student
      handleCreateStudent(newStudent)
    }
  }

  async function handleUserCreateFormButton (e) {
    if ({makeUserForStudent}) {
      setSelectedUser(true) 
      alert("Successfully Added User Info to Student! Note: Users are created only when this form is submitted. To create a user independently, select 'Create New User'")
    } 
    else {
      // make new user
      handleCreateUser(e)
    }
  }

  

  async function handleUserSelection (e, user) {
    e.preventDefault(); // prevents page reload on submission
    setSelectedUser(user)
    
    // update state 
    setFirstNameUser(user.firstName)
    setMiddleNameUser(user.middleName)
    setLastNameUser(user.lastName)
    setPassword(user.password)
    setEmail(user.email)
    setAddress(user.address)
    setisAdmin(user.isAdmin)
    setStudents(students)
    setFilterValue(user.email)
    console.log(user)
    
  }

  return (
    <div>
       <h1>Student / User Create</h1>
       <div className = "Choose-Action" > 
          <h3>
              <input type = "radio" key={'createStudent'}  name = "action" onClick = {(e) => {setActionType("Student")}}/> 
              Create New Student 
          </h3>
      
          <h3> 
              <input type = "radio" key={'createUser'}  name = "action" onClick = {(e) => {setActionType("User")}} />
              Create New User 
          </h3>

          <h3> 
              <input type = "radio" key={'connect'}  name = "action" onClick = {(e) => {setActionType("Connect")}} />
              Connect an Existing User and Student 
          </h3>
        </div>

      {(makeStudentForUser || actionType.includes("Student")) && // actionType.includes("Student") && 
        <div id = "student_create_form"> 
          <h1>Create Student Form </h1>
          <form >
            <label className="input">
              <p>First Name:</p>
                <input
                    type="text"
                    value={firstNameStudent}
                    onChange={(e) => setFirstNameStudent(e.target.value)}
                />
            </label>
          
            <label className="input">
              <p>Middle Name:</p>
                <input
                    type="text"
                    value={middleNameStudent}
                    onChange={(e) => setMiddleNameStudent(e.target.value)}
                />
            </label>
          
            <label className="input">
              <p>Last Name:</p>
                <input
                    type="text"
                    value={lastNameStudent}
                    onChange={(e) => setLastNameStudent(e.target.value)}
                />
            </label>

            <label className="input">
              <p> School:</p>
                <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                />
            </label>

            <label className="input">
              <p> Student ID:</p>
                <input
                    type="text"
                    value={studentid}
                    onChange={(e) => setStudentId(e.target.value)}
                />
            </label>

            <label className="input">
              <p> Associated User: {selectedUser ? "" + email : "None" }</p>
            </label>
  
            {!makeStudentForUser && <label className="input">
              <p>Make New User Associated With this Student:</p>
                <input
                    type="checkbox"
                    checked={makeUserForStudent}
                    onChange={(e) => {
                      setMakeUserForStudent(e.target.checked); 
                      setSelectedUser(false);
                      setFirstNameUser("")
                      setMiddleNameUser("")
                      setLastNameUser("")
                      setEmail("")
                      setPassword("")
                      setAddress("")
                      setisAdmin(false)
                    }
                    }

                  
                />
            </label>
            }

          {!makeStudentForUser && !makeUserForStudent && //search for existing user 
            <div>
              <label className="input">
                <p> Select an Existing User: </p>
              <input
                    type="text"
                    value={filterValue}
                    onChange={(e) => {setFilterValue(e.target.value); setSelectedUser(false);}}
                  
              /></label>

              {!selectedUser && 
                <div className="user-list">
                  {filteredData && filteredData.length > 0 ? (
                    filteredData.map((user) => (
                      <li >
                    <button key={user.uid} className="user" onClick = {(e) => {handleUserSelection (e, user)}} >
                      {user.email}   
                      
                    </button>
                    </li>
                    ))
                    ) : (<div> </div>)}
                </div>}
            </div>
          } 


            <div>
              <button className = "submitbutton" type="button" onClick= {(e) => {handleStudentCreateFormButton(e)}}>
              
                {makeStudentForUser ? 'Add Student' : 'Submit'} </button>
            </div>
          </form> 
        </div>
  
      }
      {(makeUserForStudent || actionType.includes("User")) &&
        <div id = "user_create_form">
          <h1>Create User Form </h1>
            <form on>
   
              <label className="input">
                <p>First Name:</p>
                  <input
                      type="text"
                      value={firstNameUser}
                      onChange={(e) => setFirstNameUser(e.target.value)}
                  />
              </label>
            
              <label className="input">
                <p>Middle Name:</p>
                  <input
                      type="text"
                      value={middleNameUser}
                      onChange={(e) => setMiddleNameUser(e.target.value)}
                  />
              </label>
            
              <label className="input">
                <p>Last Name:</p>
                  <input
                      type="text"
                      value={lastNameUser}
                      onChange={(e) => setLastNameUser(e.target.value)}
                  />
              </label>
          
              <label className="input">
                <p>Email:</p>
                  <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  />
              </label>

              <label className="input">
                <p>Password:</p>
                  <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
              </label>
            
              <label className="input">
                <p>Address:</p>
                  <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)} 
                  />
                <p> {error}</p>
              </label>

              <label className="input">
                <p>Admin:</p>
                  <input
                      type="checkbox"
                      value={isAdmin}
                      onInput={(e) => setisAdmin(e.target.value)}
                  />
              </label>

             {!makeUserForStudent && 
             <div>
               <p> Associated Students: {students.length} </p>
              {students.map((student) => (
                  <li >{student.firstName} 
                  <button type = "button" onClick = {(e) => {
                    console.log(students)
                    let filtered = students.filter(function(el) { return el.studentid != student.studentid;});
                    console.log(filtered)

                    setStudents(filtered); 
                  }}> remove </button>
                  </li>
              )) 
              }
              </div>
              }
              

              {!makeUserForStudent && 
              <label className="input">
                <p>Make New Student Associated With this User: </p>
                  <input
                      type="checkbox"
                      checked={makeStudentForUser}
                      onChange={(e) => setMakeStudentForUser(e.target.checked)}
                      key={Math.random()}
                  />
              </label>
              }
              
      
              <div>
                <button className = "button" onClick = {(e) => {handleUserCreateFormButton(e)}} type="button">
                {makeUserForStudent ? 'Add User' : 'Submit'} 
                </button>
              </div>
            </form>  
        </div>
        }

      {actionType === "Connect" && 
        <h1>Connect Student and User Form </h1>
      }


    {/* {!address && 
              <div classname = "Input an Address">
              <p> The selected User does not have a valid address. Please Input an address. </p>
              <label className="input">
                <p>Address:</p>
                  <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}  // TODO update address call. 
                  />
                <p> {error}</p>
              </label>
              </div>
          } */}
      {/* {!newUserSelected && 
        <div>
           <label className="input">
             <p> Select an Existing User: </p>
        <input
                  type="text"
                  value={filterValue}
                  onInput={(e) => setFilterValue(e.target.value)}
                
      /></label>

      {!selectedUser && <div className="user-list">
        {filteredData && filteredData.length > 0 ? (
          filteredData.map((user) => (
            <button key={user.uid} className="user" onClick = {(e) => {handleUserSelection (e, user)}} >
              <span className="user-id" >{user.email}   </span>
              
            </button>
          ))
        ) : (<div> </div>)}
          </div>}
        </div>
      } */}
        
        <div id="user_create_map">
          <h3> Map </h3>
          {error && (<div>{error}</div>)}
          {showMap && (<div style={{ height: '50vh', width: '50%', display: "inline-block" }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_MAPS_API}` }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
            >
              <Marker
                  text="You're Address"
                  lat={lat}
                  lng={lng}
              />
            </GoogleMapReact>
          </div>)}
        </div>
    </div>
  );
}
