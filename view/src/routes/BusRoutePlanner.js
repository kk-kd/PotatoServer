import "./BusRoutePlanner.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { SelectableMarker } from "./../map/SelectableMarker";
import { getOneRoutePlanner, saveRoute, updateSchool } from "./../api/axios_wrapper";

export const BusRoutePlanner = () => {
  const [ selectedRoute, setSelectedRoute ] = useState();
  const [ loading, setLoading ] = useState(true);
  const [ school, setSchool ] = useState();
  const { schoolId } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneRoutePlanner(schoolId);
        console.log(fetchedData);
        setSchool(fetchedData.data);
        setLoading(false);
      } catch (error) {
        alert(error.request.data);
      }
    };
    fetchData();
  }, [schoolId]);
  const saveData = async () => {
    try {
      const saved = await updateSchool(schoolId, school);
      setSchool(saved.data);
    } catch (error) {
      alert(error.request.data);
    }
  }
  const createRoute = async () => {
    try {
      const newRoute = await saveRoute({
        name: "Default Name",
        desciption: "Default Description",
        school: school
      });
      setSchool({...school, routes: [...school.routes, newRoute.data]});
    } catch (error) {
      alert(error.request.data);
    }
  }

  return (
      <div>
        <h1>Route Planner</h1>
        {loading ? <h3>Loading</h3> :
            <div
                style={{height: '50vh', width: '50%', display: "inline-block"}}>
              <h3>{school.name}</h3>
              <GoogleMapReact
                  bootstrapURLKeys={{key: `${process.env.REACT_APP_GOOGLE_MAPS_API}`}}
                  defaultCenter={{ lat: parseFloat(school.latitude), lng: parseFloat(school.longitude) }}
                  defaultZoom={6}
              >
                <Marker text={school.name}
                        lat={parseFloat(school.latitude)}
                        lng={parseFloat(school.longitude)}/>
                {school.students.map((student) => (
                    <SelectableMarker
                        id={student.uid}
                        currentRoute={selectedRoute ? selectedRoute.uid : null}
                        selectRoute={(id) => {
                          if (!selectedRoute) {
                            console.log("no");
                            return;
                          }
                          setSchool({...school, students: school.students.map((student) =>
                            student.uid === id ? {...student, route: selectedRoute} : student
                          )});
                        }}
                        routeId={student.route.uid}
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
              </div>
              <div id="routeChooser">
                <div id="routes">
                  <h3>Select Route</h3>
                  {school.routes.map((route) => (
                      <div style={{ padding: 5 }}>
                        <label style={{ cursor: "pointer" }}
                               onClick={e => setSelectedRoute(route)
                        }>{route.name}</label>
                      </div>
                  ))}
                  <button onClick={e => createRoute()}>Create Route</button>
                </div>
                <div id="routeData">
                  <h3>Route Info</h3>
                  <h5>Route Name</h5>
                  {selectedRoute && <input type="text"
                          maxLength="30"
                          value={selectedRoute.name}
                          onInput={e => {
                            setSelectedRoute({...selectedRoute, name: e.target.value});
                            setSchool({...school, routes:
                                  school.routes.map((route) => route.uid === selectedRoute.uid ? {...route, name: e.target.value} : route)
                          })}}
                  />}
                  <h5>Route Description</h5>
                  {selectedRoute && <textarea rows="5" cols="40" maxLength="100"
                            value={selectedRoute.desciption}
                            onInput={e => {
                              setSelectedRoute({...selectedRoute, desciption: e.target.value});
                              setSchool({...school, routes:
                                  school.routes.map((route) => route.uid === selectedRoute.uid ? {...route, desciption: e.target.value} : route)
                            })}}
                  />}
                </div>
              </div>
              <button onClick={e => saveData()}>Save</button>
            </div>
        }
      </div>
  );
}
