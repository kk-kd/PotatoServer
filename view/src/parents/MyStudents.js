import "./MyStudents.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTable } from "react-table";
import { getOneUser } from "./../api/axios_wrapper";

export const MyStudents = ({ user }) => {
  const data = user.students || null;
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
        Header: "Last Name",
        accessor: "lastName",
      },
      {
        Header: "Detail Page",
        accessor: "uid",
        Cell: (props) => {
          return (
            <div>
              {user.isAdmin ? (
                <Link to={`/Students/info/${props.value}`}>view</Link>
              ) : (
                <Link to={`/MyStudents/${props.value}`}>view</Link>
              )}
            </div>
          );
        },
      },
    ],
    []
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  if (!user) {
    return <label>Loading</label>;
  } else {
    return (
      <div class="card">
        <div class="card-body core-card-style">
          <div id="myStudentListing">
            {data.length === 0 ? (
              <h4>You have no registered child students.</h4>
            ) : (
              <table {...getTableProps()} class="table table-striped">
                <thead class="thead-dark">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th {...column.getHeaderProps()}>
                          {column.render("Header")}
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
                            <td {...cell.getCellProps()}>
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }
};
