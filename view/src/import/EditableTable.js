import React from "react";

import Checkbox from '@mui/material/Checkbox';
import Table from "@mui/material/Table"
import PropTypes from "prop-types";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";


import {
    useRowSelect,
    useTable
  } from "react-table";
  
  // Create an editable cell renderer
  const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateMyData, 
    editableRowIndex // index of the row we requested for editing
  }) => {
    const [value, setValue] = React.useState(initialValue);
  
    const onChange = (e) => {
      setValue(e.target.value);
    };
  
    // We'll only update the external data when the input is blurred
    const onBlur = () => {
      updateMyData(index, id, value);
    };
  
    // If the initialValue is changed externall, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);
  
    return index === editableRowIndex ? (
      <input value={value} onChange={onChange} onBlur={onBlur} />
    ) : (
      <p>{value}</p>
    );
  };
  
  EditableCell.propTypes = {
    cell: PropTypes.shape({
      value: PropTypes.any.isRequired
    }),
    row: PropTypes.shape({
      index: PropTypes.number.isRequired
    }),
    column: PropTypes.shape({
      id: PropTypes.number.isRequired
    }),
    updateMyData: PropTypes.func.isRequired
  };
  
  // Set our editable cell renderer as the default Cell renderer
  const defaultColumn = {
    Cell: EditableCell
  };

  const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef();
      const resolvedRef = ref || defaultRef;
  
      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
      }, [resolvedRef, indeterminate]);
  
      return (
        <>
          <Checkbox ref={resolvedRef} {...rest} />
        </>
      );
    }
  );

export const EnhancedTable = ({
    columns,
    data,
    setData,
    updateMyData
  }) => {
    const [editableRowIndex, setEditableRowIndex] = React.useState(null);
  
    const {
      getTableProps,
      headerGroups,
      rows, 
      prepareRow,
      preGlobalFilteredRows,
      state: {selectedRowIds}
    } = useTable(
      {
        columns,
        data,
        defaultColumn,
        updateMyData,
        editableRowIndex,
        setEditableRowIndex 
      },
      useRowSelect,
      (hooks) => {
        hooks.allColumns.push((columns) => [
          ...columns,
          // pass edit hook
          {
            accessor: "edit",
            id: "edit",
            Header: "edit",
            Cell: ({ row, setEditableRowIndex, editableRowIndex }) => (
              <button
                className="action-button"
                onClick={() => {
                  const currentIndex = row.index;
                  if (editableRowIndex !== currentIndex) {
                    // row requested for edit access
                    setEditableRowIndex(currentIndex);
                  } else {
                    // request for saving the updated row
                    setEditableRowIndex(null);
                    const updatedRow = row.values;
                    console.log("updated row values:");
                    console.log(updatedRow);
                    // call your updateRow API
                  }
                }}
              >
                {editableRowIndex !== row.index ? "Edit" : "Save"}
              </button>
            )
          }
        ]);
      }
    );
  
    const removeByIndexs = (array, indexs) =>
      array.filter((_, i) => !indexs.includes(i));
  
    const deleteUserHandler = (event) => {
      const newData = removeByIndexs(
        data,
        Object.keys(selectedRowIds).map((x) => parseInt(x, 10))
      );
      setData(newData);
    };
  

    // Render the UI for your table
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
  };
  
  EnhancedTable.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    updateMyData: PropTypes.func.isRequired,
    setData: PropTypes.func.isRequired
  };
  
  export default EnhancedTable;