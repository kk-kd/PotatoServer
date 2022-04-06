import "./RunLogs.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTable } from "react-table";
import { dateToDisplay, millisecondsToDisplay } from "./../api/time";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { getAllUsers, deleteUser } from "../api/axios_wrapper";
import { filterAllRuns } from "../api/axios_wrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const RunLogs = ({ role }) => {
  let navigate = useNavigate();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(1);
  const [size, setSize] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("busNumber");
  const [sortDirec, setSortDirec] = useState("ASC");
  const [busFilter, setBusFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await filterAllRuns({
          page: page,
          size: size,
          sort: sortBy,
          sortDir: sortDirec,
          busFilter: busFilter,
          driverFilter: driverFilter,
          schoolFilter: schoolFilter,
          routeFilter: routeFilter,
          showAll: showAll,
        });
        console.log(fetchedData);
        setData(fetchedData.data.runs);
        setTotal(fetchedData.data.total);
      } catch (error) {
        alert(error.response.data);
      }
    };
    fetchData();
  }, [page, size, sortDirec, busFilter, driverFilter, schoolFilter, routeFilter, showAll]);

  const nextSort = (id) => {
    if (sortBy !== id) {
      setSortBy(id);
      if (sortDirec === "ASC") {
        setSortDirec("DESC");
      } else {
        setSortDirec("ASC");
      }
    } else if (sortDirec === "ASC") {
      setSortDirec("DESC");
    } else {
      setSortDirec("ASC");
    }
  };

  const columns = useMemo(
      () => [
        {
          HeaderName: "Bus Number",
          accessor: "busNumber",
        },
        {
          HeaderName: "Driver",
          accessor: "driver.fullName",
        },
        {
          HeaderName: "Route",
          accessor: "route.name",
        },
        {
          HeaderName: "School",
          accessor: "route.school.name",
        },
        {
          HeaderName: "Time Started",
          accessor: "timeStarted",
          Cell: (props) => (
              <div>{dateToDisplay(props.value)}</div>
          )
        },
        {
          HeaderName: "Direction",
          accessor: "direction"
        },
        {
          HeaderName: "Duration",
          accessor: "duration",
          Cell: (props) => (
              <div>{props.row.original.ongoing ? "Ongoing" : (<div>{millisecondsToDisplay(props.value)}{props.row.original.timedOut && <><FontAwesomeIcon
                  icon={faCircleExclamation}
                  style={{ color: "red" }}
                  size="xl"
                  data-tip
                  data-for={`timedOut${props.row.original.uid}`}
              />
                <ReactTooltip
                    id={`timedOut${props.row.original.uid}`}
                    place="bottom"
                    effect="solid"
                >This run was automatically timed out at three hours.</ReactTooltip></>}</div>)}</div>
          )
        }
      ],
      []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      useTable({ columns, data });
  return (
      <div id="content">
        <h2 id="title"> Complete Run Logs </h2>
        <div id="userListing">
          <table
              {...getTableProps()}
              class="table table-striped table-bordered border-success rounded"
          >
            <thead class="thead-dark">
            {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()}>
                        <div>
                          <>
                            <label
                                onClick={() => {
                                  nextSort(column.id);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                              {column.HeaderName}{" "}
                              {sortBy === column.id &&
                              sortDirec !== "none" &&
                              (sortDirec === "DESC" ? (
                                  <FontAwesomeIcon
                                      icon={faArrowDown}
                                      size="sm"
                                  />
                              ) : (
                                  <FontAwesomeIcon icon={faArrowUp} size="sm" />
                              ))}
                            </label>
                            {(column.id === "route.name" || column.id === "busNumber" || column.id === "route.school.name" || column.id === "driver.fullName")
                                && (column.id === "route.name" ? (<DefaultColumnFilter setFilter={setRouteFilter} />) :
                                    (column.id === "busNumber" ? (<DefaultColumnFilter setFilter={setBusFilter} />) :
                                        (column.id === "route.school.name" ? (<DefaultColumnFilter setFilter={setSchoolFilter} />) :
                                            (<DefaultColumnFilter setFilter={setDriverFilter} />))))
                            }
                          </>
                        </div>
                      </th>
                  ))}
                </tr>
            ))}
            </thead>
            <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                  <tr
                      {...row.getRowProps()}
                  >
                    {row.cells.map((cell) => {
                      if (cell.column.id === "route.name") {
                        return (
                            <td
                                {...cell.getCellProps()}
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/Routes/info/${row.original.route.uid}`)}
                            >
                              {cell.render("Cell")}
                            </td>
                        )
                      } else if (cell.column.id === "route.school.name") {
                        return (
                            <td
                                {...cell.getCellProps()}
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/Schools/info/${row.original.route.school.uid}`)}
                            >
                              {cell.render("Cell")}
                            </td>
                        )
                      } else if (cell.column.id === "driver.fullName") {
                        return (
                            <td
                                {...cell.getCellProps()}
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/Users/info/${row.original.driver.uid}`)}
                            >
                              {cell.render("Cell")}
                            </td>
                        )
                      }
                      return (
                          <td
                              {...cell.getCellProps()}
                          >
                            {cell.render("Cell")}
                          </td>
                      );
                    })}
                  </tr>
              );
            })}
            </tbody>
          </table>
          <div className="test-centering">
            <div class="btn-group" role="group" aria-label="Basic example">
              <button
                  onClick={() => setPage(0)}
                  disabled={page === 0 || showAll}
                  class="btn btn-secondary"
                  style={{ maxWidth: "5em" }}
              >
                {"<<"}
              </button>{" "}
              <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0 || showAll}
                  class="btn btn-secondary"
                  style={{ maxWidth: "5em" }}
              >
                {"<"}
              </button>{" "}
              <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= total / size - 1 || showAll}
                  class="btn btn-secondary"
                  style={{ maxWidth: "5em" }}
              >
                {">"}
              </button>{" "}
              <button
                  onClick={() => setPage(Math.ceil(total / size) - 1)}
                  disabled={page >= total / size - 1 || showAll}
                  class="btn btn-secondary"
                  style={{ maxWidth: "5em" }}
              >
                {">>"}
              </button>
              {"     "}
            </div>
            <div>
              <div
                  class="input-group"
                  style={{ padding: ".3em", textAlign: "center" }}
              >
                <div class="input-group-text" id="btnGroupAddon">
                  Page:{" "}
                </div>
                <input
                    type="number"
                    class="form-control"
                    placeholder="Input group example"
                    aria-label="Input group example"
                    aria-describedby="btnGroupAddon"
                    defaultValue={page + 1}
                    value={page + 1}
                    onChange={(e) => {
                      const pagee =
                          e.target.value && Number(e.target.value) > 0
                              ? Number(e.target.value) - 1
                              : 0;
                      setPage(pagee);
                    }}
                    style={{ maxWidth: "3em", minWidth: "3em" }}
                />
              </div>
            </div>
            <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                }}
                class="form-select"
                style={{ maxWidth: "16em" }}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    Show {size} out of {total} per page
                  </option>
              ))}
            </select>
            <label style={{ maxWidth: "5em" }}>
              <input
                  type="checkbox"
                  value={showAll}
                  onChange={(e) => setShowAll(!showAll)}
                  class="form-check-input"
              />
              Show All
            </label>
          </div>
        </div>
      </div>
  );
}