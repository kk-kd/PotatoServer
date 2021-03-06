import "./BusRoutePlanner.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { SelectableMarker } from "./../map/SelectableMarker";
import { getOneRoutePlanner, saveRoute, deleteRoute, saveStop } from "./../api/axios_wrapper";
import { addDriveTime, subtractDriveTime } from "./../api/time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationPin,
  faLocationDot,
  faSchool,
  faMapPin,
  faCircleQuestion,
  faCheck,
  faXmark,
  faCircleExclamation
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
  const [deletedStops, setDeletedStops] = useState([]);
  const [changeRoute, setChangeRoute] = useState(false);
  const [locations, setLocations] = useState([]);
  const { schoolId } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneRoutePlanner(schoolId);
        fetchedData.data.arrivalTime = fetchedData.data.arrivalTime || "08:00";
        fetchedData.data.departureTime = fetchedData.data.departureTime || "15:00";
        fetchedData.data.routes = fetchedData.data.routes.map(route =>
            ({...route, stops: route.stops.map(stop =>
                  ({...stop, arrivalIndex: parseInt(stop.arrivalIndex)}))}));
        var locationSet = [];
        fetchedData.data.students.forEach(student => {
          const index = locationSet.findIndex(location =>
              location.longitude === student.parentUser.longitude &&
              location.latitude === student.parentUser.latitude
          );
          if (index === -1) {
            locationSet = [...locationSet, {
              longitude: student.parentUser.longitude,
              latitude: student.parentUser.latitude,
              students: [student]
            }];
          } else {
            locationSet[index] = {...locationSet[index], students: [...locationSet[index].students, student]};
          }
        });
        setLocations(locationSet);
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
      googleMaps.event.clearListeners(googleMap, "click");
      if (placeStopLocation && stopSelect && placeStopLocation) {
        googleMap.addListener("click", e => {
          if (firstSelect) {
            setValidatedRoutes(validatedRoutes.map((bool, index) =>
                index === selectedRoute ? false : bool
            ));
            setSchool({...school, routes: school.routes.map((route, index) =>
                  index === selectedRoute ?
                      {...route, stops: route.stops.map(stop =>
                            stop.arrivalIndex === selectedStop ? {...stop,
                              latitude: e.latLng.lat(),
                              longitude: e.latLng.lng(),
                              inRangeStudents: school.students.filter(student =>
                                  school.routes[selectedRoute].students.some(s => s.uid === student.uid) &&
                                  inRange(student, { latitude: e.latLng.lat(), longitude: e.latLng.lng() })
                              )
                      } : stop)} :
                      route)}
            );
          }
        });
      }
    }
  }, [placeStopLocation, stopSelect, selectedStop]);
  useEffect(() => {
    if (googleMap) {
      if (placeStopLocation) {
        googleMap.setOptions({ draggableCursor: "pointer" });
      } else if (changeRoute) {
        googleMap.setOptions({ draggableCursor: "default" });
      } else {
        googleMap.setOptions({ draggableCursor: "grab" });
      }
    }
  }, [placeStopLocation, changeRoute]);

  const saveData = async () => {
    for (var i = 0; i < school.routes.length; i++) {
      const route = school.routes[i];
      if (!route.name || route.name.trim().length === 0) {
        alert("Please ensure all routes have a name.");
        return;
      } else if (!route.desciption || route.desciption.trim().length == 0) {
        alert("Please ensure all routes have a description.")
        return;
      } else if (route.stops.length === 0) {
        alert("Please ensure all routes have at least one stop.")
        return;
      } else if (route.stops.some(stop => !(stop.latitude && stop.longitude))) {
        alert("Please ensure that all stops have been placed on the map.")
        return;
      }
    }
    try {
      const savedRoutes = school.routes;
      for (var i = 0; i < deletedStops.length; i++) {
        var stop = deletedStops[i];
        if (stop.uid) {
          stop.inRangeStudents = [];
          await saveStop(stop);
        }
      }
      for (var i = 0; i < school.routes.length; i++) {
        const route = school.routes[i];
        if (!validatedRoutes[i]) {
          const sorted = [...route.stops.slice(0).sort((a, b) => b.arrivalIndex - a.arrivalIndex)];
          var newPolylinesEncoded = [];
          var newPolylinesDecoded = [];
          for (var j = 0; j < sorted.length/26; j++) {
            const request = {
              origin: {
                lat: j === 0 ? parseFloat(school.latitude) : parseFloat(sorted[j * 26 - 1].latitude),
                lng: j === 0 ? parseFloat(school.longitude) : parseFloat(sorted[j * 26 - 1].longitude),
              },
              destination: {
                lat: parseFloat(sorted[Math.min(sorted.length - 1, j * 26 + 25)].latitude),
                lng: parseFloat(sorted[Math.min(sorted.length - 1, j * 26 + 25)].longitude)
              },
              travelMode: 'DRIVING',
              waypoints: sorted.filter(
                  (stop, index) => index >= j * 26 && index < Math.min(sorted.length - 1, j * 26 + 25)).map(stop => ({
                location: {
                  lat: parseFloat(stop.latitude),
                  lng: parseFloat(stop.longitude)
                }}))
            };
            const result = await directionsService.route(request);
            if (result.status === "OK") {
              newPolylinesEncoded = [...newPolylinesEncoded, result.routes[0].overview_polyline];
              const len = result.routes[0].legs.length;
              for (var k = 0; k < result.routes[0].legs.length; k++) {
                if (k === 0 && j === 0) {
                  sorted[0].pickupTime =
                      subtractDriveTime(school.arrivalTime,
                          Math.trunc(result.routes[0].legs[0].duration.value / 60));
                  sorted[0].dropoffTime =
                      addDriveTime(school.departureTime,
                          Math.trunc(result.routes[0].legs[0].duration.value / 60));
                } else {
                  sorted[j * 26 + k].pickupTime =
                      subtractDriveTime(sorted[j * 26 + k - 1].pickupTime,
                          Math.trunc(result.routes[0].legs[k].duration.value / 60));
                  sorted[j * 26 + k].dropoffTime =
                      addDriveTime(sorted[j * 26 + k - 1].dropoffTime,
                          Math.trunc(result.routes[0].legs[k].duration.value / 60));
                }
              }
            } else {
              alert(result.status);
              return;
            }
          }
          route.stops = sorted;
          route.polyline = newPolylinesEncoded;
        }
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
        var route = deletedRoutes[i];
        if (route.uid) {
          delete route.students;
          route.stops = route.stops.map(stop => ({...stop, inRangeStudents: []}));
          await saveRoute(route);
          await deleteRoute(route.uid);
        }
      }
      setSchool({...school, routes: savedRoutes});
      setDeletedRoutes([]);
      setDeletedStops([]);
      setValidatedRoutes(validatedRoutes.map(bool => true));
      polylines.forEach(polylineGroup => polylineGroup.forEach(polyline => polyline.setMap(null)));
      setPolylines(savedRoutes.map((route, index) => {
            if (route.polyline) {
              const newPolylines = route.polyline.map(polyline => new googleMaps.Polyline({
                path: googleMaps.geometry.encoding.decodePath(polyline),
                strokeColor: "#0000FF",
                strokeOpacity: 1.0,
                strokeWeight: 2
              }));
              if (selectedRoute === index) {
                newPolylines.forEach(polyline => polyline.setMap(googleMap))
              }
              return newPolylines;
            }
            return [];
          }
      ));
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
      polyline: []
    };
    if (polylines[selectedRoute]) {
      polylines[selectedRoute].forEach(polyline => polyline.setMap(null));
    }
    setSchool({...school, routes: [...school.routes, newRoute]});
    setSelectedRoute(school.routes.length);
    setChangeRoute(true);
    setFirstSelect(true);
    setStopSelect(false);
    setPlaceStopLocation(false);
    setPolylines([...polylines, []]);
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
    setPolylines(school.routes.map(route => {
      if (route.polyline) {
        return route.polyline.map(polyline => new maps.Polyline({
          path: maps.geometry.encoding.decodePath(polyline),
          strokeColor: "#0000FF",
          strokeOpacity: 1.0,
          strokeWeight: 2
        }));
      }
      return [];
    }
    ));
    setValidatedRoutes(school.routes.map(route => true));
  }
  const calculateRoutes = async () => {
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

    try {
      const sorted = [...school.routes[selectedRoute].stops.slice(0).sort((a, b) => b.arrivalIndex - a.arrivalIndex)];
      const newSchool = school;
      var newPolylinesEncoded = [];
      var newPolylinesDecoded = [];
      for (var j = 0; j < sorted.length/26; j++) {
        const request = {
          origin: {
            lat: j === 0 ? parseFloat(school.latitude) : parseFloat(sorted[j * 26 - 1].latitude),
            lng: j === 0 ? parseFloat(school.longitude) : parseFloat(sorted[j * 26 - 1].longitude),
          },
          destination: {
            lat: parseFloat(sorted[Math.min(sorted.length - 1, j * 26 + 25)].latitude),
            lng: parseFloat(sorted[Math.min(sorted.length - 1, j * 26 + 25)].longitude)
          },
          travelMode: 'DRIVING',
          waypoints: sorted.filter(
              (stop, index) => index >= j * 26 && index < Math.min(sorted.length - 1, j * 26 + 25)).map(stop => ({
            location: {
              lat: parseFloat(stop.latitude),
              lng: parseFloat(stop.longitude)
            }
          }))
        };
        const result = await directionsService.route(request);
        if (result.status === "OK") {
          if (polylines[selectedRoute]) {
            polylines[selectedRoute].forEach(oldPolyline => oldPolyline.setMap(null));
          }
          const polyLine = new googleMaps.Polyline({
            path: googleMaps.geometry.encoding.decodePath(
                result.routes[0].overview_polyline),
            strokeColor: "#0000FF",
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
          newPolylinesDecoded = [...newPolylinesDecoded, polyLine];
          newPolylinesEncoded = [...newPolylinesEncoded, result.routes[0].overview_polyline];
          const len = result.routes[0].legs.length;
          for (var i = 0; i < result.routes[0].legs.length; i++) {
            if (i === 0 && j === 0) {
              sorted[0].pickupTime =
                  subtractDriveTime(school.arrivalTime,
                      Math.trunc(result.routes[0].legs[0].duration.value / 60));
              sorted[0].dropoffTime =
                  addDriveTime(school.departureTime,
                      Math.trunc(result.routes[0].legs[0].duration.value / 60));
            } else {
              sorted[j * 26 + i].pickupTime =
                  subtractDriveTime(sorted[j * 26 + i - 1].pickupTime,
                      Math.trunc(result.routes[0].legs[i].duration.value / 60));
              sorted[j * 26 + i].dropoffTime =
                  addDriveTime(sorted[j * 26 + i - 1].dropoffTime,
                      Math.trunc(result.routes[0].legs[i].duration.value / 60));
            }
          }
        } else {
          alert(result.status);
          return;
        }
      }
      setPolylines(polylines.map((line, index) =>
          index === selectedRoute ? newPolylinesDecoded : line
      ));
      setValidatedRoutes(validatedRoutes.map((bool, index) =>
          index === selectedRoute ? true : bool
      ));
      newPolylinesDecoded.forEach(newpolyLine => newpolyLine.setMap(googleMap));
      newSchool.routes[selectedRoute].stops = sorted;
      newSchool.routes[selectedRoute].polyline = newPolylinesEncoded;
      setSchool(newSchool);
    } catch (e) {
      alert(e);
    }
  }
  const completeRoute = firstSelect && !school.students.some(student =>
        (school.routes[selectedRoute].students.some(s => student.uid === s.uid) &&
            !hasInRangeStop(student, school.routes[selectedRoute])));

  return (
    <div id = "content">
      <h2 id = "title" > {school ?  " Route Planner: " + school.name: "Route Planner"} <FontAwesomeIcon
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
                  </ReactTooltip></h2>
      <div >
        {loading ? <h3>Loading</h3> :
            <div >
            
              <div style={{display: 'flex'}}>
                <div id="routes">
                  
                  <div id="routeEditor">

                    <h5 id = "sub-header-bus">  Select A Route Or Create a New One <FontAwesomeIcon
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
                        <p>Click on Create Route to add a new route to the school.</p>
                        <p>Click on the student icon in the toolbar to add/remove students to/from this route by clicking their icon on the map.</p>
                        <p>Click on the Validate Route button to create a route path based on the route's stops.</p>
                      </ReactTooltip> {firstSelect && <><FontAwesomeIcon
                        icon={completeRoute ? faCheck : faCircleExclamation}
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
                    </h5>
                
                    <div id="plannerSelectCreate">
                    <select
                        style={{width: "50%"}}
                      onChange={e => {
                        setSelectedRoute(parseInt(e.target.value));
                        setChangeRoute(false);
                        if (firstSelect && polylines[selectedRoute]) {
                          polylines[selectedRoute].forEach(polyline => polyline.setMap(null));
                        }
                        if (polylines[parseInt(e.target.value)]) {
                          polylines[parseInt(e.target.value)].forEach(polyline => polyline.setMap(googleMap));
                        }
                        setFirstSelect(true);
                        setPlaceStopLocation(false);
                        setChangeRoute(true);
                        setStopSelect(false);
                      }}
                      value={firstSelect ? selectedRoute : "-1"}
                  >
                    {!firstSelect && <option value="-1">Select a Route:</option>}
                    {school.routes.map((route, index) => (
                        <option value={index}>{route.name || "New Route"}</option>
                    ))}
                  </select>
                  <button onClick={e => createRoute()} className = "btn btn-outline-secondary">New Route</button>
                    </div>

                  {firstSelect && <div style={{width: "100%"}}><label id="plannerLabelDisplay"> Name: </label><input
                      type="text"
                      maxLength="100"
                      style={{width: "70%"}}
                      value={school.routes[selectedRoute].name}
                      onInput={e => {
                        setSchool({...school, routes: school.routes.map((r, index) =>
                              index === selectedRoute ? {...r, name: e.target.value} : r)});
                      }}
                  /></div>}
                  {firstSelect && <div style={{width: "100%"}}><label id="plannerLabelDisplay">Description: </label><textarea
                      id="routeDesciptionBox"
                      maxLength="500"
                      value={school.routes[selectedRoute].desciption}
                      onInput={e => {
                        setSchool({...school, routes: school.routes.map((r, index) =>
                              index === selectedRoute ? {...r, desciption: e.target.value} : r)});
                      }}
                  /></div>}
                  <h5 style={{width: "100%", padding: "0"}}>{`Students on route: ${firstSelect ? school.routes[selectedRoute].students.length: 0}`}</h5>
                  </div>

                  <div id="stops">
              
                      {firstSelect && <h5 id = "sub-header-bus"> Select A Stop Or Create A New One <FontAwesomeIcon
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
                        <p>Click Create Stop to add a new stop to the current route.</p>
                        <p>Check the stop icon in the toolbar to place/change the current stops location by clicking the map.</p>
                        <p>The stop times will be calculated and edited automatically when route is validated.</p>
                      </ReactTooltip> {stopSelect && <><FontAwesomeIcon
                          icon={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).longitude ? faCheck : faXmark}
                          id={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).longitude ? "plannerComplete" : "plannerIncomplete"}
                          size="sm"
                          data-tip
                          data-for="placedStopTip"
                      /><ReactTooltip
                          id="placedStopTip"
                          place="top"
                          effect="solid"
                      >
                        {school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).longitude ?
                            "This stop has had its location set on the map." :
                            "This stop has not had its location set on the map."
                        }
                      </ReactTooltip></>}</h5>}
                    
                    {firstSelect && <div id="plannerSelectCreate"><select
                        style={{ width: "50%" }}
                        onChange={e => {
                          setSelectedStop(parseInt(e.target.value));
                          setStopSelect(true);
                          setPlaceStopLocation(true);
                          setChangeRoute(false);
                        }}
                        value={stopSelect ? selectedStop : "-1"}
                    >
                      {stopSelect || <option value="-1">Select a Stop:</option>}
                      {school.routes[selectedRoute].stops.slice(0).sort((a, b) => a.arrivalIndex - b.arrivalIndex).map(stop => (
                          <option value={stop.arrivalIndex}>{stop.name || (stop.uid ? `Stop #${stop.arrivalIndex}` : "New Stop")}</option>
                      ))}
                    </select>
                    <button
                        className = "btn btn-outline-secondary"
                        onClick={e => {
                          setSchool({...school, routes: school.routes.map((route, index) =>
                                index === selectedRoute ? {...route, stops: [...route.stops, {
                                    name: "",
                                    location: "",
                                    arrivalIndex: route.stops.length,
                                    pickupTime: "00:00",
                                    dropoffTime: "00:00",
                                    inRangeStudents: []
                                  }]} : route
                            )}
                          );
                          setSelectedStop(school.routes[selectedRoute].stops.length);
                          setStopSelect(true);
                          setPlaceStopLocation(true);
                          setChangeRoute(false);
                          setValidatedRoutes(validatedRoutes.map((bool, index) =>
                              index === selectedRoute ? false : bool
                          ));
                        }}
                    >New Stop</button></div>}
                    <p> </p>
                    <p> </p>
                    {stopSelect && <div style={{ width: "100%" }}>
                      <div style={{ width: "100%"}}>
                        <label id="plannerLabelDisplay">Name: </label>
                        <input
                            type="text"
                            maxLength="100"
                            style={{ width: "70%" }}
                            value={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).name || ""}
                            onInput={e => {
                              setSchool({...school, routes: school.routes.map((route, index) =>
                                    index === selectedRoute ? {...route, stops: route.stops.map(stop =>
                                          stop.arrivalIndex === selectedStop ? {...stop, name: e.target.value} : stop
                                      )} : route)});
                            }}
                        />
                      </div>
                      <div style={{ width: "100%"}}>
                        <label id="plannerLabelDisplay"> Description: </label>
                        <input
                            type="text"
                            maxLength="100"
                            style={{ width: "70%" }}
                            value={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).location || ""}
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
                          {school.routes[selectedRoute].stops.slice(0).sort((a, b) => a.arrivalIndex - b.arrivalIndex).map(stop => (
                              <option value={stop.arrivalIndex}>{stop.arrivalIndex + 1}</option>
                          ))}
                        </select>
                        </label>
                      </div>
                    </div>}
                    {stopSelect && <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ flex: "35%" }}>
                        <label>Pick-Up Time: <input
                            type="time"
                            value={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).pickupTime}
                            readOnly={true}
                            style={{ backgroundColor: "transparent", border: "none" }}
                        /></label>
                      </div>
                      <div style={{ flex: "35%" }}>
                        <label>Drop-Off Time: <input
                            type="time"
                            value={school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).dropoffTime}
                            readOnly={true}
                            style={{ backgroundColor: "transparent", border: "none" }}
                        /></label>
                      </div>
                      <div style={{ flex: "30%" }}>
                        <button
                            className = "btn btn-outline-secondary"
                            onClick={e => {
                              setSchool({...school, routes: school.routes.map((route, index) =>
                                    index === selectedRoute ? {...route, stops: route.stops.filter(stop =>
                                          stop.arrivalIndex !== selectedStop).map(stop =>
                                          stop.arrivalIndex > selectedStop ? {...stop, arrivalIndex: stop.arrivalIndex - 1} : stop
                                      )} : route)});
                              setStopSelect(false);
                              setPlaceStopLocation(false);
                              setDeletedStops([...deletedStops, school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop)]);
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
                    {firstSelect && <div style = {{display: "inline-flex"}}>
                      <button
                          className = "btn btn-outline-secondary"
                          disabled={validatedRoutes[selectedRoute]}
                          onClick={e => calculateRoutes()}
                      >Visualize Route</button>
                      <button
                          className = "btn btn-outline-secondary"
                          onClick={e => {
                            setDeletedRoutes([...deletedRoutes, school.routes[selectedRoute]]);
                            setSchool({...school, routes: school.routes.filter((route, index) => index !== selectedRoute)});
                            if (polylines[selectedRoute]) {
                              polylines[selectedRoute].forEach(polyline => polyline.setMap(null));
                            }
                            setPolylines(polylines.filter((p, index) => index !== selectedRoute));
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
                </div>
                <div id="centerMapContainer">
                <div id="mapSideContainer">
                  <div id="toolbar">
                    <div id="tools">
                      
                    <button
                        className = "btn btn-outline-secondary"
                        id={changeRoute ? "mapActionButtonSelected" : "mapActionButton disabled"}
                        disabled={!firstSelect}
                        onClick={e => {
                          setChangeRoute(!changeRoute);
                          setPlaceStopLocation(false);
                        }}
                        data-tip
                        data-for="changeStudentRouteTip"

                    > Student Edit Mode <FontAwesomeIcon
                        icon={faLocationPin}
                        size="xl"
                    /></button>
                    <ReactTooltip
                      id="changeStudentRouteTip"
                      place="top"
                      effect="solid"
                      >
                    Add/remove student(s) to current route by clicking their icon on the map.
                  </ReactTooltip>
                    <button
                        className = "btn btn-outline-secondary"
                        id={placeStopLocation ? "mapActionButtonSelected" : "mapActionButton disabled"}
                        disabled={!stopSelect}
                        onClick={e => {
                          setChangeRoute(false);
                          setPlaceStopLocation(!placeStopLocation);
                        }}
                        data-tip
                        data-for="placeStopTip"

                    >Edit Bus Stop Mode <FontAwesomeIcon
                        icon={faMapPin}
                        size="xl"
                    />
                    </button><ReactTooltip
                      id="placeStopTip"
                      place="top"
                      effect="solid"
                  >
                    Place/move stop location by clicking on the map.
                  </ReactTooltip>
                    </div>
                    <div id="plannerKeys">
                      <div id="plannerKey">
                        <FontAwesomeIcon
                            icon={faMapPin}
                            size="2xl"
                        />
                        <ReactTooltip
                            id="placeStopTip"
                            place="top"
                            effect="solid"
                        >
                          Place/move stop location by clicking on the map.
                        </ReactTooltip>
                        <p>Stop</p>
                      </div>
                      <div id="plannerKey">
                        <FontAwesomeIcon
                            icon={faLocationPin}
                            size="2xl"
                        />
                        <ReactTooltip
                            id="placeStopTip"
                            place="top"
                            effect="solid"
                        >
                          Place/move stop location by clicking on the map.
                        </ReactTooltip>
                        <p>Student(s)</p>
                      </div>
                      <div id="plannerKey">
                        <FontAwesomeIcon
                            icon={faLocationDot}
                            size="2xl"
                        />
                        <ReactTooltip
                            id="placeStopTip"
                            place="top"
                            effect="solid"
                        >
                          Place/move stop location by clicking on the map.
                        </ReactTooltip>
                        <p id="descriptiveText">Student(s) w/o</p>
                        <p id="descriptiveText">in-range stop</p>
                      </div>
                      <div id="plannerKey">
                        <div id="exampleRed"/>
                        <p id="descriptiveText">Not on route</p>
                        <p id="descriptiveText">route</p>
                      </div>
                      <div id="plannerKey">
                        <div id="exampleBlue"/>
                        <p id="descriptiveText">On selected</p>
                        <p id="descriptiveText">route</p>
                      </div>
                      <div id="plannerKey">
                        <div id="exampleGreen"/>
                        <p id="descriptiveText">In range of</p>
                        <p id="descriptiveText">selected stop</p>
                      </div>
                    </div>
                  </div>
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
                    {locations.map((location) => (
                        <SelectableMarker
                            students={location.students}
                            onCurrentRoute={firstSelect && school.routes[selectedRoute].students.some(s => location.students[0].uid === s.uid)}
                            notOnRoute={!school.routes.some(route => route.students.some(s => s.uid === location.students[0].uid))}
                            inRangeStop={school.routes.some(route => route.stops.some(stop => stop.inRangeStudents.some(s => s.uid === location.students[0].uid)))}
                            onCurrentStop={firstSelect && stopSelect &&
                                school.routes[selectedRoute].stops.find(stop => stop.arrivalIndex === selectedStop).inRangeStudents.some(s => location.students[0].uid === s.uid)
                            }
                            selectRoute={(students) => {
                              if (!firstSelect || !changeRoute) {
                                return;
                              }
                              if (school.routes[selectedRoute].students.some(s => s.uid === students[0].uid)) {
                                setSchool({...school, routes: school.routes.map((r, index) =>
                                  index === selectedRoute ? {...r,
                                    students: r.students.filter(s => !students.some(st => st.uid === s.uid)),
                                    stops: r.stops.map(stop => ({...stop,
                                      inRangeStudents: stop.inRangeStudents.filter(s => !students.some(st => st.uid === s.uid))
                                    }))
                                } : r)});
                              } else {
                                setSchool({...school, routes: school.routes.map((r, index) => {
                                  if (r.students.some(s => s.uid === students[0].uid)) {
                                    return {...r,
                                      students: r.students.filter(s => !students.some(st => st.uid === s.uid)),
                                      stops: r.stops.map(stop => ({...stop,
                                        inRangeStudents: stop.inRangeStudents.filter(s => !students.some(st => st.uid === s.uid))
                                      }))
                                    };
                                  } else if (index === selectedRoute) {
                                    return {...r,
                                      students: [...r.students, ...students],
                                      stops: r.stops.map(stop => ({...stop,
                                          inRangeStudents: inRange(students[0], stop) ? [...stop.inRangeStudents, ...students] : stop.inRangeStudents
                                      }))
                                    };
                                  } else {
                                    return r;
                                  }
                                })});
                              }
                            }}
                            lat={parseFloat(location.latitude)}
                            lng={parseFloat(location.longitude)}
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
                </div>
                
                </div>
              </div>
            </div>
        }
      </div>
      <div id = "action-bar">
        <button onClick={e => saveData()} className = "btn btn-outline-secondary">Save All Changes</button>
      </div>
      </div>
  );
}
