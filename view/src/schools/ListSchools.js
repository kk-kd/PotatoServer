import "./ListSchools.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTable } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { filterAllSchools } from "./../api/axios_wrapper";
import { getDisplayTime } from "./../api/time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";

export const ListSchools = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(1);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [showAll, setShowAll] = useState(false);
  const [sortDirec, setSortDirec] = useState("none");
  const [nameFilter, setNameFilter] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await filterAllSchools({
          page: page,
          size: size,
          sort: sortBy,
          sortDir: sortDirec,
          filterType: "name",
          filterData: nameFilter,
          showAll: showAll,
        });
        setData(fetchedData.data.schools);
        setTotal(fetchedData.data.total);
      } catch (error) {
        alert(error.response.data);
      }
    };
    fetchData();
  }, [page, size, sortDirec, nameFilter, showAll]);

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
        HeaderName: "Name",
        accessor: "name",
      },
      {
        Header: "Address",
        accessor: "address",
      },
      {
        HeaderName: "Arrival Time",
        accessor: "arrivalTime",
        Cell: props => (
            <div>{props.value ? getDisplayTime(props.value) : ""}</div>
        )
      },
      {
        HeaderName: "Departure Time",
        accessor: "departureTime",
        Cell: props => (
            <div>{props.value ? getDisplayTime(props.value) : ""}</div>
        )
      },
      {
        Header: "Detail Page",
        accessor: "uid",
        Cell: (props) => {
          return <Link to={`/Schools/info/${props.value}`}>view</Link>;
        },
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });
  return (
    <div id = "content">
       <h2 id = "title"> Schools </h2>
        <div id="schoolListing">
          <Link to="/Schools/create">
            <button>Create School</button>
          </Link>
          <table {...getTableProps()} class="table table-striped">
            <thead class="thead-dark">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th scope="col" {...column.getHeaderProps()}>
                      {(column.id === "name" || column.id === "arrivalTime" || column.id == "departureTime") ? (
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
                          <DefaultColumnFilter setFilter={setNameFilter} />
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
                  value={page + 1}
                  onChange={(e) => {
                    const pagee = e.target.value && Number(e.target.value) > 0
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
  );
};
