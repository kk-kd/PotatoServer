import "./ListUsers.css";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFilters, useSortBy, useTable } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { getAllUsers, deleteUser} from "../api/axios_wrapper";

export const ListUsers = () => {
  
  function generateUserDetailLink(uid) {
    return "/Users/info/" + uid; 
  }

  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getAllUsers({
          page: 0,
          size: 0,
          sort: "none",
          sortDir: "none",
        });
        //console.log(fetchedData.data);
        setData(fetchedData.data);

      } catch (error) {
        console.log(error.response);
      }
    };
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "Email Address",
        Filter: DefaultColumnFilter,
        accessor: "email",
      },
      {
        Header: "Full Name",
        Filter: DefaultColumnFilter,
        accessor: "firstName",
      },
      {
        Header: "Address",
        disableFilters: true,
        accessor: "address",
      },
      {
        Header: "Administrator",
        disableFilters: true,
        accessor: "isAdmin",
        Cell: (props) => {
          return <label>{props.value.toString()}</label>;
        }
      },
        {
          Header: 'Students',
          disableFilters: true,
          accessor: 'students'
        },
        {
          Header: ' ',
          disableFilters: true,
          accessor: 'uid',
          Cell: ({value}) => { 
            return <div> 
              <Link to = {generateUserDetailLink(value)}> {"View User Detail"} </Link> 
              <button onClick = {(e) => {handleDeleteUser(value, e)}}> Delete User </button>
              </div> } 
        },
      ],
      []
  );

  async function handleDeleteUser (user_id, e) {
    e.preventDefault(); 
   
    console.log("Deleting User with uid = " + user_id)
    try {
      let delete_user_response = await deleteUser(user_id).catch ((error) => {})
      let status = delete_user_response.status
      
      if (status === 200) {
    
        throw alert ("User Successfully Deleted.")
        // move to their user detail
      }
      if (status === 404) {
        throw alert ("Login Failed Because the Server was Not Reached.")
      } 
      else if (status === 401) {
        throw alert ("Login Failed Because User Already Exists")
    }
  } catch {
    // avoids warning
   }
  }

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data }, useFilters, useSortBy);
  return (
    <div id="userListing">
      <h1>List Users</h1>
      <Link to="/Users/create">
        <button>Create User</button>
      </Link>
      <table {...getTableProps()} style={{ border: "solid 1px blue" }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(
                    (column.id === "name" || column.id === "email_address") &&
                      column.getSortByToggleProps()
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
                  <div>{column.canFilter && column.render("Filter")}</div>
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
                  {row.cells.map(cell => {
                    return (
                        <td
                            {...cell.getCellProps()}
                            style={{
                              padding: '10px',
                              border: 'solid 1px gray',
                              background: 'papayawhip',
                            }}
                        >
            
                          {cell.render('Cell')}
                          
                        </td>
                    )
                  })}
                </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
};
