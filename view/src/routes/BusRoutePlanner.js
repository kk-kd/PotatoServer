import "./BusRoutePlanner.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { SelectableMarker } from "./../map/SelectableMarker";
import { getOneRoutePlanner, saveRoute, updateSchool } from "./../api/axios_wrapper";

export const BusRoutePlanner = () => {
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState();
  const [firstSelect, setFirstSelect] = useState(false);
  const { schoolId } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneRoutePlanner(schoolId);
        setSchool(fetchedData.data);
        setLoading(false);
      } catch (error) {
        alert(error.request.data);
      }
    };
    fetchData();
  }, [schoolId]);
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
      }
    }
    try {
      for (var i = 0; i < school.routes.length; i++) {
        const route = school.routes[i];
        await saveRoute(route);
      }
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
      students: []
    };
    setSchool({...school, routes: [...school.routes, newRoute]});
    setSelectedRoute(school.routes.length);
    setFirstSelect(true);
  }

  return (
      <div>
        <h1>Route Planner</h1>
        <ul id="description">
          <li>Press Create Route to add a new route grouping to the school</li>
          <li>Select a route from the Select Route section to edit that route</li>
          <li>Select students on the map to add them to the currently selected route</li>
          <li>Changes to route names, descriptions, and groupings will not be saved until you press Save</li>
        </ul>
        {loading ? <h3>Loading</h3> :
            <div
                style={{height: '50vh', width: '50%', display: "inline-block"}}>
              <h3>{school.name}</h3>
              <GoogleMapReact
                  bootstrapURLKeys={{key: `${process.env.REACT_APP_GOOGLE_MAPS_API}`}}
                  defaultCenter={{ lat: parseFloat(school.latitude), lng: parseFloat(school.longitude) }}
                  defaultZoom={9}
              >
                <Marker text={school.name}
                        lat={parseFloat(school.latitude)}
                        lng={parseFloat(school.longitude)}/>
                {school.students.map((student) => (
                    <SelectableMarker
                        student={student}
                        onCurrentRoute={firstSelect && school.routes[selectedRoute].students.some(s => student.uid === s.uid)}
                        notOnRoute={!school.routes.some(route => route.students.some(s => s.uid === student.uid))}
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
              </GoogleMapReact>
              <div id="routeChooser">
                <div id="routeMarkerTutorial">
                  <h5>Students on Current Route:</h5>
                  <div id="exampleCurrentRouteMarker"/>
                </div>
                <div id="routeMarkerTutorial">
                  <h5>Students with No Route:</h5>
                  <div id="exampleNoRouteMarker"/>
                </div>
                <div id="routeMarkerTutorial">
                  <h5>Students on Other Routes:</h5>
                  <div id="exampleRouteMarker" />
                </div>
              </div>
              <div id="routeChooser">
                <div id="routes">
                  <h3>Select Route To Edit</h3>
                  <select onChange={e => {
                    setSelectedRoute(parseInt(e.target.value));
                    setFirstSelect(true);
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
                <div id="routeData">
                  <h3>Current Route Info</h3>
                  <h5>Route Name</h5>
                  {firstSelect && <input type="text"
                          maxLength="100"
                          value={school.routes[selectedRoute].name}
                          onInput={e => {
                            setSchool({...school, routes: school.routes.map((r, index) =>
                                  index === selectedRoute ? {...r, name: e.target.value} : r)});
                          }}
                  />}
                  <h5>Route Description</h5>
                  {firstSelect && <textarea rows="5" cols="40" maxLength="500"
                            value={school.routes[selectedRoute].desciption}
                            onInput={e => {
                              setSchool({...school, routes: school.routes.map((r, index) =>
                                   index === selectedRoute ? {...r, desciption: e.target.value} : r)});
                            }}
                  />}
                </div>
              </div>
              <button onClick={e => saveData()}>Save</button>
            </div>
        }
      </div>
  );
}
