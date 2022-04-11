import EditableTable from "./EditableTable";
import { CssBaseline } from "@mui/material";
import { useEffect } from "react";

export const EditManager = ({
  complete,
  setComplete,
  message,
  editableFileData,
  setEditableFileData,
  columns,
  editableColumns,
  checkRow,
  checkCell,
  selectedIndex,
  setSelectedIndex,
  resetErrorData,
  resetWarningData,
}) => {
  // this triggers a check on page load, which allows checking for file duplicates.
  useEffect(() => {
    for (let i = 0; i < editableFileData.length; i++) {
        if (editableColumns.includes('student_email')) {
            updateEditedDataErrors(i, "student_email", editableFileData[i]["student_email"]);
        }
        if (editableColumns.includes('email')) {
            updateEditedDataErrors(i, "email", editableFileData[i]["email"]);
        }
        if (editableColumns.includes('name')) {
            updateEditedDataErrors(i, "name", editableFileData[i]["name"]);
        }
    }
  }, []);

  const searchFileAgainstNewValue = (old_row, new_index, col, val) => {
    //(row, rowIndex, columnId, value)
    let existing_dup = old_row["duplicate"] ? old_row["duplicate"] : [];

    if (col === "email") {
      // search for email match
      if (
        old_row.email &&
        val &&
        old_row.email.toLowerCase().trim() === val.toLowerCase().trim()
      ) {
        existing_dup.push([50, "Email Matches Row " + new_index]);
      }
      // if not, remove error from existing_dup
      else if (existing_dup.length > 0) {
        //remove it
        for (let i = 0; i < existing_dup.length; i++) {
          if (existing_dup[i] && existing_dup[i][0] === 50  && existing_dup[i][1].includes("Row " + new_index)) {
            existing_dup.splice(i, 1);
          }
        }
      }
    }
    if (col === "student_email") {
        // search for email match
        if (
          old_row.student_email &&
          val &&
          old_row.student_email.toLowerCase().trim() === val.toLowerCase().trim()
        ) {
          console.log("Match Found")
          existing_dup.push([52, "Student Email Matches Row " + new_index]);
        }
        // if not, remove error from existing_dup
        else if (existing_dup.length > 0) {
          //remove it
          console.log("Removing 52 emails with index")
          for (let i = 0; i < existing_dup.length; i++) {
            console.log("Row " + new_index)
            console.log(existing_dup[i][1])
            if (existing_dup[i] && existing_dup[i][0] === 52 && existing_dup[i][1].includes("Row " + new_index)) {
              existing_dup.splice(i, 1);
            }
          }
        }
    }


    if (col === "name") {
      // check for name match
      if (old_row.name && val && old_row.name.trim() === val.trim()) {
        existing_dup.push([51, "Name Matches Row " + new_index]);
      }
      // if not, remove error from existing_dup
      else if (existing_dup.length > 0) {
        //remove it
        for (let i = 0; i < existing_dup.length; i++) {
          if (existing_dup[i] && existing_dup[i][0] === 51) {
            existing_dup.splice(i, 1);
          }
        }
      }
    }

    return existing_dup;
  };

  const searchFileData = (row, row_ind) => {
    let ret = [];
    let matching_email_indexes = editableFileData.reduce((r, n, i) => {
      n.email &&
        row.email &&
        n.index !== row_ind &&
        n.email.toLowerCase().trim() === row.email.toLowerCase().trim() &&
        r.push(i);
      return r;
    }, []);

    let matching_student_email_indexes = editableFileData.reduce((r, n, i) => {
        n.student_email &&
          row.student_email &&
          n.index !== row_ind &&
          n.student_email.toLowerCase().trim() === row.student_email.toLowerCase().trim() &&
          r.push(i);
        return r;
      }, []);

    let matching_name_indexes = editableFileData.reduce((r, n, i) => {
      n.name &&
        row.name &&
        n.index !== row_ind &&
        n.name.trim() === row.name.trim() &&
        r.push(i);
      return r;
    }, []);

    if (matching_email_indexes.length > 0) {
        for (let i = 0; i < matching_email_indexes.length; i++) {
            ret.push([
                50,
                "Email Matches Row " + matching_email_indexes[i],
            ]);
        }
    }
    if (matching_student_email_indexes.length > 0) {
       for (let i = 0; i < matching_student_email_indexes.length; i++) {
            ret.push([
                52,
                "Student Email Matches Row " + matching_student_email_indexes[i],
            ]);
        }
      }
    if (matching_name_indexes.length > 0) {
        for (let i = 0; i < matching_name_indexes.length; i++) {
            ret.push([
                51,
                "Name Matches Row " + matching_name_indexes[i],
            ]);
        }
    }
    return ret;
  };

  // called whenever an editable cell is changed.
  const updateEditedDataErrors = (rowIndex, columnId, value) => {
    let warning_codes = [4, 51];

    // update validity
    setEditableFileData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          let copy = { ...old[rowIndex], [columnId]: value };
          let [row_errors, error_uid, warning_uid] = checkRow(copy);
          let loc_values = {};
          let address = [];
          let valid = [true];
        //   console.log("checking row");
        //   console.log(copy);

        //   console.log("check row returned");
        //   console.log(checkRow(copy));

          // if editing address and row address does not have a lat or lng, not valid
          if (editableColumns.includes("address")) {
            let has_loc = Boolean(
              copy.address &&
                copy.address.address &&
                copy.loc &&
                copy.loc.longitude &&
                copy.loc.latitude
            );
            let has_loc_from_validate = Boolean(
              copy.address &&
                !copy.address.address &&
                copy.loc &&
                copy.loc.longitude &&
                copy.loc.latitude
            );
            let has_new_loc = Boolean(
              copy.address && copy.address["lat"] && copy.address["lng"]
            );

            // if no set location, has error
            if (!(has_loc || has_new_loc || has_loc_from_validate)) {
              row_errors.push(6);
            }
            // if new location, fix row
            else if (has_new_loc) {

              loc_values["latitude"] = copy.address["lat"];
              loc_values["longitude"] = copy.address["lng"];
              address.push(copy.address.address);
            } else if (has_loc) {
              loc_values["latitude"] = copy.loc["latitude"];
              loc_values["longitude"] = copy.loc["longitude"];
              address.push(copy.address);
            } else if (has_loc_from_validate) {
              loc_values["latitude"] = copy.loc["latitude"];
              loc_values["longitude"] = copy.loc["longitude"];
              address.push(copy.address);
            }
          }
          let dup = searchFileData(copy, index);
          console.log("Search File Results")
          console.log(dup)
          for (let i = 0; i < dup.length; i++) {
            if (dup[i][0] === 50) {
              row_errors.push(50);
              valid.push(false);
            }
            if (dup[i][0] === 52) {
                row_errors.push(52);
                valid.push(false);
              }
            
          }

          // check if any of the error codes are in this sample (and are not warnings)
          for (let i = 0; i < row_errors.length; i++) {
            if (row_errors[i] && !warning_codes.includes(row_errors[i])) {
              valid.push(false);
            }
          }
          if (row_errors.length === 0) {
            valid.push(true);
          }

          let v = valid.pop();
          // remove any duplicates from dup (irony, I know)
          let dup_wo_up = []
          let dups = []
          let dup_ids = []
          for (let i =0; i< dup.length; i++){
              if (!(dups.includes(dup[i][0]) && dup_ids.includes(dup[i][1]))) {
                  dups.push(dup[i][0])
                  dup_ids.push(dup[i][1])
                  dup_wo_up.push(dup[i])
              }
          }
          console.log(dup_wo_up)
          let a = {
            ...copy,
            ["hint_uids"]: [error_uid],
            ["warning_uids"]: [warning_uid],
            ["error_code"]: row_errors,
            ["loc"]: loc_values,
            ["address"]: address[0],
            ["valid"]: v,
            ["duplicate"]: dup_wo_up,
          };
        //   console.log("updated keys and values are");
        //   console.log(a);
          resetWarningData(warning_uid);
          resetErrorData(error_uid);
          return a;
        }
        // NOT editing this row 
        else {
          let dup = searchFileAgainstNewValue(row, rowIndex, columnId, value);

          let row_errors = row["error_code"] //? row['error_code']: [];
          let valid = [true];
          let loc_values = {};
          let address = [];
          for (let i = 0; i < dup.length; i++) {
            if (dup[i][0] === 50) {
              row_errors.push(50);
              valid.push(false);
            }
          }

        // if editing address and row address does not have a lat or lng, not valid
        if (editableColumns.includes("address")) {
            let has_loc = Boolean(
                row.address &&
                row.address.address &&
                row.loc &&
                row.loc.longitude &&
                row.loc.latitude
            );
            let has_loc_from_validate = Boolean(
                row.address &&
                !row.address.address &&
                row.loc &&
                row.loc.longitude &&
                row.loc.latitude
            );
     
            console.log(has_loc)
            console.log(has_loc_from_validate)
           
            // if no set location, has error
            if (!(has_loc || has_loc_from_validate)) {
                row_errors.push(6);
            }
             if (has_loc) {

            loc_values["latitude"] = row.loc["latitude"];
            loc_values["longitude"] = row.loc["longitude"];
            address.push(row.address);
            } else if (has_loc_from_validate) {
            loc_values["latitude"] = row.loc["latitude"];
            loc_values["longitude"] = row.loc["longitude"];
            address.push(row.address);
            }
        }

          // check if any of the error codes are in this sample (and are not warnings)
          for (let i = 0; i < row_errors.length; i++) {
            if (row_errors[i] && !warning_codes.includes(row_errors[i])) {
              valid.push(false);
            }
          }
          if (row_errors.length === 0) {
            valid.push(true);
          }
          let v = valid.pop();

          // remove any duplicates from dup (irony, I know)
          let dup_wo_up = []
          let dups = []
          let dup_ids = []
          console.log("Dup prior")
          console.log(dup)
          
          for (let i =0; i< dup.length; i++){
              console.log("Checking dup index " + i)
              console.log(dup[i])
              console.log(!(dups.includes(dup[i][0])))
              console.log(!(dup.includes(dup[i][1])))
              if (!(dup_ids.includes(dup[i][1]))) {
                  dups.push(dup[i][0])
                  dup_ids.push(dup[i][1])
                  dup_wo_up.push(dup[i])
              }
          }
          console.log("Returning Duplicates")
          console.log(dup_wo_up)

          return { ...row, ["duplicate"]: dup_wo_up, ["valid"]: v,  ["address"]: address[0],};
        }
      })
    );
  };

  const updateEntry = (d, setD, index, newDict) => {
    let copy = d;
    copy[index] = newDict;
    setD(copy);
  };

  // for list of entry objects.
  // NOTE: replaces entry with empty to preserve indexing. The objects are re-indexed upon submission.
  const removeEntry = (d, setD, ind) => {
    delete d[ind];
    setD(d);
  };

  // called on row deletion
  const deleteRow = (ind, newRow) => {
    // removeEntry(fileData, setFileData, newRow['index']) // stored data
    // removeEntry(editedData, setEditedData, ind) // displayed subset
    // checkComplete()
    // console.log(duplicateIndex)
    // if (setDuplicateIndex) {
    //     setDuplicateIndex(duplicateIndex + 1)
    // }
  };

  // called on row submission
  const submitRow = (ind, newRow) => {};

  const isEmptyDict = (d) => {
    let keys = Object.keys(d);
    for (let i = 0; i < keys.length; i++) {
      if (d[keys[i]].length > 0) {
        return false;
      }
    }
    return true;
  };

  const checkComplete = () => {
    let not_comp = [];
    if (editableFileData) {
      editableFileData.map((row, index) => {
        if (!("exclude" in row) || !row["exclude"]) {
        
          if (!("valid" in row)) {
          
            not_comp.push(index);
          } else if (!row["valid"]) {
           
            not_comp.push(index);
          }
        }
      });
    }
    if (not_comp.length > 0) {
      setComplete(false);
    } else {
      setComplete(true);
    }
  };
  useEffect(() => {
  
    checkComplete();
  }, [editableFileData]);

  return (
    <div>
      {!complete && <h5> {message} </h5>}

      <CssBaseline />
      {editableFileData.length > 0 && (
        <EditableTable
          setSelectedIndex={setSelectedIndex}
          columns={columns}
          editableColumns={editableColumns}
          editableFileData={editableFileData}
          setEditableFileData={setEditableFileData}
          updateErrorCodes={updateEditedDataErrors}
          checkRow={checkRow}
          isCellValid={checkCell}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      )}
    </div>
  );
};
