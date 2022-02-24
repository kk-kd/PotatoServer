import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useEffect, useState, useMemo } from "react";
import { Marker } from "../map/Marker";
import {registerUser, saveStudent} from "../api/axios_wrapper";
import { Link, use, useNavigate, useParams } from "react-router-dom";
import { Users } from "./Users";
import { filterAllUsers, filterAllSchools, getOneUser , createUser, updateUser, deleteUser} from "../api/axios_wrapper";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

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


    // functions passed to student form to update students state
    // checks both user input and student existing before calling updateUser
    const addStudentToUser = (student) => {
      const student_candidate = {...student, parentUser : user}
      CreateStudent(student_candidate);  
    }

    // functions passed to student form to update students state
    // const addStudentToUser = (student) => {
    //   students.forEach((stud) => {
    //     if (stud.student.id === student.studentid) {
    //       alert("A Student with this ID is already associated with this user.");
    //     }
    //   });
    //   setStudents((students) => [...students, student]);
    // };


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
          password: user.password,
          uid: user.uid,
          confirmationCode: user.confirmationCode,
        }
        console.log("Updating User with Entries:")
        console.log(form_results)
        let message = ""
    
        try {
          console.log(id)
          
          const response = await updateUser(id, form_results, false); //false shouldn't be in the call anymore!
          const madeUser = await getOneUser(id);
          console.log(madeUser)
          setUser(madeUser.data);
          setStudents([madeUser.data][0].students);
          setEditable(false);
          fetchUserData();


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

    async function CreateStudent(candidate_student) {  
      try {
        let create_student_response = await saveStudent(candidate_student);
      } catch (error) {
          let message = error.response.data;
          throw alert (message);
      }
      alert("Successfully Created Student");
      fetchUserData();
    }

    const handleDeleteUser = (user_id, e) => {
      e.preventDefault();
      let sName = prompt("Do you want to delete?  If so, enter user email:");
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
    const updateUserLoading = (data) => {
      console.log(data)
      setUserLoaded(true);
    }

    const fetchUserData = async () => {
      try {
        const fetchedData = await getOneUser(id).catch ((error) => {
          let message = error.response.data;
          throw alert (message);
        });
        setUser(fetchedData.data);
        setStudents([fetchedData.data][0].students);
        updateUserLoading(fetchedData.data);
        console.log("User from API Call:")
        console.log(fetchedData.data)
      } catch (error) {
        console.log(error);
      }
    }

    // load data on page load 
    useEffect(() => {
      fetchUserData();
    }, []);
  
    // refresh data when changing from edit/view mode
    useEffect(() => {
      fetchUserData();
    }, [editable]);

    // ensure new student form closes on submission
    useEffect(() => {
        setMakeStudent(false); 
    }, [students]);

    useEffect(() => {
      console.log(" api loaded or user loaded changed")
      console.log("api loaded = " + apiLoaded)
      console.log("user loaded = " + userLoaded)
      console.log("address = " + user.address)
      if ((apiLoaded) && (userLoaded) && (user.address)) {
        checkMap(null);
      } 
    }, [apiLoaded, userLoaded]);


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
          Header: "First Name",
          accessor: "firstName",
        },
        {
          Header: "Middle Name",
          accessor: "middleName",
        },
        {
          Header: "Last Name",
          accessor: "lastName",
        },
        {
          Header: "ID",
          accessor: "id",
        },
        {
          HeaderName: "School",
          accessor: "school.name",
        },
        {
          Header: "Route",
          accessor: "route",
          Cell: (props) => (
            <div>
              {props.value ? (
                <label>
                  {props.value.name}{" "}
                  {(props.row.original.inRangeStops &&
                    props.row.original.inRangeStops.length > 0) || (
                    <>
                      <FontAwesomeIcon
                        icon={faCircleExclamation}
                        size="lg"
                        style={{ color: "red" }}
                        data-tip
                        data-for="noInRangeStopTip"
                      />
                      <ReactTooltip
                        id="noInRangeStopTip"
                        place="bottom"
                        effect="solid"
                      >
                        This student does not have any in-range stops.
                      </ReactTooltip>
                    </>
                  )}
                </label>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faXmark}
                    size="xl"
                    style={{ color: "red" }}
                    data-tip
                    data-for="noStopTip"
                  />
                  <ReactTooltip id="noStopTip" place="bottom" effect="solid">
                    This student is not on a route.
                  </ReactTooltip>
                </>
              )}
            </div>
          ),
        },
        {
          Header: "Detail Page",
          accessor: "uid",
          Cell: (props) => {
            return <Link to={`/Students/info/${props.value}`}>view</Link>;
          },
        },
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
 
        <h2 id = 'title'> {user.firstName}  {user.lastName}  </h2>
        <div>
          {!editable &&  
              <button onClick={e => setEditable(true)}> Edit Details </button>
          }
          {editable &&  
            <button onClick={e => setEditable(false)}> Cancel Edits </button>
          }
          {!editable && <button onClick = {(e) => {handleDeleteUser(id, e);}}>Delete Account </button>}
          
        </div>
        
        <div id = "main_form">
              
        {/* <Divider id = 'divider'>Information {editable}</Divider> */}
        <h5 id = "sub-header"> Information </h5>

          <label id = "label-user"> First Name </label> 
          <input
              id = "input-user"
              type="text"
              maxLength="100"
              disabled = {!editable}
              value={user.firstName}
              onChange={(e) => setUser({...user, firstName : e.target.value})}
          />
              
          <label id = "label-user"> Middle Name </label>
          <input
              id = "input-user"
              maxLength="100"
              disabled = {!editable}
              type="text"
              value={user.middleName}
              onChange={(e) => setUser({...user, middleName : e.target.value})}
          />
  
          <label id = "label-user"> Last Name </label>
          <input
              id = "input-user"
              maxLength="100"
              disabled = {!editable}
              type="text"
              value={user.lastName}
              onChange={(e) => setUser({...user, lastName : e.target.value})}
          />
    
          <label id = "label-user"> Email </label>
          <input
              id = "input-user"
              maxLength="100"
              disabled = {!editable}
              type="text"
              value={user.email}
              onChange={(e) => setUser({...user, email : e.target.value})}
          />

         
          <label id = "label-user"> Address {addressValid} </label>
          <input
              id = "input-user"
              maxLength="100"
              disabled = {!editable}
              type="text"
              value={user.address}
              onChange={(e) => {setUser({...user, address: e.target.value}); setAddressValid(false); }} 
          />
          
          <label id = "label-user"> Admin </label>
          <input
              id = "input-user"
              type="checkbox"
              disabled = {!editable}
              value={user.isAdmin}
              defaultChecked={user.isAdmin}
              onInput={(e) => setUser({...user, isAdmin : e.target.checked})}
          />

          <p> </p>
          {editable && <div>
          <button style = {{display: 'in-line block', margin: '20px'}} onClick = {(e) => checkMap(e)}> {addressValid ? "Address Valid!": "Validate Address" } </button>  
          <button style = {{display: 'in-line block', margin: '20px'}} className = "button" onClick = {(e) => {handleUserFormSubmit(e)}} type="button"> Submit </button>
          </div>} 
          <div>
             <p> </p>
            <p> </p>
            <p> </p>
            <p> </p>
            <h5 id = "sub-header"> Students </h5>
            <p> </p>
            <p> </p>
            <p> </p>
                <table {...getTableProps()} class="table table-striped">
                  <thead class="thead-dark">
                  {headerGroups.map(headerGroup => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th
                                {...column.getHeaderProps()}
                                style={{
                                  borderBottom: 'solid 3px black',
                                  background: 'white',
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
                    {rows.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map((cell) => {
                            return (
                              <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>




          {(students.length ===0) && <div>
            <p> There are no students associated with this account. {editable ? "" : "Click Edit to Add a Student."} </p>
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
                    isUser
                />
                </GoogleMapReact>
             </div>
        </div>
    
    </div>

}

