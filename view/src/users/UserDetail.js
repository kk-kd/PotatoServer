import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate} from "react-router-dom";
import {useTable } from "react-table";
import { deleteUser, getOneUser } from "../api/axios_wrapper";
import useBatchedState from 'react-use-batched-state';

export const UserDetail = () => {
  const { id } = useParams();
  const [data, setData] = useBatchedState({});
  const [students, setStudents] = useBatchedState([]);
  let navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneUser(id); 
        setData(fetchedData.data);
        console.log(fetchedData.data);
        setStudents([fetchedData.data][0].students);
      } catch (error) {
          let message = error.response.data;
          throw alert (message);
      }};
    fetchData();
  
  }, []);

  async function handleDeleteUser (user_id, e) {
    e.preventDefault(); 
   
    console.log("Deleting User with uid = " + user_id)
    try {
      let delete_user_response = await deleteUser(parseInt(user_id)); 
    } catch (error)  {
      console.log(error)
      let message = error.response.data;
      throw alert (message);
    }
    
    navigate('/Users/list');
  }
 
  const columns = useMemo(
      () => [
        {
            Header: 'Student First Name',
            accessor: 'firstName',
        },
        {
          Header: 'Student Last Name',
          accessor: 'lastName',
        },
         {
          Header: 'Missing Route',
          disableFilters : true,
          accessor: 'route',
          Cell: ({value}) => { 
              return <ul> {value ? 'No' : 'Yes' } </ul> 
          }
      },
      {
        Header: ' ',
        disableFilters: true,
        accessor: 'uid',
        Cell: ({value}) => { 
          return <Link to = {"/Students/info/" + value}> {"View Student Detail"} </Link>   
        }
    }
      ],
      []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({columns, data: students});


  return (
      <div id="userListing">
        <h1>User Detail (
          <Link to={'/Users/edit/' + id}> Edit</Link>, 
          <Link to={'/Users/list'} onClick = {(e) => {handleDeleteUser(id, e)} }> Delete </Link>
          )  </h1>
        <h3>User Characteristics </h3>
   
        <div> 
          <p>First Name : {data.firstName}</p>
          <p>Middle Name : {data.middleName}</p>
          <p>Last Name : {data.lastName}</p>
          <p>Email : {data.email}</p>
          <p>Address : {data.address}</p>
          <p>Password : {data.password}</p>
          <p>Admin : {data.isAdmin ? "Yes" : "No"}</p>
        </div>     

        <h3>Students Associated With This User </h3>
        <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
          <thead>
          {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                    <th
                        {...column.getHeaderProps((column.id === "name" || column.id === "email_address"))}
                        style={column.id === "name" || column.id === "email_address" ? {
                          borderBottom: 'solid 3px red',
                          background: 'aliceblue',
                          color: 'black',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        } : {
                          borderBottom: 'solid 3px red',
                          background: 'aliceblue',
                          color: 'black',
                          fontWeight: 'bold',
                        }}
                    >
                      {column.render('Header')}
                    </th>
                ))}
              </tr>
          ))}
          </thead>
          <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row)
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
}