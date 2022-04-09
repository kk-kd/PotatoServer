import "./ListUsers.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTable } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { getAllUsers, deleteUser } from "../api/axios_wrapper";
import { filterAllUsers } from "../api/axios_wrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export const ListUsers = ({ role }) => {
  let navigate = useNavigate();
  function generateUserDetailLink(uid) {
    return "/Users/info/" + uid;
  }

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(1);
  const [size, setSize] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("email");
  const [sortDirec, setSortDirec] = useState("ASC");
  const [emailFilter, setEmailFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await filterAllUsers({
          page: page,
          size: size,
          sort: sortBy,
          sortDir: sortDirec,
          filterType: lastNameFilter,
          filterData: emailFilter,
          roleFilter: roleFilter,
          showAll: showAll,
        });
        setData(fetchedData.data.users);
        setTotal(fetchedData.data.total);
      } catch (error) {
        alert(error.response.data);
      }
    };
    fetchData();
  }, [page, size, sortDirec, emailFilter, lastNameFilter, roleFilter, showAll]);

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
        HeaderName: "Email",
        accessor: "email",
      },
      {
        HeaderName: "Name",
        accessor: "fullName",
      },
      {
        Header: "Address",
        accessor: "address",
      },
      {
        HeaderName: "Role",
        accessor: "role",
      },
      {
        Header: "Phone Number",
        accessor: "phoneNumber",
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });
  return (
    <div id="content">
      <h2 id="title"> Users </h2>
      <div id="userListing">
        {(role === "Admin" || role === "School Staff") && (
          <Link to="/Users/create">
            <button>Create User</button>
          </Link>
        )}
        <table
          {...getTableProps()}
          class="table table-striped table-bordered border-success rounded"
        >
          <thead class="thead-dark">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>
                    {column.id === "email" ||
                    column.id === "fullName" ||
                    column.id === "role" ? (
                      <div>
                        {column.id !== "role" ? (
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
                            <DefaultColumnFilter
                              setFilter={
                                column.id === "email"
                                  ? setEmailFilter
                                  : setLastNameFilter
                              }
                            />
                          </>
                        ) : (
                          <>
                            <label>{column.HeaderName} </label>
                            <select
                              value={roleFilter}
                              onChange={(e) => setRoleFilter(e.target.value)}
                            >
                              <option value="">--</option>
                              <option value="Student">Student</option>
                              <option value="Admin">Admin</option>
                              <option value="School Staff">School Staff</option>
                              <option value="Driver">Driver</option>
                              <option value="Parent">Parent</option>
                            </select>
                          </>
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
                <tr
                  {...row.getRowProps()}
                  onClick={() => {
                    if (row.original.role === "Student") {
                      navigate(`/Students/info/${row.original.studentInfo.uid}`);
                    } else {
                      navigate(`/Users/info/${row.original.uid}`);
                    }
                  }}
                >
                  {row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        style={{ cursor: "pointer" }}
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
};
