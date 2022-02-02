import "./RouteSchool.css";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTable } from "react-table";

export const RouteSchool = ({ school }) => {
  const data = [school];
  const columns = useMemo(
      () => [
        {
          Header: 'Name',
          accessor: 'name'
        },
        {
          Header: 'Address',
          accessor: 'address'
        },
        {
          Header: "Detail Page",
          accessor: "uid",
          Cell: (props) => {
            return <Link to={`/Schools/info/${props.value}`}>view</Link>
          }
        }
      ],
      []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows
  } = useTable({ columns, data });
  return (
      <div id="routeSchoolListing">
        <h1>School</h1>
        <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
          <thead>
          {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                    <th
                        {...column.getHeaderProps()}
                        style={{
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
          {rows.map((row) => {
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
