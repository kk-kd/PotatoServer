import "./CreateSchool.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { saveSchool } from "./../api/axios_wrapper";

export const CreateSchool = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mapApi, setMapApi] = useState();
  const [lat, setLat] = useState();
  const [lng, setLng] = useState();
  const [showMap, setShowMap] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (mapApi && !validated) {
      searchLocation();
    }
  }, [mapApi]);
  useEffect(() => {
    setValidated(false);
  }, [address])
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627
    },
    zoom: 13
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length === 0) {
      alert("Please input a school name.");
    } else if (!address) {
      alert("Please input a valid address");
    } else if (!(validated && lat && lng)) {
      alert("Please press the validate address button to validate the entered address");
    } else {
      try {
        await saveSchool({
          name: name,
          address: address,
          latitude: lat,
          longitude: lng
        });
        alert("School succesfully created!");
        navigate("/Schools/list");
      } catch (e) {
        alert(e.response.data);
      }
    }
  }
  const searchLocation = () => {
    mapApi.geocoder.geocode( { 'address': address }, (results, status) => {
      if (status === "OK") {
        mapApi.map.setCenter(results[0].geometry.location);
        setLng(results[0].geometry.location.lng());
        setLat(results[0].geometry.location.lat());
        setError(null);
        setValidated(true);
      } else if (status === "ZERO_RESULTS") {
        setError("No results for that address");
      } else {
        setError("Server Error. Try again later");
      }
    });
  }
  const checkMap = () => {
    if (mapApi) {
      searchLocation();
    } else {
      setShowMap(true);
    }
  }
  const handleApiLoaded = (map, maps) => {
    const geocoder = new maps.Geocoder();
    setMapApi({
      map: map,
      maps: maps,
      geocoder: geocoder
    });
  }

  //TODO: replace address field with Google Maps API
  return (
    <div id = 'student-content'>
        <h2 id = "title">Create School</h2>
         
            <label id="input-label-student">School Name:
              <input
                  id = 'input-input-student'
                  type="text"
                  maxLength="100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label id='input-label-student'>Address:
              <input
                 id = 'input-input-student'
                  type="text"
                  maxLength="100"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
              />
              <button type="button" onClick={e => checkMap()}>Validate Address</button>
            </label>
          <button onClick = {e => onSubmit(e)} />
     
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
  );
}
