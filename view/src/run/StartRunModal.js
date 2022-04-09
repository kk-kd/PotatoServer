import "./StartRunModal.css";
import { useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import { filterAllRoutes, saveNewRun, validateNewRun } from "../api/axios_wrapper";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Modal from "@mui/material/Modal";

export const StartRunModal = ({ route, isHeader }) => {
  const [busNumber, setBusNumber] = useState("");
  const [direction, setDirection] = useState("To School");
  const [selectedRoute, setSelectedRoute] = useState();
  const [routeFilter, setRouteFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredDataRoute, setFilteredDataRoute] = useState([]);
  useEffect(() => {
    const fetchFilteredDataRoute = async () => {
      try {
        const fetchedDataRoute = await filterAllRoutes({
          page: 0,
          size: 10,
          sort: "name",
          sortDir: "ASC",
          nameFilter: routeFilter,
        });
        setFilteredDataRoute(fetchedDataRoute.data.routes);
      } catch (error) {
        alert(error.response.data);
      }
    };
    if (routeFilter) {
      fetchFilteredDataRoute();
    }
  }, [routeFilter]);
  return (
      <>
        {isHeader ? <button
                type="button"
                class="btn btn-outline-primary"
                id="selectable"
                onClick={() => setOpen(true)}
            >Start Run</button> :
            <button onClick={() => setOpen(true)}>Start Run</button>}
        <Modal open={open} id="actualModal" onClose={() => {
          setOpen(false);
          setSelectedRoute(null);
          setRouteFilter("");
          setBusNumber(null);
          setFilteredDataRoute([]);
        }}>
          <div id="startRunModal">
              {isHeader && <label>Route:</label>}
              {isHeader && <Autocomplete
                  sx={{
                    paddingTop: "20px",
                    paddingBottom: "10px",
                    width: "49%",
                    margin: "auto",
                    marginRight: "23%",
                  }}
                  options={filteredDataRoute}
                  freeSolo
                  disableClearable
                  renderInput={(params) => (
                      <TextField {...params} label="Route" variant="standard" />
                  )}
                  getOptionLabel={(option) => option.name}
                  noOptionsText={"Type to Search"}
                  value={selectedRoute}
                  onInputChange={(e) => {
                    setRouteFilter(e.target.value);
                  }}
                  onChange={(e, newRoute) => {
                    e.preventDefault();
                    setSelectedRoute(newRoute);
                  }}
              />}
              <label>Bus Number:</label>
              <input
                  type="text"
                  maxLength="4"
                  value={busNumber}
                  onChange={e => setBusNumber(e.target.value)}
              />
              <label>Direction:</label>
              <select
                  value={direction}
                  onChange={e => setDirection(e.target.value)}
              >
                <option value={"To School"}>To School</option>
                <option value={"From School"}>From School</option>
              </select>
              <button
                  onClick={async e => {
                    e.preventDefault();
                    if (!busNumber) {
                      alert("Please input a bus number.");
                      return;
                    } else if (!(Number(busNumber) > 0)) {
                      alert("Bus number must be a positive integer.");
                      return;
                    } else if (!(selectedRoute || route)) {
                      alert("Please select a route.");
                      return;
                    }
                    try {
                      var possibleErrors;
                      if (route) {
                        possibleErrors = await validateNewRun({ routeUid: route.uid, busNumber: busNumber });
                      } else {
                        possibleErrors = await validateNewRun({ routeUid: selectedRoute.uid, busNumber: busNumber });
                      }
                      console.log(possibleErrors);
                      const driverTaken = possibleErrors.data.driverTaken;
                      const busNumberTaken = possibleErrors.data.busNumberTaken;
                      const routeTaken = possibleErrors.data.routeTaken;
                      var doIt = true;
                      if (driverTaken && busNumberTaken && routeTaken) {
                        doIt = window.confirm("You are currently listed as being on a run, this bus number is currently listed as being on a run, and there is already a run listed on this route.  Are you sure you wish to start this run?");
                      } else if (driverTaken && busNumberTaken) {
                        doIt = window.confirm("You are currently listed as being on a run and this bus number is currently listed as being on a run. Are you sure you wish to start this run?");
                      } else if (driverTaken && routeTaken) {
                        doIt = window.confirm("You are currently listed as being on a run and there is already a run listed on this route.  Are you sure you wish to start this run?");
                      } else if (busNumberTaken && driverTaken) {
                        doIt = window.confirm("This bus number is currently listed as being on a run and there is already a run listed on this route.  Are you sure you wish to start this run?");
                      } else if (driverTaken) {
                        doIt = window.confirm("You are currently listed as being on a run.  Are you sure you wish to start this run?");
                      } else if (busNumberTaken) {
                        doIt = window.confirm("This bus number is currently listed as being on a run.  Are you sure you wish to start this run?");
                      } else if (routeTaken) {
                        doIt = window.confirm("There is already a run listed on this route.  Are you sure you wish to start this run?");
                      }
                      if (doIt) {
                        if (route) {
                          await saveNewRun({
                            direction: direction,
                            busNumber: busNumber,
                            routeUid: route.uid,
                          });
                          setOpen(false);
                          setSelectedRoute(null);
                          setRouteFilter("");
                          setBusNumber(null);
                          setFilteredDataRoute([]);
                        } else {
                          await saveNewRun({
                            direction: direction,
                            busNumber: busNumber,
                            routeUid: selectedRoute.uid,
                          });
                          setOpen(false);
                          setSelectedRoute(null);
                          setRouteFilter("");
                          setBusNumber(null);
                          setFilteredDataRoute([]);
                        }
                      }
                    } catch (e) {
                      alert(e);
                    }
                  }}
              >
                Submit
              </button>
          </div>
        </Modal>
      </>
  )
}