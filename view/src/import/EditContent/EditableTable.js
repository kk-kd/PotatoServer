import React from "react";

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

import Autocomplete from "react-google-autocomplete";


import {
    useTable
  } from "react-table";
  
  // Create an editable cell renderer
  const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateEditedDataValid,
    editableRowIndex, // index of the row we requested for editing
    editableColumns, // list of editable columns
    isCellValid,

  }) => {
    const [value, setValue] = React.useState(initialValue);
    const [err, setErr] = React.useState();
      
    const onChange = (e) => {
      setValue(e.target.value);
      updateEditedDataValid(index, id, e.target.value);
      setErr(isCellValid(id, e.target.value));
    };
    
    // If the initialValue is changed externally, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
      setErr(isCellValid(id, initialValue));
    }, [initialValue]);
  
    return (index === editableRowIndex && editableColumns.includes(id)) ? 
    (id === 'address' ? (
      <div>
              <Autocomplete
                apiKey={'AIzaSyBWqokXgx_Cgj1_TcXxH_c7Pqgz3qzATV4'}
                onPlaceSelected={(place) => {
                  let selected = {'address': place.formatted_address, 'lat': place.geometry.location.lat(), 'lng': place.geometry.location.lng()}
                  setValue(selected)
                  updateEditedDataValid(index, id,  selected);
                  setErr('');
                }}
                onChange = {()=> {
                  console.log('change')
                  setErr('Invalid Address')
                  updateEditedDataValid(index, id,  {'address': ''});
                }}
                
                options={{
                  fields: ["geometry.location", "formatted_address"],
                  types: ["geocode"],
                }}
              />  
              <div style = {{color:'red'}}> {err} </div>
              </div>
        ) 
        :
          <div>
            <input value={value} onChange={onChange} style = {{border: err ? '1px solid red': '1px solid #34815c', position: 'relative'}}/>
            <div style = {{color:'red'}}> {err} </div>
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