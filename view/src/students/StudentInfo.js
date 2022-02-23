
// import GoogleMapReact from "google-map-react";
import "./StudentForm.css"
import React, { useEffect, useState, Fragment } from "react";
import { getAllStudents, updateStudent } from "../api/axios_wrapper";
import { Link, useNavigate, useParams} from "react-router-dom";
import { filterAllUsers, filterAllSchools, getOneUse, saveStudent, getOneStudent, deleteStudent } from "../api/axios_wrapper";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ReactSelect from "react-select";
import { useForm, Controller } from "react-hook-form";

// this page is the student detail and edit page
export const StudentInfo = ({edit}) => {

    const { id } = useParams();
    const [editable, setEditable] = useState(edit);
    const action_text = editable ? "Edit" : "View" 
    const { handleSubmit, register, reset, control, setValue } = useForm({
      });

    const [student, setStudent] = useState();
    const [user, setUser] = useState()
    const [userDefault, setUserDefault] = "";
    const [studentLoaded, setStudentLoaded] = useState(false);

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
        if (!student.firstName || !student.firstName.trim().length === 0) {
            return {valid: false, error: 'Student First Name Required'}
        }
        else if (!student.lastName || !student.lastName.trim().length === 0) {
            return {valid: false, error: 'Student Last Name Required'}
        }
        else if (student.studentid && !(Number(student.studentid) > 0)) {
          return {valid: false, error: "Student ID must be a positive number"}
        }
        if (!selectedSchool) {
          return {valid: false, error: 'Student must have a School'}
        }
        if (!user) {
          return {valid: false, error: 'Student Must have a User'}
        }

        return {valid: true, error: ''}
    }
       
    function handleModifyStudent(e) {
        e.preventDefault(); // prevents page reload on submission
        let valid_results = validate_student_entries();
        if (valid_results.valid) {
            let form_results = {
                firstName: student.firstName,
                middleName: student.middleName,
                lastName: student.lastName,
                route: selectedRoute,
                school: selectedSchool,
                parentUser: user,
                id: student.id
            }
            console.log(form_results)
            const a = modifyStudent(form_results);
        }
        else {
            alert(valid_results.error)
        }
      }

      const modifyStudent = async (form_results) => {
        try {
          let update_user_response = await updateStudent(id,form_results); 
          setEditable(false);
    
      } catch (error) {
          let message = error.response.data;
          throw alert (message);
      }
    }
    const handleDeleteStudent = (student_id, e) => {
        e.preventDefault();
    
        let sName = prompt("Do you want to delete?  If so, enter student's last name:");
        if (!sName) {
          return; 
        } else if (sName.toLowerCase().trim() !== student.lastName.toLowerCase().trim()) {
          alert("Entered Student Last Name Does Not Match."); 
          return;
        } else {
          const a = callDeleteStudentAPI(student_id);
        }  
    }

    const callDeleteStudentAPI = async (student_id) => {
        try {
          const resp = await deleteStudent(student_id);
          alert("User Delete Successful");
          navigate("/Students/list");
        } catch (error) {
          console.log(error);
          let message = error.response.data;
          throw alert(message);
        }
      }
    
    async function UpdateStudent (e) {
        let form_results = {
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          school: selectedSchool, 
          id: student.studentid,
          parentUser: user,
          route: selectedRoute
        }
        console.log(form_results)
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
            throw alert (message);
        }
    
        alert("Successfully Created Student");
        navigate('/Students/list');
      }

      //
      // const updateSelections = (studentData) => {
      //   console.log("updateSelections");
      //   console.log(studentData)
      //   console.log(studentData.parentUser)

      //   // setUserDefault(studentData.parentUser)

      //   // if (schoolData){
      //   //     setSelectedSchool(schoolData);
      //   //     setFilteredDataSchool([schoolData]);
      //   //     console.log(schoolData)
      //   // }
      //   if (studentData && studentData.parentUser) {
      //       console.log("setting student user")
      //       setUser(studentData.parentUser)
      //       setFilteredDataUser([{email: 'example'}])
      //       // setUser(studentData.parentUser)
      //       // setFilteredDataUser([studentData.parentUser])
      //       // console.log(studentData.parentUser)
      //   }
      // }

      // const updateStudentLoading = (data) => {
      //   console.log(data)
      //   setStudentLoaded(true);
      // }

      const fetchStudentData = async () => {
        try {
          const fetchedData = await getOneStudent(id);
          setStudent(fetchedData.data)

          if ([fetchedData.data][0].parentUser) {
              setUser(fetchedData.data.parentUser); 
          }
        
          if ([fetchedData.data][0].school) {
              setSelectedSchool([fetchedData.data][0].school);
          }
          if ([fetchedData.data][0].school && [fetchedData.data][0].school.route) {
              setSelectedRoute([fetchedData.data][0].school.route)
          }
          console.log(fetchedData.data)
          console.log(fetchedData.data.parentUser)
    

                        
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

    return <div id = 'student-content'>
        <ex > </ex>
       
       <h2 id = 'title'> {student ? student.firstName : ""}  {student ? student.lastName : ""}  </h2>
        <div>
          {!editable &&  
              <button onClick={e => {setEditable(true); setUser({email: 'ex'}); setFilteredDataUser([{email:'ex'}])}}> Edit Student </button>
          }
          {!editable && 
            <button onClick = {(e) => {handleDeleteStudent(id, e);}}>Delete Student </button>
          }
          {editable &&  
            <button onClick={e => setEditable(false)}> Cancel Edits </button>
          }
          {user && user.uid && <button style = {{width: 'auto'}} onClick = {(e) => {console.log(user.uid); navigate("/Users/info/" + user.uid);}}> View Parent </button>}
          {selectedSchool && <button style = {{width: 'auto'}} onClick = {(e) => {navigate("/Schools/info/" + selectedSchool.uid);}}> View School </button> }
          {selectedRoute && <button style = {{width: 'auto'}} onClick = {(e) => {navigate("/Routes/info/" + selectedRoute.uid);}}> View Route </button>}
          
        
        </div>

        <label id = 'input-label-student'> First Name: </label>      
        <input
            id = 'input-input-student'
            disabled = {!editable}
            type="text"
            maxLength="100"
            value={student ? student.firstName : ""}
            onChange={(e) => setStudent({...student, firstName : e.target.value})}
        />

        <label id = 'input-label-student'> Middle Name: </label>      
        <input
            id = 'input-input-student'
            disabled = {!editable}
            type="text"
            maxLength="100"
            value={student ? student.middleName : ""}
            onChange={(e) => setStudent({...student, middleName : e.target.value})}
        />

        <label id = 'input-label-student' > Last Name: </label>      
        <input
            id = 'input-input-student'
            disabled = {!editable}
            type="text"
            maxLength="100"
            value={student ? student.lastName :""}
            onChange={(e) => setStudent({...student, lastName : e.target.value})}
        /> 

        <label id = 'input-label-student' for = "lastName"> Student ID: </label>     
        <input 
            id = 'input-input-student'
            disabled = {!editable}
            type="text"
            maxLength="100"
            value={student ? student.studentid : ""}
            onChange={(e) => {setStudent({...student, studentid : e.target.value})}}
        />

    {!editable && <div>
    <label id = 'input-label-student' > School: </label>     
         <input 
            id = 'input-input-student-display'
            disabled = {true}
            type="text"
            maxLength="100"
            value={((student) && (student.school))  ? student.school.name : "None"}
            onChange = {(e) => {console.log(e)}}
        />
        </div>}

        
        {editable && <Autocomplete
            sx={{
                paddingTop: "20px",
                paddingBottom: "10px",  
                margin:'auto',
                marginRight: '23%',
                width: "40%",
              }}
            options={filteredDataSchool}
            freeSolo
            renderInput={params => (
                <TextField {...params} label="School"  variant="standard" 

                />
            )}
            getOptionLabel={option => option.name}
            
            noOptionsText = {"Type to Search"}
            value={selectedSchool}
            onInputChange = {(e, newInputValue, reason) => {
                if (reason === 'reset') {
                  
                  setSchoolFilter('')
                  return
                } else if (reason === 'input') {
                  setSchoolFilter(newInputValue);
                } 
              }}
            
            onChange={(_event, newSchool) => {
                console.log(newSchool)
                setSelectedSchool(newSchool);
            }}
        />
        }

        {!editable && <div>
          <label id = 'input-label-student' > Route: </label>     
          <input 
              id = 'input-input-student-display'
              disabled = {true}
              type="text"
              maxLength="100"
              value={((student) && (student.school) && (student.school.route) && (student.school.route.name))  ? student.school.route.name : "None"}
              onChange = {(e) => {console.log(e)}}
          />           
        </div>}


        {/* {editable && selectedSchool && 
            <Autocomplete
                options={selectedSchool.routes ? selectedSchool.routes : []}
                freeSolo
                disabled = {(editable && selectedSchool && (!selectedSchool.routes || selectedSchool.routes.length === 0))}
                sx={{
                    paddingTop: "20px",
                    paddingBottom: "10px",  
                    margin:'auto',
                    marginRight: '23%',
                    width: "40%",
                  }}
                renderInput={params => (
                    <TextField {...params} label=" Route " variant="standard"
                    />
                )}
                getOptionLabel={option => option.name}
                fullWidth= {true}
                noOptionsText = {"No Matching Routes"}
                value={selectedRoute}
                onInputChange = {(e, newInputValue, reason) => {
                   
                    if (reason === 'reset') {
                      
                      setRouteFilter('')
                      return
                    } else if (reason === 'input') {
                      setRouteFilter(newInputValue);
                    } 
                  }}
                
                onChange={(_event, newRoute) => {
                    console.log(newRoute)
                    setSelectedRoute(newRoute);
                }}
        />
        } */}
 
        {/* {((editable) && (selectedSchool) && (!selectedSchool.routes || selectedSchool.routes.length === 0)) && <div style = {{marginLeft: '38%', width: '40%'}}> This School has No Routes. You can create routes in the Routes tab.</div>}  */}

        <div> 

        {!editable && <div><label id = 'input-label-student' > Parent: </label>     
        <input 
            id = 'input-input-student-display'
            disabled = {true}
            type="text"
            maxLength="100"
            value={((student) && (student.parentUser) && (student.parentUser.email))  ? student.parentUser.email : "None"}
            onChange = {(e) => {console.log(e)}}
        /> </div>}
        

         {editable && <Autocomplete
            sx={{
                paddingTop: "20px",
                paddingBottom: "10px",  
                margin:'auto',
                marginRight: '23%',
                width: "40%",
              }}
            options= {filteredDataUser}
            
            freeSolo
            renderInput={params => (
                <TextField {...params} label="Parent" variant="standard" onInputChange = {(e, newInputValue, reason) => {
                    console.log("input change " + reason)
                    if (reason === 'reset') {
                      setUserFilter('')
                      return
                    } else if (reason === 'input') {
                      setUserFilter(newInputValue);
                    } 
                  }}
                />
            )}
            getOptionLabel={option => option.email}
                       
            noOptionsText = {"Type to Search"}
            value = {user}
           
            onInputChange = {(e, newInputValue, reason) => {
              console.log("input change " + reason)
              if (reason === 'reset') {
                setUserFilter('')
                return
              } else if (reason === 'input') {
                setUserFilter(newInputValue);
              } 
            }}
            
            onChange={(_event, newUser) => {
                
                console.log(newUser)
                setUser(newUser);
            }}
            
        />}
               
        </div>

        
        {editable && <button className = "submitbutton" type="button" onClick= {(e) => {handleModifyStudent(e)}}> Submit </button>}
    </div>
    }