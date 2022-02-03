import "./EditUser.css";
import GoogleMapReact from "google-map-react";
import { useState, useMemo, useEffect} from "react";
import { Marker } from "../map/Marker";
import {updateUser, getOneUser, changeUserPassword, updateStudent} from "../api/axios_wrapper";
import { useNavigate, useParams, Link } from "react-router-dom";
import {useTable } from "react-table";
import useBatchedState from 'react-use-batched-state';

export const EditUser = () => {
  // general 
  const { id } = useParams();
  let navigate = useNavigate();

  // data 
  const [data, setData] = useBatchedState({});
  const [students, setStudents] = useBatchedState([]);


  // user
  const [ firstName, setFirstName ] = useState("");
  const [ middleName, setMiddleName ] = useState("");
  const [ lastName, setLastName ] = useState("");
  const [ oldPassword, setOldPassword] = useState("");
  const [ passwordCandidate, setPasswordCandidate] = useState("");
  const [ passwordCandidateValidation, setPasswordCandidateValidation] = useState("");
  const [ changePassword, setChangePassword] = useState(false);
  const [ email, setEmail ] = useState("");
  const [ address, setAddress ] = useState("");
  const [ isAdmin, setisAdmin ] = useState(false);
  const [ addressValid, setAddressValid] = useState(true);


  // maps
  const [ showMap, setShowMap ] = useState(false);
  const [ mapApi, setMapApi ] = useState();
  const [ lat, setLat ] = useState();
  const [ lng, setLng ] = useState();
  const [ map, setMap ] = useState();
  const [ apiLoaded, setApiLoaded ] = useState(false);
  const [ geocoder, setGeocoder ] = useState();
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627
    },
    zoom: 13
  };

 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneUser(id).catch ((error) => {
          let message = error.response.data;
          throw alert (message);
        });
        console.log(fetchedData.data);
        setData(fetchedData.data);
        setStudents([fetchedData.data][0].students);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect (() => {
    setFirstName(data.firstName)
    setMiddleName(data.middleName)
    setLastName(data.lastName)
    setEmail(data.email)
    setAddress(data.address)
    setisAdmin(data.isAdmin)
    setLat(data.latitude)
    setLng(data.longitude)
    setOldPassword(data.password)
  }, [data])

  useEffect(() => {
    if (mapApi && !addressValid) {
      searchLocation();
    }
  }, [mapApi]);

  const searchLocation = () => {
    mapApi.geocoder.geocode( { 'address': address }, (results, status) => {
      if (!address || address.trim().length === 0) {
        alert("Please Enter an Address"); 
        return;
      }
      else if (status === "OK") {
        mapApi.map.setCenter(results[0].geometry.location);
        setLng(results[0].geometry.location.lng());
        setLat(results[0].geometry.location.lat());
        setAddress(address);
        setAddressValid(true);
      } else if (status === "ZERO_RESULTS") {
        setAddressValid(false);
        console.log(status);
        alert ("No results for that address")
      } else {
        setAddressValid(false); 
        console.log(status)
        alert("Server Error. Try again later")
      }
    });
  }
  const handleApiLoaded = (map, maps) => {
    const geocoder = new maps.Geocoder();
    setMapApi({geocoder: geocoder, map: map});
  }

  const checkMap = (e) => {
    e.preventDefault();
    if (apiLoaded) {
      searchLocation()
    } else {
      setShowMap(true);
    }
  }

  const columns = useMemo(
    () => [
      {
          Header: 'Student First Name',
          accessor: 'firstName',
      },
      {
        Header: 'Student Last Name',
        accessor: 'lastName',
      },
      {
        Header: ' ',
        disableFilters: true,
        accessor: 'uid',
        Cell: ({value}) => { 
          return <Link to = {"/Students/info/" + value}> {"View Student Detail"} </Link>   
      },
    }
    ],
    []
);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({columns, data: students});

  const ModifyUserCall = async (form_results) => {
    console.log(changePassword);
    try {
      let update_user_response = await updateUser(id,form_results, changePassword); 
      alert("User Successfully Updated");
      navigate('/Users/info/' + id);
      return update_user_response; 
    } catch (error) {
        let message = error.response.data;
        alert (message);
    }
  }

  const handleModifyUser = (e)  => {
    e.preventDefault()
    //update password
    console.log(passwordCandidate)

    if (!addressValid) {
      alert("Please Validate Address.")
      return; 
    }

    if (!firstName || !lastName || !email) {
      alert("First Name, Last Name, and Email are Required."); 
      return; 
    }

    if (changePassword && (passwordCandidate !== passwordCandidateValidation)){
      alert("Password and Re-Enter Password Do Not Match.")
      return;
    }

    //update user
    let form_results = {
      email: email.toLowerCase(),
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      address: address,
      isAdmin: isAdmin,
      password: (!changePassword || !passwordCandidate) ? oldPassword : passwordCandidate,
      longitude: lng, 
      latitude: lat,
    }
    console.log("Modifying User with entries:");
    console.log(form_results);
    const response = ModifyUserCall(form_results);
  
  }
 
  return (
    <div > 
    <h1> Edit User </h1>
    <div >
         
        <form newUserClicked = {false} id='form'>
          <div>
              <label className="input">
                <p>First Name:</p>
                  <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                  />
              </label>
                
              <label className="input">
                <p>Middle Name:</p>
                  <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                  />
              </label>
                
              <label className="input">
                <p>Last Name:</p>
                  <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                  />
              </label>
              <label className="input">
                <p>Email:</p>
                  <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  />
              </label>

              <label className="input">
                <p>Change Password:</p>
                  <input
                      type="checkbox"
                      value={changePassword}
                      onChange={(e) => {setChangePassword(e.target.checked); setPasswordCandidate(""); setPasswordCandidateValidation("")}}
                  />
              </label>

            {changePassword && <div> 
                <label className="input">
                  <p>New Password:</p>
                    <input
                        type="password"
                        value={passwordCandidate}
                        onChange={(e) => setPasswordCandidate(e.target.value)
                        }
                    />
                </label> 
              </div>
              }

            {changePassword && <div> 
                <label className="input">
                  <p>Re-Enter New Password:</p>
                    <input
                        type="password"
                        value={passwordCandidateValidation}
                        onChange={(e) => setPasswordCandidateValidation(e.target.value)
                        }
                    />
                </label> 
              </div>
              }
                
              <label className="input">
                <p>Address:</p>
                  <input
                      type="text"
                      value={address}
                      onChange={(e) => {setAddress(e.target.value); setAddressValid(false)}} 
                  />
                  <button onClick = {(e) => checkMap(e)}> {addressValid ? "Address Valid!": "Validate" }  </button>
              </label>

              <label className="input">
                <p>Admin:</p>
                  <input
                      type="checkbox"
                      checked={isAdmin}
                      onChange={(e) => setisAdmin(e.target.checked)}
                  />
              </label>
          
          
          <h3>Students Associated With This User </h3>
          
          <div id ='table'>
          <table {...getTableProps()} style={{ border: 'solid 1px blue' } }>
            <thead>
            {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                      <th
                          {...column.getHeaderProps((column.id === "name" || column.id === "email_address"))}
                          style={column.id === "name" || column.id === "email_address" ? {
                            borderBottom: 'solid 3px red',
                            background: 'aliceblue',
                            color: 'black',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          } : {
                            borderBottom: 'solid 3px red',
                            background: 'aliceblue',
                            color: 'black',
                            fontWeight: 'bold',
                          }}
                      >
                        {column.render('Header')}
                      </th>
                  ))}
                </tr>
            ))}
            </thead>
            <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row)
              return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => {
                      return (
                          <td
                              {...cell.getCellProps()}
                              style={{
                                padding: '10px',
                                border: 'solid 1px gray',
                                background: 'papayawhip',
                              }}
                          >
                              {cell.render('Cell')}
                          </td>
                      )
                    })}
                  </tr>
              )
            })
            }
            </tbody>
          </table> 
          </div>

    
            <div>
                <button className = "submitbutton" onClick={(e) => {handleModifyUser(e)}} >Submit</button>
            </div>
          </div> 
          </form>
        
        
       <div id="user_map">
          <h3> Map </h3>
          {showMap && (<div style={{ height: '50vh', width: '50%', display: "inline-block" }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_MAPS_API}` }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
            >
              <Marker
                  text="You're Address"
                  lat={lat}
                  lng={lng}
              />
            </GoogleMapReact>
        </div>)} 
          </div> 
    </div>
    </div>
  );
}
