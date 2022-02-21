import "./EmailForm.css"
import { useEffect, useState, Fragment } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  filterAllRoutes,
  filterAllSchools,
  sendGeneralAnnouncementToUsersFromSchool,
  sendGeneralAnnouncementToUsersOnRoute,
  sendRouteAnnouncementToAll, 
  sendGeneralAnnouncementToAll,
  getOneSchool, 
  getOneRoute
} from "../api/axios_wrapper";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { FormControl, InputLabel, Select, MenuItem, CustomSelect, StyledOption} from "@mui/material";



export const EmailForm = () => {
  const {schoolid, routeid} = useParams()
  const action_text = "Send Email";
  const [schoolLoading, setSchoolLoading] = useState(true);

  const [emailType, setEmailType] = useState("");

  const [message, setMessage] = useState({}); // keys = subject, body
  const [includeRouteInfo, setIncludeRouteInfo] = useState(false);

  // school filter
  const [filteredDataSchool, setFilteredDataSchool] = useState([]);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [selectedSchool, setSelectedSchool] = useState();

  // route filter
  const [filteredDataRoute, setFilteredDataRoute] = useState([]);
  const [routeFilter, setRouteFilter] = useState("");
  const [selectedRoute, setSelectedRoute] = useState();

  const resetState = () => {
    setEmailType('');
    setMessage({subject: '', body: ''});
    setIncludeRouteInfo(false);
    setFilteredDataSchool([]);
    setSchoolFilter("");
    setSelectedSchool();
    setFilteredDataRoute([]);
    setRouteFilter("");
    setSelectedRoute();
    return 1;
  }

  const validate_entries = () => {
    if (!emailType) {
      return { valid: false, error: "Please Select A Receipient Group" };
    }
    if (!message.subject || !message.body) {
      return { valid: false, error: "Subject and Body Required" };
    }
    else if (emailType == "school" && !selectedSchool) {
      return { valid: false, error: "Please Select a School or Change Sender Type" };
    }
    else if (emailType == "route" && !selectedRoute) {
      return { valid: false, error: "Please Select a Route or Change Sender Type" };
    }
    return { valid: true, error: "" };
  };

  const handleEmailFormSubmit = (e) => {
    let valid_results = validate_entries();
    if (valid_results.valid) {
      SendEmail(e);
    } else {
      alert(valid_results.error);
    }
  };

  async function SendEmail(e) {
    let form_results = {
      subject: message.subject,
      html: `<p> ${message.body}</p>`,
    };
    console.log(emailType);

    try {
      if (emailType === "school") {
        let id = selectedSchool.uid;
        console.log(id);
        console.log(form_results);
        if (includeRouteInfo) {
          console.log("route annoucement to users from school")
          // sendRouteAnnouncementToUsersFromSchool({
          //   message: form_results,
          //   schoolId: id,
          // });
        }
        else {
          console.log("general annoucement to users from school")
          // sendGeneralAnnouncementToUsersFromSchool({
          //   message: form_results,
          //   schoolId: id,
          // });
        }
      } else if (emailType === "route") {
        let id = selectedRoute.uid;
        console.log(id);
        console.log(form_results);
        if (includeRouteInfo) {
          console.log("route annoucement to users on route")
          // sendRouteAnnouncementToUsersOnRoute({
          //   message: form_results,
          //   routeId: id,
          // });
        }
        else {
          console.log("general annoucement to users on route")
          // sendGeneralAnnouncementToUsersOnRoute({
          //   message: form_results,
          //   routeId: id,
          // });
        }
      } else {
        console.log(form_results);
        if (includeRouteInfo) {
          console.log("route annoucement to all users")
          //sendRouteAnnouncementToAll({ message: form_results });
        }
        else {
          console.log("general annoucement to all ")
          //sendGeneralAnnouncementToAll({ message: form_results });
        }
      }
    } catch (error) {
      let message = error.response.data;
      throw alert(message);
    }
    alert("Successfully Sent Email");
    resetState();
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
    const fetchFilteredDataRoute = async () => {
      try {
        const fetchedData = await filterAllRoutes({
          page: 0,
          size: 10,
          sort: "name",
          sortDir: "ASC",
          filterType: "",
          filterData: routeFilter,
        });
        setFilteredDataRoute(fetchedData.data.routes);
        console.log(fetchedData.data);
      } catch (error) {
        alert(error.response.data);
      }
    };
    if (routeFilter) {
      fetchFilteredDataRoute();
    }
  }, [routeFilter]);

  useEffect(() => {
    setSelectedSchool()
    setFilteredDataSchool([])
    setSchoolFilter("")
    setSelectedRoute()
    setFilteredDataRoute([])
    setRouteFilter("")

  }, [emailType]);


  const callGetSchool = async () => {
    try {
      const schoolData = await getOneSchool(schoolid);
      const newSchool = schoolData.data
      setFilteredDataSchool([newSchool]); 
      setSelectedSchool(newSchool);
         
      return; 
    } catch (e) {
      console.log(e)
    }
  }

  const callGetRoute = async () => {
    try {
      const routeData = await getOneRoute(routeid);
      const newRoute= routeData.data
      setFilteredDataRoute([newRoute]); 
      setSelectedRoute(newRoute);
          return; 
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (schoolid) {
      setEmailType("school"); 
      try {
        const a = callGetSchool();   
      }
      catch (e) {
        console.log(e)
      }

    }
    else if (routeid) {
      setEmailType("route")
      try {
        const a = callGetRoute();   
      }
      catch (e) {
        console.log(e)
      }
    }
  }, []);

  return (
    <div id="content">
      <h1 id = 'title'> {action_text} </h1>
      <p> </p>
      <p>  </p>
      <p> </p>
  
        <label id="input-label" >
            {" "}
            Send Email To:{"     "} 
        </label>
        <FormControl  style={{minWidth: "10%"}} id = 'input-input' variant = "standard"> 
        <Select value = {emailType} onChange={(e) => {setEmailType(e.target.value);}}  >
            <MenuItem value={"all"}> All Parents </MenuItem>
            <MenuItem value={"school"}>Parents of a Given School </MenuItem>
            <MenuItem value={"route"}>Parents of a Given Route</MenuItem>
        </Select>
                
        </FormControl> 

      {emailType == "school" && (
        <Autocomplete
          sx={{
            paddingTop: "15px",
            paddingBottom: "10px",
            paddingRight: "7%",
            maxWidth: "37%",
            marginLeft: '52%'
          }}
          options={filteredDataSchool}
          freeSolo
          renderInput={(params) => (
            <TextField {...params} label="School" variant="standard" />
          )}
          getOptionLabel={(option) => option.name}
          
          value={selectedSchool}
          onInputChange = {(e, newInputValue, reason) => {
            console.log(reason)
            if (reason === 'reset') {
              
              setSchoolFilter('')
              return
            } else if (reason === 'input') {
              setSchoolFilter(newInputValue);
            } 
          }}
        
          onChange={(_event, newSchool) => {
            console.log("on change")
            console.log(newSchool);
            setSelectedSchool(newSchool);
          }}
        />
      )}

      {emailType == "route" && (
        <Autocomplete
          options={filteredDataRoute}
          freeSolo
          sx={{
            paddingTop: "15px",
            paddingBottom: "10px",
            paddingRight: "7%",
            maxWidth: "37%",
            // margin: "auto",
            marginLeft: '52%'
          }}
          renderInput={(params) => (
            <TextField {...params} label=" Route " variant="standard" />
          )}
          getOptionLabel={(option) => option.name}
          fullWidth={true}
          noOptionsText={"Type to Search"}
          value={selectedRoute}
          onInputChange={(e) => {
            setRouteFilter(e.target.value);
          }}
          onChange={(_event, newRoute) => {
            console.log(newRoute);
            setSelectedRoute(newRoute);
          }}
        />
      )}
      <p> </p>
      <p> </p>
      <p> </p>
      
      <label id="input-label" > Include Student Route Information  </label>
        <input
            id  = "input-check"
            style ={{paddingLeft: '10%'}}
            type="checkbox"
            checked ={includeRouteInfo}
            onInput={(e) => setIncludeRouteInfo(!includeRouteInfo)}
       />

      <p> </p>
      <p> </p>
      <label id="input-label" for="n">
        {" "}
        Subject Line:{" "}
      </label>
      <input
        id="input-input"
        type="text"
        maxLength="100"
        value={message.subject}
        onChange={(e) => setMessage({ ...message, subject: e.target.value })}
      />
      <p> </p>
      <p> </p>
      <span> <hr style = {{marginLeft: '2'}}></hr></span>

      <p  id = "label-2">
        {" "}
        Email Body:{" "}
      </p>
      <textarea
        style = {{width: "60%", margin: 'auto', display: 'flex'}}
      
        value={message.body}
        onChange={(e) => setMessage({ ...message, body: e.target.value })}
      />
      <p> </p>
      <p> </p>
      <button
        id="submitbutton"
        type="button"
        onClick={(e) => {
          handleEmailFormSubmit(e);
        }}
      >
       
        {action_text}
      </button>
    </div>
  );
};
