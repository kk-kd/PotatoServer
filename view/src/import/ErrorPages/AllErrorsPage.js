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
}) => {
  const [editableFileData, setEditableFileData] = useState();
  const [complete, setComplete] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selected, setSelected] = useState(false);

  const [errorDataToShow, setErrorDataToShow] = useState([]);
  const [errorIds, setErrorIds] = useState([]);
  const [warningDataToShow, setWarningDataToShow] = useState([]);
  const [warningIds, setWarningIds] = useState([]);

  const [selectedIndex, setSelectedIndex] = useState();

  const editableColumns = requiredColumns;

  const fetchErrorDuplicates = async (ids) => {
    console.log("fetch error with errorids");
    console.log(ids);
    if (ids && (selectedIndex === 0 || selectedIndex)) {
      let a = [];
      try {
        for (let j = 0; j < ids.length; j++) {
          if (ids[j]) {
        //    if (dataType === "parents") {
              const fetchedData = await getOneUser(ids[j]).catch((error) => {
                let message = error.response.data;
                throw alert(message);
              });
              a.push(fetchedData.data);
          }
        }
        console.log("Error data")
        console.log(a)

        setErrorDataToShow(a);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchWarningDuplicates = async (ids) => {
    console.log("fetch error with warningids");
    console.log(ids);
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
        let new_ids = [...errorIds, uid];
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
    console.log("selectd index use effect");
    console.log(selectedIndex);
    checkForErrorAndWarningData(selectedIndex);
  }, [selectedIndex]);

  // used to load on page load, or on index change
  const checkForErrorAndWarningData = (ind) => {
    if (editableFileData) {
      let currentRow = editableFileData[ind];
      console.log(currentRow);
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

  const removeEntries = () => {
    // // remove all entries from data
    // for (let i = 0; i < data.length; i++) {
    //     let ind = data[i]['index']
    //     delete data[i]
    //     setData(data)
    // }
    // console.log(data)
    // setComplete(true);
  };
  useEffect(() => {
    if (processingComplete && fileData) {
      setEditableFileData(fileData);
    }
  }, [processingComplete]);

  return (
    <div>
      {!processingComplete && (
        <div>
          <h6>Loading</h6>
          <img src={loadingLogo} alt="loading..." />
        </div>
      )}{" "}
      {!selected && editableFileData && !complete && processingComplete && (
        <div>
          <h6>
            {" "}
            We found X entries in your submission. What would you like to do?{" "}
          </h6>
          <div>
            <button
              onClick={() => {
                setEdit(true);
                setSelected(true);
              }}
            >
              {" "}
              Fix Errors{" "}
            </button>
            <button
              onClick={() => {
                setEdit(false);
                setSelected(true);
                removeEntries();
              }}
            >
              {" "}
              Remove Entries With Errors{" "}
            </button>
          </div>
        </div>
      )}
      {editableFileData && edit && (
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
      {complete && (
        <div>
          <h6> No Errors Left! </h6>
          <button onClick={(e) => setActiveError(activeError + 1)}>
            {" "}
            Continue
          </button>
        </div>
      )}
    </div>
  );
};
