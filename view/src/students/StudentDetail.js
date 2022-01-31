import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTable } from "react-table";
import { deleteStudent, getOneStudent } from "../api/axios_wrapper";
import useBatchedState from "react-use-batched-state";

/*
- Look at nolan's route detail page
- if they change the school, check that onDelete is setting school to be null;
  - use the orphaned, but check that if school is CHANGED OR REMOVED, route is gone for student; route isn't deleted.
- for the create/edit form, copy Nolan's route format (PI on jan 30th night / 31 morning) (check megan's too to see what's more explicit formatting)
*/

export const StudentDetail = () => {
  const { id } = useParams();
  const [data, setData] = useBatchedState({});
  const [route, setRoute] = useBatchedState([]);
  // const [students, setStudents] = useBatchedState([]); (will be routes)

  let navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneStudent(id);
        setData(fetchedData.data);
        console.log(fetchedData.data);
        setRoute([[fetchedData.data][0].route]);
      } catch (error) {
        let message = error.response.data;
        throw alert(message);
      }
    };
    fetchData();
  }, []);

  async function handleDeleteStudent(student_id, e) {
    e.preventDefault();

    console.log("Deleting student with uid = " + student_id);
    try {
      let delete_student_response = await deleteStudent(parseInt(student_id));
    } catch (error) {
      console.log(error);
      let message = error.response.data;
      throw alert(message);
    }

    navigate("/Students/list");
  }

  const columns = useMemo(
    () => [
      {
        Header: "Route Name",
        accessor: "name",
      },
      {
        Header: "Route Description",
        accessor: "desciption",
      },
      {
        Header: " ",
        disableFilters: true,
        accessor: "uid",
        Cell: ({ value }) => {
          return (
            <Link to={"/Routes/info/" + value}> {"View Route Detail"} </Link>
          );
        },
      },
    ],
    []
  );
  console.log(route);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: route });

  return (
    <div id="studentListing">
      <h1>
        Student Detail (<Link to={"/Students/edit/" + id}> Edit</Link>,
        <Link
          to={"/Students/list"}
          onClick={(e) => {
            handleDeleteStudent(id, e);
          }}
        >
          {" "}
          Delete{" "}
        </Link>
        ){" "}
      </h1>
      <h3>Student Characteristics </h3>
      <div>
        <p>First Name : {data.firstName}</p>
        <p>Middle Name : {data.middleName}</p>
        <p>Last Name : {data.lastName}</p>
        {/* <p>Address : {data.address}</p> */}
        <p>ID : {data.id}</p>
      </div>
      <h3>Routes Associated With This Student </h3>
      <table {...getTableProps()} style={{ border: "solid 1px blue" }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(
                    column.id === "name" || column.id === "email_address"
                  )}
                  style={
                    column.id === "name" || column.id === "email_address"
                      ? {
                          borderBottom: "solid 3px red",
                          background: "aliceblue",
                          color: "black",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }
                      : {
                          borderBottom: "solid 3px red",
                          background: "aliceblue",
                          color: "black",
                          fontWeight: "bold",
                        }
                  }
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
      </table>{" "}
    </div>
  );
};
