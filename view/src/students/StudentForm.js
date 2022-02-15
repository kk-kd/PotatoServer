
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
        <button className = "submitbutton" type="button" onClick= {(e) => {handleStudentFormSubmit(e)}}> {action_text} </button>
    </div>
    }