import "./SchoolStudents.css";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFilters, useSortBy, useTable, usePagination } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const SchoolStudents = ({ data, routes }) => {
  const columns = useMemo(
      () => [
        {
          Header: 'Name',
          accessor: 'firstName',
          Cell: props => (
              <div>
                {`${props.value} ${props.row.original.lastName}`}
              </div>
          )
        },
        {
          Header: 'ID',
          accessor: 'id'
        },
        {
          Header: 'Route',
          accessor: 'route',
          Cell: (props) => (
              <div>
                {props.value ?
                    <label>
                      {props.value.name} {props.row.original.inRangeStops.length > 0 || <><FontAwesomeIcon
                        icon={faCircleExclamation}
                        size="lg"
                        style={{ color: "red" }}
                        data-tip
                        data-for={`noStopTip${props.row.original.uid}`}
                    /><ReactTooltip
                        id={`noStopTip${props.row.original.uid}`}
                        place="bottom"
                        effect="solid"
                    >
                      This student does not have an in-range stop.
                    </ReactTooltip></>}
                    </label> :
                    <>
                    <FontAwesomeIcon
                        icon={faXmark}
                        size="lg"
                        style={{ color: "red" }}
                        data-tip
                        data-for={`noRouteTip${props.row.original.uid}`}
                        /><ReactTooltip
                            id={`noRouteTip${props.row.original.uid}`}
                            place="bottom"
                            effect="solid"
                        >
                    This student is not on a route.
                    </ReactTooltip>
                    </>
                  }
              </div>
          )
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
    state: { pageIndex, pageSize },
  } = useTable(
    { columns, data, initialState: { pageIndex: 0 } },
    usePagination
  );
  return (
  <div id="schoolStudentListing">
    {data.length === 0 ? <h5> This school has no students. Create some by clicking <Link to="/Students/create">here.</Link></h5>
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
                    {row.cells.map((cell) => {
                      return (
                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      );
                    })}
                  </tr>
                );
            })}
        </tbody>
        </table>
          <div className="pagination">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              {"<<"}
            </button>{" "}
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
              {"<"}
            </button>{" "}
            <button onClick={() => nextPage()} disabled={!canNextPage}>
              {">"}
            </button>{" "}
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              {">>"}
            </button>{" "}
            <span>
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{" "}
            </span>
            <span>
              | Go to page:{" "}
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                style={{ width: "100px" }}
              />
            </span>{" "}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
          
        </>
        
      } 
    </div>
  );
};
