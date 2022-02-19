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
  const [deletedStops, setDeletedStops] = useState([]);
  const [changeRoute, setChangeRoute] = useState(false);
  const [locations, setLocations] = useState([]);
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
      for (var i = 0; i < deletedStops.length; i++) {
        var stop = deletedStops[i];
        if (stop.uid) {
          stop.inRangeStudents = [];
          await saveStop(stop);
        }
      }
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
        var route = deletedRoutes[i];
        if (route.uid) {
          delete route.students;
          route.stops = route.stops.map(stop => ({...stop, inRangeStudents: []}));
          console.log(route);
          await saveRoute(route);
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
      polyline: []
    };
    if (polylines[selectedRoute]) {
      polylines[selectedRoute].forEach(polyline => polyline.setMap(null));
    }
    setSchool({...school, routes: [...school.routes, newRoute]});
    setSelectedRoute(school.routes.length);
    setChangeRoute(false);
    setFirstSelect(true);
    setStopSelect(false);
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
    map.addListener("zoom_changed", () => {
      console.log(map.getZoom());
    });
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
        console.log(result);
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
          console.log(sorted);
          console.log(result.routes[0].overview_polyline);
          console.log(result.routes[0].overview_polyline.includes(","));
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
      <div id="busRouteComplete">
        {loading ? <h3>Loading</h3> :
            <div id="busRouteFlex">
              <div style={{display: 'flex'}}>
                <div id="routes">
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
                  </ReactTooltip> <FontAwesomeIcon
                      icon={!validatedRoutes.includes(false) ? faCheck : faXmark}
                      id={!validatedRoutes.includes(false) ? "plannerComplete" : "plannerIncomplete"}
                      size="sm"
                      data-tip
                      data-for="readyToSaveTip"
                  /><ReactTooltip
                      id="readyToSaveTip"
                      place="top"
                      effect="solid"
                  >
                    {!validatedRoutes.includes(false) ? "All routes have been validated and can be saved." :
                        "Not all routes have been validated.  All routes must be validated before saving."
                    }
                  </ReactTooltip></h1>
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
                        <p>Click on Create Route to add a new route to the school.</p>
                        <p>Click on the student icon in the toolbar to add/remove students to/from this route by clicking their icon on the map.</p>
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
                        setStopSelect(false);
                      }}
                      value={firstSelect ? selectedRoute : "-1"}
                  >
                    {!firstSelect && <option value="-1">Select a Route:</option>}
                    {school.routes.map((route, index) => (
                        <option value={index}>{route.name || "New Route"}</option>
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
                    {firstSelect && <div style={{width: "100%"}}>{`Students on route: ${school.routes[selectedRoute].students.length}`}</div>}
                    {firstSelect && <div><button
                      onClick={e => calculateRoutes()}
                    >{validatedRoutes[selectedRoute] ? "Valid Route!" : "Validate Route"}</button>
                      <button
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
                      </ReactTooltip></>}</h3>}
                    {firstSelect || <h5>Select a route to edit its stops.</h5>}
                    {firstSelect && <div id="plannerSelectCreate"><select
                        style={{ width: "50%" }}
                        onChange={e => {
                          setSelectedStop(parseInt(e.target.value));
                          setStopSelect(true);
                          setPlaceStopLocation(false);
                        }}
                        value={stopSelect ? selectedStop : "-1"}
                    >
                      {stopSelect || <option value="-1">Select a Stop:</option>}
                      {school.routes[selectedRoute].stops.slice(0).sort((a, b) => a.arrivalIndex - b.arrivalIndex).map(stop => (
                          <option value={stop.arrivalIndex}>{stop.name || (stop.uid ? `Stop #${stop.uid}` : "New Stop")}</option>
                      ))}
                    </select>
                    <button
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
                          setPlaceStopLocation(false);
                          setValidatedRoutes(validatedRoutes.map((bool, index) =>
                              index === selectedRoute ? false : bool
                          ));
                        }}
                    >Create Stop</button></div>}
                    {stopSelect && <div style={{ width: "100%" }}>
                      <div style={{ width: "100%"}}>
                        <label id="plannerLabelDisplay">Stop Name: </label>
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
                        <label id="plannerLabelDisplay">Location Description: </label>
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
                  </div>
                </div>
                <div id="centerMapContainer">
                <div id="mapSideContainer">
                  <div id="toolbar">
                    <div id="tools">
                    <button
                        id={changeRoute ? "mapActionButtonSelected" : "mapActionButton"}
                        disabled={!firstSelect}
                        onClick={e => {
                          setChangeRoute(!changeRoute);
                          setPlaceStopLocation(false);
                        }}
                        data-tip
                        data-for="changeStudentRouteTip"
                    ><FontAwesomeIcon
                        icon={faLocationPin}
                        size="xl"
                    /></button><ReactTooltip
                      id="changeStudentRouteTip"
                      place="top"
                      effect="solid"
                  >
                    Add/remove student(s) to current route by clicking their icon on the map.
                  </ReactTooltip>
                    <button
                        id={placeStopLocation ? "mapActionButtonSelected" : "mapActionButton"}
                        disabled={!stopSelect}
                        onClick={e => {
                          setChangeRoute(false);
                          setPlaceStopLocation(!placeStopLocation);
                        }}
                        data-tip
                        data-for="placeStopTip"
                    ><FontAwesomeIcon
                        icon={faMapPin}
                        size="xl"
                    /></button><ReactTooltip
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
                  <button onClick={e => saveData()}>Save All Changes</button>
                </div>
              </div>
            </div>
        }
      </div>
  );
}
