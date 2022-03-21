// This page has the interactive element for users to fix address data errors. 
// requirements: 
// - must change the activeError to activeError+1 when all errors are fixed
// - must remove values from addressErrors as they are fixed 
// - must change elements in fileData with fixed entries 
import { CssBaseline } from "@mui/material"
import React from "react"
import EnhancedTable from "../EditableTable"

export const AddressErrorPage = ({activeError, setActiveErrror, addressErrors, setAddressErrors, fileData, setFileData}) => {

    const columns = React.useMemo(
        () => [
          {
            Header: 'First Name',
            accessor: 'firstName',
          }
        ],
        []
      )
    
      const [data, setData] = React.useState([{'firstName': '1'}, {'firstName': 'me'}])    

      const updateMyData = (rowIndex, columnId, value) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              }
            }
            return row
          })
        )
      }
    
      return (
        <div>
          <CssBaseline />
          <EnhancedTable
            columns={columns}
            data={data}
            setData={setData}
            updateMyData={updateMyData}
          />
        </div>
      )
 
}