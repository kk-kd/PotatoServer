
// This page has the interactive element for users to fix missing data errors. 
// requirements: 
// - must change the activeError to activeError+1 when all errors are fixed
// - must remove values from missingErrors as they are fixed 
// - must change elements in fileData with fixed entries 
import { useState, useEffect } from "react";
import React from "react";
import { EditManager} from "../EditContent/EditManager";
import { CheckStudentCell, CheckParentCell, CheckStudentRow, CheckParentRow} from "../Validation/ValidationUtils";

// validate all data except maps. 
export const MissingErrorPage = ({checkRow, checkCell, columns, dataType, requiredColumns, activeError, setActiveError, missingErrors, setMissingErrors, processingComplete, setProcessingComplete, fileData, setFileData}) => {

    const [data, setData] = useState();
    const [complete, setComplete] = useState(false);
    const [edit, setEdit] = useState(false);
    const [selected, setSelected] = useState(false);

    const editableColumns = requiredColumns; // not have 'address'
    
     // upon load, make tabular data from errors. 
     useEffect(()=> {
         let errSet = new Set() // avoid duplicates!

        if (processingComplete) {
            for (const [key, value] of Object.entries(missingErrors)) {
                for (let j = 0; j < value.length; j++) {
                    let ind = value[j] 
                    if (fileData[ind]) {
                        let ent = fileData[ind]
                        errSet.add(ent) 
                    }           
                } 
            }
        setData(Array.from(errSet));
        if (errSet.size === 0) {
            setComplete(true);
        }
        }
        
    }, [processingComplete])  

    const removeEntries = () => {
        // remove all entries from fileData and data
        for (let i = 0; i < data.length; i++) {
            let ind = data[i]['index']
            delete fileData[ind]
            setFileData(fileData)
            delete data[i]
            setData(data)
        }  
        console.log(fileData)
        setMissingErrors({})
        setComplete(true);
    }

 
    return (
        <div> 
        {((!selected) && (data) && (!complete)) && 
            <div>
                <h6> We found {data.length} record(s) with missing values. </h6>
                <div>
                    <button onClick = {()=> {setEdit(true); setSelected(true); }}> Fix Entries </button>
                    <button onClick = {()=> {setEdit(false); setSelected(true); removeEntries()}}> Remove Entries </button>
                </div>
            </div>
        }

        {((data) && (edit)) && 
            <EditManager
                message = {"Please Fill In Missing Data"}
                complete = {complete}
                setComplete = {setComplete}
                errors = {missingErrors}
                setErrors = {setMissingErrors}
                errorDataSubset = {data} 
                setErrorDataSubset = {setData}
                fileData = {fileData} 
                setFileData = {setFileData}
                columns = {columns}
                editableColumns = {editableColumns}
                rowValidation = {checkRow}
                isCellValid = {checkCell}
                showMap = {false}
            />}
        
        {complete && <div> 
             <h6> No Missing Data Errors Left! </h6>
             <button onClick = {(e)=> setActiveError(activeError +1)}> Continue
            </button>
            </div>
         }

        </div>
    )
}