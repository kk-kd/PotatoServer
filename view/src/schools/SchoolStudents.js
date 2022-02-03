import "./SchoolStudents.css";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFilters, useSortBy, useTable, usePagination } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";

export const SchoolStudents = ({ data, routes }) => {
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
          Header: 'ID',
          accessor: 'id'
        },
        {
          Header: 'Has Route',
          accessor: 'route',
          Cell: (props) => {
            return <label>{`${props.value != null}`}</label>
          }
        },
        {
          Header: "Detail Page",
          accessor: "uid",
          Cell: (props) => {
            return <Link to={`/Students/info/${props.value}`}>view</Link>
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
      usePagination);
  return (
  <div id="schoolStudentListing">
    <h1>Students</h1>
    {data.length === 0 ? <h4>There are no students attached to this school! Create some by clicking <Link to="/Users/create">here.</Link></h4>
        : <><table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
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
          {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
          ))}
        </select>
      </div>
        </>}
    </div>
  );
}
