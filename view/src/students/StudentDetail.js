import "./StudentDetail.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTable } from "react-table";
import { deleteStudent, getOneStudent } from "../api/axios_wrapper";
import useBatchedState from "react-use-batched-state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

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
  const [school, setSchool] = useBatchedState({});

  let navigate = useNavigate();
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const fetchedData = await getOneStudent(id);
        setData(fetchedData.data);
        console.log(fetchedData.data)
       
        let myDict = [fetchedData.data][0].school;
        myDict['inRangeStops'] = fetchedData.data.inRangeStops;
        if (fetchedData.data.route) {
          myDict['route_description'] = fetchedData.data.route.desciption;
          myDict['route_name'] = fetchedData.data.route.name;
          myDict['route_uid'] = fetchedData.data.route.uid;
        }
        else {
          myDict['route_description'] = "";
          myDict['route_name'] = "";
          myDict['route_uid'] = "";
        }

        delete Object.assign(myDict, { ["schoolName"]: myDict["name"] })[
          "name"
        ];
        delete Object.assign(myDict, { ["schoolUid"]: myDict["uid"] })["uid"];

        setSchool(myDict);
       
      } catch (error) {
        let message = error.response.data;
        throw alert(message);
      }
    };
    fetchStudentData();
  }, []);

  const handleDeleteStudent = (student_id, e) => {
    e.preventDefault();

    let sName = prompt("Do you want to delete?  If so, enter student's last name:");
    if (!sName) {
      return; 
    } else if (sName.toLowerCase().trim() !== data.lastName.toLowerCase().trim()) {
      alert("Entered Student Last Name Does Not Match."); 
      return;
    } else {
      const a = callDeleteStudentAPI(student_id);
    } 
  }

  // const handleDeleteUser = (user_id, e) => {
  //   e.preventDefault();
  //   let sName = prompt("Do you want to delete?  If so, enter User email:");
  //   console.log(sName);
  //   console.log(data.email);
  //   if (!sName) {
  //     return; 
  //   } else if (sName.toLowerCase().trim() !== data.email.toLowerCase().trim()) {
  //     alert("Entered Email Does Not Match."); 
  //     return;
  //   } else {
  //     deleteUserCall(user_id);
  //   } 
  // }

  const callDeleteStudentAPI = async (student_id) => {
    try {
      const resp = await deleteStudent(student_id);
      alert("User Delete Successful");
      navigate("/Students/list");
    } catch (error) {
      //console.log(error);
      let message = error.response.data;
      throw alert(message);
    }
  }

  const columns = useMemo(
    () => [
      {
        Header: "School Name",
        accessor: "schoolName",
        Cell: props => (
            <label><Link to={`/Schools/info/${props.row.original.schoolUid}`}>{props.value}</Link></label>
        )
      },
      {
        Header: "School Address",
        accessor: "address",
      },
      {
        Header: "Route",
        accessor: "route_name",
        Cell: props => (
            <div>
            {props.value ?
                  (<div>
                    <Link to={`/Routes/info/${props.row.original.route_uid}`}>{props.value}</Link>
                    {(props.row.original.inRangeStops && props.row.original.inRangeStops.length > 0) || <><FontAwesomeIcon
                        icon={faCircleExclamation}
                        size="lg"
                        style={{ color: "red" }}
                        data-tip
                        data-for="noInRangeStopTip"
                    /><ReactTooltip
                        id="noInRangeStopTip"
                        place="bottom"
                        effect="solid"
                    >
                      This student does not have any in-range stops.
                    </ReactTooltip></>}
                  </div>) : (<>
                    <FontAwesomeIcon
                        icon={faXmark}
                        size="lg"
                        style={{ color: "red" }}
                        data-tip
                        data-for={`noRouteTip${props.row.original.route_uid}`}
                    /><ReactTooltip
                      id={`noRouteTip${props.row.original.route_uid}`}
                      place="bottom"
                      effect="solid"
                  >
                    This student is not on a route.
                  </ReactTooltip>
                  </>)}
            </div>
        )
      }
    ],
    []
  );

  let myData = [Object.assign({}, route, school)];
  //console.log(myData)
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: myData });

  return (
    <div id="student-listing">
      <h1>
        Student Detail (<Link to={"/Students/edit/" + id}> Edit Student</Link>,
        <Link
          to={"/Students/list"}
          onClick={(e) => {
            handleDeleteStudent(id, e);
          }}
        >
          {" "}
          Delete Student {" "}
        </Link>
        ){" "}
      </h1>

      <h3>Student Characteristics </h3>
      <div>
        <p>First Name : {data.firstName}</p>
        <p>Middle Name : {data.middleName || ""}</p>
        <p>Last Name : {data.lastName}</p>
       <p>School: {school.schoolName} </p>
        <p>ID : {data.id || ""}</p>
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
