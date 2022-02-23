import "./RouteStudents.css";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFilters, useSortBy, useTable, usePagination } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const RouteStudents = ({ data, routes }) => {
  const columns = useMemo(
      () => [
        {
          Header: 'Name',
          accessor: 'firstName',
          Cell: props => (
              <label>
                <Link to={`/Students/info/${props.row.original.uid}`}>{`${props.value} ${props.row.original.lastName}`}</Link>
                {(props.row.original.inRangeStops && props.row.original.inRangeStops.length > 0) || <><FontAwesomeIcon
                    icon={faCircleExclamation}
                    size="lg"
                    style={{ color: "red" }}
                    data-tip
                    data-for="noInRangeStopTip"
                /><ReactTooltip
                    id="noInRangeStopTip"
                    place="bottom"
                    effect="solid"
                >
                  This student does not have any in-range stops.
                </ReactTooltip></>}
              </label>
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
      <div >
        {data.length === 0 ? <h4>This route has no students. Add some by clicking Edit Students/Stops.</h4>
            : <><table {...getTableProps()} class="table table-striped">
          <thead>
          {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                        <th
                            {...column.getHeaderProps()}
                            style={{
                              borderBottom: 'solid 3px black',
                              background: 'white',
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
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
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
