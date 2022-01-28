import { useEffect, useMemo, useState } from "react";
import { Link, useParams} from "react-router-dom";
import {useTable } from "react-table";
import { getOneUser } from "../api/axios_wrapper";
import useBatchedState from 'react-use-batched-state';

export const UserDetail = () => {
  const { id } = useParams();
  const [data, setData] = useBatchedState({});
  const [students, setStudents] = useBatchedState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneUser(id).catch((e) => {});
        setData(fetchedData.data);
        setStudents([fetchedData.data][0].students);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
    console.log(data)
  }, []);
 
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
        <h1>User Detail (<Link to={'/Users/edit/' + id}>
          Edit
        </Link>) </h1>
        <h3>User Characteristics </h3>
   
        <div> 
          <p>First Name : {data.firstName}</p>
          <p>Middle Name : {data.firstName}</p>
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