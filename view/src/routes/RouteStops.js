import "./RouteStops.css";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFilters, useSortBy, useTable, usePagination } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const RouteStops = ({ data, routes }) => {
  const columns = useMemo(
      () => [
        {
          Header: "Name",
          accessor: "name",
          Cell: props => (
              <div>
                {props.value ? `${props.value}` : `Stop #${props.row.original.uid}`}
              </div>
          )
        },
        {
          Header: 'Pickup Time',
          accessor: 'pickupTime',
          Cell: props => (
              <input
                  style={{ backgroundColor: "transparent", border: "none" }}
                  type="time"
                  id="routeStopTime"
                  value={props.value || props.row.original.arrivalTime}
                  readOnly
              />
          )
        },
        {
          Header: 'Dropoff Time',
          accessor: 'dropoffTime',
          Cell: props => (
              <input
                  style={{ backgroundColor: "transparent", border: "none" }}
                  type="time"
                  id="routeStopTime"
                  value={props.value || props.row.original.departureTime}
                  readOnly
              />
          )
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
      <div id="routeStopListing">
        <h1>Stops</h1>
        {data.length === 0 ? <h4>There are no students attached to this route! Add some by selecting Route Planner.</h4>
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
                <button className="paginationButton" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                  {'<<'}
                </button>{' '}
                <button className="paginationButton" onClick={() => previousPage()} disabled={!canPreviousPage}>
                  {'<'}
                </button>{' '}
                <button className="paginationButton" onClick={() => nextPage()} disabled={!canNextPage}>
                  {'>'}
                </button>{' '}
                <button className="paginationButton" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                  {'>>'}
                </button>{' '}
              </div>
            </>}
      </div>
  );
}
