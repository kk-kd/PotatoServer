// import GoogleMapReact from "google-map-react";
import "./StudentForm.css";
import { useEffect, useState, Fragment } from "react";
import { updateStudent } from "../api/axios_wrapper";
// import { Marker } from "../map/Marker";
// import {registerUser, saveStudent} from "../api/axios_wrapper";
import { Link, useNavigate } from "react-router-dom";
import {
  filterAllUsers,
  filterAllSchools,
  getOneUse,
  saveStudent,
} from "../api/axios_wrapper";
// import { Users } from "./Users";
// import { filterAllUsers, filterAllSchools, getOneUser } from "../api/axios_wrapper";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export const StudentForm = ({ addStudentToUser }) => {
  const action_text = addStudentToUser ? "Add New Student" : "Make New Student";

  const [student, setStudent] = useState({ school: { name: "school name" } });
  const [user, setUser] = useState();

  // filter search state
  const [filteredDataSchool, setFilteredDataSchool] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState();
  const [schoolFilter, setSchoolFilter] = useState("");
  const [makeUser, setMakeUser] = useState(false);

  const [routeFilter, setRouteFilter] = useState("");
  // const [selectedRoute, setSelectedRoute] = useState();

  const [filteredDataUser, setFilteredDataUser] = useState([]);

  const [userFilter, setUserFilter] = useState("");

  let navigate = useNavigate();

  const validate_student_entries = () => {
    if (!student.fullName) {
      return { valid: false, error: "Student Name Required" };
    } else if (student.studentid && !(Number(student.studentid) > 0)) {
      return { valid: false, error: "Student ID must be a positive number" };
    }
    if (!selectedSchool) {
      return { valid: false, error: "Student must have a School" };
    }
    if (!user && !addStudentToUser) {
      return { valid: false, error: "Student Must have a User" };
    }
    if (makeUser && !student.email) {
      return { valid: false, error: "Student must have an email to be granted user access."}
    }

    return { valid: true, error: "" };
  };

  const handleStudentFormSubmit = (e) => {
    let valid_results = validate_student_entries();
    if (valid_results.valid) {
      if (addStudentToUser) {
        console.log("Adding Student to User");
        let form_results = {
          fullName: student.fullName,
          school: selectedSchool,
          id: student.studentid,
          // route: selectedRoute
        };
        if (makeUser) {
          form_results.email = student.email;
        }
        addStudentToUser(form_results);
      } else {
        console.log("Make New Student");
        CreateStudent(e);
      }
    } else {
      alert(valid_results.error);
    }
  };

  async function CreateStudent(e) {
    let form_results = {
      fullName: student.fullName,
      school: selectedSchool,
      id: student.studentid,
      parentUser: user,
    };
    if (makeUser) {
      form_results.email = student.email;
    }
    console.log(form_results);

    if (!student.studentid || student.studentid.length === 0) {
      form_results["id"] = null;
    }

    console.log(form_results);

    try {
      let create_student_response = await saveStudent(form_results);
    } catch (error) {
      let message = error.response.data;
      throw alert(message);
    }

    alert("Successfully Created Student");
    navigate("/Students/list");
  }

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

  useEffect(() => {
    const fetchFilteredDataUser = async () => {
      try {
        const fetchedData = await filterAllUsers({
          page: 0,
          size: 10,
          sort: "email",
          sortDir: "ASC",
          filterType: "",
          filterData: userFilter,
          roleFilter: "Parent",
          isCreate: true,
        });
        setFilteredDataUser(fetchedData.data.users);
        console.log(fetchedData.data);
      } catch (error) {
        alert(error.response.data);
      }
    };
    if (userFilter) {
      fetchFilteredDataUser();
    }
  }, [userFilter]);

  return (
    <div id="student-content">
      {addStudentToUser && <h4 id="subtitle"> {action_text} </h4>}
      {!addStudentToUser && <h2 id="title"> {action_text} </h2>}

      <label id="input-label-student"> Name* </label>
      <input
        id="input-input-student"
        type="text"
        maxLength="100"
        value={student.fullName}
        onChange={(e) => setStudent({ ...student, fullName: e.target.value })}
      />

      <label id="input-label-student"> Grant User Access </label>
      <input
          id="input-input-student"
          type="checkbox"
          onInput={e => setMakeUser(e.target.checked)}
      />

      {makeUser && <label id="input-label-student"> Email* </label>}
      {makeUser && <input
        id="input-input-student"
        type="text"
        maxLength="100"
        value={student.email}
        onChange={(e) => setStudent({ ...student, email: e.target.value })}
      />}

      <label id="input-label-student" for="lastName">
        {" "}
        Student ID{" "}
      </label>
      <input
        id="input-input-student"
        type="text"
        maxLength="100"
        value={student.studentid}
        onChange={(e) => {
          setStudent({ ...student, studentid: e.target.value });
        }}
      />

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
        value={selectedSchool}
        onInputChange={(e) => {
          setSchoolFilter(e.target.value);
        }}
        onChange={(_event, newSchool) => {
          console.log(newSchool);
          setSelectedSchool(newSchool);
        }}
      />

      {/* {selectedSchool && selectedSchool.routes && selectedSchool.routes.length > 0 && 
            <Autocomplete
                options={selectedSchool.routes}
                freeSolo
                sx = {{paddingTop: '20px', paddingBottom: '10px', width: '49%', margin: 'auto', marginRight: '23%',}}
                renderInput={params => (
                    <TextField {...params} label=" Route " variant="standard"
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
        } */}
      <div>
        {!addStudentToUser && (
          <Autocomplete
            sx={{
              paddingTop: "20px",
              paddingBottom: "10px",
              width: "49%",
              margin: "auto",
              marginRight: "23%",
            }}
            options={filteredDataUser}
            freeSolo
            disableClearable
            renderInput={(params) => (
              <TextField {...params} label="Parent" variant="standard" />
            )}
            getOptionLabel={(option) => option.email}
            noOptionsText={"Type to Search"}
            value={user}
            onInputChange={(e, newInputValue, reason) => {
              if (reason === "reset") {
                setUserFilter("");
                return;
              } else if (reason === "input") {
                setUserFilter(newInputValue);
              }
            }}
            onChange={(_event, newUser) => {
              console.log(newUser);
              setUser(newUser);
            }}
          />
        )}
      </div>

      <button
        className="submitbutton"
        type="button"
        onClick={(e) => {
          handleStudentFormSubmit(e);
        }}
      >
        {" "}
        {action_text}{" "}
      </button>
    </div>
  );
};
