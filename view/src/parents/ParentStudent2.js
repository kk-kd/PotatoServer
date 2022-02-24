import "./ParentStudent.css";
import { useEffect, useMemo, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTable } from "react-table";
import { RouteStops } from "../routes/RouteStops";

export const ParentStudent = ({ user }) => {
  const { id } = useParams();
  const student = user.students.find(student => student.uid == id);
  var data;
  if (!student) {
    data = [];
  } else {
    data = [student];
  }
  const columns = useMemo(
      () => [
        {
          Header: "First Name",
          accessor: "firstName",
        },
        {
          Header: "Middle Name",
          accessor: "middleName"
        },
        {
          Header: "Last Name",
          accessor: "lastName"
        },
        {
          Header: "Student ID",
          accessor: "id"
        },
        {
          Header: "Route Name",
          accessor: "route",
          Cell: (props) => {
            if (props.value) {
              return (
                  <div>
                    <div>
                      <h5>Name</h5>
                      <label>{props.value.name}</label>
                    </div>
                    <div>
                      <h5>Description</h5>
                      <label>{props.value.desciption}</label>
                    </div>
                  </div>
              )
            }
            return <label>No Route</label>
          }
        },
        {
          Header: "School",
          accessor: "school.name"
        }
      ],
      []
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      useTable({ columns, data });

  if (!user) {
    return (
        <h1>Loading</h1>
    );
  } else if (!data || !data[0]) {
    return (
        <h1>Student Not Found</h1>
    );
  }
  return (
      <div id="content">
        <h2 id = "title"> {data[0].firstName} {data[0].lastName} </h2>

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

        {data[0] && data[0].inRangeStops && (
        <div
          style={{
            display: "flex",
            width: "90%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          >
            <RouteStops data={data[0].inRangeStops} />
          </div>
        )}
      </div>
  );
}
