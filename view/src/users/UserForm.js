import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";
import { Marker } from "../map/Marker";
import { registerUser, saveStudent } from "../api/axios_wrapper";
import { Link, use, useNavigate } from "react-router-dom";
import { Users } from "./Users";
import {
  filterAllUsers,
  filterAllSchools,
  getOneUser,
} from "../api/axios_wrapper";
import { StudentForm } from "../students/StudentForm";

import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { ListItemButton } from "@mui/material";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import { fontSize } from "@mui/system";

export const UserForm = ({ role }) => {
  let navigate = useNavigate();

  const action_text = "Create New User";

  // user
  const [user, setUser] = useState({
    name: "",
    address: "",
    role: "Parent",
    attachedSchools: [],
  });

  const [students, setStudents] = useState([]);
  const [addressValid, setAddressValid] = useState(false);

  const [addSchool, setAddSchool] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [filteredDataSchool, setFilteredDataSchool] = useState([]);

  // show student form
  const [makeStudent, setMakeStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({});

  // maps
  const [mapApi, setMapApi] = useState();
  const [lat, setLat] = useState();
  const [lng, setLng] = useState();
  const [apiLoaded, setApiLoaded] = useState(false);
  const [error, setError] = useState(null);
  const defaultProps = {
    center: {
      lat: 0,
      lng: 0,
    },
    zoom: 13,
  };

  // functions passed to student form to update students state
  const addStudentToUser = (student) => {
    setStudents((students) => [...students, student]);
  };

  const validate_user_entries = () => {
    if (!user.fullName) {
      return { valid: false, error: "User Name Required" };
    } else if (!user.email) {
      return { valid: false, error: "Please provide a user email" };
    } else if (user.role === "Parent" && !user.address) {
      return { valid: false, error: "Please provide a user address" };
    } else if (user.role === "Parent" && !addressValid) {
      return { valid: false, error: "The address is not valid." };
    } else if (user.role === "Parent" && !user.phoneNumber) {
      return { valid: false, error: "Please provide a phone number" };
    }
    return { valid: true, error: "" };
  };

  useEffect(() => {
    const fetchFilteredDataSchool = async () => {
      try {
        const fetchedDataSchool = await filterAllSchools({
          page: 0,
          size: 10,
          sort: "name",
          sortDir: "ASC",
          filterType: "",
          filterData: schoolFilter,
        });
        setFilteredDataSchool(fetchedDataSchool.data.schools);
      } catch (error) {
        alert(error.response.data);
      }
    };
    if (schoolFilter) {
      fetchFilteredDataSchool();
    }
  }, [schoolFilter]);

  const handleUserFormSubmit = (e) => {
    let valid_results = validate_user_entries();
    if (valid_results.valid) {
      CreateUser(e);
      console.log("Make New User");
    } else {
      alert(valid_results.error);
    }
  };

  async function CreateUser(e) {
    e.preventDefault(); // prevents page reload on submission

    let form_results = {
      email: user.email.toLowerCase(),
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      address: user.address,
      role: user.role,
      attachedSchools: user.attachedSchools,
      latitude: lat,
      longitude: lng,
    };
    console.log(form_results);
    let message = "";

    try {
      const create_user_response = await registerUser(form_results);
      const madeUser = await getOneUser(create_user_response.data);
      console.log("Made User");
      console.log(madeUser.data);
      console.log("Students = ");
      console.log(students);

      for (const student of students) {
        console.log(student);
        const name = await addStudent(student, madeUser.data);
      }
    } catch (error) {
      message = error.response.data;
      alert(message);
    }
    if (!message) {
      alert("User Successfully Created");
      navigate("/Users/list");
    }
  }

  async function addStudent(student, parent) {
    try {
      const student_form = { ...student, parentUser: parent };
      console.log(student_form);
      const created = await saveStudent(student_form);
      return created;
    } catch (e) {
      console.log(e);
    }
  }

  // ensure new student form closes on submission
  useEffect(() => {
    setMakeStudent(false);
  }, [students]);

  //maps
  const eventCheckMap = async (e) => {
    e.preventDefault();
    if (apiLoaded) {
      searchLocation();
    }
    return e;
  };

  const searchLocation = () => {
    mapApi.geocoder.geocode({ address: user.address }, (results, status) => {
      if (!user.address || user.address.trim().length === 0) {
        alert("Please Enter an Address");
        return;
      }
      if (status === "OK") {
        mapApi.map.setCenter(results[0].geometry.location);
        setLng(results[0].geometry.location.lng());
        setLat(results[0].geometry.location.lat());
        setError(null);
        setUser({ ...user, address: user.address });
        setAddressValid(true);
      } else if (status === "ZERO_RESULTS") {
        setAddressValid(false);
        setError("No results for that address");
        alert("No results for that address");
      } else {
        setAddressValid(false);
        setError("Server Error. Try again later");
        alert("Server Error. Try again later");
      }
    });
  };
  const handleApiLoaded = (map, maps) => {
    const geocoder = new maps.Geocoder();
    setMapApi({ geocoder: geocoder, map: map });
    setApiLoaded(true);
  };

  return (
    <div id="content">
      <h2 id="title"> {action_text} </h2>

      <div id="main_form">
        <h5 id="sub-header">Information</h5>

        <label id="label-user"> Name* </label>
        <input
          id="input-user"
          type="text"
          maxLength="100"
          value={user.fullName}
          onChange={(e) => setUser({ ...user, fullName: e.target.value })}
        />

        <label id="label-user"> Email* </label>
        <input
          id="input-user"
          maxLength="100"
          type="text"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <label id="label-user">
          {" "}
          {user.role === "Parent" ? "Phone Number*" : "Phone Number"}{" "}
        </label>
        <input
          id="input-user"
          maxLength="100"
          type="text"
          value={user.phoneNumber}
          onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
        />

        {user.role === "Parent" && (
          <div>
            <label id="label-user"> Address* {addressValid} </label>
            <input
              id="input-user"
              maxLength="100"
              type="text"
              value={user.address}
              onChange={(e) => {
                setUser({ ...user, address: e.target.value });
                setAddressValid(false);
              }}
            />
          </div>
        )}

        {role === "Admin" && (
          <>
            <label id="label-user"> Role </label>
            <select
              id="input-user"
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
            >
              <option value="Parent">Parent</option>
              <option value="Driver">Driver</option>
              <option value="School Staff">School Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </>
        )}

        {user.role === "School Staff" && (
          <Box
            sx={{
              width: "100%",
              maxWidth: 360,
              bgcolor: "background.paper",
              margin: "auto",
              marginTop: "10px",
            }}
          >
            <List
              dense
              sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
            >
              {user.attachedSchools.map((school) => {
                const labelId = `checkbox-list-secondary-label-${school.uid}`;
                return (
                  <ListItem
                    key={school.uid}
                    secondaryAction={
                      <IconButton
                        aria-label="delete"
                        style={{ backgroundColor: "transparent" }}
                      >
                        <DeleteIcon
                          onClick={(e) => {
                            setUser({
                              ...user,
                              attachedSchools: user.attachedSchools.filter(
                                (s) => s.uid !== school.uid
                              ),
                            });
                          }}
                        />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemText id={labelId} primary={school.name} />
                  </ListItem>
                );
              })}

              <ListItem key={"-1"} disablePadding>
                <ListItemButton
                  onClick={(e) => {
                    setAddSchool(true);
                  }}
                >
                  <PersonAddIcon />
                  <ListItemText primary={"Add New School"} />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        )}

        {addSchool && (
          <Autocomplete
            sx={{
              paddingTop: "20px",
              paddingBottom: "10px",
              width: "49%",
              margin: "auto",
              marginRight: "23%",
            }}
            options={filteredDataSchool}
            freeSolo
            disableClearable
            renderInput={(params) => (
              <TextField {...params} label="School" variant="standard" />
            )}
            getOptionLabel={(option) => option.name}
            noOptionsText={"Type to Search"}
            onInputChange={(e) => {
              setSchoolFilter(e.target.value);
            }}
            onChange={(_event, newSchool) => {
              if (
                !user.attachedSchools.some(
                  (school) => school.uid === newSchool.uid
                )
              ) {
                setUser({
                  ...user,
                  attachedSchools: [...user.attachedSchools, newSchool],
                });
              }
              setAddSchool(false);
              setSchoolFilter("");
            }}
          />
        )}

        {user.role === "Parent" && (
          <div>
            <p> </p>
            <div>
              <h5 id="sub-header"> Students </h5>

              <Box
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                  margin: "auto",
                  marginTop: "10px",
                }}
              >
                <List
                  dense
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                  }}
                >
                  {students.map((student) => {
                    const labelId = `checkbox-list-secondary-label-${student.studentid}`;
                    return (
                      <ListItem
                        key={student.studentid}
                        secondaryAction={
                          <IconButton
                            aria-label="delete"
                            style={{ backgroundColor: "transparent" }}
                          >
                            <DeleteIcon
                              onClick={(e) => {
                                let filtered = students.filter(function (el) {
                                  return el.studentid != student.studentid;
                                });
                                setStudents(filtered);
                              }}
                            />
                          </IconButton>
                        }
                        disablePadding
                      >
                        <ListItemButton
                          onClick={(e) => {
                            setSelectedStudent(student);
                          }}
                        >
                          <PersonIcon> </PersonIcon>
                          <ListItemText
                            id={labelId}
                            primary={student.fullName}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}

                  <ListItem key={"-1"} disablePadding>
                    <ListItemButton
                      onClick={(e) => {
                        setMakeStudent(true);
                      }}
                    >
                      <PersonAddIcon />
                      <ListItemText primary={"Add New Student"} />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </div>
          </div>
        )}

        {makeStudent && (
          <div id="sub-form">
            <CloseIcon
              onClick={(e) => {
                setMakeStudent(false);
              }}
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
              }}
            ></CloseIcon>
            {makeStudent && (
              <StudentForm addStudentToUser={addStudentToUser}> </StudentForm>
            )}
          </div>
        )}

        <div>
          {user.role === "Parent" && (
            <button
              style={{ display: "in-line block", margin: "20px" }}
              onClick={(e) => eventCheckMap(e)}
            >
              {" "}
              {addressValid ? "Address Valid!" : "Validate Address"}{" "}
            </button>
          )}

          <button
            style={{ display: "in-line block", margin: "20px" }}
            className="button"
            onClick={(e) => {
              handleUserFormSubmit(e);
            }}
            type="button"
          >
            {" "}
            Submit{" "}
          </button>
        </div>
      </div>
      {user.role === "Parent" && (
        <div id="map">
          {error && <div>{error}</div>}
          <div
            style={{ height: "50vh", width: "80%", display: "inline-block" }}
          >
            <GoogleMapReact
              bootstrapURLKeys={{
                key: `${process.env.REACT_APP_GOOGLE_MAPS_API}`,
              }}
              defaultCenter={defaultProps.center}
              defaultZoom={defaultProps.zoom}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
            >
              <Marker text="Your Address" lat={lat} lng={lng} isUser />
            </GoogleMapReact>
          </div>
        </div>
      )}
    </div>
  );
};
