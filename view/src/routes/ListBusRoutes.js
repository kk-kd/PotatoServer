import "./ListBusRoutes.css";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFilters, useSortBy, useTable, usePagination } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";

export const ListBusRoutes = () => {
  const data = useMemo(
      () => [
        {
          name: {
            rname: "Normal route",
            rid: "1"
          },
          students: "Amy, Tom, Lionel, Caldwell",
          school: "Normal School",
          route_description: "This is a route that is fine"
        },
        {
          name: {
            rname: "Not Normal route",
            rid: "2"
          },
          students: "Dog, Fox, Cat, Lionel",
          school: "Not Normal School",
          route_description: "Pieces"
        },
        {
          name: {
            rname: "Long Route",
            rid: "3"
          },
          students: "Really, Long, List, Of, Random, Students, That, Just, Keep, Going",
          school: "Far Away School",
          route_description: "This is a long-term bus.  It goes really, really, really far."
        }
      ],
      []
  );

  const columns = useMemo(
      () => [
        {
          Header: 'Route Name',
          Filter: DefaultColumnFilter,
          accessor: 'name',
          Cell: (props) => (
              <Link to={`/Routes/info/${props.value.rid}`}>
                <label>{props.value.rname}</label>
              </Link>
          )
        },
        {
          Header: 'School',
          disableFilters: true,
          accessor: 'school'
        },
        {
          Header: 'Students',
          disableFilters: true,
          accessor: 'students'
        },
        {
          Header: 'Route Description',
          disableFilters: true,
          accessor: 'route_description'
        }
      ],
      []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable({ columns, data, initialState: { pageIndex: 0 } },
      useFilters,
      useSortBy,
      usePagination);
  return (
      <div id="routeListing">
        <h1>List Routes</h1>
        <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
          <thead>
          {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                    <th
                        {...column.getHeaderProps(column.canFilter && column.getSortByToggleProps())}
                        style={column.canFilter ? {
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
          {page.map((row, i) => {
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
        <div className="pagination">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>{' '}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>{' '}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {'>'}
          </button>{' '}
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            {'>>'}
          </button>{' '}
          <span>
          Page{' '}
            <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
          <span>
          | Go to page:{' '}
            <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0
                  gotoPage(page)
                }}
                style={{ width: '100px' }}
            />
        </span>{' '}
          <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value))
              }}
          >
            {[1, 2, 10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
            ))}
          </select>
        </div>
      </div>
  );
}
