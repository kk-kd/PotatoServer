import "./ListSchools.css";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFilters, useSortBy, useTable } from "react-table";

export const ListSchools = () => {

  const DefaultColumnFilter = ({
    column: { filterValue, setFilter }
  }) => {
    return (
        <input
            value={filterValue || ''}
            onChange={e => {
              setFilter(e.target.value || undefined)
            }}
        />
    )
  }

  const data = useMemo(
      () => [
        {
          name: "Duke University",
          address: "123 Campus Dr, Durham, NC"
        },
        {
          name: "Random Middle School",
          address: "33 Real St, City, State"
        },
        {
          name: "Canada Elementary School",
          address: "7 Canda Rd, Alberta, CA"
        }
      ],
      []
  );

  const columns = useMemo(
      () => [
        {
          Header: 'Name',
          Filter: DefaultColumnFilter,
          accessor: 'name'
        },
        {
          Header: 'Address',
          disableFilters: true,
          accessor: 'address'
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
  } = useTable({ columns, data },
    useFilters,
    useSortBy);
  return (
      <div id="schoolListing">
        <h1>List Schools</h1>
        <Link to="/Schools/create">
          <button>Create School</button>
        </Link>
        <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
          <thead>
          {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                    <th
                        {...column.getHeaderProps(column.id === "name" && column.getSortByToggleProps())}
                        style={column.id === "name" ? {
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
                          <Link to="/Schools/info">
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
