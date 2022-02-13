import "./BusRoutePlanner.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { SelectableMarker } from "./../map/SelectableMarker";
import { getOneRoutePlanner, saveRoute, deleteRoute } from "./../api/axios_wrapper";
import { addDriveTime, subtractDriveTime } from "./../api/time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationPin,
  faSchool,
  faMapPin,
  faCircleQuestion,
  faCheck,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import { hasInRangeStop, inRange } from "./../api/distance";
import ReactTooltip from "react-tooltip";

export const BusRoutePlanner = () => {
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [selectedStop, setSelectedStop] = useState(0);
  const [dragIndex, setDragIndex] = useState(0);
  const [polylines, setPolylines] = useState([]);
  const [validatedRoutes, setValidatedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState();
  const [firstSelect, setFirstSelect] = useState(false);
  const [stopSelect, setStopSelect] = useState(false);
  const [googleMap, setGoogleMap] = useState();
  const [googleMaps, setGoogleMaps] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();
  const [directionsService, setDirectionsService] = useState();
  const [placeStopLocation, setPlaceStopLocation] = useState(false);
  const [deletedRoutes, setDeletedRoutes] = useState([]);
  const { schoolId } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneRoutePlanner(schoolId);
        console.log(fetchedData.data);
        fetchedData.data.arrivalTime = fetchedData.data.arrivalTime || "08:00";
        fetchedData.data.departureTime = fetchedData.data.departureTime || "15:00";
        fetchedData.data.routes = fetchedData.data.routes.map(route =>
            ({...route, stops: route.stops.map(stop =>
                  ({...stop, arrivalIndex: parseInt(stop.arrivalIndex)}))}));
        console.log(fetchedData);
        setSchool(fetchedData.data);
        setLoading(false);
      } catch (error) {
        alert(error.request.data);
      }
    };
    fetchData();
  }, [schoolId]);
  useEffect(() => {
    setPlaceStopLocation(false);
    setStopSelect(false);
  }, [selectedRoute]);
  useEffect(() => {
    if (googleMap) {
      console.log("removing listener");
      googleMaps.event.clearListeners(googleMap, "click");
      if (placeStopLocation && stopSelect && placeStopLocation) {
        console.log("adding listener");
        googleMap.addListener("click", e => {
          if (firstSelect) {
            console.log(e.latLng.lng());
            console.log(e.latLng.lat());
            setValidatedRoutes(validatedRoutes.map((bool, index) =>
                index === selectedRoute ? false : bool
            ));
            setSchool({...school, routes: school.routes.map((route, index) =>
                  index === selectedRoute ?
                      {...route, stops: route.stops.map(stop =>
                            stop.arrivalIndex === selectedStop ? {...stop, latitude: e.latLng.lat(), longitude: e.latLng.lng()} : stop)} :
                      route)}
            );
          }
        });
      }
    }
  }, [placeStopLocation, stopSelect, selectedStop]);

  const saveData = async () => {
    for (var i = 0; i < school.routes.length; i++) {
      const route = school.routes[i];
      if (!route.name || route.name.trim().length === 0) {
        console.log(route);
        alert("Please ensure all routes have a name.");
        return;
      } else if (!route.desciption || route.desciption.trim().length == 0) {
        alert("Please ensure all routes have a description.")
        return;
      } else if (!validatedRoutes[i]) {
        alert(`Please validate ${route.name} before saving.`);
        return;
      }
    }
    try {
      const savedRoutes = school.routes;
      for (var i = 0; i < school.routes.length; i++) {
        const route = school.routes[i];
        if (route.uid) {
          const saved = await saveRoute(route);
          savedRoutes[i] = saved.data;
        } else {
          const stops = route.stops;
          delete route.stops;
          const createdRoute = await saveRoute(route);
          createdRoute.data.stops = stops;
          const fullRoute = await saveRoute(createdRoute.data);
          savedRoutes[i] = fullRoute.data;
        }
      }
      for (var i = 0; i < deletedRoutes.length; i++) {
        const route = deletedRoutes[i];
        if (route.uid) {
          await deleteRoute(route.uid);
        }
      }
      setSchool({...school, routes: savedRoutes});
      alert("Routes updated!")
    } catch (error) {
      alert(error.response.data);
    }
  }
  const createRoute = () => {
    const newRoute = {
      name: "",
      desciption: "",
      school: school,
      students: [],
      stops: [],
      polyline: ""
    };
    if (polylines[selectedRoute]) {
      polylines[selectedRoute].setMap(null);
    }
    setSchool({...school, routes: [...school.routes, newRoute]});
    setSelectedRoute(school.routes.length);
    setFirstSelect(true);
    setStopSelect(false);
    setPolylines([...polylines, ""]);
    setValidatedRoutes([...validatedRoutes, false]);
  }
  const handleApiLoaded = (map, maps) => {
    setGoogleMap(map);
    setGoogleMaps(maps);
    const dirRend = new maps.DirectionsRenderer();
    const dirServ = new maps.DirectionsService();
    dirRend.setMap(map);
    setDirectionsRenderer(dirRend);
    setDirectionsService(dirServ);
    map.addListener("zoom_changed", () => {
      console.log(map.getZoom());
    });
    setPolylines(school.routes.map(route => {
      if (route.polyline) {
        return new maps.Polyline({
          path: maps.geometry.encoding.decodePath(route.polyline),
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
      }
      return "";
    }
    ));
    setValidatedRoutes(school.routes.map(route => true));
  }
  const completeRoute = firstSelect && !school.students.some(student =>
        (school.routes[selectedRoute].students.some(s => student.uid === s.uid) &&
            !hasInRangeStop(student, school.routes[selectedRoute])));


  return (
      <div id="busRouteComplete">
        {loading ? <h3>Loading</h3> :
            <div id="busRouteFlex">
              <h1>{school.name} <FontAwesomeIcon
                  icon={faCircleQuestion}
                  size="xs"
                  data-tip
                  data-for="plannerTip"
              /><ReactTooltip
                  id="plannerTip"
                  place="bottom"
                  effect="solid"
              >
                <p>Use this page to update the routes and stops for the current school.</p>
                <p>Make sure to save before leaving the page, or all of your progress will be lost.</p>
                <p>Map Key</p>
                <div id="keyList">
                  <div id="keyItem"><label>School: <FontAwesomeIcon
                      icon={faSchool}
                      size="sm"
                  /></label></div>
                  <div id="keyItem"><label>Student with no route: <FontAwesomeIcon
                      icon={faLocationPin}
                      size="sm"
                      id="exampleNoRouteMarker"
                  /></label></div>
                  <div id="keyItem"><label>Student on other route with no in-range stop: <FontAwesomeIcon
                      icon={faLocationPin}
                      size="sm"
                      id="exampleNoStopMarker"
                  /></label></div>
                  <div id="keyItem"><label>Student on other route with in-range stop: <FontAwesomeIcon
                      icon={faLocationPin}
                      size="sm"
                      id="exampleRouteMarker"
                  /></label></div>
                  <div id="keyItem"><label>Student on current route with no in-range stop: <FontAwesomeIcon
                      icon={faLocationPin}
                      size="sm"
                      id="exampleCurrentRouteNoStopMarker"
                  /></label></div>
                  <div id="keyItem"><label>Student on current route: <FontAwesomeIcon
                      icon={faLocationPin}
                      size="sm"
                      id="exampleCurrentRouteMarker"
                  /></label></div>
                  <div id="keyItem"><label>Student on current route and in-range of current stop: <FontAwesomeIcon
                      icon={faLocationPin}
                      size="sm"
                      id="exampleCurrentRouteAndStopMarker"
                  /></label></div>
                  <div id="keyItem"><label>Bus stop: <FontAwesomeIcon
                      icon={faMapPin}
                      size="sm"
                  /></label></div>
                  <div id="keyItem"><label>Current bus stop: <FontAwesomeIcon
                      icon={faMapPin}
                      size="sm"
                      id="exampleCurrentStopMarker"
                  /></label></div>
                </div>
              </ReactTooltip></h1>
              <div style={{display: 'flex'}}>
                <div id="routes">
                  <div id="routeEditor">
                    <h3>Current Route <FontAwesomeIcon
                        icon={faCircleQuestion}
                        size="sm"
                        data-tip
                        data-for="routeTip"
                      /><ReactTooltip
                        id="routeTip"
                        place="top"
                        effect="solid"
                      >
                        <p>Select a route from the dropdown to edit it.</p>
                        <p>Click on a student in the map to add/remove it to/from the current route.</p>
                        <p>Click on Create Route to add a new route to the school.</p>
                        <p>Click on the Validate Route button to create a route path based on the route's stops.</p>
                      </ReactTooltip> {firstSelect && <><FontAwesomeIcon
                        icon={completeRoute ? faCheck : faXmark}
                        id={completeRoute ? "plannerComplete" : "plannerIncomplete"}
                        size="sm"
                        data-tip
                        data-for="completePlannerTip"
                    /><ReactTooltip
                      id="completePlannerTip"
                      place="top"
                      effect="solid"
                      >
                      {completeRoute ? "All students on this route have an in range bus stop." :
                          "At least one student on this route does not have an in range bus stop."
                      }
                      </ReactTooltip></>}
                    </h3>
                    <div style={{padding: "10px"}}>
                    <select
                        style={{width: "50%"}}
                      onChange={e => {
                        setSelectedRoute(parseInt(e.target.value));
                        if (firstSelect && polylines[selectedRoute]) {
                          polylines[selectedRoute].setMap(null)
                        }
                        if (polylines[parseInt(e.target.value)]) {
                          polylines[parseInt(e.target.value)].setMap(googleMap);
                        }
                        setFirstSelect(true);
                        setPlaceStopLocation(false);
                        setStopSelect(false);
                      }}
                      value={firstSelect ? selectedRoute : "-1"}
                  >
                    {!firstSelect && <option value="-1">Select a Route:</option>}
                    {school.routes.map((route, index) => (
                        <option value={index}>{route.name}</option>
                    ))}
                  </select>
                  <button onClick={e => createRoute()}>Create Route</button>
                    </div>
                  {firstSelect && <div style={{width: "100%"}}><label id="plannerLabelDisplay">Route Name: </label><input
                      type="text"
                      maxLength="100"
                      style={{width: "70%"}}
                      value={school.routes[selectedRoute].name}
                      onInput={e => {
                        setSchool({...school, routes: school.routes.map((r, index) =>
                              index === selectedRoute ? {...r, name: e.target.value} : r)});
                      }}
                  /></div>}
                  {firstSelect && <div style={{width: "100%"}}><label id="plannerLabelDisplay">Route Description: </label><textarea
                      id="routeDesciptionBox"
                      maxLength="500"
                      value={school.routes[selectedRoute].desciption}
                      onInput={e => {
                        setSchool({...school, routes: school.routes.map((r, index) =>
                              index === selectedRoute ? {...r, desciption: e.target.value} : r)});
                      }}
                  /></div>}
                    {firstSelect && <div><button
                      onClick={e => {
                        if (validatedRoutes[selectedRoute]) {
                          return;
                        } else if (school.routes[selectedRoute].stops.length === 0) {
                          alert("Please add at least one stop onto the route.");
                          return;
                        } else if (school.routes[selectedRoute].stops.some(stop =>
                            !(stop.latitude && stop.longitude))) {
                          alert("Please place all stops on the map so route can be created.");
                          return;
                        }
                        const sorted = school.routes[selectedRoute].stops.sort((a, b) => a.arrivalIndex - b.arrivalIndex);
                        const request = {
                          origin: {
                            lat: parseFloat(sorted[0].latitude),
                            lng: parseFloat(sorted[0].longitude),
                          },
                          destination: {
                            lat: parseFloat(school.latitude),
                            lng: parseFloat(school.longitude)
                          },
                          travelMode: 'DRIVING',
                          waypoints: sorted.filter((stop, index) => index > 0).map(stop => ({
                            location: {
                              lat: parseFloat(stop.latitude),
                              lng: parseFloat(stop.longitude)
                            }
                          }))
                        };
                        const path = directionsService.route(request, function(result, status) {
                          console.log(result);
                          if (status == "OK") {
                            if (polylines[selectedRoute]) {
                              const oldPolyline = polylines[selectedRoute];
                              oldPolyline.setMap(null);
                            }
                            const polyLine = new googleMaps.Polyline({
                              path: googleMaps.geometry.encoding.decodePath(result.routes[0].overview_polyline),
                              strokeColor: "#FF0000",
                              strokeOpacity: 1.0,
                              strokeWeight: 2
                            });
                            polyLine.setMap(googleMap);
                            setPolylines(polylines.map((line, index) =>
                                index === selectedRoute ? polyLine : line
                            ));
                            const newSchool = school;
                            newSchool.routes[selectedRoute].polyline = result.routes[0].overview_polyline;
                            const len = result.routes[0].legs.length;
                            sorted[len - 1].pickupTime =
                                subtractDriveTime(school.arrivalTime, Math.trunc(result.routes[0].legs[len - 1].duration.value/60));
                            sorted[len - 1].dropoffTime =
                                addDriveTime(school.arrivalTime, Math.trunc(result.routes[0].legs[len - 1].duration.value/60));
                            for (var i = result.routes[0].legs.length - 2; i >= 0; i --) {
                              sorted[i].pickupTime =
                                  subtractDriveTime(sorted[i + 1].pickupTime,
                                      Math.trunc(result.routes[0].legs[i].duration.value/60));
                              sorted[i].dropoffTime =
                                  addDriveTime(sorted[i + 1].dropoffTime,
                                      Math.trunc(result.routes[0].legs[i].duration.value/60));
                            }
                            newSchool.routes[selectedRoute].stops = sorted;
                            setSchool(newSchool);
                            console.log(newSchool);
                            setValidatedRoutes(validatedRoutes.map((bool, index) =>
                                index === selectedRoute ? true : bool
                            ));
                            console.log(result.routes[0].legs[0].duration.text);
                            console.log(subtractDriveTime("09:00", Math.trunc(result.routes[0].legs[0].duration.value/60)));
                            console.log(addDriveTime("15:25", Math.trunc(result.routes[0].legs[0].duration.value/60)));
                            console.log(subtractDriveTime("00:20", Math.trunc(result.routes[0].legs[0].duration.value/60)));
                            console.log(addDriveTime("23:35", Math.trunc(result.routes[0].legs[0].duration.value/60)));
                          }
                        })
                      }
                      }>{validatedRoutes[selectedRoute] ? "Valid Route!" : "Validate Route"}</button>
                      <button
                          onClick={e => {
                            setDeletedRoutes([...deletedRoutes, school.routes[selectedRoute]]);
                            setSchool({...school, routes: school.routes.filter((route, index) => index !== selectedRoute)});
                            setFirstSelect(false);
                            setStopSelect(false);
                            setPlaceStopLocation(false);
                          }}
                          data-tip
                          data-for="deleteRouteTip"
                      >
                        Delete Route
                      </button><ReactTooltip
                          id="deleteRouteTip"
                          place="top"
                          effect="solid"
                      >
                        Clicking this button will show the effects of deleting this route, but the route will not actually be deleted until Save All Changes is  clicked.
                      </ReactTooltip>
                    </div>}
                  </div>
                  <div id="stops">
                      {firstSelect && <h3>Current Stop <FontAwesomeIcon
                          icon={faCircleQuestion}
                          size="sm"
                          data-tip
                          data-for="editStopTip"
                      /><ReactTooltip
                          id="editStopTip"
                          place="top"
                          effect="solid"
                      >
                        <p>Select a stop from the dropdown to edit that stop.</p>
                        <p>Check the Edit Stop Location box and click on the map to change the stops location.</p>
                        <p>The stop times will be calculated and edited automatically when route is validated.</p>
                      </ReactTooltip></h3>}
                    {firstSelect || <h5>Select a route to edit its stops.</h5>}
                    {firstSelect && <select
                        style={{ width: "50%" }}
                        onChange={e => {
                          setSelectedStop(parseInt(e.target.value));
                          setStopSelect(true);
                          setPlaceStopLocation(false);
                        }}
                        value={stopSelect ? selectedStop : "-1"}
                    >
                      {stopSelect || <option value="-1">Select a Stop:</option>}
                      {school.routes[selectedRoute].stops.sort((a, b) => a.arrivalIndex - b.arrivalIndex).map(stop => (
                          <option value={stop.arrivalIndex}>{stop.name || stop.arrivalIndex}</option>
                      ))}
                    </select>
                    }
                    {(firstSelect && school.routes[selectedRoute].stops.length < 25) && <button
                        onClick={e => {
                          setSchool({...school, routes: school.routes.map((route, index) =>
                                index === selectedRoute ? {...route, stops: [...route.stops, {
                                    name: "",
                                    location: "",
                                    arrivalIndex: route.stops.length,
                                    pickupTime: "00:00",
                                    dropoffTime: "00:00"
                                  }]} : route
                            )}
                          );
                          setSelectedStop(school.routes[selectedRoute].stops.length);
                          setStopSelect(true);
                          setPlaceStopLocation(false);
                          setValidatedRoutes(validatedRoutes.map((bool, index) =>
                              index === selectedRoute ? false : bool
                          ));
                        }}
                    >Create Stop</button>}
                    {stopSelect && <div style={{ width: "100%" }}>
                      <div style={{ width: "100%"}}>
                        <label id="plannerLabelDisplay">Stop Name: </label>
                        <input
                            type="text"
                            maxLength="100"
                            style={{ width: "70%" }}
                            value={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).name}
                            onInput={e => {
                              setSchool({...school, routes: school.routes.map((route, index) =>
                                    index === selectedRoute ? {...route, stops: route.stops.map(stop =>
                                          stop.arrivalIndex === selectedStop ? {...stop, name: e.target.value} : stop
                                      )} : route)});
                            }}
                        />
                      </div>
                      <div style={{ width: "100%"}}>
                        <label id="plannerLabelDisplay">Stop Location: </label>
                        <input
                            type="text"
                            maxLength="100"
                            style={{ width: "70%" }}
                            value={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).location}
                            onInput={e => {
                              setSchool({...school, routes: school.routes.map((route, index) =>
                                    index === selectedRoute ? {...route, stops: route.stops.map(stop =>
                                          stop.arrivalIndex === selectedStop ? {...stop, location: e.target.value} : stop
                                      )} : route)});
                            }}
                        />
                      </div>
                      <div>
                        <label style={{padding: "10px"}}>Select Stop Pickup Order in Route: <select
                            onChange={e => {
                              const newIndex = parseInt(e.target.value);
                              console.log({...school, routes: school.routes.map((route, index) =>
                                    index === selectedRoute ? {...route, stops: route.stops.map(stop => {
                                        if (stop.arrivalIndex === selectedStop) {
                                          return {...stop, arrivalIndex: newIndex};
                                        } else if (stop.arrivalIndex < newIndex && stop.arrivalIndex > selectedStop) {
                                          return {...stop, arrivalIndex: stop.arrivalIndex - 1};
                                        } else if (stop.arrivalIndex > newIndex && stop.arrivalIndex < selectedStop) {
                                          return {...stop, arrivalIndex: stop.arrivalIndex + 1};
                                        } else if (stop.arrivalIndex === newIndex) {
                                          if (newIndex > selectedStop) {
                                            return {...stop, arrivalIndex: stop.arrivalIndex - 1};
                                          } else {
                                            return {...stop, arrivalIndex: stop.arrivalIndex + 1};
                                          }
                                        } else {
                                          return stop;
                                        }
                                      })} : route
                                )});
                              setSchool({...school, routes: school.routes.map((route, index) =>
                                    index === selectedRoute ? {...route, stops: route.stops.map(stop => {
                                        if (stop.arrivalIndex === selectedStop) {
                                          return {...stop, arrivalIndex: newIndex};
                                        } else if (stop.arrivalIndex < newIndex && stop.arrivalIndex > selectedStop) {
                                          return {...stop, arrivalIndex: stop.arrivalIndex - 1};
                                        } else if (stop.arrivalIndex > newIndex && stop.arrivalIndex < selectedStop) {
                                          return {...stop, arrivalIndex: stop.arrivalIndex + 1};
                                        } else if (stop.arrivalIndex === newIndex) {
                                          if (newIndex > selectedStop) {
                                            return {...stop, arrivalIndex: stop.arrivalIndex - 1};
                                          } else {
                                            return {...stop, arrivalIndex: stop.arrivalIndex + 1};
                                          }
                                        } else {
                                          return stop;
                                        }
                                      })} : route
                                )});
                              setSelectedStop(newIndex);
                              setPlaceStopLocation(false);
                              setValidatedRoutes(validatedRoutes.map((bool, index) =>
                                  index === selectedRoute ? false : bool
                              ));
                            }}
                            value={selectedStop}
                        >
                          {school.routes[selectedRoute].stops.sort((a, b) => a.arrivalIndex - b.arrivalIndex).map(stop => (
                              <option value={stop.arrivalIndex}>{stop.arrivalIndex + 1}</option>
                          ))}
                        </select>
                        </label>
                        <label style={{padding: "10px"}}>Select Stop Location: <input
                            type="checkbox"
                            checked={placeStopLocation}
                            onChange={e => setPlaceStopLocation(e.target.checked)}
                        /></label>
                      </div>
                    </div>}
                    {stopSelect && <div style={{ display: "flex" }}>
                      <div style={{ flex: "35%" }}>
                        <label>Pick-Up Time: <input
                            type="time"
                            value={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).pickupTime}
                            readOnly={true}
                        /></label>
                      </div>
                      <div style={{ flex: "35%" }}>
                        <label>Drop-Off Time: <input
                            type="time"
                            value={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).dropoffTime}
                            readOnly={true}
                        /></label>
                      </div>
                      <div style={{ flex: "30%" }}>
                        <button
                            onClick={e => {
                              console.log({...school, routes: school.routes.map((route, index) =>
                                    index === selectedRoute ? {...route, stops: route.stops.filter(stop =>
                                          stop.arrivalIndex !== selectedStop).map(stop =>
                                          stop.arrivalIndex > selectedStop ? {...stop, arrivalIndex: stop.arrivalIndex - 1} : stop
                                      )} : route)});
                              setSchool({...school, routes: school.routes.map((route, index) =>
                                    index === selectedRoute ? {...route, stops: route.stops.filter(stop =>
                                          stop.arrivalIndex !== selectedStop).map(stop =>
                                          stop.arrivalIndex > selectedStop ? {...stop, arrivalIndex: stop.arrivalIndex - 1} : stop
                                      )} : route)});
                              setStopSelect(false);
                              setPlaceStopLocation(false);
                              setValidatedRoutes(validatedRoutes.map((bool, index) =>
                                  index === selectedRoute ? false : bool
                              ));
                            }}
                            data-tip
                            data-for="deleteStopTip"
                        >Delete Stop</button><ReactTooltip
                          id="deleteStopTip"
                          place="top"
                          effect="solid"
                      >
                        Clicking this button will show the effects of deleting this stop, but the stop will not actually be deleted until Save All Changes is  clicked.
                      </ReactTooltip>
                      </div>
                    </div>}
                  </div>
                </div>
                <div id="centerMapContainer">
                <div id="mapContainer">
                  <GoogleMapReact
                      bootstrapURLKeys={{key: `${process.env.REACT_APP_GOOGLE_MAPS_API}`}}
                      defaultCenter={{ lat: parseFloat(school.latitude), lng: parseFloat(school.longitude) }}
                      defaultZoom={9}
                      yesIWantToUseGoogleMapApiInternals
                      onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                  >
                    <Marker
                        text={school.name}
                        lat={parseFloat(school.latitude)}
                        lng={parseFloat(school.longitude)}
                        isSchool
                    />
                    {school.students.map((student) => (
                        <SelectableMarker
                            student={student}
                            onCurrentRoute={firstSelect && school.routes[selectedRoute].students.some(s => student.uid === s.uid)}
                            notOnRoute={!school.routes.some(route => route.students.some(s => s.uid === student.uid))}
                            inRangeStop={school.routes.some(route => route.students.some(s => s.uid === student.uid)) &&
                                hasInRangeStop(student, school.routes.find(route => route.students.some(s => student.uid === s.uid)))
                            }
                            onCurrentStop={firstSelect && stopSelect &&
                                school.routes[selectedRoute].students.some(s => student.uid === s.uid) &&
                                inRange(student, school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop))
                            }
                            selectRoute={(st) => {
                              if (!firstSelect) {
                                return;
                              }
                              if (school.routes[selectedRoute].students.some(s => s.uid === st.uid)) {
                                setSchool({...school, routes: school.routes.map((r, index) =>
                                  index === selectedRoute ? {...r, students: r.students.filter(s => s.uid !== st.uid)} : r)});
                              } else {
                                setSchool({...school, routes: school.routes.map((r, index) => {
                                  if (r.students.some(s => s.uid === st.uid)) {
                                    return {...r, students: r.students.filter(s => s.uid !== st.uid)};
                                  } else if (index === selectedRoute) {
                                    return {...r, students: [...r.students, st]};
                                  } else {
                                    return r;
                                  }
                                })});
                              }
                            }}
                            lat={parseFloat(student.parentUser.latitude)}
                            lng={parseFloat(student.parentUser.longitude)}
                        />
                    ))}
                    {firstSelect && school.routes[selectedRoute].stops.filter(stop => stop.latitude && stop.longitude).map(stop => (
                        <Marker
                            isStop
                            isCurrentStop={stopSelect && stop.arrivalIndex === selectedStop}
                            lat={parseFloat(stop.latitude)}
                            lng={parseFloat(stop.longitude)}
                        />
                    ))}
                  </GoogleMapReact>
                </div>
                  <button onClick={e => saveData()}>Save All Changes</button>
                </div>
              </div>
            </div>
        }
      </div>
  );
}
