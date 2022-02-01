
import { useState, useMemo, useEffect} from "react";
import { Marker } from "../map/Marker";
import {updateStudent, getOneStudent, filterAllSchools} from "../api/axios_wrapper";
import { useNavigate, useParams, Link } from "react-router-dom";
import {useTable } from "react-table";
import useBatchedState from 'react-use-batched-state';


export const EditStudent = () => {
  // general 
  const { id } = useParams();
  let navigate = useNavigate();

  // user
  const [ firstName, setFirstName ] = useState("");
  const [ middleName, setMiddleName ] = useState("");
  const [ lastName, setLastName ] = useState("");
  const [school, setSchool] = useState(); 
  const [user, setUser] = useState(); 

  const [filteredDataSchool, setFilteredDataSchool] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState();
  const [filterValueSchool, setFilterValueSchool] = useState("");

  const [routeFilter, setRouteFilter] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(false);
  const [route, setRoute] = useState();

 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneStudent(id).catch ((error) => {
          let message = error.response.data;
          throw alert (message);
        });
        console.log(fetchedData.data)
        setFirstName(fetchedData.data.firstName);
        setMiddleName(fetchedData.data.middleName);
        setLastName(fetchedData.data.lastName);

        setRoute(fetchedData.data.route);
        setRouteFilter(fetchedData.data.route.name)
        setSchool(fetchedData.data.school);
              
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
        console.log(fetchedDataSchool);
      } catch (error) {
        alert(error.response.data);
      }
    }
    if (filterValueSchool) {
      fetchFilteredDataSchool();
    }
  
  }, [filterValueSchool])

  async function handleModifyStudent(e) {
    e.preventDefault(); // prevents page reload on submission
    let form_results = {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      route: route,
      school: school,
      user: user,
    }
    console.log("Modifying Student with entries:");
    console.log(form_results);
   
    try {
      let update_user_response = await updateStudent(id,form_results); 
    } catch (error) {
        let message = error.response.data;
        throw alert (message);
    }
    alert("Student Successfully Updated");
    navigate('/Students/info/' + id);
  }

  return (
    <div>
        <h1>Edit Student</h1>
        <div id = "user_create_form">
          <form onSubmit={handleModifyStudent}>
          
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
                  <p> School: </p>
                <input
                      type="text"
                      value={filterValueSchool}
                      onChange={(e) => {setFilterValueSchool(e.target.value); setSelectedSchool(false); }}
                      defaultValue = "Search"
                /> 
          </label>

          {!selectedSchool && 
                <div className="user-list">
                  {filteredDataSchool && filteredDataSchool.length > 0 ? (
                    filteredDataSchool.map((school) => (
                      <li >
                    <button key={school.uid} className="user" onClick = {(e) => {
                            setSelectedSchool(true);
                            setFilterValueSchool(school.name); 
                            setSchool(school); 
                            setSelectedRoute(false);
                          }
                            } >
                      {school.name}   
                    </button>
                    </li>
                    ))
                    ) : (<div> </div>)}
                </div>
          }

          {selectedSchool && <label className="input">
              <p> Route: </p>
              <input
                  type="text"
                  value={routeFilter}
                  onChange={(e) => {setRouteFilter(e.target.value); setSelectedRoute(false)}}
                  defaultValue = "Search"
              />
            </label>}
            {((selectedSchool) && !(selectedRoute)) &&
            <div className="route-list">
              {school.routes.filter(route => route.name.toLowerCase().includes(routeFilter.toLowerCase())).splice(0, 10).map((route) => (
                      <li >
                        <button key={route.uid} className="route" onClick = {(e) => {setSelectedRoute(true); setRouteFilter(route.name); setRoute(route)}} >
                          {route.name}
                        </button>
                      </li>
                  )
              )}
            </div>}

      
          </form>

        
        </div>
    </div>
  );
}
