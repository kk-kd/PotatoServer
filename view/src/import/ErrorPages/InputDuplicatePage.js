// This page has the interactive element for users to fix invalid data errors.
// requirements:
// - must change the activeError to activeError+1 when all errors are fixed
// - must remove values from missingErrors as they are fixed
// - must change elements in fileData with fixed entries

import React, { useEffect, useState } from "react";
import { EditManager } from "../EditContent/EditManager";

export const InputDuplicatePage = ({
  checkRow,
  checkCell,
  columns,
  requiredColumns,
  activeError,
  setActiveError,
  invalidErrors,
  dataType,
  setInvalidErrors,
  processingComplete,
  setProcessingComplete,
  fileData,
  setFileData,
}) => {
  const [data, setData] = useState();
  const [complete, setComplete] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selected, setSelected] = useState(false);

  const [editableColumns, setEditableColumns] = useState(requiredColumns);

  useEffect(() => {
    if (editableColumns.includes("address")) {
      let copy = editableColumns;
      for (var i = 0; i < copy.length; i++) {
        if (copy[i] === "address") {
          copy.splice(i, 1);
          setEditableColumns(copy);
        }
      }
    }
  }, []);

  /*
    We need a count of and the list of indicies where the emails are duplicated (in parents only)
    We also need a count of and the list of indicies where the rows are duplicated (in both)
*/

  // upon load, make tabular data from errors.
  useEffect(() => {
    let duplicateEmailMap = {}; // duplicateEmailMap contains a key of the email to the indicies where it's duplicated.
    // example, {"example@gmail.com": [2, 3]} indicates that example@gmail.com appears at index 2 and 3
    let duplicateNameMap = {}; // duplicateNameMap contains a key of the name to the indicies where it's duplicated.
    // example, {"Mega": [2, 3, 7]} indicates that Mega appears at index 2, 3 and 7
    // this is only used in the case of parents: if duplicate emails are registered, we have a problem.
    let duplicateRowMap = {}; // duplicateRowMap contains a key of the row to the indicies where it's duplicated.
    // example, {{1:"email": "example@gmail.com", "student_id...": [2, 3, 5]} indicates that example@gmail.com appears at index 2 and 3 and 5

    // populating duplicateRowMap
    var fileDataClone = JSON.parse(JSON.stringify(fileData));
    // Delete index from our copy of fileData so we can compare just the data to others.

    for (let i = 0; i < fileDataClone.length; i++) {
      fileDataClone[i].index = 0;
    }

    let alreadyFoundRowCopyIndicies = [];
    for (let i = 0; i < fileData.length; i++) {
      for (let j = 0; j < fileData.length; j++) {
        if (
          i !== j &&
          i < j &&
          !alreadyFoundRowCopyIndicies.includes(j) &&
          JSON.stringify(fileDataClone[i]) === JSON.stringify(fileDataClone[j])
        ) {
          var duplicateList =
            duplicateRowMap[fileData[i].index] ??
            (duplicateRowMap[fileData[i].index] = []);
          duplicateList.push(j);
          alreadyFoundRowCopyIndicies.push(j);
          duplicateRowMap[fileData[i].index] = duplicateList;
          /*  (duplicateRowMap[fileData[i].index] ?? (duplicateRowMap[fileData[i].index] = [])).push(j); */
        }
      }
    }
    // populating duplicateEmailMap
    let alreadyFoundEmailIndicies = [];
    if (dataType === "parents") {
      for (let i = 0; i < fileData.length; i++) {
        for (let j = 0; j < fileData.length; j++) {
          if (
            i !== j &&
            i < j &&
            !alreadyFoundRowCopyIndicies.includes(j) &&
            !alreadyFoundEmailIndicies.includes(j) &&
            fileData[i].email === fileDataClone[j].email
          ) {
            var duplicateListEmail =
              duplicateEmailMap[fileData[i].email] ??
              (duplicateEmailMap[fileData[i].email] = [i]);
            duplicateListEmail.push(j);
            alreadyFoundEmailIndicies.push(j);
            duplicateEmailMap[fileData[i].email] = duplicateListEmail;

            /*  (duplicateRowMap[fileData[i].index] ?? (duplicateRowMap[fileData[i].index] = [])).push(j); */
          }
        }
      }
    }

    let alreadyFoundNameIndicies = [];
    for (let i = 0; i < fileData.length; i++) {
      for (let j = 0; j < fileData.length; j++) {
        if (
          i !== j &&
          i < j &&
          !alreadyFoundNameIndicies.includes(j) &&
          !alreadyFoundRowCopyIndicies.includes(j) &&
          fileData[i].name === fileData[j].name
        ) {
          var duplicateListForName =
            duplicateNameMap[fileData[i].name] ??
            (duplicateNameMap[fileData[i].name] = []);
          duplicateListForName.push(j);
          alreadyFoundNameIndicies.push(j);
          duplicateNameMap[fileData[i].name] = duplicateListForName;
          /*  (duplicateNameMap[fileData[i].index] ?? (duplicateNameMap[fileData[i].index] = [])).push(j); */
        }
      }
    }
  }, []);

  const removeEntries = () => {
    // remove all entries from fileData and data
    for (let i = 0; i < data.length; i++) {
      if (data[i]) {
        let ind = data[i]["index"];
        delete fileData[ind];
        setFileData(fileData);
        delete data[i];
        setData(data);
      }
    }
    console.log(fileData);
    setInvalidErrors({});
    setComplete(true);
  };

  return (
    <div>
      {!selected && data && !complete && (
        <div>
          <h6>
            {" "}
            We found {data.length} record(s) that are duplicated in your
            inputted sheet.{" "}
          </h6>

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
        <EditManager
          message={"Please Fix Duplicated Messages"}
          complete={complete}
          setComplete={setComplete}
          errors={invalidErrors}
          setErrors={setInvalidErrors}
          errorDataSubset={data}
          setErrorDataSubset={setData}
          fileData={fileData}
          setFileData={setFileData}
          columns={columns}
          editableColumns={editableColumns}
          checkRow={checkRow}
          checkCell={checkCell}
        />
      )}

      {complete && (
        <div>
          <h6> No Inputted Duplicates Remaining! </h6>
          <button onClick={(e) => setActiveError(activeError + 1)}>
            {" "}
            Continue
          </button>
        </div>
      )}
    </div>
  );
};
