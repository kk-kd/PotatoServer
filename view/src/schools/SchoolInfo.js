import "./SchoolInfo.css"
import GoogleMapReact from "google-map-react";
import { useState, useMemo, useEffect  } from "react";
import { Marker } from "../map/Marker";

import {saveSchool, updateSchool, deleteSchool, getOneSchool} from "../api/axios_wrapper";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";
import { Link, use, useNavigate, useParams} from "react-router-dom";
import {useTable} from "react-table";
import * as React from 'react';
import { SchoolStudents} from "./SchoolStudents";
import { SchoolRoutes } from "./SchoolRoutes";


export const SchoolInfo = ({edit}) => {
    let navigate = useNavigate(); 

    const { id } = useParams();

    const [editable, setEditable] = useState(edit);
    const action_text = editable ? "Edit" : "View" 
    const [ schoolLoaded,  setSchoolLoaded ] = useState(false);

    const [school, setSchool] = useState({
      name: '', 
      address: '', 
      students: [],
    });

    const [addressValid, setAddressValid] = useState(false);


    // maps
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


    const validate_entries = () => {
      if (!school.name || school.name.trim().length === 0){
          return {valid: false, error: 'School Name Required'}
      }
      else if (!school.address) {
        return {valid: false, error:"Please provide an address"}
      }
      else if (!addressValid) {
        return {valid: false, error: "Please Validate Address."}
      }
      return {valid: true, error: ''}
  }
    const handleSchoolFormSubmit = async (e) => {
        e.preventDefault();
        let valid_results = validate_entries();
        if (valid_results.valid) {
            try {
                await updateSchool(school.uid, {...school,
                name: school.name,
                address: school.address,
                latitude: lat,
                longitude: lng
                });
                alert("School Update Successful");
                setEditable(false); 
                fetchSchoolData();
            } catch (e) {
                alert(e.response.data);
            }
        }
        else {
            alert(valid_results.error)
        }
        
    }
    const deleteSch = async () => {
        try {
          await deleteSchool(id);
          alert("School was succesfully deleted");
          navigate("/Schools/list")
        } catch (e) {
          alert(e.response.data);
        }
      }

    const handleDeleteSchool = async (e) => {
        let sName = prompt("Do you want to delete?  If so, enter school name:");
        console.log(sName.trim().toLowerCase() !== school.name.trim().toLowerCase())
        if (!sName || (sName.trim().toLowerCase() !== school.name.trim().toLowerCase())) {
            alert ("Entries Do Not Match")
            return;
        } else {
            deleteSch();
        }
    }

    const fetchSchoolData = async () => {
        try {
          const schoolData = await getOneSchool(id);
          setSchool(schoolData.data)
          console.log(schoolData.data)
          updateSchoolLoading(schoolData.data);
        } catch (e) {
          alert(e.response.data);
        }
      }

    // load data on page load 
    useEffect(() => {
        fetchSchoolData();
    }, []);
    
    // refresh data when changing from edit/view mode
    useEffect(() => {
        fetchSchoolData();
    }, [editable]);

    // waits until both api and data are loaded to load map address. 
    useEffect(() => {
        if ((apiLoaded) && (schoolLoaded) && (school.address)) {
          checkMap(null);
        } 
      }, [apiLoaded, schoolLoaded]);

      const updateSchoolLoading = (data) => {
        console.log(data)
        setSchoolLoaded(true);
      }
  
  
      //maps
      const checkMap = (e) => {
        if (e) {
          e.preventDefault();
        }
        console.log(apiLoaded)
        if (apiLoaded) {
          searchLocation()
        } 
      }

    const searchLocation = () => {
        mapApi.geocoder.geocode( { 'address': school.address }, (results, status) => {
          if (!school.address || school.address.trim().length === 0) {
            alert("Please Enter an Address"); 
            return;
          }
          if (status === "OK") {
            mapApi.map.setCenter(results[0].geometry.location);
            setLng(results[0].geometry.location.lng());
            setLat(results[0].geometry.location.lat());
            setError(null);
            setSchool({...school, address : school.address});
            setAddressValid(true);
          } else if (status === "ZERO_RESULTS") {
            setAddressValid(false);
            setError("No results for that address");
            alert ("No results for that address");
     
          } else {
            setAddressValid(false);
            setError("Server Error. Try again later");
            alert("Server Error. Try again later"); 
          }
        });
    }
    const handleApiLoaded = (map, maps) => {
        const geocoder = new maps.Geocoder();
        setMapApi({geocoder: geocoder, map: map});
        setApiLoaded(true);
    }

    const columns = useMemo(
        () => [
          {
            Header: "First Name",
            accessor: "firstName",
          },
          {
            Header: "Middle Name",
            accessor: "middleName",
          },
          {
            HeaderName: "Last Name",
            accessor: "lastName",
          },
          {
            HeaderName: "ID",
            accessor: "id",
          },
          {
            HeaderName: "School",
            accessor: "school.name",
          },
          {
            Header: "Route",
            accessor: "route",
            Cell: props => (
                <div>
                  {props.value ?
                      <label>{props.value.name} {(props.row.original.inRangeStops && props.row.original.inRangeStops.length > 0) || <><FontAwesomeIcon
                      icon={faCircleExclamation}
                      size="lg"
                      style={{ color: "red" }}
                      data-tip
                      data-for="noInRangeStopTip"
                  /><ReactTooltip
                        id="noInRangeStopTip"
                        place="bottom"
                        effect="solid"
                        >
                        This student does not have any in-range stops.
                        </ReactTooltip></>}</label> :
                      <><FontAwesomeIcon
                          icon={faXmark}
                          size="xl"
                          style={{ color: "red" }}
                          data-tip
                          data-for="noStopTip"
                      /><ReactTooltip
                    id="noStopTip"
                    place="bottom"
                    effect="solid"
                    >
                    This student is not on a route.
                    </ReactTooltip></>}
                </div>
            )
          },
          {
            Header: "Detail Page",
            accessor: "uid",
            Cell: (props) => {
              return <Link to={`/Students/info/${props.value}`}>view</Link>;
            },
          },
        ],
        []
      );

      const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
      } = useTable({columns, data: school.students});

    return <div id="content"> 
 
        <h2 id = 'title'> {school.name}</h2>
        <div>
          {!editable &&  
              <button onClick={e => setEditable(true)}> Edit </button>
          }
          {editable &&  
            <button onClick={e => setEditable(false)}> Cancel Edits </button>
          }
          {!editable && <button onClick = {(e) => {handleDeleteSchool(id, e);}}>Delete </button>}
          
        </div>
        


        <div id = "top-half-wrapper">
            <div id = "main_form">
                <h5 id = "sub-header"> Information </h5>
            
                <label id = 'label-user'> School Name </label> 
                <input
                    disabled = {!editable}
                    id = "input-user"
                    type="text"
                    maxLength="100"
                    value={school.name}
                    onChange={(e) => setSchool({...school, name : e.target.value})}
                />
                
                <label  id = 'label-user'> Address {addressValid} </label>
                <input
                    disabled = {!editable}
                    id = "input-user"
                    maxLength="100"
                    type="text"
                    value={school.address}
                    onChange={(e) => {setSchool({...school, address: e.target.value}); setAddressValid(false); }} 
                />
                        
            
                {editable && <div>
                <button style = {{display: 'in-line block', margin: '20px'}} onClick = {(e) => checkMap(e)}> {addressValid ? "Address Valid!": "Validate Address" } </button>  
                <button style = {{display: 'in-line block', margin: '20px'}} className = "button" onClick = {(e) => {handleSchoolFormSubmit(e)}} type="button"> Update School </button>
                </div>} 
                </div>

            
                <div id="map">
                    {error && (<div>{error}</div>)}
                    <div style={{ height: '50vh', width: '80%', display: "inline-block" }}>
                        <GoogleMapReact
                            bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_MAPS_API}` }}
                            defaultCenter={defaultProps.center}
                            defaultZoom={defaultProps.zoom}
                            yesIWantToUseGoogleMapApiInternals
                            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                        >
                        <Marker
                            text="Your Address"
                            lat={lat}
                            lng={lng}
                        />
                        </GoogleMapReact>
                    </div>
                </div>
        </div>

     

        <div id = 'tables-container'> 

            <p> </p>
            <p> </p>
            <p> </p>
            <p> </p>
            <h5 id = "sub-header"> Students </h5>
            <p> </p>
            <p> </p>
            <p> </p>

            {editable &&
                <div>
                    <div> You can Add Students in the Students Tab </div>
                </div>
            }

             
            {((school) && (school.students) && (school.students.length !== 0)) && <SchoolStudents data={school.students} /> 
            }
        
            {(school.students.length ===0) && 
                <div>
                    <div> There are no students associated with this school.  </div>
                </div>
            }
                    
            <p> </p>
            <p> </p>
            <p> </p>
            <p> </p>
            <h5 id = "sub-header"> Routes </h5>
            <p> </p>
            <p> </p>
            <p> </p>

            {editable && 
                <div>
                    <div> You can Add Routes in the Routes Tab </div>
                </div>
            }
            
            {( (school) && (school.routes) && (school.routes.length !== 0)) && <SchoolRoutes data={school.routes} />
            }
            {(school.routes && school.routes.length ===0) && 
                <div>
                    <div> There are no routes associated with this school. You can make routes in the Routes tab.  </div>
                </div>
            }
                
        </div>     
    </div>

}