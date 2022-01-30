import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useState } from "react";
import { Marker } from "./../map/Marker";
import {registerUser} from "../api/axios_wrapper";
import { useNavigate } from "react-router-dom";

export const CreateUser = () => {
  let navigate = useNavigate();

  // user
  const [ firstName, setFirstName ] = useState("");
  const [ middleName, setMiddleName ] = useState("");
  const [ lastName, setLastName ] = useState("");
  const [ password, setPassword] = useState("");
  const [ email, setEmail ] = useState("");
  const [ address, setAddress ] = useState("");
  const [ isAdmin, setisAdmin ] = useState(false);

  // maps
  const [ showMap, setShowMap ] = useState(false);
  const [ lat, setLat ] = useState();
  const [ lng, setLng ] = useState();
  const [ map, setMap ] = useState();
  const [ apiLoaded, setApiLoaded ] = useState(false);
  const [ geocoder, setGeocoder ] = useState();
  const [ error, setError ] = useState(null);
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627
    },
    zoom: 13
  };

  async function handleCreateUser (e) {
    e.preventDefault(); // prevents page reload on submission
    //checkMap(address)
   
    let form_results = {
      email: email,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      address: address,
      isAdmin: isAdmin,
      password: password,
    }
    console.log("Creating User with entries:")
    console.log(form_results)
    try {
      let create_user_response = await registerUser(form_results).catch ((error) => {
        let message = error.response.data;
        throw alert (message);
      });
    } catch {}
  }

  const searchLocation = () => {
    geocoder.geocode( { 'address': address }, (results, status) => {
      if (status === "OK") {
        map.setCenter(results[0].geometry.location);
        setLng(results[0].geometry.location.lng());
        setLat(results[0].geometry.location.lat());
        setError(null);
        setAddress(address);
      } else if (status === "ZERO_RESULTS") {
        setError("No results for that address");
        console.log(status)
      } else {
        setError("Server Error. Try again later");
        console.log(status)
      }
    });
  }
  const handleApiLoaded = (map, maps) => {
    const geocoder = new maps.Geocoder();
    setGeocoder(geocoder);
    setMap(map);
    setApiLoaded(true);
    searchLocation();
  }
  const checkMap = (e) => {
    e.preventDefault();
    if (apiLoaded) {
      searchLocation()
    } else {
      setShowMap(true);
    }
  }

  return (
    <div>
        <h1>Create User</h1>
        <div id = "user_create_form">
          <form onSubmit={handleCreateUser}>
          
          <label className="input">
            <p>First Name:</p>
              <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
              />
          </label>
            
          <label className="input">
            <p>Middle Name:</p>
              <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
              />
          </label>
            
          <label className="input">
            <p>Last Name:</p>
              <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
              />
          </label>
          <label className="input">
            <p>Email:</p>
              <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
          </label>

          <label className="input">
            <p>Password:</p>
              <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
          </label>
            
          <label className="input">
            <p>Address:</p>
              <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)} 
              />
            <p> {error}</p>
          </label>

          <label className="input">
            <p>Admin:</p>
              <input
                  type="checkbox"
                  value={isAdmin}
                  onChange={(e) => setisAdmin(e.target.value)}
              />
          </label>
      
            <div>
              <button className = "submitbutton" type="submit">Submit</button>
            </div>
          </form>
          </div>
        <div id="user_create_map">
          <h3> Map </h3>
          {error && (<div>{error}</div>)}
          {showMap && (<div style={{ height: '50vh', width: '50%', display: "inline-block" }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_MAPS_API}` }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
            >
              <Marker
                  text="You're Address"
                  lat={lat}
                  lng={lng}
              />
            </GoogleMapReact>
          </div>)}
        </div>
    </div>
  );
}
