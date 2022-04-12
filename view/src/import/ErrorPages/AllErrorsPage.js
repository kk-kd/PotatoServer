// This page has the interactive element for users to fix address data errors.
// requirements:
// - must change the activeError to activeError+1 when all errors are fixed
// - must remove values from addressErrors as they are fixed
// - must change elements in fileData with fixed entries

import React, { useEffect, useState } from "react";
import { EditManager } from "../EditContent/EditManager";
import { UserTable } from "./UserTable";
import { StudentTable } from "./StudentTable";
import { getOneStudent, getOneUser } from "../../api/axios_wrapper";
import "./Error.css";
import loadingLogo from "../ErrorPages/Spinner-1s-200.gif";
import { StepButtons } from "../StepNavigation/StepButtons";

export const ErrorPage = ({
  checkRow,
  checkCell,
  columns,
  requiredColumns,
  activeError,
  setActiveError,
  Errors,
  setErrors,
  processingComplete,
  setProcessingComplete,
  fileData,
  setFileData,
  dataType,
  submissionData, 
  setSubmissionData,
  step_labels, 
  activeStep, 
  setActiveStep,
  setRunValidation, 
  resetState

}) => {
  const [editableFileData, setEditableFileData] = useState();
  const [complete, setComplete] = useState(false);
  const [show, setShow] = useState(false);

  const [errorDataToShow, setErrorDataToShow] = useState([]);
  const [errorIds, setErrorIds] = useState([]);
  const [warningDataToShow, setWarningDataToShow] = useState([]);
  const [warningIds, setWarningIds] = useState([]);

  const [selectedIndex, setSelectedIndex] = useState();

  const editableColumns = requiredColumns;

  const fetchErrorDuplicates = async (ids) => {
//    console.log("fetch error with errorids");
//     console.log(ids);
    if (ids && (selectedIndex === 0 || selectedIndex)) {
      let a = [];
      try {
        for (let j = 0; j < ids.length; j++) {
          if (ids[j]) {
              const fetchedData = await getOneUser(ids[j]).catch((error) => {
                let message = error.response.data;
                throw alert(message);
              });
              a.push(fetchedData.data);
          }
        }

        setErrorDataToShow(a);
      } catch (error) {
       // console.log(error);
      }
    }
  };

  const fetchWarningDuplicates = async (ids) => {
    //console.log("fetch error with warningids");
    //console.log(ids);
    if (ids && (selectedIndex === 0 || selectedIndex)) {
      let a = [];
      try {
        for (let j = 0; j < ids.length; j++) {
          if (ids[j]) {
            if (dataType === "parents") {
              const fetchedData = await getOneUser(ids[j]).catch((error) => {
                let message = error.response.data;
                throw alert(message);
              });
              a.push(fetchedData.data);
            }
            if (dataType === "students") {
              const fetchedData = await getOneStudent(ids[j]).catch((error) => {
                let message = error.response.data;
                throw alert(message);
              });
              a.push(fetchedData.data);
            }
          }
        }
        setWarningDataToShow(a);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // TODO pull student data by id

  const resetErrorData = (uid) => {

    if (uid) {
      if (!errorIds.includes(uid)) {
        // re fetch error user
        setErrorDataToShow();
        let new_ids = [uid];
        setErrorIds(new_ids);
        fetchErrorDuplicates(new_ids);
      }
    } else {
      setErrorDataToShow([]);
      setErrorIds([]);
    }
  };

  const resetWarningData = (uid) => {
    if (uid) {
      if (!warningIds.includes(uid)) {
        // re fetch error user
        setWarningDataToShow([]);
        let new_ids = [...warningIds, uid];
        setWarningIds(new_ids);
        fetchWarningDuplicates(new_ids);
      }
    } else {
      setWarningDataToShow([]);
      setWarningIds([]);
    }
  };

  useEffect(() => {
    checkForErrorAndWarningData(selectedIndex);
  }, [selectedIndex]);

  // used to load on page load, or on index change
  const checkForErrorAndWarningData = (ind) => {
    if (editableFileData) {
      let currentRow = editableFileData[ind];
      // console.log(currentRow);
    if (currentRow["hint_uids"]) {
          setErrorIds(currentRow["hint_uids"]);
          fetchErrorDuplicates(currentRow["hint_uids"]);
        } else {
          resetErrorData();
        }
    if (dataType === 'parents') {
        if (currentRow["warning_uids"]) {
          setWarningIds(currentRow["warning_uids"]);
          fetchWarningDuplicates(currentRow["warning_uids"]);
        } else {
          resetWarningData();
        }
      } else if (dataType === "students") {
        resetWarningData();
        if (currentRow["warning_uids"]) {
          setWarningIds(currentRow["warning_uids"]);
          fetchWarningDuplicates(currentRow["warning_uids"]);
        } else {
          resetWarningData();
        }
      }
    }
  };

  useEffect(() => {
    if (processingComplete && fileData) {
      setEditableFileData(fileData);
    }
  }, [processingComplete]);

  const removeExcludedRows = () => {
      let included = []
      for (let i=0; i< editableFileData.length; i++) {
          if (editableFileData[i]) {
              // console.log("Checking ")
              // console.log(editableFileData[i])
              if (!('exclude' in editableFileData[i])) {
                //console.log("Adding bc didn't find exclude key")
                included.push(editableFileData[i])
              }
              else if (editableFileData[i]['exclude'] === false) {
                //console.log("Adding bc excluded was false")
                included.push(editableFileData[i])
              }
              else if (editableFileData[i]['exclude'] === undefined) {
                //console.log("Adding bc excluded was undefined")
                included.push(editableFileData[i])
              }
          }
      }
      // console.log("included")
      // console.log(included)
      return included;
  }

  return (
    <div>
      {!processingComplete && (
        <div>
          <h6>Loading</h6>
          <img src={loadingLogo} alt="loading..." />
        </div>
      )}{" "}

    
    <div style = {{border: '1px solid black', width: '80%', margin: 'auto'}}>
        <h5 id = "sub-header" style = {{width: '100%'}}> Instructions </h5> 
        <div> Your submitted data is shown below. Errors are highlighted in red, and must be fixed, or the row must be excluded from submission. Warnings are shown in yellow, and
          it's recommended that they are reviewed prior to submission. Note: all potential duplicates have been excluded by default! </div>
        <div></div>
        <div></div>
        <div></div>
        {
        complete && (
         <div>
           <h4 style = {{color: "#34815c"}}> All errors are either resolved or excluded. Double check the information below before continuing! </h4>
       </div>
      )}
    </div>

    
      {editableFileData && (
        <div>
          {errorDataToShow && errorDataToShow.length !== 0 && (
            <div id="errorContainer">
              <div>
                {" "}
                Error: Duplicate entry already exists in our database.{" "}
                
              </div>
              <UserTable displayData={errorDataToShow}/>
            </div>
          )}

          {warningDataToShow && warningDataToShow.length !== 0 && (
            <div id="warningContainer">
              <div> Warning: we found an entry with a matching name! </div>
             {dataType == "students" && <StudentTable
                displayData={warningDataToShow}></StudentTable>}
             {dataType == "parents" && <UserTable
                displayData={warningDataToShow}></UserTable>}
            </div>
          )}

          <EditManager
            message={""}
            complete={complete}
            setComplete={setComplete}
            editableFileData={editableFileData}
            setEditableFileData={setEditableFileData}
            columns={columns}
            editableColumns={editableColumns}
            checkRow={checkRow}
            checkCell={checkCell}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            resetErrorData={resetErrorData}
            resetWarningData={resetWarningData}
          />
        </div>
      )}

       <StepButtons
         nextButtonValid={complete}
         step_labels={step_labels}
         activeStep={activeStep}
         setActiveStep={setActiveStep}
         setRunValidation={setRunValidation}
         resetState={resetState}
         additionalNextFunction = {() => {setSubmissionData(removeExcludedRows()); setActiveError(activeError + 1)}}
       ></StepButtons>
    </div>
  );
};
