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
  }, [address]);
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627,
    },
    zoom: 13,
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length === 0) {
      alert("Please input a school name.");
    } else if (!address) {
      alert("Please input a valid address");
    } else if (!(validated && lat && lng)) {
      alert(
        "Please press the validate address button to validate the entered address"
      );
    } else {
      try {
        await saveSchool({
          name: name,
          address: address,
          latitude: lat,
          longitude: lng,
        });
        alert("School succesfully created!");
        navigate("/Schools/list");
      } catch (e) {
        alert(e.response.data);
      }
    }
  };
  const searchLocation = () => {
    mapApi.geocoder.geocode({ address: address }, (results, status) => {
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
  };
  const checkMap = () => {
    if (mapApi) {
      searchLocation();
    } else {
      setShowMap(true);
    }
  };
  const handleApiLoaded = (map, maps) => {
    const geocoder = new maps.Geocoder();
    setMapApi({
      map: map,
      maps: maps,
      geocoder: geocoder,
    });
  };

  //TODO: replace address field with Google Maps API
  return (
    <div>
      <h1>Create School</h1>
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="test-centering">
          <div class="mb-3">
            <label for="schoolNameInput" class="form-label">
              School Name
            </label>
            <input
              type="text"
              maxLength="100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              class="form-control"
              id="schoolNameInput"
              aria-describedby="schoolHelp"
              style={{ maxWidth: "16em" }}
            />
            <div id="schoolHelp" class="form-text">
              This name cannot match another school's name!
            </div>
          </div>
          <div class="mb-3">
            <label for="schoolAddressInput" class="form-label" id="schoolInput">
              Address
              <input
                type="text"
                maxLength="100"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                class="form-control"
                id="schoolAddressInput"
                aria-describedby="addressHelp"
              />
              <div id="addressHelp" class="form-text">
                Before submitting, to confirm address, click the validate button
                and visualize your location on the map.
              </div>
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={(e) => checkMap()}
              >
                Validate Address
              </button>
            </label>
          </div>
          <button type="submit" class="btn btn-primary" value="submit">
            Submit
          </button>
        </div>
      </form>
      {error && <div>{error}</div>}
      {showMap && (
        <div style={{ height: "50vh", width: "50%", display: "inline-block" }}>
          <GoogleMapReact
            bootstrapURLKeys={{
              key: `${process.env.REACT_APP_GOOGLE_MAPS_API}`,
            }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
          >
            <Marker text="You're Address" lat={lat} lng={lng} />
          </GoogleMapReact>
        </div>
      )}
    </div>
  );
};
