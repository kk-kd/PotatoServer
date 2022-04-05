import EditableTable from "./EditableTable";
import {CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";
import e from "cors";

export const EditManager = ({complete, setComplete, message, editableFileData, setEditableFileData, columns, editableColumns, checkRow, checkCell, selectedIndex, setSelectedIndex, resetErrorData, resetWarningData}) => {

    
    // called whenever an editable cell is changed. 
    const updateEditedDataErrors = (rowIndex, columnId, value) => {  
        console.log(columnId)
        
        // update validity
        setEditableFileData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
                let copy = {...old[rowIndex], [columnId]: value}
                let [row_errors, error_uid, warning_uid] = checkRow(copy) 
                let loc_values = {}
                let address = []

                console.log("check parent returned")
                console.log(checkRow(copy))
   
                // if editing address and row address does not have a lat or lng, not valid
                if ((editableColumns.includes('address'))) {
                    let has_loc = Boolean(copy.address && copy.address.address && copy.loc && copy.loc.longitude && copy.loc.latitude)
                    let has_loc_from_validate = Boolean(copy.address && !copy.address.address && copy.loc && copy.loc.longitude && copy.loc.latitude)
                    let has_new_loc = Boolean(copy.address && copy.address['lat'] && copy.address['lng'])
                    console.log("Has Loc ")
                    console.log(has_loc)
                    console.log("Has Loc From Valid ")
                    console.log(has_loc_from_validate)
                    console.log("New loc")
                    console.log(has_new_loc)
                    console.log(copy)

                    // if no set location, has error
                    if (!(has_loc || has_new_loc || has_loc_from_validate)) {
                        row_errors.push(6)
                    }
                    // if new location, fix row 
                    else if (has_new_loc) {
                        loc_values['latitude'] = copy.address['lat']
                        loc_values['longitude'] = copy.address['lng']
                        address.push(copy.address.address)
                    }
                    else if (has_loc) {
                        loc_values['latitude'] = copy.loc['latitude']
                        loc_values['longitude'] = copy.loc['longitude']
                        address.push(copy.address)
                    }
                    else if (has_loc_from_validate) {
                        loc_values['latitude'] = copy.loc['latitude']
                        loc_values['longitude'] = copy.loc['longitude']
                        address.push(copy.address)
                    }
                } 
                
                let a= {...copy, ['hint_uids']: [error_uid], ['warning_uids']: [warning_uid], ['error_code']: row_errors, ['loc']: loc_values, ['address']: address[0]} 
                console.log("updated keys and values are")
                console.log(a)
                resetWarningData(warning_uid)
                resetErrorData(error_uid)
                return a                
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
                selectedIndex = {selectedIndex}
                setSelectedIndex = {setSelectedIndex}
             />}
        </div>

    );


}