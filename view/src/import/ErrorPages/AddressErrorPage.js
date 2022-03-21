// This page has the interactive element for users to fix address data errors. 
// requirements: 
// - must change the activeError to activeError+1 when all errors are fixed
// - must remove values from addressErrors as they are fixed 
// - must change elements in fileData with fixed entries 
import React, { useEffect, useState } from "react"
import { EditCard } from "../EditCard/EditCard"

export const AddressErrorPage = ({activeError, setActiveError, addressErrors, setAddressErrors, fileData, setFileData}) => {
    const [data5, setData5] = useState();
    const [complete, setComplete] = useState(false);

    const columns = React.useMemo(
        () => [
          {
            Header: 'Email',
            accessor: 'parent_email',
          },
          {
            Header: 'School',
            accessor: 'school_name',
          },
        ],
        []
      )
      
      const addressValidation = (rowData) => {
          //TODO - add google maps validation
          console.log(rowData)
          if (rowData['firstName'] === 'Morgan') {
              return true
          }
          else {
            return true
         }
      }

      const editableColumns = ['parent_email']

    // upon load, make tabular data from errors. 
    useEffect(()=> {
        let codes = [5,6]

        for (let i = 0; i < codes.length; i++) {
            let code = codes[i]
            let tempArr = []
            for (let j = 0; j < addressErrors[code].length; j++) {
                //tempArr.push(fileData[addressErrors[code][j]])
            } 
            tempArr.push(fileData[0]);
            console.log(tempArr)
            setData5(tempArr)
        }
    }, [])

    useEffect (()=> {
        if (complete) {
            setComplete(true)
        }
    }, [complete])
    
      return (
        <div>
         {(data5) && 
         <EditCard 
            message = {"Please Fix Entries With Missing or Invalid Addresses"}
            complete = {complete}
            setComplete = {setComplete}
            errors = {addressErrors}
            setErrors = {setAddressErrors}
            errorDataSubset = {data5} 
            setErrorDataSubset = {setData5}
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