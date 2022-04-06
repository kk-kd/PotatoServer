
import { useTable } from "react-table";
import { useEffect, useMemo, useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody";

export const UserTable = ({displayData, dataType}) => {
    const [hidden_col_map, setHiddenColMap] = useState ({
      'students': ['address', 'phoneNumber'],
      'parents': ['school_name', 'student_id', 'parent_email'],
    })

    useEffect(()=> {
      setHiddenColumns(hidden_col_map[dataType])
    }, [])
    
    const columns = useMemo(
        () => [
          {
            Header: "Name",
            accessor: row => row.fullName ? row.fullName : row.name,
          },
          {
            Header: "Parent Email",
            accessor: row => row.parentUser.email,
          },
          {
            Header: "School",
            accessor: row => row.school.name,
          },
          {
            Header: "Student ID",
            accessor: "id",
          },
          {
            Header: "Email",
            accessor: "email",
          },
          {
            Header: "Address",
            accessor: "address",
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

    const { getTableProps, rows, prepareRow,  headerGroups, setHiddenColumns} = useTable({ columns, data: displayData});
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