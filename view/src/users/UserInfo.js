import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useEffect, useState, useMemo } from "react";
import { Marker } from "../map/Marker";
import {registerUser, saveStudent} from "../api/axios_wrapper";
import { Link, use, useNavigate, useParams } from "react-router-dom";
import { Users } from "./Users";
import { filterAllUsers, filterAllSchools, getOneUser , updateUser, deleteUser} from "../api/axios_wrapper";
import { StudentForm } from "../students/StudentForm";
import {useTable} from "react-table";


import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ListItemButton } from "@mui/material";
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import { fontSize } from "@mui/system";

// this functions as the user edit and detail pages. 

export const UserInfo = ({edit}) => {

    const { id } = useParams();
    let navigate = useNavigate(); 

    const [editable, setEditable] = useState(edit);
    const action_text = editable ? "Edit" : "View" 

    // user 
    const [user, setUser] = useState({
      firstName: '', 
      middleName: '', 
      lastName:'',
      isAdmin: false, 
      address: '', 
    });

    const [students, setStudents] = useState([]); 
    const [addressValid, setAddressValid] = useState(false);
    const [ userLoaded,  setUserLoaded ] = useState(false);

    // show student form 
    const [makeStudent, setMakeStudent] = useState(false);

    // maps
    const [ mapApi, setMapApi ] = useState();
    const [ lat, setLat ] = useState();
    const [ lng, setLng ] = useState();
    const [ map, setMap ] = useState();
    const [ apiLoaded, setApiLoaded ] = useState(false);
    const [ geocoder, setGeocoder ] = useState();
    const [ error, setError ] = useState(null);
    const defaultProps = {
        center: {
        lat: 0,
        lng: 0
        },
        zoom: 13
    };

    const check_if_student_exists = (student) => {
      user.students.forEach((stud) => {
        console.log(stud)
        if (stud.id === student.id) {            
            return false ;
        }
      });
      return true;
    }

    // functions passed to student form to update students state
    // checks both user input and student existing before calling updateUser
    const addStudentToUser = (student) => {
      let valid_results = validate_user_entries(); // check user entries 
      if (valid_results.valid) {
        let valid = check_if_student_exists(student); // check if student exists
        if (valid) {
          UpdateUser(null, [...students, student]); // update user with new students
        }
        else {
          alert("A Student with this ID is already associated with this user.");
        }
      }
      else {
          alert(valid_results.error)
      }
        
    }

    const validate_user_entries = () => {
      if (!user.firstName || !user.lastName){
          return {valid: false, error: 'User First Name and Last Name Required'}
      }
      else if (!user.email) {
        return {valid: false, error:"Please provide a user email"}
      }
      else if (!user.address) {
        return {valid: false, error:"Please provide a user address"}
      }
      else if (!addressValid) {
        return {valid: false, error: "Please Validate User Address."}
      }
      return {valid: true, error: ''}
   }
  

    const handleUserFormSubmit = (e) => {
      let valid_results = validate_user_entries();
      if (valid_results.valid) {
          UpdateUser(e, students);
      }
      else {
          alert(valid_results.error)
      }
  }

    async function UpdateUser (e, studentsList) {
      if (e) {
        e.preventDefault(); // prevents page reload on submission
      }
       
        let form_results = {
          email: user.email.toLowerCase(),
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          address: user.address,
          isAdmin: user.isAdmin,
          latitude: lat,
          longitude: lng,
          students: studentsList,
          password: user.password
        }
        console.log("Updating User with Entries:")
        console.log(form_results)
        let message = ""
    
        try {
          const response = await updateUser(id, form_results, false); //false shouldn't be in the call anymore!
          const madeUser = await getOneUser(id);
          setUser(madeUser.data);
          setStudents([madeUser.data][0].students);

          console.log("Updated User")
          console.log(madeUser.data)
          console.log("Students = ")
          console.log(students)

        } catch (error) {
            message = error.response.data;
            alert (message);
        }
        if (!message) {
          alert("User Successfully Updated");
          //navigate('/Users/list');
        }
    }

    const handleDeleteUser = (user_id, e) => {
      e.preventDefault();
      let sName = prompt("Do you want to delete?  If so, enter User email:");
      if (!sName) {
        return; 
      } else if (sName.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
        alert("Entered Email Does Not Match."); 
        return;
      } else {
        deleteUserCall(user_id);
      } 
    }
    const deleteUserCall = async (user_id) => {  
      try {
        await deleteUser(parseInt(user_id)); 
        alert ("User Deletion Successful");
        navigate('/Users/list');
      } catch (e)  {
        console.log(e);
        let message = e.response.data;
        alert (message);
      }    
    }

    useEffect(() => {
      const fetchData = async () => {
        try {
          const fetchedData = await getOneUser(id).catch ((error) => {
            let message = error.response.data;
            throw alert (message);
          });
          setUser(fetchedData.data);
          setStudents([fetchedData.data][0].students);
          console.log(fetchedData.data.address)
        } catch (error) {
     
        }
      };
      fetchData();
    }, []);
  

    // ensure new student form closes on submission
    useEffect(() => {
        setMakeStudent(false); 
    }, [students]);

    useEffect(() => {
      console.log(" api loaded or user loaded changed")
      console.log("api loaded = " + apiLoaded)
      if ((apiLoaded) && (userLoaded) && (user.address)) {
        checkMap(null);
      } 
    }, [apiLoaded, userLoaded]);

    useEffect(() => {
      if (!userLoaded) {
        console.log("userLoaded set to true")
        setUserLoaded(true);
      }
    }, [user]);


    //maps
    const checkMap = (e) => {
      if (e) {
        e.preventDefault();
      }
      console.log(apiLoaded)
      if (apiLoaded) {
        searchLocation()
      } 
    }
    const searchLocation = () => {
        mapApi.geocoder.geocode( { 'address': user.address }, (results, status) => {
          if (!user.address || user.address.trim().length === 0) {
            alert("Please Enter an Address"); 
            return;
          }
          if (status === "OK") {
            mapApi.map.setCenter(results[0].geometry.location);
            setLng(results[0].geometry.location.lng());
            setLat(results[0].geometry.location.lat());
            setError(null);
            setUser({...user, address : user.address});
            setAddressValid(true);
          } else if (status === "ZERO_RESULTS") {
            setAddressValid(false);
            setError("No results for that address");
            alert ("No results for that address");
     
          } else {
            setAddressValid(false);
            setError("Server Error. Try again later");
            alert("Server Error. Try again later");
            
          }
        });
    }
    const handleApiLoaded = (map, maps) => {
        const geocoder = new maps.Geocoder();
        setMapApi({geocoder: geocoder, map: map});
        setApiLoaded(true);
    }

    const columns = useMemo(
      () => [
        {
            Header: 'Student First Name',
            accessor: 'firstName',
        },
        {
          Header: 'Student Last Name',
          accessor: 'lastName',
        },
         {
          Header: 'Missing Route',
          disableFilters : true,
          accessor: 'route',
          Cell: ({value}) => { 
              return <ul> {value ? 'No' : 'Yes' } </ul> 
          }
      },
      {
        Header: ' ',
        disableFilters: true,
        accessor: 'uid',
        Cell: ({value}) => { 
          return <Link to = {"/Students/info/" + value}> {"View Student Detail"} </Link>   
        }
        }
          ],
          []
    );

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow
    } = useTable({columns, data: students});

    

    return <div id="content"> 
 
        <h2 id = 'title'>  {action_text} {user.firstName}  {user.lastName}  </h2>
        <div>
          {!editable &&  
              <button onClick={e => setEditable(true)}> Edit </button>
          }
          {editable &&  
            <button onClick={e => setEditable(false)}> View </button>
          }
          <button onClick = {(e) => {handleDeleteUser(id, e);}}>Delete </button>
          
        </div>
        
        <div id = "main_form">
              
        <Divider id = 'divider'>Information {editable}</Divider>

          <label for = "firstName"> First Name </label> 
          <input
              id = "username"
              type="text"
              maxLength="100"
              disabled = {!editable}
              value={user.firstName}
              onChange={(e) => setUser({...user, firstName : e.target.value})}
          />
              
          <label for = "middleName"> Middle Name </label>
          <input
              id = "middleName"
              maxLength="100"
              disabled = {!editable}
              type="text"
              value={user.middleName}
              onChange={(e) => setUser({...user, middleName : e.target.value})}
          />
  
          <label for = "lastName"> Last Name </label>
          <input
              id = 'lastName'
              maxLength="100"
              disabled = {!editable}
              type="text"
              value={user.lastName}
              onChange={(e) => setUser({...user, lastName : e.target.value})}
          />
    
          <label for = "email"> Email </label>
          <input
              id = 'email'
              maxLength="100"
              disabled = {!editable}
              type="text"
              value={user.email}
              onChange={(e) => setUser({...user, email : e.target.value})}
          />

         
          <label for = "address"> Address {addressValid} </label>
          <input
              id = 'address'
              maxLength="100"
              disabled = {!editable}
              type="text"
              value={user.address}
              onChange={(e) => {setUser({...user, address: e.target.value}); setAddressValid(false); }} 
          />
          
          <label for = "isAdmin"> Admin </label>
          <input
              id = "isAdmin"
              type="checkbox"
              disabled = {!editable}
              value={user.isAdmin}
              onInput={(e) => setUser({...user, isAdmin : e.target.checked})}
          />

          <p> </p>
          <div>
            <Divider id = 'divider'>Students</Divider>
            <p> </p>

           {(students.length !== 0) && <div id ='table'>
            <table {...getTableProps()} style={{ border: 'solid 1px blue' } }>
              <thead>
              {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                        <th
                            {...column.getHeaderProps((column.id === "name" || column.id === "email_address"))}
                            style={column.id === "name" || column.id === "email_address" ? {
                              borderBottom: 'solid 3px red',
                              background: 'aliceblue',
                              color: 'black',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            } : {
                              borderBottom: 'solid 3px red',
                              background: 'aliceblue',
                              color: 'black',
                              fontWeight: 'bold',
                            }}
                        >
                          {column.render('Header')}
                        </th>
                    ))}
                  </tr>
              ))}
              </thead>
              <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row)
                return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => {
                        return (
                            <td
                                {...cell.getCellProps()}
                                style={{
                                  padding: '10px',
                                  border: 'solid 1px gray',
                                  background: 'papayawhip',
                                }}
                            >
                                {cell.render('Cell')}
                            </td>
                        )
                      })}
                    </tr>
                )
              })
              }
              </tbody>
            </table> 
            </div>}

          {(students.length ===0) && <div>
            <p> There are no students associated with this account. Add one by clicking Edit</p>
             </div>}

            {editable &&<Box sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper', margin: 'auto', marginTop: '10px'}}>
                <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper'}} 
                >
          
                <ListItem
                    key={'-1'}
                    disablePadding
                >
                    <ListItemButton
                        onClick = {(e) => {setMakeStudent(true);}}>
                        <PersonAddIcon />
                        <ListItemText primary={"Add New Student"} />
                    </ListItemButton>
                </ListItem>

                </List>
            </Box>
            }
        </div>
        
 
        {makeStudent && <div id = 'sub-form'> 
            <CloseIcon onClick = {(e) => {setMakeStudent(false)}} style = {{
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        }}></CloseIcon>
         {makeStudent && <StudentForm addStudentToUser = {addStudentToUser}> </StudentForm>}
         </div>
         } 
        
        {editable && <div>
          <button style = {{display: 'in-line block', margin: '20px'}} onClick = {(e) => checkMap(e)}> {addressValid ? "Address Valid!": "Validate Address" } </button>  
          <button style = {{display: 'in-line block', margin: '20px'}} className = "button" onClick = {(e) => {handleUserFormSubmit(e)}} type="button"> Submit </button>
        </div>} 
        
        </div>
        
        <div id="map">
          {error && (<div>{error}</div>)}
            <div style={{ height: '50vh', width: '80%', display: "inline-block" }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_MAPS_API}` }}
                    defaultCenter={defaultProps.center}
                    defaultZoom={defaultProps.zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                >
                <Marker
                    text="Your Address"
                    lat={lat}
                    lng={lng}
                />
                </GoogleMapReact>
             </div>
        </div>
    
    </div>

}