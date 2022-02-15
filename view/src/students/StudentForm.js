
// import GoogleMapReact from "google-map-react";
import "./StudentForm.css"
import { useEffect, useState, Fragment } from "react";
import { updateStudent } from "../api/axios_wrapper";
// import { Marker } from "../map/Marker";
// import {registerUser, saveStudent} from "../api/axios_wrapper";
import { Link, useNavigate } from "react-router-dom";
import { filterAllUsers, filterAllSchools, getOneUse, saveStudent } from "../api/axios_wrapper";
// import { Users } from "./Users";
// import { filterAllUsers, filterAllSchools, getOneUser } from "../api/axios_wrapper";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';



export const StudentForm = ({addStudentToUser}) => {
  
    const [student, setStudent] = useState({'school': {'name': 'school name'}});

    // filter search state
    const [filteredDataSchool, setFilteredDataSchool] = useState([])
    const [selectedSchool, setSelectedSchool] = useState();
    const [schoolFilter, setSchoolFilter] = useState("");

    const [routeFilter, setRouteFilter] = useState("");
    const [selectedRoute, setSelectedRoute] = useState();

    const action_text = addStudentToUser ? "Add New Student": "Make New Student" 

    let navigate = useNavigate(); 

    const validate_student_entries = () => {
        if (!student.firstName || !student.lastName){
            return {valid: false, error: 'Student First and Last Name Required'}
        }

        return {valid: true, error: ''}
    }
    const handleStudentFormSubmit = (e) => {
        let valid_results = validate_student_entries();
        if (valid_results.valid) {
            if (addStudentToUser) {
                console.log("Adding Student to User");
                addStudentToUser(student);
            }
            else {
                console.log("Make New Student")
                CreateStudent(e);
            }
        }
        else {
            alert(valid_results.error)
        }

    }
    
    async function CreateStudent (e) {
        let form_results = {
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          school: student.school, 
          id: student.studentid,
          parentUser: student.user,
          route: student.route
        }
        if (!selectedRoute) {
          form_results["route"] = null;
        }
        if (student.studentid.length === 0) {
          form_results["id"] = null;
        }
    
        try {
          let create_student_response = await saveStudent({...form_results, parentUser: student.user});
        } catch (error) {
            let message = error.response.data;
            throw alert (message);
        }
    
        alert("Successfully Created Student");
        navigate('/Students/list');
      }
    
      useEffect(() => {
        const fetchFilteredDataSchool = async () => {
        
          try {
            const fetchedDataSchool = await filterAllSchools({
              page: 0,
              size: 10,
              sort: 'name',
              sortDir: "ASC",
              filterType: '',
              filterData: schoolFilter
            });
            setFilteredDataSchool(fetchedDataSchool.data.schools);
         
          } catch (error) {
            alert(error.response.data);
          }
        }
        if (schoolFilter) {
          fetchFilteredDataSchool();
        }
      
      }, [schoolFilter])

    return <div id = 'content'>
        {addStudentToUser && <h4> {action_text} </h4>}
        {!addStudentToUser && <h1>  {action_text} </h1>}

        <label for = "firstName"> First Name: </label>      
        <input
            type="text"
            maxLength="100"
            value={student.firstName}
            onChange={(e) => setStudent({...student, firstName : e.target.value})}
        />

        <label for = "middleName"> Middle Name: </label>      
        <input
            type="text"
            maxLength="100"
            value={student.middleName}
            onChange={(e) => setStudent({...student, middleName : e.target.value})}
        />

        <label for = "lastName"> Last Name: </label>      
        <input
            type="text"
            maxLength="100"
            value={student.lastName}
            onChange={(e) => setStudent({...student, lastName : e.target.value})}
        /> 

        <label for = "lastName"> Student ID: </label>     
        <input
            type="text"
            maxLength="100"
            value={student.studentid}
            onChange={(e) => setStudent({...student, studentid : e.target.value})}
        />

        <Autocomplete
            id="school-search"
            options={filteredDataSchool}
            freeSolo
            style = {{display: 'inline-block', paddingTop: '8px'}}
            renderInput={params => (
                <TextField {...params} label=" Select School " variant="outlined"
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <Fragment>
                        {params.InputProps.endAdornment}
                      </Fragment>
                    ),
                  }}
                />
            )}
            getOptionLabel={option => option.name}
            fullWidth= {true}
            
            noOptionsText = {"Type to Search"}
            value={selectedSchool}
            onInputChange = {(e) => {
                setSchoolFilter(e.target.value);}
            }
            
            onChange={(_event, newSchool) => {
                console.log(newSchool)
                setSelectedSchool(newSchool);
            }}
            
        />

        {selectedSchool && selectedSchool.routes && selectedSchool.routes.length > 0 && 
            <Autocomplete
                id="route-search"
                options={selectedSchool.routes}
                freeSolo
                style = {{display: 'inline-block', paddingTop: '8px'}}
                renderInput={params => (
                    <TextField {...params} label=" Select Route " variant="outlined"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                        <Fragment>
                            {params.InputProps.endAdornment}
                        </Fragment>
                        ),
                    }}
                    />
                )}
                getOptionLabel={option => option.name}
                fullWidth= {true}
                
                noOptionsText = {"Type to Search"}
                value={selectedRoute}
                onInputChange = {(e) => {
                    setRouteFilter(e.target.value);}
                }
                
                onChange={(_event, newRoute) => {
                    console.log(newRoute)
                    setSelectedRoute(newRoute);
                }}
            
        />
        }
  

        

        {/* <label className="input">
                <p> School Search: </p>
            <input
                    type="text"
                    maxLength="100"
                    value={filterValueSchool}
                    onChange={(e) => {setFilterValueSchool(e.target.value); setSelectedSchool(false); setSelectedRoute(false); setRouteFilter("")}}
                    defaultValue = "Search"
            /> 
        </label>
        {!selectedSchool && 
            <div className="user-list">
                {filteredDataSchool && filteredDataSchool.length > 0 ? (
                filteredDataSchool.map((school) => (
                    <li >
                <button key={school.uid} className="user" onClick = {(e) => {setSelectedSchool(true); setFilterValueSchool(school.name); setSchool(school); setRoute({});}} >
                    {school.name}   
                </button>
                </li>
                ))
                ) : (<div> </div>)}
            </div>}
            
        <p> {(selectedSchool && (!school.routes || school.routes.length === 0)) ? " There Are No Routes Available For The Selected School. Please Create One In the Routes Tab." : ''} </p>
        <p> {!selectedSchool ? "You must select a school before you will be able to assign a route to this student." : ""} </p>
        {selectedSchool && school.routes && school.routes.length > 0 && <label className="input">
            <p> Route Search: </p>
            <input
                type="text"
                maxLength="100"
                value={routeFilter}
                onChange={(e) => {setRouteFilter(e.target.value); setSelectedRoute(false)}}
                defaultValue = "Search"
            />
        </label>}
        {(selectedSchool && !selectedRoute) &&
        <div className="route-list">
            {school.routes.filter(route => route.name.toLowerCase().includes(routeFilter.toLowerCase())).splice(0, 10).map((route) => (
                    <li >
                    <button key={route.uid} className="route" onClick = {(e) => {setSelectedRoute(true); setRouteFilter(route.name); setRoute(route)}} >
                        {route.name}
                    </button>
                    </li>
                )
            )}
        </div>}

        <label className="input">
            <p> Student ID:</p>
            <input
                type="text"
                maxLength="100"
                value={studentid}
                onChange={(e) => setStudentId(e.target.value)}
            />
        </label>
          
        {!makeStudentForUser && <div> 
        <h4> Search for an Existing User or Create a New One.  </h4>
        <h4> Associated User = {selectedUser ? "" + email : "None" } </h4>
        </div>
        }

        {!makeStudentForUser && !makeUserForStudent && //search for existing user 
            <div>
            <label className="input">
                <p> User Search: </p>
            <input
                    type="text"
                    maxLength="100"
                    value={filterValue}
                    onChange={(e) => {setFilterValue(e.target.value); setSelectedUser(false); }}
                
            /></label>

            {!selectedUser && 
                <div className="user-list">
                {filteredData && filteredData.length > 0 ? (
                    filteredData.map((user) => (
                    <li >
                    <button key={user.uid} className="user" onClick = {(e) => {
                    handleUserSelection (e, user);}} >
                    {user.email}   
                    
                    </button>
                    </li>
                    ))
                    ) : (<div> </div>)}
                </div>}
            </div>
        }  */}
  
            {/* {!makeStudentForUser && <label className="input">
              <p>Make New User:</p>
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
                      setFilterValue(""); 
                      setSelectedUser(false);
                      setFilteredData([]);
                    }
                    }

                  
                /> */}
            {/* </label> */}
            {/* } */}

        <button className = "submitbutton" type="button" onClick= {(e) => {handleStudentFormSubmit(e)}}> {action_text} </button>
    </div>
    }