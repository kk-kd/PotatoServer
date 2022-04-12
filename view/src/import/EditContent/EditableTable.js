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
    updateErrorCodes,
    editableColumns, // list of editable columns
    isCellValid,
    setSelectedIndex, 
    selectedIndex

  }) => {
    const [value, setValue] = React.useState(initialValue);
    const [err, setErr] = React.useState();
    const [warn, setWarn] = React.useState();
      
    const onChange = (e) => {
      setValue(e.target.value);
      updateErrorCodes(index, id, e.target.value);
      let [code, err_message, error_uid, warning_message, warning_uid] = isCellValid(id, e.target.value); // [code, error_message, error_uid, warning_message, warning_uid]
      setWarn(warning_message)
      setErr(err_message)
    };
    
    const onClick =()=> {
      setSelectedIndex(index);
    }

    // If the initialValue is changed externally, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue);
        let e = isCellValid(id, initialValue);
        if (e[1]) {        
          if (e[3]) {
            setWarn(e[1]);
          }
          else {
            setErr(e[1]);
          }
        }
    }, [initialValue]);
  
    return (editableColumns.includes(id)) ? 
    (id === 'address' ? (
      <div>
              <Autocomplete
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API}
                onPlaceSelected={(place) => {
                  let selected = {'address': place.formatted_address, 'lat': place.geometry.location.lat(), 'lng': place.geometry.location.lng()}
                  setValue(selected)
                  updateErrorCodes(index, id,  selected);
                  setErr('');
                }}
                onClick = {onClick}
  
                defaultValue = {initialValue}
                onChange = {()=> {
                  updateErrorCodes(index, id,  '');
                }}
                options={{
                  fields: ["geometry.location", "formatted_address"],
                  types: ["geocode"],
                }}
                style = {{border: (err) ? '1px solid red': '1px solid black'}}
              />  
              <div style = {{color:'red'}}> {err} </div>
              </div>
        ) 
        :
          <div>
            {!warn && <input value={value} onChange={onChange} onClick = {onClick} style = {{border: (err) ? '1px solid red': '1px solid black', position: 'relative'}}/>} 
            {warn && <input value={value} onChange={onChange} onClick = {onClick} style = {{border: '1px solid orange', position: 'relative'}}/>} 
            <div style = {{color:'red'}}> {err} </div>
            <div style = {{color:'orange'}}> {warn} </div>
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
    editableFileData,
    setEditableFileData,
    updateErrorCodes,
    isCellValid,
    selectedIndex, 
    setSelectedIndex,
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
        data: editableFileData,
        setEditableFileData,
        defaultColumn,
        updateErrorCodes,
        editableRowIndex,
        setEditableRowIndex, 
        isCellValid, 
        selectedIndex, 
        setSelectedIndex
      },

      (hooks) => {
        hooks.allColumns.push((columns) => [
         {
            accessor: "id",
            id: "id",
            Header: "Row",
            Cell: ({row}) => 
    
              <div>
                {row.id} 
              </div> 
          },
          ...columns,
          {
            accessor: "duplicate",
            id: "duplicate",
            Header: "File Duplicates",
            Cell: ({row}) => (
              (row.values.duplicate && row.values.duplicate.length > 0) ? 
              <div>
                
                 {row.values.duplicate.slice(0,3).map(obj =>
                    (obj[0] && [50, 52].includes(obj[0])) ?
                        <div style = {{color:'red'}}> {obj[1]} </div> 
                       : <div style = {{color:'orange'}}> {obj[1]} </div>
                    )
                    }

              </div> :
              <div></div>)
          },
          {
            accessor: "valid",
            id: "valid",
            Header: "Status",
            Cell: ({row}) => (

              (row.values.valid)  ?
              <FontAwesomeIcon
                onClick = {()=> {console.log(row)}}
                icon={faCircleCheck}
                size="lg"
                style={{ color: "green"}}
               />
                : 
                <FontAwesomeIcon
                onClick = {()=> {console.log(row)}}
                icon={faCircleExclamation}
                size="lg"
                style={{ color: "red" }}
               />)
          },
                {
            accessor: "exclude",
            id: "exclude",
            Header: "Exclude",
            Cell: ({
              row,
              value: initialValue,
              updateErrorCodes,
              }) => {
                
              const [value, setValue] = React.useState(initialValue);

              React.useEffect(() => {
                setValue(initialValue);
                updateErrorCodes(row.index, 'exclude', initialValue);
              }, [initialValue]);
               
              return (
      
                
                <input
                  style = {{height: "25px", width: "25px"}}
                  type="checkbox"
                  checked={value}
                  onChange={(e) => {
                  setValue(e.target.checked);
                  updateErrorCodes(row.index, 'exclude', e.target.checked);
                }}        
              />
            )}
          },
        ]);}
    );
  
    const removeByIndexs = (array, indexs) =>
      array.filter((_, i) => !indexs.includes(i));
    
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