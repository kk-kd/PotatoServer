
import { useState, useMemo, useEffect} from "react";
import { Marker } from "../map/Marker";
import {updateStudent, getOneStudent, filterAllSchools, filterAllUsers} from "../api/axios_wrapper";
import { useNavigate, useParams, Link } from "react-router-dom";
import {useTable } from "react-table";
import useBatchedState from 'react-use-batched-state';


export const EditStudent = () => {
  // general 
  const { id } = useParams();
  let navigate = useNavigate();
  
  // student
  const [ firstName, setFirstName ] = useState("");
  const [ middleName, setMiddleName ] = useState("");
  const [ lastName, setLastName ] = useState("");
  const [school, setSchool] = useState({}); 
  const [user, setUser] = useState({}); 

  const [filteredDataSchool, setFilteredDataSchool] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState();
  const [filterValueSchool, setFilterValueSchool] = useState("");

  const [routeFilter, setRouteFilter] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(false);
  const [route, setRoute] = useState([]);

  const [filteredDataUser, setFilteredDataUser] = useState([]);
  const [selectedUser,setSelectedUser] = useState();
  const [filterValueUser, setFilterValueUser] = useState("");

 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneStudent(id).catch ((error) => {
          let message = error.response.data;
          throw alert (message);
        });
        //console.log(fetchedData.data)
        setFirstName(fetchedData.data.firstName);
        setMiddleName(fetchedData.data.middleName);
        setLastName(fetchedData.data.lastName);

        setRoute(fetchedData.data.route);
        setRouteFilter(fetchedData.data.route.name)
        
        setFilterValueSchool(fetchedData.data.school.name);
        setSchool(fetchedData.data.school);
        //console.log(fetchedData.data.school);
        
        //school 
        if (fetchedData.data.school.name) {
          //console.log("has school")
          // add routes to school object (it's in user)
          let school_with_route = Object.assign(fetchedData.data.school, {'routes': [fetchedData.data.route]});
          //console.log(school_with_route);
          setSchool(school_with_route);
          setSelectedSchool(true);
          setSelectedRoute(true);
        }

        //route 
        
        setUser(fetchedData.data.parentUser);
        setFilterValueUser(fetchedData.data.parentUser.email); 
        if (fetchedData.data.parentUser.email) {
          setSelectedUser(true); 
        }

              
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFilteredDataSchool = async () => {
      try {
        const fetchedDataSchool = await filterAllSchools({
          page: 0,
          size: 10,
          sort: 'name',
          sortDir: "ASC",
          filterType: '',
          filterData: filterValueSchool
        });
        setFilteredDataSchool(fetchedDataSchool.data.schools);
        //console.log(fetchedDataSchool);
      } catch (error) {
        alert(error.response.data);
      }
    }
    if (filterValueSchool) {
      fetchFilteredDataSchool();
    }
  
  }, [filterValueSchool])

  useEffect(() => {
    const fetchFilteredDataUser = async () => {
      try {
        const fetchedData = await filterAllUsers({
          page: 0,
          size: 10,
          sort: 'email',
          sortDir: "ASC",
          filterType: '',
          filterData: filterValueUser
        });
        setFilteredDataUser(fetchedData.data.users);
      } catch (error) {
        alert(error.response.data);
      }
    }
    if (filterValueUser) {
      fetchFilteredDataUser()
    }
  
  }, [filterValueUser])

  function handleModifyStudent(e) {
    e.preventDefault(); // prevents page reload on submission
    let form_results = {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      route: route,
      school: school,
      parentUser: user,
    }
    const a = modifyStudent(form_results); 

    alert("Student Successfully Updated");
    navigate('/Students/info/' + id);
  }

  const modifyStudent = async (form_results) => {
    try {
      let update_user_response = await updateStudent(id,form_results); 
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setRoute({});
      setSchool({});
      setUser({}); 

  } catch (error) {
      let message = error.response.data;
      throw alert (message);
  }
}

  return (
    <div>
        <h1>Edit Student</h1>
        <div id = "user_create_form">
          <form>
          
          <label className="input">
            <p>First Name:</p>
              <input
                  type="text"
                  maxLength="100"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
              />
          </label>
            
          <label className="input">
            <p>Middle Name:</p>
              <input
                  type="text"
                  maxLength="100"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
              />
          </label>
            
          <label className="input">
            <p>Last Name:</p>
              <input
                  type="text"
                  maxLength="100"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
              />
          </label>

          <label className="input">
                  <p> School: </p>
                <input
                      type="text"
                      maxLength="100"
                      value={filterValueSchool}
                      onChange={(e) => {setFilterValueSchool(e.target.value); setSelectedSchool(false); setSelectedRoute(false); }}
                      defaultValue = "Search"
                /> 
          </label>

          {!selectedSchool && 
                <div className="user-list">
                  {filteredDataSchool &&
                  <div> 
                    {filteredDataSchool.length > 0 ? (
                      filteredDataSchool.map((school) => (
                        <li >
                      <button key={school.uid} className="user" onClick = {(e) => {
                              setSelectedSchool(true);
                              setFilterValueSchool(school.name); 
                              setSchool(school); 
                              setSelectedRoute(false);
                              setRoute({});
                        
                            }
                              } >
                        {school.name}   
                      </button>
                      </li>
                      ))
                    )  
                    : (<div> </div>)}
                  </div>
                  }
                </div>
          }

          {<label className="input">

              <p> Route:  {(!school.routes || school.routes.length === 0) ? " There Are No Routes Available For The Selected School. Please Create One In the Routes Tab." : ''} </p>
              
              {(school.routes && school.routes.length > 0) && 
              <input
                  type="text"
                  value={routeFilter}
                  maxLength="100"
                  onChange={(e) => {setRouteFilter(e.target.value); setSelectedRoute(false)}}
                  defaultValue = "Search"
              />}
            </label>
            }

            {(selectedSchool && !selectedRoute) && (!selectedRoute) && 
            <div className="route-list">
              {school.routes.filter(route => route.name.toLowerCase().includes(routeFilter.toLowerCase())).splice(0, 10).map((route) => (
                      <li >
                        <button key={route.uid} className="route" onClick = {(e) => {setSelectedRoute(true); setRouteFilter(route.name); setRoute(route)}} >
                          {route.name}
                        </button>
                      </li>
                  )
              )}
              
            </div>
            }
 
            <div>
              <label className="input">
                <p> User: </p>
              <input
                    type="text"
                    maxLength="100"
                    value={filterValueUser}
                    onChange={(e) => {setFilterValueUser(e.target.value); setSelectedUser(false);}}
                  
              /></label>

              {!selectedUser && 
                <div className="user-list">
                  {filteredDataUser && filteredDataUser.length > 0 ? (
                    filteredDataUser.map((user) => (
                      <li >
                    <button key={user.uid} className="user" onClick = {(e) => {setSelectedUser(true); setFilterValueUser(user.email); setUser(user)}} >
                      {user.email}   
                      
                    </button>
                    </li>
                    ))
                    ) : (<div> </div>)}
                </div>}
            </div>

            <div>
                <button className = "submitbutton" type="submit" onClick = {handleModifyStudent}>Submit</button>
            </div>
            
      
          </form>

        
        </div>
    </div>
  );
}
