import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFilters, useSortBy, useTable } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";

export const ShowUserDetail = () => {
  const data = useMemo(
      () => [
        {
          email_address: "Example email",
          name: "Amy Bac Cant",
          address: 'example address',
          administrator: "false", 
          students: ['Student 1','Student 2'], 
        },
      ]
  );
 
  const columns = useMemo(
      () => [
        {
            Header: 'Full Name',
            Filter: DefaultColumnFilter,
            accessor: 'name'
        },
        {
          Header: 'Email Address',
          Filter: DefaultColumnFilter,
          accessor: 'email_address'
        },

        {
          Header: 'Address',
          disableFilters: true,
          accessor: 'address'
        },
        {
          Header: 'Administrator',
          disableFilters: true,
          accessor: 'administrator'
        },
        {
            Header: 'Students',
            disableFilters : true,
            accessor: 'students',
            Cell: ({value}) => { 
                function a (n) {
                    return  (<li>{n}</li>);
                } 
                return <ul> {value.map(a)} </ul> 
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
  } = useTable({ columns, data },
      useFilters,
      useSortBy);
  return (
      <div id="userListing">
        <h1>List Schools</h1>
        <Link to="/Users/create">
          <button>Create User</button>
        </Link>
        <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
          <thead>
          {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                    <th
                        {...column.getHeaderProps((column.id === "name" || column.id === "email_address") && column.getSortByToggleProps())}
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
                           <Link to="/Users/info"> 
                            {cell.render('Cell')}
                           </Link>
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