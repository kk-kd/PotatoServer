// This page has the interactive element for users to fix address data errors. 
// requirements: 
// - must change the activeError to activeError+1 when all errors are fixed
// - must remove values from addressErrors as they are fixed 
// - must change elements in fileData with fixed entries 
import React, { useEffect, useState } from "react"
import { EditCard } from "../EditCard/EditCard"

export const AddressErrorPage = ({columns, activeError, setActiveError, addressErrors, setAddressErrors, processingComplete, setProcessingComplete, fileData, setFileData}) => {
    const [data, setData] = useState();
    const [complete, setComplete] = useState(false);
    const [edit, setEdit] = useState(false);
    const [selected, setSelected] = useState(false);
      
      const addressValidation = (rowData) => {
          //TODO - add google maps validation
          console.log(rowData)
          return true
      }

      const editableColumns = ['parent_email', 'name', 'school_name']

    // upon load, make tabular data from errors. 
    useEffect(()=> {
        let errSet = new Set() // avoid duplicates!
    
       if (processingComplete) {
           for (const [key, value] of Object.entries(addressErrors)) {
               for (let j = 0; j < value.length; j++) {
                   let ind = value[j] 
                   let ent = fileData[ind]
                   errSet.add(ent)            
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
        setAddressErrors({})
        setComplete(true);
    }

    
      return (
        <div>
            {((!selected) && (data) && (!complete)) && 
            <div>
                We found {data.length} record(s) with invalid addresses. 

               <div>
                    <button onClick = {()=> {setEdit(true); setSelected(true); }}> Fix Entries </button>
                    <button onClick = {()=> {setEdit(false); setSelected(true); removeEntries()}}> Remove Entries </button>
                </div>
            </div>
            }
        {((data) && (edit)) && 
         <EditCard 
            message = {"Please Fix Entries With Missing or Invalid Addresses"}
            complete = {complete}
            setComplete = {setComplete}
            errors = {addressErrors}
            setErrors = {setAddressErrors}
            errorDataSubset = {data} 
            setErrorDataSubset = {setData}
            fileData = {fileData} 
            setFileData = {setFileData}
            columns = {columns}
            editableColumns = {editableColumns}
            rowValidation = {addressValidation}
            showMap = {true}
         />}
         
         {complete && <div> 
             <h6> No Address Errors Left! </h6>
             <button onClick = {(e)=> setActiveError(activeError +1)}> Continue
            </button>
            </div>
         }
        </div>
      )
 
}