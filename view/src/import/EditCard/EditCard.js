import EditableTable from "./EditableTable";
import {CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";

export const EditCard = ({complete, setComplete, errors, setErrors, message, errorDataSubset, setErrorDataSubset, fileData, setFileData, columns, editableColumns, rowValidation, showMap}) => {

    const [editedData, setEditedData] = useState(errorDataSubset); // we change this copy in the table, and replace 

    // called on editable cell change to check for validity
    const updateEditedDataValid = (rowIndex, columnId, value) => {
        setEditedData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
                let copy = {...old[rowIndex], [columnId]: value}
                console.log("changing")
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

    // for list of entry objects. 
    // NOTE: replaces entry with empty to preserve indexing. The objects are re-indexed upon submission.
    const removeEntry = (d, setD, ind) => {
        delete d[ind]
        setD(d)
        console.log(d)
        checkComplete()
    }

    const removeError = (ind) => {
        let temp = errors
        delete temp[ind]
        setErrors(temp)
        console.log("errors")
        console.log(errors)
    }

    // called on row deletion 
    const deleteRow = (ind, newRow) => {
        console.log(newRow)
        removeEntry(fileData, setFileData, newRow['index']) // stored data
        removeEntry(editedData, setEditedData, ind) // displayed subset
        removeError(ind)    
    }


    // called on row submission
    const submitRow = (ind, newRow) => {
        if (rowValidation(newRow)) {
            removeEntry(editedData, setEditedData, ind) // displayed subset
            removeError(ind) 
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
            console.log('errors empty')
            setComplete(true);
        }
        if (editedData.length < 0) {
            console.log('edit empty')
            setComplete(true);
        }
        if (complete) {
            console.log('a')
            setComplete(true)
        }
    }
     
    return (
        <div> 
            <h5> {message} </h5>
            <CssBaseline />
            {((!complete) && (editedData) && (editedData.length >0)) && <EditableTable
                columns={columns}
                editableColumns = {editableColumns}
                editedData={editedData}
                setEditedData={setEditedData}
                submitRow={submitRow}
                deleteRow = {deleteRow}
                updateEditedDataValid={updateEditedDataValid}
                rowValidation = {rowValidation}
             />}
        </div>

    );


}