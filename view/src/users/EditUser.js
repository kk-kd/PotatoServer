import "./UserForm.css";
import GoogleMapReact from "google-map-react";
import { useState, useMemo, useEffect} from "react";
import { Marker } from "../map/Marker";
import {updateUser, getOneUser} from "../api/axios_wrapper";
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
  const [ password, setPassword] = useState("");
  const [ email, setEmail ] = useState("");
  const [ address, setAddress ] = useState("");
  const [ isAdmin, setisAdmin ] = useState(false);


  // maps
  const [ showMap, setShowMap ] = useState(false);
  const [ lat, setLat ] = useState();
  const [ lng, setLng ] = useState();
  const [ map, setMap ] = useState();
  const [ apiLoaded, setApiLoaded ] = useState(false);
  const [ geocoder, setGeocoder ] = useState();
  const [ error, setError ] = useState(null);
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
    setPassword(data.password)
    setEmail(data.email)
    setAddress(data.address)
    setisAdmin(data.isAdmin)
  }, [data])

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

  async function handleModifyUser (e) {
    e.preventDefault(); // prevents page reload on submission
    let form_results = {
      email: email,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      address: address,
      isAdmin: isAdmin,
      password: password,
    }
    console.log("Modifying User with entries:");
    console.log(form_results);
   
    try {
      let update_user_response = await updateUser(id,form_results); 
    } catch (error) {
        let message = error.response.data;
        throw alert (message);
    }
    alert("User Successfully Updated");
    navigate('/Users/info/' + id);
  }

  const searchLocation = () => {
    geocoder.geocode( { 'address': address }, (results, status) => {
      if (status === "OK") {
        map.setCenter(results[0].geometry.location);
        setLng(results[0].geometry.location.lng());
        setLat(results[0].geometry.location.lat());
        setError(null);
        setAddress(address);
      } else if (status === "ZERO_RESULTS") {
        setError("No results for that address");
      } else {
        setError("Server Error. Try again later");
      }
    });
  }
  const handleApiLoaded = (map, maps) => {
    const geocoder = new maps.Geocoder();
    setGeocoder(geocoder);
    setMap(map);
    setApiLoaded(true);
    searchLocation();
  }
  const checkMap = (e) => {
    e.preventDefault();
    if (apiLoaded) {
      searchLocation()
    } else {
      setShowMap(true);
    }
  }

  return (
    <div>
        <h1> Edit User </h1>
        
        <form onSubmit={handleModifyUser} newUserClicked = {false}>
          <div id = "user_create_form">
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
                <p>Password:</p>
                  <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
              </label>
                
              <label className="input">
                <p>Address:</p>
                  <input
                      type="text"
                      value={address}
                      onChange={(e) => checkMap(e.target.value)} 
                  />
                <p> {error}</p>
              </label>

              <label className="input">
                <p>Admin:</p>
                  <input
                      type="checkbox"
                      value={isAdmin}
                      onChange={(e) => setisAdmin(e.target.value)}
                  />
              </label>
          </div> 
          
        
            <h3>Students Associated With This User </h3>
          <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
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
            <div>

                <button className = "submitbutton" type="submit">Submit</button>
            </div>
          </form>
        
        <div id="user_create_map">
          <h3> Map </h3>
          {error && (<div>{error}</div>)}
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
  );
}
