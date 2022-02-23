import "./SchoolInfo.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { deleteSchool, getOneSchool, updateSchool, saveRoute } from "./../api/axios_wrapper";
import {
  addDriveTime,
  subtractDriveTime,
  findNewPickupTime,
  findNewDropOffTime
} from "./../api/time";
import { SchoolStudents } from "./SchoolStudents";
import { SchoolRoutes } from "./SchoolRoutes";

export const SchoolInfo = ({edit}) => {
  const [editable, setEditable] = useState(edit);
  const [addressValid, setAddressValid] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [school, setSchool] = useState();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [arrivalTime, setArrivalTime] = useState("00:00");
  const [departureTime, setDepartureTime] = useState("00:00");
  const [mapApi, setMapApi] = useState();
  const [lat, setLat] = useState();
  const [lng, setLng] = useState();
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState(false);
  

  const fetchSchoolData = async () => {
    try {
      const schoolData = await getOneSchool(id);
      console.log(schoolData);
      setSchool(schoolData.data);
      setAddress(schoolData.data.address);
      setName(schoolData.data.name);
      setLat(schoolData.data.latitude);
      setLng(schoolData.data.longitude);
      setStudents(schoolData.data.students);
      setRoutes(schoolData.data.routes.map(route =>
          ({...route, stops: route.stops.map(stop =>
                ({...stop, arrivalIndex: parseInt(stop.arrivalIndex)}))})));
      setArrivalTime(schoolData.data.arrivalTime);
      setDepartureTime(schoolData.data.departureTime);
      setLoading(false);
    } catch (e) {
      alert(e.response.data);
    }
  };
  
  // load data on page load
  useEffect(() => {
    fetchSchoolData();
  }, []);

  
  useEffect(() => {
    if (mapApi && !addressValid) {
      searchLocation();
    }
  }, [mapApi]);

  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627,
    },
    zoom: 13,
  };
  const handleSchoolFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length === 0) {
      alert("Please input a school name.");
    } else if (!address) {
      alert("Please input a valid address");
    } else if (!(addressValid && lat && lng)) {
      alert(
        "Please press the validate address button to validate the entered address"
      );
    } else {
      try {
        await updateSchool(school.uid, {
          ...school,
          name: name,
          address: address,
          latitude: lat,
          longitude: lng,
          arrivalTime: arrivalTime,
          departureTime: departureTime
        });
        for (var i = 0; i < routes.length; i++) {
          await saveRoute(routes[i]);
        }
        alert("School Succesfully Updated");
        setEditable(false);
        fetchSchoolData();
      } catch (e) {
        alert(e.response.data);
      }
    }
  }

  const calculateRoutes = async (newLat, newLng) => {
    try {
      console.log(routes);
      const newRoutes = routes;
      for (var selectedRoute = 0; selectedRoute < routes.length; selectedRoute++) {
        const sorted = [...routes[selectedRoute].stops.slice(0).sort(
            (a, b) => b.arrivalIndex - a.arrivalIndex)];
        var newPolylinesEncoded = [];
        for (var j = 0; j < sorted.length / 26; j++) {
          const request = {
            origin: {
              lat: j === 0 ? newLat : parseFloat(
                  sorted[j * 26 - 1].latitude),
              lng: j === 0 ? newLng : parseFloat(
                  sorted[j * 26 - 1].longitude),
            },
            destination: {
              lat: parseFloat(
                  sorted[Math.min(sorted.length - 1, j * 26 + 25)].latitude),
              lng: parseFloat(
                  sorted[Math.min(sorted.length - 1, j * 26 + 25)].longitude)
            },
            travelMode: 'DRIVING',
            waypoints: sorted.filter(
                (stop, index) => index >= j * 26 && index < Math.min(
                    sorted.length - 1, j * 26 + 25)).map(stop => ({
              location: {
                lat: parseFloat(stop.latitude),
                lng: parseFloat(stop.longitude)
              }
            }))
          };
          const result = await mapApi.directionsService.route(request);
          console.log(result);
          if (result.status === "OK") {
            newPolylinesEncoded = [...newPolylinesEncoded,
              result.routes[0].overview_polyline];
            const len = result.routes[0].legs.length;
            for (var i = 0; i < result.routes[0].legs.length; i++) {
              if (i === 0 && j === 0) {
                sorted[0].pickupTime =
                    subtractDriveTime(arrivalTime,
                        Math.trunc(
                            result.routes[0].legs[0].duration.value / 60));
                sorted[0].dropoffTime =
                    addDriveTime(departureTime,
                        Math.trunc(
                            result.routes[0].legs[0].duration.value / 60));
              } else {
                sorted[j * 26 + i].pickupTime =
                    subtractDriveTime(sorted[j * 26 + i - 1].pickupTime,
                        Math.trunc(
                            result.routes[0].legs[i].duration.value / 60));
                sorted[j * 26 + i].dropoffTime =
                    addDriveTime(sorted[j * 26 + i - 1].dropoffTime,
                        Math.trunc(
                            result.routes[0].legs[i].duration.value / 60));
              }
            }
          } else {
            alert(result.status);
            return;
          }
        }
        newRoutes[selectedRoute].stops = sorted;
        newRoutes[selectedRoute].polyline = newPolylinesEncoded;
      }
      console.log(newRoutes);
      setRoutes(newRoutes);
    } catch (e) {
      alert(e);
    }
  }
  const searchLocation = async () => {
    mapApi.geocoder.geocode( { 'address': address }, async (results, status) => {
      if (status === "OK") {
        mapApi.map.setCenter(results[0].geometry.location);
        setLng(results[0].geometry.location.lng());
        setLat(results[0].geometry.location.lat());
        await calculateRoutes(results[0].geometry.location.lat(), results[0].geometry.location.lng());
        setError(null);
        setAddressValid(true);
      } else if (status === "ZERO_RESULTS") {
        setError("No results for that address");
        console.log(status);
      } else {
        setError("Server Error. Try again later");
        console.log(status);
      }
    });
  };
  const checkMap = () => {
    if (mapApi) {
      searchLocation();
    } else if (!addressValid) {
      setShowMap(true);
    }
  }
  const handleApiLoaded = async (map, maps) => {
    const geocoder = await new maps.Geocoder();
    const directionsService = await new maps.DirectionsService();
    setMapApi({
      map: map,
      maps: maps,
      geocoder: geocoder,
      directionsService: directionsService
    });
  };
  const deleteSch = async () => {
    try {
      await deleteSchool(id);
      alert("School was succesfully deleted");
      navigate("/Schools/list");
    } catch (e) {
      alert(e.response.data);
    }
  };
  if (isDelete) {
    let sName = prompt("Do you want to delete?  If so, enter school name:");
    if (!sName || sName.toLowerCase() !== school.name.toLowerCase()) {
      setIsDelete(false);
    } else {
      deleteSch();
    }
  }

  if (loading) {
    return <h1>Loading.</h1>
  }

  return (
    <div id="content"> 
      <h2 id = 'title'> {school.name}</h2>
        <div>
          {!editable &&  
              <button onClick={e => setEditable(true)}> Edit School </button>
          }
          {editable &&  
            <button onClick={e => setEditable(false)}> Cancel Edits </button>
          }
          {!editable && <button onClick = {(e) => {setIsDelete(true);}}>Delete School</button>}
          <button onClick={(e) => navigate(`/Routes/planner/${id}`)}> Route Planner </button>
          <button onClick={(e) => navigate(`/Emails/send/${id}`)}> Send Announcement</button>
          
        </div>

        <div id = "top-half-wrapper">
            <div id = "main_form">
                <h5 id = "sub-header"> Information </h5>
            
                <label id = 'label-user'> School Name </label> 
                <input
                    disabled = {!editable}
                    id = "input-user"
                    type="text"
                    maxLength="100"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                
                <label  id = 'label-user'> Address {addressValid} </label>
                <input
                    disabled = {!editable}
                    id = "input-user"
                    maxLength="100"
                    type="text"
                    value={address}
                    onChange={(e) => {setAddress(e.target.value); setAddressValid(false); }} 
                />

                <label id='label-user'> Arrival Time:  </label>
                <input
                    type="time"
                    id = "input-user"
                    value={arrivalTime}
                    onChange={e => {
                      setArrivalTime(e.target.value);
                      setRoutes(routes.map(route => ({...route,
                          stops: route.stops.map(stop => ({...stop,
                          pickupTime: findNewPickupTime(e.target.value, arrivalTime, stop.pickupTime)
                          }))
                      })));
                    }}
                    readOnly={!isEdit}
                    required
                />
              
                <label id='label-user'> Departure Time: </label>
                  <input
                      id = 'input-user'
                      type="time"
                      value={school.departureTime}
                      onChange={e => {
                        setDepartureTime(e.target.value);
                        setRoutes(routes.map(route => ({...route,
                            stops: route.stops.map(stop => ({...stop,
                            dropoffTime: findNewDropOffTime(e.target.value, departureTime, stop.dropoffTime)
                        }))
                        })));
                      }}
                      readOnly={!isEdit}
                      required
                  />
          
                        
                {editable && <div>
                  <button style = {{display: 'in-line block', margin: '20px'}} onClick = {(e) => checkMap(e)}> {addressValid ? "Address Valid!": "Validate Address" } </button>  
                  <button style = {{display: 'in-line block', margin: '20px'}} className = "button" onClick = {(e) => {handleSchoolFormSubmit(e)}} type="button"> Update School </button>
                  </div>
                } 
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
        <div id = 'tables-container'> 
          <p> </p>
          <p> </p>
          <p> </p>
          <p> </p>
          <h5 id = "sub-header"> Students &  Routes </h5>
          <div style={{ display: "flex", width: "90%", marginLeft: "auto", marginRight: "auto" }}>
            <SchoolStudents data={students} />
            <SchoolRoutes data={routes} />
          </div> 

        </div>

            
        
        </div>
        )};