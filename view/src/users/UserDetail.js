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

  const handleDeleteUser = (user_id, e) => {
    e.preventDefault();
    let sName = prompt("Do you want to delete?  If so, enter User email:");
    console.log(sName);
    console.log(data.email);
    if (!sName) {
      return; 
    } else if (sName.toLowerCase().trim() !== data.email.toLowerCase().trim()) {
      alert("Entered Email Does Not Match."); 
      return;
    } else {
      deleteUserCall(user_id);
    } 
  }
  const deleteUserCall = async (user_id) => {  
    try {
      await deleteUser(parseInt(user_id)); 
      alert ("User Deletion Successful");
      navigate('/Users/list');
    } catch (e)  {
      console.log(e);
      let message = e.response.data;
      alert (message);
    }    
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
          <Link to={'/Users/edit/' + id}> Edit User </Link>,
          <Link to={'/Users/list'} onClick = {(e) => {handleDeleteUser(id, e);} }> Delete User </Link>
          )  </h1>
        <h3>User Characteristics </h3>
   
        <div> 
          <p>First Name : {data.firstName}</p>
          <p>Middle Name : {data.middleName}</p>
          <p>Last Name : {data.lastName}</p>
          <p>Email : {data.email}</p>
          <p>Address : {data.address}</p>
          <p>Admin : {data.isAdmin ? "Yes" : "No"}</p>
        </div>     

        <h3>Students Associated With This User </h3>
        {students.length === 0 ? <h4>There are no students attached to this user! Create one by clicking <Link to="/Users/create">here.</Link></h4>
            :
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
        </table> }
      </div>
  );
}