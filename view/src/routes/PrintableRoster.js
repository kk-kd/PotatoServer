import "./PrintableRoster.css";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTable } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const PrintableRoster = React.forwardRef(({ data, route }, ref) => {
  const columns = useMemo(
      () => [
        {
          Header: 'Name',
          accessor: 'fullName',
        },
        {
          Header: "ID",
          accessor: "id"
        },
        {
          Header: "Address",
          accessor: "parentUser.address"
        },
        {
          Header: "Parent",
          accessor: "parentUser.fullName"
        },
        {
          Header: "Email",
          accessor: "parentUser.email"
        },
        {
          Header: "Phone Number",
          accessor: "parentUser.phoneNumber"
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
      <div ref={ref} id="printableTable">
        {data.length === 0 ? <h4>This route has no students</h4>
            : <><h4>{`${route.school.name}: ${route.name}`}</h4>
              <table {...getTableProps()}>
              <thead>
              {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                        <th
                            {...column.getHeaderProps()}
                            id="printableHeaderCell"
                        >
                          {column.render('Header')}
                        </th>
                    ))}
                  </tr>
              ))}
              </thead>
              <tbody {...getTableBodyProps()}>
              {rows.map((row, i) => {
                prepareRow(row)
                return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => {
                        return <td {...cell.getCellProps()} id="printableRosterCell">{cell.render('Cell')}</td>
                      })}
                    </tr>
                )
              })}
              </tbody>
            </table>
            </>}
      </div>
  );
});
