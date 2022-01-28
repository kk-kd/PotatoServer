import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useState, useMemo, useEffect} from "react";
import { Marker } from "../map/Marker";
import {registerUser} from "../api/axios_wrapper";
import { useNavigate } from "react-router-dom";

export const EditUser = () => {
  let navigate = useNavigate();

  // user
  const [ firstName, setFirstName ] = useState("");
  const [ middleName, setMiddleName ] = useState("");
  const [ lastName, setLastName ] = useState("");
  const [ userName, setUserName] = useState("");
  const [ password, setPassword] = useState("");
  const [ email, setEmail ] = useState("");
  const [ address, setAddress ] = useState("");
  const [ isAdmin, setisAdmin ] = useState(false);
  const [students, setStudents ] = useState([]);

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

  
  // TODO - API call integration 
  // const [data, setData] = useState([]);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const fetchedData = await getOneUser(id);
  //       console.log(fetchedData.data);
  //       setData(fetchedData.data);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  
  const data = useMemo(
    () => [
      {
        firstName: "Amy",
        middleName: "may", 
        lastName: "Calle",
        username: "username", 
        password: "password",
        email: "email", 
        address: 'example address',
        isAdmin: true, 
        students: [{name: "Student 1", id:'1'}, {name: "Student 2", id:"2"}], 
      }
    ]
  )
  useEffect (() => {
    setFirstName(data[0].firstName)
    setMiddleName(data[0].middleName)
    setLastName(data[0].lastName)
    setUserName(data[0].username)
    setPassword(data[0].password)
    setEmail(data[0].email)
    setAddress(data[0].address)
    setisAdmin(data[0].isAdmin)
    setStudents(data[0].students)
  }, [])


  async function handleModifyUser (e) {
    e.preventDefault(); // prevents page reload on submission
    let form_results = {
      email: email,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      address: address,
      isAdmin: isAdmin,
      username: userName,
      password: password,
    }
    console.log("Modifying User with entries:")
    console.log(form_results)
    try {
      let create_user_response = await registerUser(form_results).catch ((error) => {})
      let user_id = create_user_response.id
      let status = create_user_response.status
      
      if (status === 200) {
        navigate("/Users/info/" + user_id, { replace: true });
        throw alert ("User Successfully Modified.")
        // move to their user detail
      }
      if (status === 404) {
        throw alert ("Login Failed Because the Server was Not Reached.")
      } 
      else if (status === 401) {
        throw alert ("Login Failed Because User Already Exists")
    }
  } catch {
    // avoids warning
   }
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
      } else {
        setError("Server Error. Try again later");
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
        <h1>Edit User</h1>
        <div id = "user_create_form">
          <form onSubmit={handleModifyUser}>
          
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
            <p>Username:</p>
              <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
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
                  onChange={(e) => checkMap(e.target.value)} 
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
            
          <label className="input">
            <p>Students:</p>
              <input
                  type="text"
                  value={students}
                  onChange={(e) => setStudents(e.target.value)}
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
