import EditableTable from "./EditableTable";
import {CssBaseline } from "@mui/material";
import { useState } from "react";
import { MapHelper } from "./MapHelper";

export const EditManager = ({setSelectedIndex, complete, setComplete, errors, setErrors, message, errorDataSubset, fileData, setFileData, columns, editableColumns, checkRow, checkCell, showMap}) => {

    const [editedData, setEditedData] = useState(errorDataSubset); // we change this copy in the table, and replace 

    // maps
    const [lat, setLat] = useState();
    const [lng, setLng] = useState();  
    const [activeAddress, setActiveAddress] = useState()
    const [addressValid, setAddressValid] = useState(false);

    // wrapper to call 1) checkCell (from ValidationStep), which checks all non-address cells for validity, and 
    // 2) check for address validity 
    const checkCellAndMap = (col, val) => {
        let err = checkCell(col, val)
        if ((activeAddress) && !(addressValid)) {
            return 'Not Valid Address'
        }
        else if (err) {
            return err
        }
        else return ''
    }

    // called whenever an editable cell is changed, ONLY checks for validity and updatest the 'valid' key to display that the 
    // user has fixed the error. editedData is changed dynamically in EditableTable. 
    const updateEditedDataValid = (rowIndex, columnId, value) => {  
        // change active address 
        if (columnId === 'address') {
            console.log('address set to ')
            console.log(value)
            setActiveAddress(value)
        }
        
        // update validity
        setEditedData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
                let copy = {...old[rowIndex], [columnId]: value}

                let row_error = checkRow(copy) // returns error string or '' and checks all validity except maps
                
                // if editing address and address is not valid, row is not valid
                if ((editableColumns.includes('address') && !addressValid)) {
                    return {
                        ...copy,
                        ['valid']: false,
                    }
                } 
                
                // if other row error, row is not valid
                else if (row_error) {
                    return {
                        ...copy,
                        ['valid']: false,
                    }
                }
                // otherwsie, is valid
                else {  
                    return {
                        ...copy,
                        ['valid']: false,
                    }
                }
            }
            return row;
          })
        )
    } 

    const updateEntry = (d, setD, ind, newD) => {
        let c = d
        c[ind] = newD;
        setD(c)
    }

    // for list of entry objects. 
    // NOTE: replaces entry with empty to preserve indexing. The objects are re-indexed upon submission.
    const removeEntry = (d, setD, ind) => {
        delete d[ind]
        setD(d)
    }

    const removeError = (ind) => {
        let temp = errors
        delete temp[ind]
        setErrors(temp)
    }

    // called on row deletion 
    const deleteRow = (ind, newRow) => {
        removeEntry(fileData, setFileData, newRow['index']) // stored data
        removeEntry(editedData, setEditedData, ind) // displayed subset
        removeError(ind)  
        checkComplete() 
    }


    // called on row submission
    const submitRow = (ind, newRow) => {
        console.log(newRow)
        if (!checkRow(newRow)) {
            removeEntry(editedData, setEditedData, ind) // displayed subset
            removeError(ind) // errors.filter 
            updateEntry(fileData, setFileData, newRow['index'], newRow)
            checkComplete()
            console.log(editedData)
            console.log(fileData)
        }
        else {
            setEditedData(old =>
                old.map((row, index) => {
                  if (index === ind) {
                    let a = newRow
                    a['valid'] = false 
                    return a                  }
                  return row
                })
              )
        }
    }

    const isEmptyDict = (d) => {
        let keys = Object.keys(d); 
        for (let i = 0; i < keys.length; i++) {
            if (d[keys[i]].length > 0) {
                return false;
            }
        }
        return true;
    }

    const checkComplete = () => {
        if (isEmptyDict(errors)) {
            setComplete(true);
        }
        let nonempty_count = editedData.filter(Boolean).length
        
        if (nonempty_count === 0) {
            setComplete(true);

        }
        if (complete) {
            setComplete(true)
        }
    }

     
    return (
        <div> 
            {!complete && <h5> {message} </h5>}
           

            <CssBaseline />
            {((!complete) && (editedData.length > 0)) && <EditableTable
                setSelectedIndex ={setSelectedIndex}
                columns={columns}
                editableColumns = {editableColumns}
                editedData={editedData}
                setEditedData={setEditedData}
                submitRow={submitRow}
                deleteRow = {deleteRow}
                updateEditedDataValid={updateEditedDataValid}
                checkRow = {checkRow}
                isCellValid = {checkCell}
                
             />}

             {showMap && <MapHelper 
                            activeAddress = {activeAddress} 
                            setAddressValid = {setAddressValid} 
                            lat = {lat}
                            setLat = {setLat}
                            lng = {lng} 
                            setLng ={setLng}> 
                        </MapHelper>}
        </div>

    );


}