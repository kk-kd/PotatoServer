import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { deleteSchool, getOneSchool, updateSchool } from "./../api/axios_wrapper";
import { SchoolStudents } from "./SchoolStudents";
import { SchoolRoutes } from "./SchoolRoutes";

export const SchoolInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [addressChanged, setAddressChanged] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [school, setSchool] = useState();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mapApi, setMapApi] = useState();
  const [lat, setLat] = useState();
  const [lng, setLng] = useState();
  const [showMap, setShowMap] = useState(false);
  const [validated, setValidated] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (mapApi && !validated) {
      searchLocation();
    }
  }, [mapApi]);
  useEffect(() => {
    if (addressChanged) {
      setValidated(false);
    } else if (school) {
      setAddressChanged(true);
    }
  }, [address]);
  useEffect(() => {
    const getSchool = async () => {
      try {
        const schoolData = await getOneSchool(id);
        setSchool(schoolData.data);
        setAddress(schoolData.data.address);
        setName(schoolData.data.name);
        setLat(schoolData.data.latitude);
        setLng(schoolData.data.longitude);
        setStudents(schoolData.data.students);
        setRoutes(schoolData.data.routes);
      } catch (e) {
        alert(e.response.data);
      }
    }
    getSchool();
  }, []);
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
        await updateSchool(school.uid, {...school,
          name: name,
          address: address,
          latitude: lat,
          longitude: lng
        });
        alert("Succesfully edit school.");
        navigate("/Schools/list")
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
        console.log(status)
      } else {
        setError("Server Error. Try again later");
        console.log(status)
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
  const deleteSch = async () => {
    try {
      await deleteSchool(id);
      alert("School was succesfully deleted");
      navigate("/Schools/list")
    } catch (e) {
      alert(e.response.data);
    }
  }
  if (isDelete) {
    let sName = prompt("Do you want to delete?  If so, enter school name:");
    if (!sName || sName.toLowerCase() !== school.name.toLowerCase()) {
      setIsDelete(false);
    } else {
      deleteSch();
    }
  }

  //TODO: replace address field with Google Maps API
  return (
      <div>
        <h1>School Info</h1>
        <div>
          <button onClick={e => setIsEdit(true)}>Edit School</button>
          <button onClick={e => setIsDelete(true)}>Delete School</button>
          <button onClick={e => navigate(`/Routes/planner/${id}`)}>Route Planner</button>
          <button onClick={e => navigate(`/Emails/send/${id}`)}>Send Email Announcement</button>
        </div>
        <form onSubmit={e => onSubmit(e)}>
          <label id="schoolInput">School Name:
            <input
                type="text"
                maxLength="100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEdit}
            />
          </label>
          <label id="schoolInput">Adress:
            <input
                type="text"
                maxLength="100"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                readOnly={!isEdit}
            />
            {isEdit && <button type="button" onClick={e => checkMap()}>Validate Address</button>}
          </label>
          {isEdit && <input type="submit" value="submit" />}
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
        <SchoolStudents data={students} />
        <SchoolRoutes data={routes} />
      </div>
  );
}
