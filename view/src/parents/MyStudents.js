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
        Header: "Last Name",
        accessor: "lastName",
      },
      {
        Header: "School",
        accessor: "school.name",
      },
      {
        Header: "Bus Route Info",
        accessor: "uid",
        Cell: (props) => {
          return (
            <div>
              <Link to={`/MyStudents/${props.value}`}>view</Link>
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
      <div id = "content">
          <h2 id = "title"> My Students </h2>
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
    );
  }
};
