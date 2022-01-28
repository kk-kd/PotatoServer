import { useState } from "react";
import { useParams } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { SelectableMarker } from "./../map/SelectableMarker";

export const BusRoutePlanner = () => {
  const [ selectedRoute, setSelectedRoute ] = useState();
  const [ students, setStudents ] = useState([
        {
          uid: "1",
          lat: 36,
          lng: 78,
          route: "1"
        },
        {
          uid: "2",
          lat: 36,
          lng: 79,
          route: null
        },
        {
          uid: "3",
          lat: 37,
          lng: 79,
          route: "1"
        },
        {
          uid: "4",
          lat: 37,
          lng: 78,
          route: "2"
        }
      ]
  );
  const { schoolId } = useParams();
  const defaultProps = {
    center: {
      lat: 36.0014,
      lng: 78.9382
    },
    zoom: 6
  };

  return (
      <div>
        <h1>Route Planner</h1>
        <h2>{`School ID: ${schoolId}`}</h2>
        <div style={{ height: '50vh', width: '50%', display: "inline-block" }}>
          <GoogleMapReact
              bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_MAPS_API}` }}
              defaultCenter={defaultProps.center}
              defaultZoom={defaultProps.zoom}
          >
            {students.map((student) => (
                <SelectableMarker
                  id={student.uid}
                  currentRoute={selectedRoute}
                  selectRoute={(id) => setStudents(students.map(
                      (student) => student.uid === id ? {...student, route: selectedRoute} : student))}
                  routeId={student.route}
                  lat={student.lat}
                  lng={student.lng}
                />
            ))}
          </GoogleMapReact>
          <div onClick={e => setSelectedRoute("1")}>Route 1</div>
          <div onClick={e => setSelectedRoute("2")}>Route 2</div>
        </div>
      </div>
  );
}
