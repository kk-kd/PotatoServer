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
  const [arrivalTime, setArrivalTime] = useState();
  const [departureTime, setDepartureTime] = useState();
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
    } else if (!arrivalTime) {
      alert("Please input an arrival time for the school.")
    } else if (!departureTime) {
      alert("Please input a departure time for the school.")
    } else {
      try {
        await saveSchool({
          name: name,
          address: address,
          latitude: lat,
          longitude: lng,
          arrivalTime: arrivalTime,
          departureTime: departureTime
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
  const handleApiLoaded = async (map, maps) => {
    const geocoder = await new maps.Geocoder();
    setMapApi({
      map: map,
      maps: maps,
      geocoder: geocoder
    });
  }

  //TODO: replace address field with Google Maps API
  return (
      <div>
        <h1>Create School</h1>
          <form onSubmit={e => onSubmit(e)}>
            <div id="schoolCreateForm">
              <div id="schoolCreateNameInput">
                <label>School Name:
                  <input
                      type="text"
                      maxLength="100"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                  />
                </label>
              </div>
              <div id="schoolCreateAddressInput">
                <label>Adress:
                  <input
                      type="text"
                      maxLength="100"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setValidated(false);
                      }}
                      required
                  />
                  <button type="button" onClick={e => checkMap()}>{validated ? "Valid Address" : "Validate Address"}</button>
                </label>
              </div>
              <div id="schoolCreateTimeInput">
                <label>Arrival Time:
                  <input
                      type="time"
                      value={arrivalTime}
                      onChange={e => setArrivalTime(e.target.value)}
                      required
                  />
                </label>
              </div>
              <div id="schoolCreateTimeInput">
                <label >Departure Time:
                  <input
                      type="time"
                      value={departureTime}
                      onChange={e => setDepartureTime(e.target.value)}
                      required
                  />
                </label>
              </div>
            </div>
          <input type="submit" value="submit" />
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
                isSchool
            />
          </GoogleMapReact>
        </div>)}
      </div>
  );
}
