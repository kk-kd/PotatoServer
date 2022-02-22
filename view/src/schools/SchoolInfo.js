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

export const SchoolInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState(true);
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
  const [validated, setValidated] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (mapApi && !validated) {
      searchLocation();
    }
  }, [mapApi]);
  useEffect(() => {
    const getSchool = async () => {
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
    getSchool();
  }, []);
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
        alert("Succesfully edit school.");
        navigate("/Schools/list");
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
        setValidated(true);
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
    } else if (!validated) {
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
    <div>
      <h1>School Info</h1>
      <div>
        <button
          className="btn btn-outline-secondary"
          onClick={(e) => setIsEdit(true)}
        >
          Edit School
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={(e) => setIsDelete(true)}
        >
          Delete School
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={(e) => navigate(`/Routes/planner/${id}`)}
        >
          Route Planner
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={(e) => navigate(`/Emails/send/${id}`)}
        >
          Send Email Announcement
        </button>
      </div>
      <form onSubmit={(e) => onSubmit(e)}>
        <fieldset disabled>
          <div
            class="input-group mb-3"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <span class="input-group-text" id="basic-addon3">
              School Name
            </span>
            <input
              type="text"
              maxLength="100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="disabledTextInput"
              class="form-control"
              aria-describedby="basic-addon3"
              placeholder={!isEdit}
              style={{ maxWidth: "12em", fontWeight: "bold" }}
            ></input>
          </div>
        </fieldset>
        <div
          class="input-group mb-3"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <span class="input-group-text" id="basic-addon4">
            Address
          </span>
          <input
            type="text"
            maxLength="100"
            value={address}
            id="disabledTextInput"
            class="form-control"
            aria-describedby="basic-addon4"
            placeholder={!isEdit}
            style={{ maxWidth: "12em", fontWeight: "bold" }}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div id="schoolInfoTimeInput">
              <label>Arrival Time:
                <input
                    type="time"
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
              </label>
            </div>
            <div id="schoolInfoTimeInput">
              <label >Departure Time:
                <input
                    type="time"
                    value={departureTime}
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
              </label>
            </div>
          {isEdit && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={(e) => checkMap()}
              style={{ padding: ".2em" }}
            >
              Validate Address
            </button>
          )}
          {isEdit && (
            <button type="submit" class="btn btn-primary" value="submit">
              Submit
            </button>
          )}
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
            <Marker
                text="You're Address"
                lat={lat}
                lng={lng}
                isSchool
            />
          </GoogleMapReact>
        </div>
      )}
      <SchoolStudents data={students} />
      <SchoolRoutes data={routes} />
    </div>
  );
};
