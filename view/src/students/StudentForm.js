
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
import { UserForm } from "../users/UserForm";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ListItemButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { CreateUser } from "../users/CreateUserStudent";


export const StudentForm = ({addStudentToUser}) => {

    const action_text = addStudentToUser ? "Add New Student": "Make New Student" 
  
    const [student, setStudent] = useState({'school': {'name': 'school name'}});
    const [makeUser, setMakeUser] = useState(false);
    const [refreshAutocomplete, setRefreshAutocomplete] = useState([]);
    const [user, setUser] = useState()

    // filter search state
    const [filteredDataSchool, setFilteredDataSchool] = useState([])
    const [selectedSchool, setSelectedSchool] = useState();
    const [schoolFilter, setSchoolFilter] = useState("");

    const [routeFilter, setRouteFilter] = useState("");
    const [selectedRoute, setSelectedRoute] = useState();

    const [filteredDataUser, setFilteredDataUser] = useState([]);
    
    const [userFilter, setUserFilter] = useState("");


    
    let navigate = useNavigate(); 

    const validate_student_entries = () => {
        if (!student.firstName || !student.lastName){
            return {valid: false, error: 'Student First and Last Name Required'}
        }

        return {valid: true, error: ''}
    }
    
    // functions passed to user form to update user state
   
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

      useEffect(() => {
        const fetchFilteredDataUser = async () => {
          try {
            const fetchedData = await filterAllUsers({
              page: 0,
              size: 10,
              sort: 'email',
              sortDir: "ASC",
              filterType: '',
              filterData: userFilter
            });
            setFilteredDataUser(fetchedData.data.users);
            console.log(fetchedData.data)
       
          } catch (error) {
            alert(error.response.data);
          }
        }
        if (userFilter) {
          fetchFilteredDataUser();
        }
      
      }, [userFilter])

      useEffect(() => {
        console.log("make user Changed")
        setUser();
        setUserFilter();
        setFilteredDataUser([]);
        console.log(user);

      }, [makeUser])

    return <div id = 'content'>
        {addStudentToUser && <h4> {action_text} </h4>}
        {!addStudentToUser && <h1>  {action_text} </h1>}

        <label id = 'input-label' for = "firstName"> First Name: </label>      
        <input
            id = 'input-input'
            type="text"
            maxLength="100"
            value={student.firstName}
            onChange={(e) => setStudent({...student, firstName : e.target.value})}
        />

        <label id = 'input-label' for = "middleName"> Middle Name: </label>      
        <input
            id = 'input-input'
            type="text"
            maxLength="100"
            value={student.middleName}
            onChange={(e) => setStudent({...student, middleName : e.target.value})}
        />

        <label id = 'input-label' for = "lastName"> Last Name: </label>      
        <input
            id = 'input-input'
            type="text"
            maxLength="100"
            value={student.lastName}
            onChange={(e) => setStudent({...student, lastName : e.target.value})}
        /> 

        <label id = 'input-label' for = "lastName"> Student ID: </label>     
        <input 
            id = 'input-input'
            type="text"
            maxLength="100"
            value={student.studentid}
            onChange={(e) => {setStudent({...student, studentid : e.target.value})}}
        />

        <Autocomplete
            sx = {{paddingTop: '20px', paddingBottom: '20px', maxWidth: '600px', margin: 'auto'}}
            options={filteredDataSchool}
            freeSolo
            renderInput={params => (
                <TextField {...params} label="Select A School" sx = {{'textAlign': 'left'}}variant="outlined" 
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
                options={selectedSchool.routes}
                freeSolo
                sx = {{display: 'block',  paddingTop: '10px', paddingBottom: '10px', maxWidth: '600px', margin: 'auto'}}
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
        <div> 

        {!addStudentToUser && <div> 
            <h4> Select an Existing User or Create a New One.  </h4>
            <h4> User = {user ? "" + user.email : "None" } </h4>
            </div>}

        {<Autocomplete
            key={String(refreshAutocomplete) + '1'} 
            sx = {{paddingTop: '20px', paddingBottom: '20px', maxWidth: '600px', margin: 'auto'}}
            options={filteredDataUser}
            freeSolo
            renderInput={params => (
                <TextField {...params} onClick = {() => {if (makeUser) {setMakeUser(false)}}} label="Select A User" sx = {{'textAlign': 'left'}}variant="outlined" 
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
            getOptionLabel={option => option.email}
            
            noOptionsText = {"Type to Search"}
            value={user}
           
            onInputChange = {(e, newInputValue, reason) => {
              console.log(reason)
              if (reason === 'reset') {
                setUserFilter('')
                return
              } else if (reason === 'input') {
                setMakeUser(false);
                setUserFilter(newInputValue);
              } 
            }}
            
            onChange={(_event, newUser) => {
                console.log(newUser)
                setUser(newUser);
            }}
            
        />
        }

        {!addStudentToUser && <Box sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper', margin: 'auto'}}>
              <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper'}} 
              >
              {(user && user.id) && [user].map((us) => {
                  const labelId = `checkbox-list-secondary-label-${us.id}`;
                  return (
                  <ListItem
                      key={us.id}

                      secondaryAction={
                          <IconButton aria-label="delete" style={{backgroundColor: 'transparent'}}>
                              <DeleteIcon onClick = {(e) => {
                                  setUser({}); 
                              }}/>
                          </IconButton>
                      }
                      disablePadding
                  >
          
                  </ListItem>
                  );
              })}

          <ListItem
                  key={'-1'}
                  disablePadding
              >
                  <ListItemButton
                      onClick = {(e) => {setMakeUser(true); setRefreshAutocomplete(!refreshAutocomplete)}}>
                      <PersonAddIcon />
                      <ListItemText primary={"Make New User"} />
                  </ListItemButton>
            </ListItem>
                  
        </List>
        </Box>
        }
        </div>

        
          {(!addStudentToUser && makeUser) && <div id = 'sub-form-wrapper'> 
              <CloseIcon onClick = {(e) => {setMakeUser(false)}} style = {{
                          position: 'absolute',
                          right: '10px',
                          top: '10px',
                          }}></CloseIcon>
               {(!addStudentToUser) && <UserForm addUserToStudent = {(user) => {console.log("adding user to student"); setUser(user); setMakeUser(false)}}> </UserForm> }
          
              </div>
          }
      
 

        <button className = "submitbutton" type="button" onClick= {(e) => {handleStudentFormSubmit(e)}}> {action_text} </button>
    </div>
    }