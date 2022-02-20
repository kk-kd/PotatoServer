import "./ListBusRoutes.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTable } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { filterAllRoutes } from "./../api/axios_wrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const ListBusRoutes = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(1);
  const [size, setSize] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("none");
  const [sortDirec, setSortDirec] = useState("none");
  const [nameFilter, setNameFilter] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await filterAllRoutes({
          page: page,
          size: size,
          sort: sortBy,
          sortDir: sortDirec,
          nameFilter: nameFilter,
          showAll: showAll,
        });
        setData(fetchedData.data.routes);
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
  const isComplete = (students) => {
    return !students.some(student => !student.inRangeStops || student.inRangeStops.length === 0);
  }

  const columns = useMemo(
    () => [
      {
        HeaderName: "Route Name",
        accessor: "name",
      },
      {
        HeaderName: "School",
        accessor: "school",
        Cell: (props) => {
          return <div>{props.value ? props.value.name : ""}</div>;
        },
      },
      {
        HeaderName: "Student Count",
        accessor: "students.length",
      },
      {
        Header: "Route Description",
        accessor: "desciption",
      },
      {
        Header: "Complete",
        accessor: "students",
        Cell: (props) => (
            <div>
              <FontAwesomeIcon
                  icon={isComplete(props.value) ? faCheck : faXmark}
                  style={isComplete(props.value) ? { color: "green"} : { color: "red" }}
                  size="xl"
                  data-tip
                  data-for={`copmleteRouteTip${props.row.original.uid}`}
              />
              <ReactTooltip
                  id={`copmleteRouteTip${props.row.original.uid}`}
                  place="bottom"
                  effect="solid"
              >
                {isComplete(props.value) ? "Every student on this route has an in-range stop." : "At least one student on this route does not have an in-range stop."}
              </ReactTooltip>
            </div>
        )
      },
      {
        Header: "Detail Page",
        accessor: "uid",
        Cell: (props) => {
          return <Link to={`/Routes/info/${props.value}`}>view</Link>;
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
        <div id="routeListing">
          <table {...getTableProps()} style={{ border: "solid 1px blue" }}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps()}
                      style={{
                        borderBottom: "solid 3px red",
                        background: "aliceblue",
                        color: "black",
                        fontWeight: "bold",
                      }}
                    >
                      {column.HeaderName ? (
                        <div id="header">
                          <label
                            onClick={() => {
                              nextSort(column.id);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {column.HeaderName}
                          </label>
                          {column.id === "name" && (
                            <DefaultColumnFilter setFilter={setNameFilter} />
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
                        <td
                          {...cell.getCellProps()}
                          style={{
                            padding: "10px",
                            border: "solid 1px gray",
                            background: "papayawhip",
                          }}
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
          <div className="pagination">
            <button onClick={() => setPage(0)} disabled={page === 0 || showAll}>
              {"<<"}
            </button>{" "}
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0 || showAll}
            >
              {"<"}
            </button>{" "}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= total / size - 1 || showAll}
            >
              {">"}
            </button>{" "}
            <button
              onClick={() => setPage(Math.ceil(total / size) - 1)}
              disabled={page >= total / size - 1 || showAll}
            >
              {">>"}
            </button>{" "}
            <span>
              Page <strong>{page + 1}</strong>{" "}
            </span>
            <span>
              | Go to page:{" "}
              <input
                type="number"
                defaultValue={page + 1}
                onChange={(e) => {
                  const pagee = e.target.value ? Number(e.target.value) - 1 : 0;
                  setPage(pagee);
                }}
                style={{ width: "100px" }}
              />
            </span>{" "}
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size} out of {total}
                </option>
              ))}
            </select>
            <label>
              Show All
              <input
                type="checkbox"
                value={showAll}
                onChange={(e) => setShowAll(!showAll)}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
