
import { useTable } from "react-table";
import { useEffect, useMemo, useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody";

export const StudentTable = ({displayData}) => {
    
    const columns = useMemo(
        () => [
          {
            Header: "Name",
            accessor: row => row.fullName ? row.fullName : row.name,
          },
          {
            Header: "Parent Email",
            id: 'parent_email',
            accessor: row => row.parentUser.email,
          },
          {
            Header: "School",
            id: 'school_name',
            accessor: row => row.school.name,
          },
          {
            Header: "Student ID",
            id: 'id',
            accessor: "id",
          },
          {
            Header: "Email",
            accessor: "email",
          },
          {
            Header: "Phone Number",
            accessor: "phoneNumber",
          },
        ],
        []
      );

    useEffect(()=> {
        console.log(displayData)
    }, [])

    const { getTableProps, rows, prepareRow,  headerGroups} = useTable({ columns, data: displayData});
    return (
        <TableContainer>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <TableCell
                    {...column.getHeaderProps()}
                  >
                    {column.render("Header")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <TableCell {...cell.getCellProps()}>
                        {cell.render("Cell")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

    );
}