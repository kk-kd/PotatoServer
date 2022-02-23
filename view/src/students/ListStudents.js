import "./ListStudent.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTable } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { filterAllStudents } from "../api/axios_wrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faCircleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const ListStudents = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(1);
  const [size, setSize] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("none");
  const [sortDirec, setSortDirec] = useState("none");
  const [idFilter, setIdFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await filterAllStudents({
          page: page,
          size: size,
          sort: sortBy,
          sortDir: sortDirec,
          lastNameFilter: lastNameFilter,
          idFilter: idFilter,
          showAll: showAll,
        });
        console.log(fetchedData);
        setData(fetchedData.data.students);
        setTotal(fetchedData.data.total);
      } catch (error) {
        alert(error.response.data);
      }
    };
    fetchData();
  }, [page, size, sortDirec, idFilter, lastNameFilter, showAll]);

  const nextSort = (id) => {
    if (sortBy !== id) {
      setSortBy(id);
      if (sortDirec === "none" || sortDirec === "DESC") {
        setSortDirec("ASC");
      } else {
        setSortDirec("DESC");
      }
    } else if (sortDirec === "ASC") {
      setSortDirec("DESC");
    } else if (sortDirec === "DESC") {
      setSortDirec("none");
    } else {
      setSortDirec("ASC");
    }
  };

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
        Cell: (props) => (
          <div>
            {props.value ? (
              <label>
                {props.value.name}{" "}
                {(props.row.original.inRangeStops &&
                  props.row.original.inRangeStops.length > 0) || (
                  <>
                    <FontAwesomeIcon
                      icon={faCircleExclamation}
                      size="lg"
                      style={{ color: "red" }}
                      data-tip
                      data-for="noInRangeStopTip"
                    />
                    <ReactTooltip
                      id="noInRangeStopTip"
                      place="bottom"
                      effect="solid"
                    >
                      This student does not have any in-range stops.
                    </ReactTooltip>
                  </>
                )}
              </label>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faXmark}
                  size="xl"
                  style={{ color: "red" }}
                  data-tip
                  data-for="noStopTip"
                />
                <ReactTooltip id="noStopTip" place="bottom" effect="solid">
                  This student is not on a route.
                </ReactTooltip>
              </>
            )}
          </div>
        ),
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

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });
  return (
    <div class="card">
      <div class="card-body core-card-color">
        <div id="userListing">
          <Link to="/Students/create">
            <button className="btn btn-outline-primary">Create Student</button>
          </Link>
          <table {...getTableProps()} class="table table-striped">
            <thead class="thead-dark">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>
                      {column.id === "lastName" ||
                      column.id === "id" ||
                      column.id === "school.name" ? (
                        <div>
                          <label
                            onClick={() => {
                              nextSort(column.id);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {column.HeaderName} {(sortBy === column.id && sortDirec !== "none") && (sortDirec === "DESC" ? <FontAwesomeIcon
                                  icon={faArrowDown}
                                  size="sm"
                              /> : <FontAwesomeIcon
                                  icon={faArrowUp}
                                  size="sm"
                              />
                          )}
                          </label>
                          {column.id === "school.name" || (
                            <DefaultColumnFilter
                              setFilter={
                                column.id === "id"
                                  ? setIdFilter
                                  : setLastNameFilter
                              }
                            />
                          )}
                        </div>
                      ) : (
                        column.render("Header")
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
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
                  onChange={(e) => {
                    const pagee = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    setPage(pagee);
                  }}
                  style={{ maxWidth: "3em", minWidth: "2em" }}
                />
              </div>
            </div>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
              }}
              class="form-select"
              style={{ maxWidth: "13em" }}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size} out of {total}
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
    </div>
  );
};
