import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useEffect, useState, useMemo } from "react";
import { Marker } from "../map/Marker";
import { saveStudent } from "../api/axios_wrapper";
import { useNavigate, useParams } from "react-router-dom";
import {
  filterAllSchools,
  getOneUser,
  createUser,
  saveUser,
  deleteUser,
} from "../api/axios_wrapper";
import { StudentForm } from "../students/StudentForm";
import { useTable } from "react-table";

import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { ListItemButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";
// this functions as the user edit and detail pages.

export const UserInfo = ({ edit, role, uid }) => {
  const { id } = useParams();
  let navigate = useNavigate();

  const [editable, setEditable] = useState(edit);
  const action_text = editable ? "Edit" : "View";

  // user
  const [user, setUser] = useState({
    name: "",
    address: "",
    role: "",
    attachedSchools: [],
  });

  const [students, setStudents] = useState([]);
  const [addressValid, setAddressValid] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [addSchool, setAddSchool] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [filteredDataSchool, setFilteredDataSchool] = useState([]);
  const [staffSchools, setStaffSchools] = useState([]);

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

  // show student form
  const [makeStudent, setMakeStudent] = useState(false);

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
    const student_candidate = { ...student, parentUser: user };
    CreateStudent(student_candidate);
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

  const handleUserFormSubmit = (e) => {
    let valid_results = validate_user_entries();
    if (valid_results.valid) {
      UpdateUser(e);
    } else {
      alert(valid_results.error);
    }
  };

  async function UpdateUser(e) {
    if (e) {
      e.preventDefault(); // prevents page reload on submission
    }

    let form_results = {
      email: user.email.toLowerCase(),
      phoneNumber: user.phoneNumber,
      attachedSchools: user.attachedSchools,
      students: students,
      role: user.role,
      fullName: user.fullName,
      address: user.address,
      isAdmin: user.isAdmin,
      latitude: lat,
      longitude: lng,
      password: user.password,
      uid: user.uid,
      confirmationCode: user.confirmationCode,
    };
    console.log("Updating User with Entries:");
    console.log(form_results);
    let message = "";

    try {
      console.log(id);

      const response = await saveUser(form_results); //false shouldn't be in the call anymore!
      const madeUser = await getOneUser(id);
      console.log(madeUser);
      setUser(madeUser.data);
      setStudents([madeUser.data][0].students);
      setEditable(false);
      fetchUserData();

      console.log("Updated User");
      console.log(madeUser.data);
      console.log("Students = ");
      console.log(students);
    } catch (error) {
      message = error.response.data;
      alert(message);
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
      throw alert(message);
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
  };
  const deleteUserCall = async (user_id) => {
    try {
      if (user.role === "School Staff" && user.attachedSchools.length > 0) {
        let form_results = {
          email: user.email.toLowerCase(),
          phoneNumber: user.phoneNumber,
          attachedSchools: [],
          students: students,
          role: user.role,
          fullName: user.fullName,
          address: user.address,
          isAdmin: user.isAdmin,
          latitude: lat,
          longitude: lng,
          password: user.password,
          uid: user.uid,
          confirmationCode: user.confirmationCode,
        };
        await saveUser(form_results);
      }
      await deleteUser(parseInt(user_id));
      alert("User Deletion Successful");
      navigate("/Users/list");
    } catch (e) {
      console.log(e);
      let message = e.response.data;
      alert(message);
    }
  };
  const updateUserLoading = (data) => {
    console.log(data);
    setUserLoaded(true);
  };

  const fetchUserData = async () => {
    try {
      const fetchedData = await getOneUser(id).catch((error) => {
        let message = error.response.data;
        throw alert(message);
      });
      if (role === "School Staff") {
        const staffData = await getOneUser(uid).catch((error) => {
          let message = error.response.data;
          throw alert(message);
        });
        setStaffSchools(staffData.data.attachedSchools);
      }
      setUser(fetchedData.data);
      setStudents([fetchedData.data][0].students);
      updateUserLoading(fetchedData.data);
      console.log("User from API Call:");
      console.log(fetchedData.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteable =
    role === "Admin" ||
    (role === "School Staff" &&
      user.role === "Parent" &&
      !students.some(
        (student) =>
          !staffSchools.some((school) => school.uid === student.school.uid)
      ));

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
    console.log(" api loaded or user loaded changed");
    console.log("api loaded = " + apiLoaded);
    console.log("user loaded = " + userLoaded);
    console.log("address = " + user.address);
    if (apiLoaded && userLoaded && user.address) {
      eventCheckMap(null);
    }
  }, [apiLoaded, userLoaded]);

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
  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "fullName",
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
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data:
        role === "School Staff"
          ? students.filter((student) =>
              staffSchools.some((school) => school.uid === student.school.uid)
            )
          : students,
    });

  return (
    <div id="content">
      <h2 id="title">
        {" "}
        {user.firstName} {user.lastName}{" "}
      </h2>
      {(role === "Admin" || role === "School Staff") && (
        <div>
          {!editable && (
            <button onClick={(e) => setEditable(true)}> Edit Details </button>
          )}
          {editable && (
            <button onClick={(e) => setEditable(false)}> Cancel Edits </button>
          )}
          {!editable && deleteable && (
            <button
              onClick={(e) => {
                handleDeleteUser(id, e);
              }}
            >
              Delete Account{" "}
            </button>
          )}
        </div>
      )}

      <div id="main_form">
        {/* <Divider id = 'divider'>Information {editable}</Divider> */}
        <h5 id="sub-header"> Information </h5>

        <label id="label-user"> Name </label>
        <input
          id="input-user"
          type="text"
          maxLength="100"
          disabled={!editable}
          value={user.fullName}
          onChange={(e) => setUser({ ...user, fullName: e.target.value })}
        />

        <label id="label-user"> Email </label>
        <input
          id="input-user"
          maxLength="100"
          disabled={!editable}
          type="text"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <label id="label-user"> Phone Number </label>
        <input
          id="input-user"
          maxLength="100"
          disabled={!editable}
          type="text"
          value={user.phoneNumber}
          onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
        />

        {user.role === "Parent" && (
          <div>
            <label id="label-user"> Address {addressValid} </label>
            <input
              id="input-user"
              maxLength="100"
              disabled={!editable}
              type="text"
              value={user.address}
              onChange={(e) => {
                setUser({ ...user, address: e.target.value });
                setAddressValid(false);
              }}
            />
          </div>
        )}

        <label id="label-user"> Role </label>
        <select
          id="input-user"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
          disabled={!editable || role !== "Admin" || user.uid === uid}
        >
          <option value="Parent">Parent</option>
          <option value="Driver">Driver</option>
          <option value="School Staff">School Staff</option>
          <option value="Admin">Admin</option>
          <option value="Student">Student</option>
        </select>

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
                      editable &&
                      role === "Admin" && (
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
                      )
                    }
                    disablePadding
                  >
                    <ListItemText id={labelId} primary={school.name} />
                  </ListItem>
                );
              })}

              {editable && role === "Admin" && (
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
              )}
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

        <p> </p>
        {editable && (
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
        )}
        {user.role === "Parent" && (
          <div>
            <p> </p>
            <p> </p>
            <p> </p>
            <p> </p>

            <h5 id="sub-header"> Students </h5>
            <p> </p>
            <p> </p>
            <p> </p>
            <table {...getTableProps()} class="table table-striped">
              <thead class="thead-dark">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        style={{
                          borderBottom: "solid 3px black",
                          background: "white",
                          color: "black",
                          fontWeight: "bold",
                        }}
                      >
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      onClick={() =>
                        navigate(`/Students/info/${row.original.uid}`)
                      }
                    >
                      {row.cells.map((cell) => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            style={{ cursor: "pointer" }}
                          >
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {students.length === 0 && (
              <div>
                <p>
                  {" "}
                  There are no students associated with this account.{" "}
                  {editable ? "" : "Click Edit to Add a Student."}{" "}
                </p>
              </div>
            )}

            {editable && (
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
            )}
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
