// This page has the interactive element for users to fix address data errors. 
// requirements: 
// - must change the activeError to activeError+1 when all errors are fixed
// - must remove values from addressErrors as they are fixed 
// - must change elements in fileData with fixed entries 
import React, { useEffect, useState } from "react"
import { EditManager } from "../EditContent/EditManager"
import  {UserTable}  from "./UserTable";
import { getOneUser } from "../../api/axios_wrapper";
import "./Error.css"


export const ErrorPage = ({checkRow, checkCell, columns, requiredColumns, activeError, setActiveError, Errors, setErrors, processingComplete, setProcessingComplete, fileData, setFileData}) => {
    const [editableFileData, setEditableFileData] = useState();
    const [complete, setComplete] = useState(false);
    const [edit, setEdit] = useState(false);
    const [selected, setSelected] = useState(false);

    const [duplicatesToShow, setDuplicatesToShow] = useState([]);
    const [duplicateIds, setDuplicateIds] = useState();
    const [duplicateIndex, setDuplicateIndex] = useState();
      
    const editableColumns = requiredColumns 

    const fetchUserDuplicates = async () => {
        if (duplicateIds && (duplicateIndex === 0 || duplicateIndex)) { 
            let dup_ids = duplicateIds[duplicateIndex];
            let a = [];
            console.log(dup_ids);
            if (dup_ids) {
            try {
                for (let j = 0; j < dup_ids.length; j++) {
                const fetchedData = await getOneUser(dup_ids[j]).catch((error) => {
                    let message = error.response.data;
                    throw alert(message);
                });
                a.push(fetchedData.data);
                }
                setDuplicatesToShow(a);
                
            } catch (error) {
                console.log(error);
            }
        }
      }  
    };

    const resetDuplicates = (uid) => {
        console.log('reset duplicates got')
        console.log(uid)
        if (uid) {
           // refetch duplicates with new uid
           setDuplicatesToShow()
           let dup  = duplicateIds;
           dup[duplicateIndex] = [uid]
           setDuplicateIds(dup)
           fetchUserDuplicates()
        }
        else {
            console.log('resetting duplicates to nothing')
            setDuplicatesToShow([])
            setDuplicateIds([])
        }
    }

    useEffect(() => {
        if (duplicateIndex > 0) {
            fetchUserDuplicates();
        }
    }, [duplicateIndex]);

    useEffect(() => {
        let duplicateids = [];
    
        if (processingComplete && editableFileData) {
          for (let i = 0; i < editableFileData.length; i++) {
                let row = editableFileData[i]
                if ("hint_uids" in row) {
                    duplicateids.push(row['hint_uids']);
                }
                else {
                    duplicateids.push([]);
                }
          }

          setDuplicateIds(duplicateids);
          setDuplicateIndex(0);
        }
      }, [processingComplete, editableFileData]);

   const removeEntries = () => {
        // // remove all entries from data
        // for (let i = 0; i < data.length; i++) {
        //     let ind = data[i]['index']
        //     delete data[i]
        //     setData(data)
        // }  
        // console.log(data)
        // setComplete(true);
    }
    useEffect(()=> {
        if (processingComplete && fileData) {
            setEditableFileData(fileData)
        }  
    }
    ,[processingComplete])


      return (
        <div>
            {((!selected) && (editableFileData) && (!complete)) && 
            <div>
                <h6> We found X entries in your submission. What would you like to do? </h6>
               <div>
                    <button onClick = {()=> {setEdit(true); setSelected(true); }}> Fix Errors </button>
                    <button onClick = {()=> {setEdit(false); setSelected(true); removeEntries()}}> Remove Entries With Errors </button>
                </div>
            </div>
            }
        {((editableFileData) && (edit)) && 
       (
            <div>                
                {(!complete && duplicatesToShow && duplicatesToShow.length !== 0) && 
                
                 <div id="duplicateContainer">
                    <div> Similar User Already Exists </div>
                    <UserTable displayData={duplicatesToShow}></UserTable> 
                </div>
                }
  
                <EditManager
                    message = {"Please Fix Entries or Exclude Them"}
                    complete = {complete}
                    setComplete = {setComplete}
                    editableFileData = {editableFileData} 
                    setEditableFileData = {setEditableFileData}
                    columns = {columns}
                    editableColumns = {editableColumns}
                    checkRow = {checkRow}
                    checkCell = {checkCell}
                    duplicateIndex = {duplicateIndex}
                    setDuplicateIndex = {setDuplicateIndex}
                    resetDuplicates = {resetDuplicates}
                />
           </div>)}
         
         {complete && <div> 
             <h6> No Errors Left! </h6>
             <button onClick = {(e)=> setActiveError(activeError +1)}> Continue
            </button>
            </div>
         }
        </div>
      )
}