import EditableTable from "./EditableTable";
import {CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";

export const EditCard = ({complete, setComplete, errors, setErrors, message, errorDataSubset, setErrorDataSubset, fileData, setFileData, columns, editableColumns, rowValidation, isCellValid, showMap}) => {

    const [editedData, setEditedData] = useState(errorDataSubset); // we change this copy in the table, and replace 

    // called whenever an editable cell is changed to check for validity
    const updateEditedDataValid = (rowIndex, columnId, value) => {
        
        setEditedData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
                let copy = {...old[rowIndex], [columnId]: value}
                console.log(copy)
                if (rowValidation(copy)) {
                    return {
                        ...copy,
                        ['valid']: true,
                    }
                }
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
        if (rowValidation(newRow)) {
            removeEntry(editedData, setEditedData, ind) // displayed subset
            removeError(ind) 
            updateEntry(fileData, setFileData, newRow['index'], newRow)
            checkComplete()

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
                columns={columns}
                editableColumns = {editableColumns}
                editedData={editedData}
                setEditedData={setEditedData}
                submitRow={submitRow}
                deleteRow = {deleteRow}
                updateEditedDataValid={updateEditedDataValid}
                rowValidation = {rowValidation}
                isCellValid = {isCellValid}
             />}
        </div>

    );


}