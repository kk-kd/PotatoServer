import "./CreateUser.css";
import GoogleMapReact from "google-map-react";
import { useState } from "react";
import { Marker } from "./../map/Marker";

export const CreateUser = () => {
  const [ address, setAddress ] = useState("");
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
  const searchLocation = () => {
    geocoder.geocode( { 'address': address }, (results, status) => {
      if (status === "OK") {
        map.setCenter(results[0].geometry.location);
        setLng(results[0].geometry.location.lng());
        setLat(results[0].geometry.location.lat());
        setError(null);
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
      <div id="user_create">
        <h1>Create User</h1>
        <form onSubmit={checkMap}>
          <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
          />
          <input
              type="submit"
              value="Confirm Address"
          />
        </form>
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
