
import { useEffect, useState, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { filterAllRoutes, filterAllSchools, getOneUse, saveStudent, sendEmailToAll, sendEmailToUsersFromSchool, sendEmailToUsersOnRoute } from "../api/axios_wrapper";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Radio } from "@mui/material";
import { FormControlLabel } from "@mui/material";
import {FormControl}  from "@mui/material";
import { FormLabel } from "@mui/material";
import { RadioGroup } from "@mui/material";

export const EmailForm = () => {

    const action_text = "Send Email" 
    const [emailType, setEmailType] = useState("");

    const [message, setMessage] = useState("");
    

    // school filter
    const [filteredDataSchool, setFilteredDataSchool] = useState([]);
    const [schoolFilter, setSchoolFilter] = useState("");
    const [selectedSchool, setSelectedSchool] = useState();

    // route filter
    const [filteredDataRoute, setFilteredDataRoute] = useState([]);
    const [routeFilter, setRouteFilter] = useState("");
    const [selectedRoute, setSelectedRoute] = useState();
    
    let navigate = useNavigate(); 

    const validate_entries = () => {
        if (!message){
            return {valid: false, error: 'Message Required'}
        }
        return {valid: true, error: ''}
    }
    
    const handleEmailFormSubmit = (e) => {
      console.log("submitting!")
        let valid_results = validate_entries();
        if (valid_results.valid) {
            SendEmail(e);
        }
        else {
            alert(valid_results.error)
        }

    }
    
    async function SendEmail (e) {
        let form_results = {
          message: message,
        }
        console.log(emailType)
        
        try {
            if (emailType == "school") {
            form_results["school"] = selectedSchool;
            console.log(form_results)
            sendEmailToUsersFromSchool(form_results)

            }
            else if (emailType == "route") {
                form_results["route"] = selectedRoute;
                console.log(form_results)
                sendEmailToUsersOnRoute(form_results)
            }
            else {
                console.log(form_results)
                sendEmailToAll(form_results)
            }
        }
        catch (error) {
            let message = error.response.data;
            throw alert (message);
        }

    
        alert("Successfully Sent Email");
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
        const fetchFilteredDataRoute = async () => {
          try {
            const fetchedData = await filterAllRoutes({
              page: 0,
              size: 10,
              sort: 'name',
              sortDir: "ASC",
              filterType: '',
              filterData: routeFilter
            });
            setFilteredDataRoute(fetchedData.data.routes);
            console.log(fetchedData.data)
       
          } catch (error) {
            alert(error.response.data);
          }
        }
        if (routeFilter) {
          fetchFilteredDataRoute();
        }
      
      }, [routeFilter])

    return <div id = 'content'>
     
         <h1> {action_text} </h1>

        <div>

        <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">Email Announcment Type</FormLabel>
        <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="female"
            name="radio-buttons-group"
            value={emailType}
            onChange={(e) => {setEmailType(e.target.value)}}
        >
            <FormControlLabel value="all" control={<Radio />} label="All" />
            <FormControlLabel value="route" control={<Radio />} label="Route" />
            <FormControlLabel value="school" control={<Radio />} label="School" />
        </RadioGroup>
        </FormControl>
        </div>

        <p> </p> 
        <p> </p> 
        <label id = 'input-label' for = "firstName"> Email Message: </label>  
        <p> </p>    
        <textarea
            id = 'input-input'
            type="text"
            maxLength="100"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
        />



        {(emailType == "school") && <Autocomplete
            sx = {{paddingTop: '15px', paddingBottom: '10px',  paddingRight: '7%', maxWidth: '50%', margin: 'auto'}}
            options={filteredDataSchool}
            freeSolo
            renderInput={params => (
                <TextField {...params} label="Select A School"  variant="standard" 

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
        }

        {(emailType == "route") && 
            <Autocomplete
                options={filteredDataRoute}
                freeSolo
                sx = {{paddingTop: '15px', paddingBottom: '10px',  paddingRight: '7%', maxWidth: '50%', margin: 'auto'}}
                renderInput={params => (
                    <TextField {...params} label=" Select Route " variant="standard"
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



       
                
        </div>

        
        <button className = "submitbutton" type="button" onClick= {(e) => {handleEmailFormSubmit(e)}}> {action_text} </button>
    </div>
    }