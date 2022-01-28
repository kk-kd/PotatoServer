import { useEffect, useMemo, useState } from "react";
import { Link, useParams} from "react-router-dom";
import {useTable } from "react-table";

export const UserDetail = () => {
  const { id } = useParams();

  // TODO - API call with user id 
  
  const data = useMemo(
      () => [
        {
          email_address: "Example email",
          name: "Amy Bac Cant",
          address: 'example address',
          administrator: "false", 
          students: [{name: "Student 1", id:'1'}, {name: "Student 2", id:"2"}], 
        },
      ]
  );
 
  const columns = useMemo(
      () => [
        {
            Header: 'Full Name',
            accessor: 'name'
        },
        {
          Header: 'Email Address',
          accessor: 'email_address'
        },

        {
          Header: 'Address',
          accessor: 'address'
        },
        {
          Header: 'Administrator',
          accessor: 'administrator'
        },
        {
            Header: 'Students',
            disableFilters : true,
            accessor: 'students',
            Cell: ({value}) => { 
                function makeLink(n) {
                    return  <Link key = {n.ids} to = {"/Students/info/" + n.id}> {n.name} </Link> ;
                } 
                return <ul> {value.map(makeLink)} </ul> 
         }},
      ],
      []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data });
  return (
      <div id="userListing">
        <h1>User Detail</h1>
        <h2>{`ID: ${id}`}</h2>
        <Link to="/Users/edit">
          <button>Edit User Details</button>
        </Link>
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
                      <div>{column.canFilter && column.render('Filter')}</div>
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