import "./SchoolRoutes.css";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFilters, useSortBy, useTable, usePagination } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const SchoolRoutes = ({ data }) => {
  const columns = useMemo(
      () => [
        {
          Header: 'name',
          accessor: 'name',
          Cell: props => (
              <div><label>{props.value} {!props.row.original.students.some(student => !student.inRangeStops || student.inRangeStops.length === 0) || <><FontAwesomeIcon
                  icon={faCircleExclamation}
                  size="lg"
                  style={{ color: "red" }}
                  data-tip
                  data-for="incompleteTip"
              /><ReactTooltip
                  id="incompleteTip"
                  place="bottom"
                  effect="solid"
              >
                At least one student on this route does not have an in-range stop.
              </ReactTooltip></>}</label></div>
          )
        },
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
      <div id="schoolRouteListing">
        {data.length === 0 ? <h5>This school has no routes. Create some by clicking Route Planner.</h5>
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
                prepareRow(row);
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
          <div className="test-centering">
            <div class="btn-group" role="group" aria-label="Basic example">
              <button
                class="btn btn-secondary"
                style={{ maxWidth: "5em" }}
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                {"<<"}
              </button>{" "}
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                class="btn btn-secondary"
                style={{ maxWidth: "5em" }}
              >
                {"<"}
              </button>{" "}
              <button
                class="btn btn-secondary"
                style={{ maxWidth: "5em" }}
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                {">"}
              </button>{" "}
              <button
                class="btn btn-secondary"
                style={{ maxWidth: "5em" }}
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                {">>"}
              </button>{" "}
            </div>
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
