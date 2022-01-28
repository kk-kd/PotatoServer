import { useEffect, useMemo, useState } from "react";
import { Link, useParams} from "react-router-dom";
import {useTable } from "react-table";
import { getOneUser } from "../api/axios_wrapper";

export const UserDetail = () => {
  const { id } = useParams();

  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getOneUser(id);
        console.log(fetchedData.data);
        setData([fetchedData.data]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
 
  const columns = useMemo(
      () => [
        {
            Header: 'First Name',
            accessor: 'firstName'
        },
        {
          Header: 'Last Name',
          accessor: 'lastName'
      },
        {
          Header: 'Email Address',
          accessor: 'email'
        },

        {
          Header: 'Address',
          accessor: 'address'
        },
        {
          Header: 'Administrator',
          accessor: 'isAdmin', 
          Cell: ({value}) => { 
            return <p> {value ? 'Yes' : 'No' } </p>
        }
        },
        {
            Header: 'Students',
            disableFilters : true,
            accessor: 'students',
            Cell: ({value}) => { 
                function makeLink(n) {
                    return  <Link key = {n.uid} to = {"/Students/info/" + n.uid}> {n.firstName +' '+ n.lastName} </Link> ;
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
        <Link to={'/Users/edit/' + id}>
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