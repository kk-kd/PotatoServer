// This page has the interactive element for users to fix exist data errors.
// requirements:
// - must change the activeError to activeError+1 when all errors are fixed
// - must remove values from missingErrors as they are fixed
// - must change elements in fileData with fixed entries
import React, { useEffect, useState } from "react";
import { EditManager } from "../EditContent/EditManager";
import { getOneUser } from "../../api/axios_wrapper";
import { UserTable } from "./UserTable";
import "./Error.css";

export const DatabaseDuplicatePage = ({
  checkRow,
  checkCell,
  columns,
  requiredColumns,
  activeError,
  setActiveError,
  existErrors,
  setExistErrors,
  processingComplete,
  setProcessingComplete,
  fileData,
  setFileData,
}) => {
  const [data, setData] = useState();
  const [complete, setComplete] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selected, setSelected] = useState(false);
  const [duplicatesToShow, setDuplicatesToShow] = useState([]);
  const [duplicateIds, setDuplicateIds] = useState();
  const [duplicateIndex, setDuplicateIndex] = useState();
  const [duplicatesLoaded, setDuplicatesLoaded] = useState(false);

  const editableColumns = requiredColumns;

  const fetchUserDuplicates = async () => {
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
          console.log("User from API Call:");
          console.log(fetchedData.data);
          setDuplicatesLoaded(true);
        }
        setDuplicatesToShow(a);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    console.log("duplicate index changed");
    fetchUserDuplicates();
  }, [duplicateIndex]);

  // upon load, make tabular data from errors, and pull duplicates from database
  useEffect(() => {
    let errSet = new Set(); // avoid duplicates!
    let duplicateUserIds = [];

    if (processingComplete) {
      for (const [k, v] of Object.entries(existErrors)) {
        if (k !== "key") {
          for (let j = 0; j < v.length; j++) {
            let ind = v[j];
            if (fileData[ind]) {
              console.log("adding");
              let ent = fileData[ind];
              duplicateUserIds.push(ent["hint_uids"]);
              errSet.add(ent);
            }
          }
        }
      }
      setData(Array.from(errSet));
      setDuplicateIds(duplicateUserIds);
      console.log(duplicateUserIds);
      setDuplicateIndex(0);

      if (errSet.size === 0) {
        setComplete(true);
      }
    }
  }, [processingComplete]);

  const removeEntries = () => {
    // remove all entries from fileData and data
    for (let i = 0; i < data.length; i++) {
      let ind = data[i]["index"];
      delete fileData[ind];
      setFileData(fileData);
      delete data[i];
      setData(data);
    }
    setExistErrors({});
    setComplete(true);
  };

  return (
    <div>
      {!selected && data && !complete && (
        <div>
          <h6> We found {data.length} record(s) with a duplicate record. </h6>

          <div>
            <button
              onClick={() => {
                setEdit(true);
                setSelected(true);
              }}
            >
              {" "}
              Fix Entries{" "}
            </button>
            <button
              onClick={() => {
                setEdit(false);
                setSelected(true);
                removeEntries();
              }}
            >
              {" "}
              Remove Entries{" "}
            </button>
          </div>
        </div>
      )}

      {data && edit && (
        <div>
          {!complete && duplicatesLoaded && (
            <div id="duplicateContainer">
              <div> Similar User Already Exists </div>
              <UserTable displayData={duplicatesToShow}></UserTable>
            </div>
          )}

          <EditManager
            message={"Please Fix Entries"}
            complete={complete}
            setComplete={setComplete}
            errors={existErrors}
            setErrors={setExistErrors}
            errorDataSubset={data}
            setErrorDataSubset={setData}
            fileData={fileData}
            setFileData={setFileData}
            columns={columns}
            editableColumns={editableColumns}
            checkRow={checkRow}
            checkCell={checkCell}
            duplicateIndex={duplicateIndex}
            setDuplicateIndex={setDuplicateIndex}
          />
        </div>
      )}

      {complete && (
        <div>
          <h6> No Duplicate Errors Left! </h6>
          <button onClick={(e) => setActiveError(activeError + 1)}>
            {" "}
            Continue
          </button>
        </div>
      )}
    </div>
  );
};
