import React from "react";

import Checkbox from '@mui/material/Checkbox';
import Table from "@mui/material/Table"
import PropTypes from "prop-types";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";


import {
    useTable
  } from "react-table";
  
  // Create an editable cell renderer
  const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateEditedData, 
    updateEditedDataValid,
    editableRowIndex, // index of the row we requested for editing
    editableColumns, // list of editable columns
    isCellValid,
  }) => {
    const [value, setValue] = React.useState(initialValue);
    const [err, setErr] = React.useState();

    const onBlur = (e) => {
      if (id === 'address') {
        updateEditedDataValid(index, id, e.target.value);
        setErr(isCellValid(id, e.target.value));
      }
    }
      
    const onChange = (e) => {
      setValue(e.target.value);
      if (id !== 'address') {
        updateEditedDataValid(index, id, e.target.value);
        setErr(isCellValid(id, e.target.value));
      }
    };

    
    // If the initialValue is changed externall, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
      setErr(isCellValid(id, initialValue));
    }, [initialValue]);
  
    return (index === editableRowIndex && editableColumns.includes(id)) ? (
      <div>

        <input value={value} onChange={onChange} onBlur = {onBlur} style = {{border: err ? '1px solid red': '1px solid #34815c', position: 'relative'}}/>
        <span style = {{color:'red'}}> {err} </span>
        
      </div>
      
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
    updateEditedData: PropTypes.func.isRequired,
    updateEditedDataValid: PropTypes.func.isRequired,
    editableColumns: PropTypes.array()
  };
  
  // Set our editable cell renderer as the default Cell renderer
  const defaultColumn = {
    Cell: EditableCell
  };

export const EditableTable = ({
    columns,
    editableColumns,
    editedData,
    setEditedData,
    updateEditedDataValid,
    submitRow,
    deleteRow,
    isCellValid,
  }) => {
    const [editableRowIndex, setEditableRowIndex] = React.useState(0);
    
  
    const {
      getTableProps,
      headerGroups,
      rows, 
      prepareRow,
      state: {selectedRowIds}
    } = useTable(
      {
        columns,
        editableColumns,
        data: editedData,
        setEditedData,
        defaultColumn,
        submitRow,
        deleteRow,
        updateEditedDataValid,
        editableRowIndex,
        setEditableRowIndex, 
        isCellValid
      },


      (hooks) => {
        hooks.allColumns.push((columns) => [
          ...columns,
          {
            accessor: "valid",
            id: "valid",
            Header: "Status",
            Cell: ({ row}) => (
              (row.values.valid) ?
              <FontAwesomeIcon
                icon={faCircleCheck}
                size="lg"
                style={{ color: "green"}}
               />
                : 
                <FontAwesomeIcon
                icon={faCircleExclamation}
                size="lg"
                style={{ color: "red" }}
               />)
          },
          {
            accessor: "edit",
            id: "edit",
            Header: "",
            Cell: ({ row, setEditableRowIndex, editableRowIndex, editableColumns, updateEditedDataValid}) => (
              (row.index === editableRowIndex) ?
                <button
                    className="action-button"
                    disabled = {!row.values.valid}
                    onClick={() => {         
                        const Row = row.values;
                        delete Row.edit;
                        updateEditedDataValid(row.index, ['index'], Row['index'])
                        //move to next column
                        if (row.values.valid) {
                            setEditableRowIndex(row.index + 1);
                            submitRow(row.index, row.values)
                        }
                    }
                    }
                >
        
                {row.values.valid ? "Submit": 'Please Fix Errors'}
                </button>
                : 
                <div></div>)
          },
          {
            accessor: "index",
            id: "index",
            Header: "",
            Cell: ({row, deleteRow}) => (
               <button onClick = {(e) => {deleteRow(row.index, row.values); updateEditedDataValid(row.index, 'index', row.index); setEditableRowIndex(row.index +1)}}> Delete </button> 
            )
          },
        ]);}
    );
  
    const removeByIndexs = (array, indexs) =>
      array.filter((_, i) => !indexs.includes(i));
  
    const deleteUserHandler = (event) => {
      const newData = removeByIndexs(
        editedData,
        Object.keys(selectedRowIds).map((x) => parseInt(x, 10))
      );
      setEditedData(newData);
    };
  
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
    
  export default EditableTable;