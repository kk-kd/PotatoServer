import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { deleteRoute, getOneRoute, updateRoute } from "./../api/axios_wrapper";
import { RouteSchool } from "./RouteSchool";
import { RouteStudents } from "./RouteStudents";

export const BusRouteInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
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
        setLoaded(true);
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
      await deleteRoute(id);
      alert("Route was succesfully deleted");
      navigate("/Routes/list")
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

  return (
      <div>
        <h1>Route Info</h1>
        <div>
          <button onClick={e => setIsEdit(true)}>Edit Route</button>
          <button onClick={e => setIsDelete(true)}>Delete Route</button>
          <button onClick={e => navigate(`/Routes/planner/${school.uid}`)}>Route Planner</button>
          <button onClick={e => navigate(`/Emails/send/-1/${id}`)}>Send Email Announcement</button>
        </div>
        <form onSubmit={e => onSubmit(e)}>
          <label id="schoolInput">Route Name:
            <input
                type="text"
                maxLength="100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEdit}
            />
          </label>
          <label id="schoolInput">Route Description:
            <textarea rows="5" cols="40" maxLength="500"
                      value={desciption}
                      onChange={e => setDesciption(e.target.value)}
                      readOnly={!isEdit}
            />
          </label>
          {isEdit && <input type="submit" value="submit" />}
        </form>
        {loaded && <div style={{ height: '50vh', width: '50%', display: "inline-block" }}>
          <GoogleMapReact
              bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_MAPS_API}` }}
              defaultCenter={{ lat: parseFloat(school.latitude), lng: parseFloat(school.longitude)}}
              defaultZoom={6}
          >
            {students.map(student => (
                <Marker
                    text={`${student.firstName} ${student.lastName}`}
                    lat={parseFloat(student.parentUser.latitude)}
                    lng={parseFloat(student.parentUser.longitude)}
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
        {loaded && <RouteSchool school={school} />}
        {loaded && <RouteStudents data={students} />}
      </div>
  );
}