import "./BusRouteInfo.css";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from 'react-to-print';
import { Link, useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import {
  deleteRoute,
  getRouteActiveRun,
  saveRoute,
  getOneRoute,
  updateRoute,
  getBusLocation
} from "./../api/axios_wrapper";
import { StartRunModal } from "./../run/StartRunModal";
import { BusRouteRuns } from "./BusRouteRuns";
import { PrintableRoster } from "./PrintableRoster";
import { RouteStops } from "./RouteStops";
import { RouteStudents } from "./RouteStudents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationPin,
  faLocationDot,
  faSchool,
  faMapPin,
  faCircleQuestion,
  faCircleExclamation,
  faCheck,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const BusRouteInfo = ({ role }) => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stops, setStops] = useState([]);
  const [route, setRoute] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [school, setSchool] = useState();
  const [activeBus, setActiveBus] = useState();
  const [foundBus, setFoundBus] = useState(false);
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [desciption, setDesciption] = useState("");
  const getRoute = async () => {
    try {
      const routeData = await getOneRoute(id);
      setRoute(routeData.data);
      setSchool(routeData.data.school);
      setName(routeData.data.name);
      setDesciption(routeData.data.desciption);
      setStudents(routeData.data.students);
      setStops(routeData.data.stops);
      setLoaded(true);
      var locationSet = [];
      routeData.data.students.forEach(student => {
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
      setLoading(false);
    } catch (e) {
      alert(e.response.data);
    }
  }
  useEffect(() => {
    getRoute();
  }, []);
  useEffect(() => {
    const updateBusLocation = setInterval(async () => {
      try {
        const currentBus = await getRouteActiveRun(id);
        const busLocation = await getBusLocation(currentBus.data.busNumber);
        console.log(busLocation);
        setActiveBus(busLocation.data);
        setFoundBus((busLocation.data.longitude && busLocation.data.latitude) ? true : false);
      } catch (e) {
        setFoundBus(false);
        console.log(e);
      }
    }, 1000);
    return () => clearInterval(updateBusLocation);
  }, []);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length === 0) {
      alert("Please input a route name.");
    } else if (!desciption || desciption.trim().length === 0) {
      alert("Please input a route description.")
    } else {
      try {
        await updateRoute(route.uid, {
          uid: route.uid,
          name: name,
          desciption: desciption
        });
        alert("Succesfully edited route.");
        setIsEdit(false);
        getRoute();

      } catch (e) {
        alert(e.response.data);
      }
    }
  }
  const deleteSch = async () => {
    try {
      await saveRoute({
        uid: route.uid,
        name: name,
        school: school,
        desciption: desciption,
        stops: stops.map(stop => ({...stop, inRangeStudents: []}))
      })
      await deleteRoute(id);
      alert("Route was succesfully deleted");
      navigate("/Routes/list");
    } catch (e) {
      alert(e.response.data);
    }
  }
  if (isDelete) {
    let deleteThisRoute = window.confirm("Do you want to delete this route?");
    if (!deleteThisRoute) {
      setIsDelete(false);
    } else {
      deleteSch();
    }
  }

  if (loading) {
    return (
        <h1>Loading</h1>
    )
  }

  return (
      <div id = "content">
        <h2 id = "title">{route.name} <FontAwesomeIcon
          icon={!students.some(student => student.inRangeStops.length === 0) ? faCheck : faCircleExclamation}
          id={!students.some(student => student.inRangeStops.length === 0) ? "plannerComplete" : "plannerIncomplete"}
          size="sm"
          data-tip
          data-for="completePlannerTip"
          /><ReactTooltip
            id="completePlannerTip"
            place="top"
            effect="solid"
        >
          {!students.some(student => student.inRangeStops.length === 0) ? "All students on this route have an in range bus stop." :
              "At least one student on this route does not have an in range bus stop."
          }
        </ReactTooltip></h2>
        <div style={{ display: "none" }}>
          <PrintableRoster data={[...students].splice(0).sort((a, b) => a.fullName.localeCompare(b.fullName))} route={route} ref={componentRef} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
          {role === "Driver" && <StartRunModal route={route} />}
          {(!isEdit && (role === "Admin" || role === "School Staff")) && <button onClick={e => setIsEdit(true)}>Edit Route Details </button>}
          {isEdit && <button onClick={e => setIsEdit(false)}>Cancel Changes</button>}
          {(role === "Admin" || role === "School Staff") && <button onClick={e => setIsDelete(true)}>Delete Route</button>}
          {(role === "Admin" || role === "School Staff") && <button onClick={e => {if (school.uid) {navigate(`/Routes/planner/${school.uid}`)}}}>Edit Students/Stops</button>}
          {(role === "Admin" || role === "School Staff") && <button onClick={e => navigate(`/Emails/send/-1/${id}`)}>Send Announcement</button>}
          <button onClick={handlePrint}>Print Roster</button>
          <button onClick={() => navigate(`/Routes/navigation/${id}`)}>Navigation Link(s)</button>
        </div>

        <div id = "main_form">
          <h5 id = "sub-header"> Details </h5>
          <div>
            <label id="school-route-label">School Name: <Link to={`/Schools/info/${school.uid}`}>{school.name}</Link></label>
          </div>

              
              <label id="label-route">Route Name: </label>
                <input
                    id="input-route"
                    type="text"
                    maxLength="100"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    readOnly={!isEdit}
                />
             
              <label id="label-route">Route Description: </label>
                <textarea
                    id="input-route"
                    rows="5"
                    cols="40"
                    maxLength="500"
                    value={desciption}
                    onChange={e => setDesciption(e.target.value)}
                    readOnly={!isEdit}
                />
              
            {isEdit && <button style = {{display: 'in-line block', margin: '20px'}} className = "button" onClick = {(e) => {onSubmit(e)}} type="button"> Submit Changes</button>}


          <p> </p>
          <p> </p>
          <p> </p>
          <h5 id = "sub-header"> Stops </h5>
          <div style={{ display: "flex", width: "90%", marginLeft: "auto", marginRight: "auto" }}>
              <RouteStops data={[school, ...stops.map(stop => ({...stop, arrivalIndex: parseInt(stop.arrivalIndex)})).sort((a, b) => b.arrivalIndex - a.arrivalIndex)]} />
          </div>
          <h5 id = "sub-header"> Students </h5>
          <div>
            <RouteStudents data={[...students]} />
          </div>
        </div>

        <div id = "map">
        {loaded && <div style={{ height: '50vh', flex: "50%", width: '100%', display: "inline-block" }}>
          <GoogleMapReact
              bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_MAPS_API}` }}
              defaultCenter={{ lat: parseFloat(school.latitude), lng: parseFloat(school.longitude)}}
              defaultZoom={6}
          >
            {locations.map(location => (
                <Marker
                    lat={parseFloat(location.latitude)}
                    lng={parseFloat(location.longitude)}
                    students={location.students}
                    inRangeStop={location.students[0].inRangeStops && location.students[0].inRangeStops.length > 0}
                />
            ))}
            {stops.map(stop => (
                <Marker
                    lat={parseFloat(stop.latitude)}
                    lng={parseFloat(stop.longitude)}
                    stop={stop}
                    isStop
                    detail
                />
            ))}
            {foundBus && <Marker
                lat={parseFloat(activeBus.latitude)}
                lng={parseFloat(activeBus.longitude)}
                isBus
              />}
            <Marker
                text={school.name}
                lat={parseFloat(school.latitude)}
                lng={parseFloat(school.longitude)}
                isSchool
            />
          </GoogleMapReact>
          {foundBus && <div><h4>Active Run</h4><div>{`Bus: ${activeBus.busNumber}`}</div></div>}
          </div>}
          </div>
        <div style={{ width: "100%", padding: "50px", display: "inline-block" }}>
          <h5 id = "sub-header"> Run Logs </h5>
          <BusRouteRuns uid={id} />
        </div>
      </div>
  );
}