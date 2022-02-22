import "./BusRouteInfo.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { deleteRoute, saveRoute, getOneRoute, updateRoute } from "./../api/axios_wrapper";
import { RouteStops } from "./RouteStops";
import { RouteStudents } from "./RouteStudents";
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
import ReactTooltip from "react-tooltip";

export const BusRouteInfo = () => {
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
  const [name, setName] = useState("");
  const [desciption, setDesciption] = useState("");
  useEffect(() => {
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
    getRoute();
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
        navigate("/Routes/list")
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
      <div>
        <h1>{route.name} <FontAwesomeIcon
          icon={!students.some(student => student.inRangeStops.length === 0) ? faCheck : faXmark}
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
        </ReactTooltip></h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
          <button onClick={e => setIsEdit(true)}>Edit Route</button>
          <button onClick={e => setIsDelete(true)}>Delete Route</button>
          <button onClick={e => navigate(`/Routes/planner/${school.uid}`)}>Edit Students/Stops</button>
          <button onClick={e => navigate(`/Emails/send/${null}/${id}`)}>Send Email Announcement</button>
        </div>
        <form onSubmit={e => onSubmit(e)}>
          <div id="routeDetailForm">
            <label id="routeDetailSchoolName">School Name:
              <Link id="routeDetailSchoolLink" to={`/Schools/info/${school.uid}`}>{school.name}</Link>
            </label>
          <label id="routeDetailNameLabel">Route Name:
            <input
                id="routeDetailNameInput"
                type="text"
                maxLength="100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEdit}
            />
          </label>
          <label id="routeDetailDescriptionLabel">Route Description:
            <textarea
                id="routeDetailDescriptionInput"
                rows="5"
                cols="40"
                maxLength="500"
                value={desciption}
                onChange={e => setDesciption(e.target.value)}
                readOnly={!isEdit}
            />
          </label>
          </div>
          {isEdit && <input type="submit" value="submit" />}
        </form>
        <div style={{ display: "flex", width: "90%", marginLeft: "auto", marginRight: "auto" }}>
          <RouteStops data={[school, ...stops.map(stop => ({...stop, arrivalIndex: parseInt(stop.arrivalIndex)})).sort((a, b) => b.arrivalIndex - a.arrivalIndex)]} />
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
            <Marker
                text={school.name}
                lat={parseFloat(school.latitude)}
                lng={parseFloat(school.longitude)}
                isSchool
            />
          </GoogleMapReact>
        </div>}
          <RouteStudents data={students} />
        </div>
      </div>
  );
}