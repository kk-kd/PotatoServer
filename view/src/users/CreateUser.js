import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";
import { Marker } from "./../map/Marker";
import {registerUser, saveStudent} from "../api/axios_wrapper";
import { Link, useNavigate } from "react-router-dom";
import { Users } from "./Users";
import { filterAllUsers, filterAllSchools } from "../api/axios_wrapper";

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
  const [ school, setSchool ] = useState({});
  const [ studentid, setStudentId ] = useState("");

  const [filteredDataSchool, setFilteredDataSchool] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState();
  const [filterValueSchool, setFilterValueSchool] = useState("");


  const [ firstNameUser, setFirstNameUser ] = useState("");
  const [ middleNameUser, setMiddleNameUser ] = useState("");
  const [ lastNameUser, setLastNameUser ] = useState("");
  const [ password, setPassword] = useState("");
  const [ email, setEmail ] = useState("");
  const [ address, setAddress ] = useState("");
  const [ isAdmin, setisAdmin ] = useState(false);
  const [students, setStudents] = useState([]);


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
    e.preventDefault(); // prevents page reload on submission
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
      firstName: firstNameStudent,
      middleName: middleNameStudent,
      lastName: lastNameStudent,
      school: school, 
      studentid: studentid,
    }
    console.log("Creating Student with entries:")
    console.log(form_results)
    try {
      let create_user_response = await saveStudent(form_results); 
    } catch (error) {
        let message = error.response.data;
        throw alert (message);
    }

    //alert("Successfully Created Student");
    //navigate('/Users/list');
  }
  
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

  useEffect(() => {
    const fetchFilteredDataSchool = async () => {
      try {
        const fetchedDataSchool = await filterAllSchools({
          page: 0,
          size: 10,
          sort: 'name',
          sortDir: "ASC",
          filterType: '',
          filterData: filterValueSchool
        });
        setFilteredDataSchool(fetchedDataSchool.data.schools);
        console.log(fetchedDataSchool);
      } catch (error) {
        alert(error.response.data);
      }
    }
    if (filterValueSchool) {
      fetchFilteredDataSchool();
    }
  
  }, [filterValueSchool])

  useEffect(() => {
    //user
    setFirstNameUser("")
    setMiddleNameUser("")
    setLastNameUser("")
    setPassword("")
    setEmail("")
    setAddress("")
    setisAdmin("")
    setStudents([])
    setFilterValue("")
    setSelectedUser(false)
    setFilteredData([])

    //student
    setFirstNameStudent("")
    setMiddleNameStudent("")
    setLastNameStudent("")
    setStudentId("")

    //school
    setFilterValueSchool("")
    setSchool({})
    setSelectedSchool(false)
  
  }, [actionType])

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
      if (!firstNameStudent || !lastNameStudent || !studentid || !school) {
        alert("First Name, Last Name, StudentID, and School is Required.")
      }
      else{
        setStudents(arr => [...arr, newStudent]);
        setFirstNameStudent(""); 
        setMiddleNameStudent(""); 
        setLastNameStudent(""); 
        setStudentId(""); 
        setSchool({});
        alert("Successfully Added Student Info to User. Note: Students are created only when the user form is submitted. To create a student independently, select Create New Student")
      }
    } 
    else {
      // make new student
      setStudents(arr => [...arr, newStudent]);

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
    setSelectedUser(true)
    
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

        </div>

      {(makeStudentForUser || actionType.includes("Student")) && 
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
                  <p> Select an Existing School: </p>
                <input
                      type="text"
                      value={filterValueSchool}
                      onChange={(e) => {setFilterValueSchool(e.target.value); setSelectedSchool(false)}}
                      defaultValue = "Search"
                /> 
            </label>
            {!selectedSchool && 
                <div className="user-list">
                  {filteredDataSchool && filteredDataSchool.length > 0 ? (
                    filteredDataSchool.map((school) => (
                      <li >
                    <button key={school.uid} className="user" onClick = {(e) => {setSelectedSchool(true); setFilterValueSchool(school.name); setSchool(school)}} >
                      {school.name}   
                    </button>
                    </li>
                    ))
                    ) : (<div> </div>)}
                </div>}

            <label className="input">
              <p> Student ID:</p>
                <input
                    type="text"
                    value={studentid}
                    onChange={(e) => setStudentId(e.target.value)}
                />
            </label>

            {!makeStudentForUser &&
              <label className="input">
                <p> Associated User: {selectedUser ? "" + email : "None" }</p>
              </label>
            }
  
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
