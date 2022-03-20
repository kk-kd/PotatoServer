// import GoogleMapReact from "google-map-react";
import "./StudentForm.css";
import React, { useEffect, useState, Fragment } from "react";
import { getAllStudents, updateStudent } from "../api/axios_wrapper";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  filterAllUsers,
  filterAllSchools,
  getOneUse,
  saveStudent,
  getOneStudent,
  deleteStudent,
} from "../api/axios_wrapper";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import ReactSelect from "react-select";
import { useForm, Controller } from "react-hook-form";
import { flexbox } from "@mui/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faCircleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { RouteStops } from "../routes/RouteStops";

// this page is the student detail and edit page
export const StudentInfo = ({ edit, role }) => {
  const { id } = useParams();
  const [editable, setEditable] = useState(edit);
  const action_text = editable ? "Edit" : "View";
  const { handleSubmit, register, reset, control, setValue } = useForm({});

  const [student, setStudent] = useState();
  const [user, setUser] = useState();
  const [userDefault, setUserDefault] = "";
  const [studentLoaded, setStudentLoaded] = useState(false);
  const [removeInRangeStops, setRemoveInRangeStops] = useState(false);

  // filter search state
  const [filteredDataSchool, setFilteredDataSchool] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState();
  const [schoolFilter, setSchoolFilter] = useState("");

  const [routeFilter, setRouteFilter] = useState("");
  const [selectedRoute, setSelectedRoute] = useState();

  const [filteredDataUser, setFilteredDataUser] = useState([]);

  const [userFilter, setUserFilter] = useState("");

  let navigate = useNavigate();

  const validate_student_entries = () => {
    if (!student.fullName || !student.fullName.trim().length === 0) {
      return { valid: false, error: "Student Name Required" };
    } else if (student.studentid && !(Number(student.studentid) > 0)) {
      return { valid: false, error: "Student ID must be a positive number" };
    }
    if (!selectedSchool) {
      return { valid: false, error: "Student must have a School" };
    }
    if (!user) {
      return { valid: false, error: "Student Must have a User" };
    }

    return { valid: true, error: "" };
  };

  function handleModifyStudent(e) {
    e.preventDefault(); // prevents page reload on submission
    let valid_results = validate_student_entries();
    if (valid_results.valid) {
      let form_results = {
        ...student,
        fullName: student.fullName,
        route: selectedRoute,
        school: selectedSchool,
        parentUser: user,
        id: student.studentid,
      };
      if (removeInRangeStops) {
        form_results.inRangeStops = [];
      }
      console.log(form_results);
      const a = modifyStudent(form_results);
    } else {
      alert(valid_results.error);
    }
  }

  const modifyStudent = async (form_results) => {
    try {
      let update_user_response = await saveStudent(form_results);
      setEditable(false);
    } catch (error) {
      let message = error.response.data;
      throw alert(message);
    }
  };
  const handleDeleteStudent = (student_id, e) => {
    e.preventDefault();
    let deleteThisRoute = window.confirm("Do you want to delete this student?");
    if (deleteThisRoute) {
      const a = callDeleteStudentAPI(student_id);
    }
  };

  const callDeleteStudentAPI = async (student_id) => {
    try {
      const resp = await deleteStudent(student_id);
      alert("Student Delete Successful");
      navigate("/Students/list");
    } catch (error) {
      console.log(error);
      let message = error.response.data;
      throw alert(message);
    }
  };

  async function UpdateStudent(e) {
    let form_results = {
      fullName: student.fullName,
      school: selectedSchool,
      id: student.studentid,
      parentUser: user,
      route: selectedRoute,
    };
    console.log(form_results);
    if (!selectedRoute) {
      form_results["route"] = null;
    }
    if (student.studentid.length === 0) {
      form_results["id"] = null;
    }

    try {
      let create_student_response = await saveStudent(form_results);
    } catch (error) {
      let message = error.response.data;
      throw alert(message);
    }
    alert("Successfully Created Student");
    navigate("/Students/list");
  }

  const fetchStudentData = async () => {
    try {
      const fetchedData = await getOneStudent(id);
      setStudent({ ...fetchedData.data, studentid: fetchedData.data.id });

      if (fetchedData.data.parentUser) {
        setUser(fetchedData.data.parentUser);
      }

      if (fetchedData.data.school) {
        console.log("School Select Filled");
        setSelectedSchool(fetchedData.data.school);
      }
      if (fetchedData.data.route) {
        setSelectedRoute(fetchedData.data.route);
      }
      console.log(fetchedData.data);
    } catch (error) {
      let message = error.response.data;
      throw alert(message);
    }
  };

  // fetch data upon page load
  useEffect(() => {
    fetchStudentData();
  }, []);

  // refresh data when changing from edit/view mode
  useEffect(() => {
    fetchStudentData();
  }, [editable]);

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
      <ex> </ex>

      <h2 id="title"> {student ? student.fullName : ""} </h2>
      <div>
        {!editable && (role === "Admin" || role === "School Staff") && (
          <button
            onClick={(e) => {
              setEditable(true);
              setUser({ email: "ex" });
              setFilteredDataUser([{ email: "ex" }]);
            }}
          >
            {" "}
            Edit Student{" "}
          </button>
        )}
        {!editable && (role === "Admin" || role === "School Staff") && (
          <button
            onClick={(e) => {
              handleDeleteStudent(id, e);
            }}
          >
            Delete Student{" "}
          </button>
        )}
        {editable && (
          <button onClick={(e) => setEditable(false)}> Cancel Edits </button>
        )}
      </div>

      <label id="input-label-student"> Name: </label>
      <input
        id="input-input-student"
        disabled={!editable}
        type="text"
        maxLength="100"
        value={student ? student.fullName : ""}
        onChange={(e) => setStudent({ ...student, fullName: e.target.value })}
      />

      <label id="input-label-student" for="lastName">
        {" "}
        Student ID:{" "}
      </label>
      <input
        id="input-input-student"
        disabled={!editable}
        type="text"
        maxLength="100"
        value={student ? student.studentid : ""}
        onChange={(e) => {
          setStudent({ ...student, studentid: e.target.value });
        }}
      />

      {!editable && (
        <div>
          <label id="input-label-student"> Parent: </label>
          {user && (
            <span id="input-input-inline-item">
              {" "}
              <Link to={"/Users/info/" + user.uid}> {user.fullName}</Link>{" "}
            </span>
          )}
          {!user && <span id="input-input-inline-item"> None Parent </span>}
        </div>
      )}

      {editable && (
        <Autocomplete
          sx={{
            paddingTop: "20px",
            paddingBottom: "10px",
            margin: "auto",
            marginRight: "23%",
            width: "40%",
          }}
          options={filteredDataUser}
          freeSolo
          disableClearable
          renderInput={(params) => (
            <TextField
              {...params}
              label="Parent"
              variant="standard"
              onInputChange={(e, newInputValue, reason) => {
                console.log("input change " + reason);
                if (reason === "reset") {
                  setUserFilter("");
                  return;
                } else if (reason === "input") {
                  setUserFilter(newInputValue);
                }
              }}
            />
          )}
          getOptionLabel={(option) => option.email}
          noOptionsText={"Type to Search"}
          value={user}
          onInputChange={(e, newInputValue, reason) => {
            console.log("input change " + reason);
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
            setSelectedRoute(null);
            setRemoveInRangeStops(true);
          }}
        />
      )}

      {!editable && (
        <div>
          <label id="input-label-student"> School: </label>
          {selectedSchool && (
            <span id="input-input-inline-item">
              {" "}
              <Link to={"/Schools/info/" + selectedSchool.uid}>
                {" "}
                {selectedSchool.name}
              </Link>{" "}
            </span>
          )}
          {!selectedSchool && <span id="input-input-inline-item"> None </span>}
        </div>
      )}

      {editable && (
        <Autocomplete
          sx={{
            paddingTop: "20px",
            paddingBottom: "10px",
            margin: "auto",
            marginRight: "23%",
            width: "40%",
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
          onInputChange={(e, newInputValue, reason) => {
            if (reason === "reset") {
              setSchoolFilter("");
              return;
            } else if (reason === "input") {
              setSchoolFilter(newInputValue);
            }
          }}
          onChange={(_event, newSchool) => {
            console.log(newSchool);
            setSelectedSchool(newSchool);
            setSelectedRoute(null);
            setRemoveInRangeStops(true);
          }}
        />
      )}

      {!editable && (
        <div>
          <label id="input-label-student"> Route: </label>
          {selectedRoute && (
            <span id="input-input-inline-item">
              {" "}
              <Link to={"/Routes/info/" + selectedRoute.uid}>
                {" "}
                {selectedRoute.name}{" "}
              </Link>{" "}
            </span>
          )}
          {!selectedRoute && (
            <span id="input-input-inline-item">
              {" "}
              <FontAwesomeIcon
                icon={faXmark}
                size="lg"
                style={{ color: "red" }}
                data-tip
                data-for="noInRangeStopTip"
              />{" "}
              No Route Assigned{" "}
            </span>
          )}
        </div>
      )}

      {!editable &&
        !(
          student &&
          student.inRangeStops &&
          student.inRangeStops.length !== 0
        ) && (
          <div>
            <label id="input-label-student"> Stops: </label>
            <span id="input-input-inline-item">
              {" "}
              <FontAwesomeIcon
                icon={faCircleExclamation}
                size="lg"
                style={{ color: "red" }}
                data-tip
                data-for="noInRangeStopTip"
              />{" "}
              No Stops In Range{" "}
            </span>
          </div>
        )}
      {editable && (
        <button
          className="submitbutton"
          type="button"
          onClick={(e) => {
            handleModifyStudent(e);
          }}
        >
          {" "}
          Submit{" "}
        </button>
      )}

      {student && student.inRangeStops && student.inRangeStops.length !== 0 && (
        <div
          style={{
            display: "flex",
            width: "90%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <RouteStops data={student.inRangeStops} />
        </div>
      )}
      <div></div>
    </div>
  );
};
