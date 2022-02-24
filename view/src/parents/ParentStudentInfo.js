import GoogleMapReact from "google-map-react";
import "./ParentStudent.css"
import React, { useEffect, useState, Fragment } from "react";
import { getAllStudents, updateStudent } from "../api/axios_wrapper";
import { Link, useNavigate, useParams } from "react-router-dom";
import {getOneStudent} from "../api/axios_wrapper";
import TextField from "@mui/material/TextField";
import ReactSelect from "react-select";
import { useForm, Controller } from "react-hook-form";
import { flexbox } from "@mui/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Marker } from "../map/Marker";
import {
  faArrowUp,
  faArrowDown,
  faCircleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { RouteStops } from "../routes/RouteStops";

// this page is the parent view for student detail
export const ParentStudentInfo = () => {
  const { id } = useParams();

  const [student, setStudent] = useState();

  const [selectedRoute, setSelectedRoute] = useState();
  const [selectedSchool, setSelectedSchool] = useState();

   // maps
   const [ mapReady,  setMapReady ] = useState(false);
   const [ studentLoaded,  setStudentLoaded ] = useState(false);
   const [ mapApi, setMapApi ] = useState();
   const [ lat, setLat ] = useState();
   const [ lng, setLng ] = useState();
   const [ map, setMap ] = useState();
   const [ apiLoaded, setApiLoaded ] = useState(false);
   const [ geocoder, setGeocoder ] = useState();
   const [ error, setError ] = useState(null);
   const defaultProps = {
       center: {
       lat: 0,
       lng: 0
       },
       zoom: 13
   };

  let navigate = useNavigate();

 
  const fetchStudentData = async () => {
    try {
      const fetchedData = await getOneStudent(id);
      setStudent({ ...fetchedData.data, studentid: fetchedData.data.id });

      if (fetchedData.data.school) {
        setSelectedSchool(fetchedData.data.school);
      }
      if (fetchedData.data.route) {
        setSelectedRoute(fetchedData.data.route);
      }
      console.log(fetchedData.data);
      updateStudentLoading(fetchedData);
    } catch (error) {
      let message = error.response.data;
      throw alert(message);
    }
  };

  // fetch data upon page load
  useEffect(() => {
    fetchStudentData();
  }, []);

  const updateStudentLoading = (data) => {
    setStudentLoaded(true);
  }
  const handleApiLoaded = (map, maps) => {
    const geocoder = new maps.Geocoder();
    setMapApi({geocoder: geocoder, map: map});
    setApiLoaded(true);
}

  useEffect(() => {
    if ((apiLoaded) && (studentLoaded) && (student.inRangeStops)) {
      setMapReady(true);
      if (student.inRangeStops.length !==0) {
        let lat_center = student.inRangeStops[0].latitude
        let lng_center = student.inRangeStops[0].longitude
        mapApi.map.setCenter({lat: parseFloat(lat_center) , lng: parseFloat(lng_center)});
        mapApi.map.setZoom(16);
      }
    } 
  }, [apiLoaded, studentLoaded]);

  return (
    <div id="content">
      <h2 id="title">
        {" "}
        {student ? student.firstName : ""} {student ? student.lastName : ""}{" "}
      </h2>
      
      <div>
          {
              <button onClick={e => navigate("/MyStudents")}> Back To All Students </button>
          }
      </div>

    <div id = "main_form"> 
    <h5 id = "sub-header"> Student Information </h5>     
      <label id="input-label-student"> First Name: </label>
      <input
        id="input-input-student-parent"
        disabled={true}
        type="text"
        maxLength="100"
        value={student ? student.firstName : ""}
      />

      <label id="input-label-student"> Middle Name: </label>
      <input
        id="input-input-student-parent"
        disabled={true}
        type="text"
        maxLength="100"
        value={student ? student.middleName : ""}
      />

      <label id="input-label-student"> Last Name: </label>
      <input
        id="input-input-student-parent"
        disabled={true}
        type="text"
        maxLength="100"
        value={student ? student.lastName : ""}
      />

      <label id="input-label-student" for="lastName">
        {" "}
        Student ID:{" "}
      </label>
      <input
        id="input-input-student-parent"
        disabled={true}
        type="text"
        maxLength="100"
        value={student ? student.studentid : ""}
      />

   
        <div>
          <label id="input-label-student"> School: </label>
          {selectedSchool && (
            <span id="input-input-inline-item">
              
                {selectedSchool.name}
             
            </span>
          )}
          {!selectedSchool && <span id="input-input-inline-item"> None </span>}
        </div>
      
        <div>
          <label id="input-label-student"> Route: </label>
          {selectedRoute && (
            <span id="input-input-inline-item">
        
                {selectedRoute.name}
              
            </span>
          )}
          {!selectedRoute && (
            <span id="input-input-inline-item">
              {" "}
              <FontAwesomeIcon
                icon={faXmark}
                size="lg"
                style={{ color: "red" }}
                data-tip
                data-for="noInRangeStopTip"
              />{" "}
              This Student Is Missing a Bus Route. Please Contact Your Bus Administrator. {" "}
            </span>
          )}
    
        <p> </p>
        <p> </p>
        <h5 id = "sub-header"> Stop Information </h5>
      
      {
        !(
          student &&
          student.inRangeStops &&
          student.inRangeStops.length !== 0
        ) && (
          <div>
            <label id="input-label-student">  </label>
            <span id="input-input-inline-item">
              {" "}
              <FontAwesomeIcon
                icon={faCircleExclamation}
                size="lg"
                style={{ color: "red" }}
                data-tip
                data-for="noInRangeStopTip"
              />{" "}
              This Student Is Missing a Bus Stop Near Their Home Address. Please Contact Your Bus Administrator.  {" "}
            </span>
          </div>
        )}
      </div>

      {student && student.inRangeStops && student.inRangeStops.length !== 0 && (
        <div
          style={{
            display: "flex",
            width: "90%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <RouteStops data={student.inRangeStops} />
        </div>
      )}
      </div>

      <div id="map">
            {studentLoaded && <div style={{ height: '50vh', width: '80%', display: "inline-block" }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_MAPS_API}` }}
                    defaultCenter={defaultProps.center}
                    defaultZoom={defaultProps.zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                >
                {
                student.inRangeStops.map(stop => (
                    <Marker
                        lat={parseFloat(stop.latitude)}
                        lng={parseFloat(stop.longitude)}
                        stop={stop}
                        isStop
                        detail
                        />
                      ))}
                </GoogleMapReact>
             </div>
            }
        </div>


      <div></div>

    </div>
  );
};
