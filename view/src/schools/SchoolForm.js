import GoogleMapReact from "google-map-react";
import { useState } from "react";
import { Marker } from "../map/Marker";
import { useNavigate } from "react-router";


import {saveSchool} from "../api/axios_wrapper";



import * as React from 'react';


export const SchoolForm = () => {
    let navigate = useNavigate(); 

    const action_text = "Make New School" 

    const [school, setSchool] = useState({
      name: '', 
      address: '',
      arrivalTime: null,
      departureTime: null, 
    });

    const [addressValid, setAddressValid] = useState(false);

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


    const validate_entries = () => {
      if (!school.name || school.name.trim().length === 0){
          return {valid: false, error: 'School Name Required'}
      }
      else if (!school.address) {
        return {valid: false, error:"Please provide an address"}
      }
      else if (!addressValid) {
        return {valid: false, error: "Please Validate Address."}
      } else if (!school.arrivalTime) {
        return {valid: false, error: "Please provide an arrival time."}
      } else if (!school.departureTime) {
        return {valid: false, error: "Please provide a departure time."}
      }
      return {valid: true, error: ''}
  }
  

    const handleSchoolFormSubmit = (e) => {
      let valid_results = validate_entries();
      if (valid_results.valid) {
            CreateSchool(e);
      }
      else {
          alert(valid_results.error)
      }
  }

    async function CreateSchool (e) {
        e.preventDefault(); // prevents page reload on submission
        let message = ""
 
        try {
            await saveSchool({
            name: school.name,
            address: school.address,
            latitude: lat,
            longitude: lng, 
            arrivalTime: school.arrivalTime, 
            departureTime: school.departureTime
            });
            alert("School succesfully created!");
            navigate("/Schools/list");
        } catch (error) {
            message = error.response.data;
            alert (message);
        }
      }

    //maps
    const checkMap = (e) => {
        e.preventDefault();
        if (apiLoaded) {
          searchLocation()
        } 
    }
    const searchLocation = () => {
        mapApi.geocoder.geocode( { 'address': school.address }, (results, status) => {
          if (!school.address || school.address.trim().length === 0) {
            alert("Please Enter an Address"); 
            return;
          }
          if (status === "OK") {
            mapApi.map.setCenter(results[0].geometry.location);
            setLng(results[0].geometry.location.lng());
            setLat(results[0].geometry.location.lat());
            setError(null);
            setSchool({...school, address : school.address});
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

    return <div id="content"> 
 
        <h2 id = 'title'>  {action_text} </h2>
        
        <div id = "main_form">
              
        <h5 id = "sub-header"> Information </h5>

          <label id = 'label-user'> School Name </label> 
          <input
              id = "input-user"
              type="text"
              maxLength="100"
              value={school.name}
              onChange={(e) => setSchool({...school, name : e.target.value})}
          />
         
          <label  id = 'label-user'> Address {addressValid} </label>
          <input
              id = "input-user"
              maxLength="100"
              type="text"
              value={school.address}
              onChange={(e) => {setSchool({...school, address: e.target.value}); setAddressValid(false); }} 
          />


          <label id='label-user'> Arrival Time:  </label>
            <input
                id = 'input-user'
                type="time"
                value={school.arrivalTime}
                onChange={e => {setSchool({...school, arrivalTime: e.target.value});}} 
                required
            />
         
          <label id='label-user'> Departure Time: </label>
            <input
                id = 'input-user'
                type="time"
                value={school.departureTime}
                onChange={e => {setSchool({...school, departureTime: e.target.value});}} 
                required
            />
          
          

          <p> </p>
         
        
        <div>
          <button style = {{display: 'in-line block', margin: '20px'}} onClick = {(e) => checkMap(e)}> {addressValid ? "Address Valid!": "Validate Address" } </button>  
          <button style = {{display: 'in-line block', margin: '20px'}} className = "button" onClick = {(e) => {handleSchoolFormSubmit(e)}} type="button"> Make School </button>
        </div> 
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
                    isSchool
                />
                </GoogleMapReact>
             </div>
        </div>
    
    </div>

}