import EditableTable from "./EditableTable";
import {CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";

export const EditManager = ({setSelectedIndex, complete, setComplete, message, editableFileData, setEditableFileData, columns, editableColumns, checkRow, checkCell, duplicateIndex, setDuplicateIndex, resetDuplicates}) => {

    
    // called whenever an editable cell is changed, this function is called, and updates the error_codes list of the corresponding
    // element. editedData is changed dynamically in EditableTable. 
    const updateEditedDataErrors = (rowIndex, columnId, value) => {  
        
        // update validity
        setEditableFileData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
                
                let copy = {...old[rowIndex], [columnId]: value}
                let [row_errors, uid] = checkRow(copy) // returns [] for valid, [1,2,4] if not.
   
                // if editing address and row address does not have a lat or lng, not valid
                if ((editableColumns.includes('address') && columnId === 'address') && (!value.lat || !value.lng)) {
                    console.log('no lat or lng')
                    row_errors.push(6)
                } 
                
                // Update the error_code key with new errors
                if (row_errors.length === 0){
                    let n = {...copy, ['error_code']: [0]} 
                    // if entry has duplicate, update hint_uids key. 
                    if (row_errors.includes(3)){
                        let duplicates = {...n, ['hint_uids']: [uid]} 
                        resetDuplicates(uid)
                        return duplicates
                    }

                    else {
                        let no_duplicates = {...n, ['hint_uids']: []} 
                        resetDuplicates()
                        return no_duplicates
                    }
                }
                else {
                    let n = {...copy, ['error_code']: row_errors} 
                    // if entry has duplicate, update hint_uids key. 
                    if (row_errors.includes(3)){
                        let duplicates = {...n, ['hint_uids']: [uid]} 
                        resetDuplicates(uid)
                        return duplicates
                    }
                    else {
                        let no_duplicates = {...n, ['hint_uids']: []} 
                        resetDuplicates()
                        return no_duplicates
                    }
                    return n
                }
            }
            return row;
          })
        )
    } 

    const updateEntry = (d, setD, index, newDict) => {
        let copy = d
        copy[index] = newDict;
        setD(copy)
    }

    // for list of entry objects. 
    // NOTE: replaces entry with empty to preserve indexing. The objects are re-indexed upon submission.
    const removeEntry = (d, setD, ind) => {
        delete d[ind]
        setD(d)
    }


    // called on row deletion 
    const deleteRow = (ind, newRow) => {
        // removeEntry(fileData, setFileData, newRow['index']) // stored data
        // removeEntry(editedData, setEditedData, ind) // displayed subset 
        // checkComplete() 
        // console.log(duplicateIndex)
        // if (setDuplicateIndex) {
        //     setDuplicateIndex(duplicateIndex + 1)
        // }
    }

    // called on row submission
    const submitRow = (ind, newRow) => {
        
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

        let nonempty_count = editableFileData.filter(Boolean).length
        
        if (nonempty_count === 0) {
            setComplete(true);

        }
        if (complete) {
            setComplete(true)
        }
    }
    useEffect(()=> {
        console.log(editableFileData)
    }
    ,[editableFileData])

     
    return (
        <div> 
            {!complete && <h5> {message} </h5>}
           
            <CssBaseline />
            {((!complete) && (editableFileData.length > 0)) && <EditableTable
                setSelectedIndex ={setSelectedIndex}
                columns={columns}
                editableColumns = {editableColumns}
                editableFileData={editableFileData} 
                setEditableFileData={setEditableFileData}
                updateErrorCodes={updateEditedDataErrors}
                checkRow = {checkRow}
                isCellValid = {checkCell}
                duplicateIndex = {duplicateIndex}
                setDuplicateIndex = {setDuplicateIndex}
             />}
        </div>

    );


}