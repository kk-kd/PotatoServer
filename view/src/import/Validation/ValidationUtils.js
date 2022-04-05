import { faCodePullRequest } from "@fortawesome/free-solid-svg-icons";
import * as EmailValidator from "email-validator";
// This handles all validation EXCEPT addresses, which is handled by MapHelper in EditContent/MapHelper.

// * Validation error codes:
// * GENERAL
// * 99 - Missing index
// * 0 - success
// * 2 - no name
// * 13 - user does not permission to add parents/students to this school
// *
// * PARENT
// * 1 - Email is not valid
// * 16 - Email is empty
// * 3 - email existed in the database
// * 4 - repetitive emails in request
// * 5 - Missing Address
// * 6 - Error while querying address
// * 7 - Missing Phone Number
// *
// * STUDENT
// * 8 - id is empty
// * 15 - id is invalid/nonnumerical
// * 9 - school entry is empty
// * 10 - parent email is empty
// * 14 - invalid email
// * 11 - school does not exist
// * 12 - parent email does not exist
// */

export const CheckStudentCell = (
  col,
  val,
  schools,
  users,
  databaseUsers,
  schoolNames
) => {
  if (col === "index" || col === "valid") {
    return [-1, ''];
  }
  // catches blank cases
  else if (val === null || val === undefined || val === "") {
    let missing_col_code_map = {
      'email': 16, 
      'name': 2,
      'student_id': 8,
      'school_name': 9,
      'parent_email': 10,
    }
    let code = missing_col_code_map[col]
    return [code, "Blank!"];
  }
  // If the student isn't numerical
  else if (col === "student_id") {
    if (isNaN(val)) {
      return [15, "Not a number"];
    }
  } else if (col === "parent_email") {
    if (!databaseUsers.email.includes(val) && !databaseUsers.email.includes(val.toLowerCase().trim())) {
      return [12, "Email not registered"];
    }
     if (!EmailValidator.validate(val)) {
      return [14, "Not Valid"];
    }
  } else if (col === "school_name") {
    if (
      !schoolNames.includes(val) &&
      !schoolNames.includes(val.toLowerCase().trim())
    ) {
      return [11, "School not registered"];
    }
  }
  //dodged every wrong case? Return a success.
  return [0,""];
};

// * 1 - Email is not valid
// * 16 - Email is empty
// * 3 - email existed in the database
// * 4 - repetitive emails in request
// * 5 - Missing Address
// * 6 - Error while querying address
// * 7 - Missing Phone Number
// return [code, error_message, error_uid, warning_message, warning_uid]

export const CheckParentCell = (
  col,
  val,
  schools,
  users,
  databaseUsers,
  schoolNames
) => {
  if (col === "index" || col === "valid") {
    return [null,"", "", "", ""];
  }
  // catches blank cases
  else if ((val === null || val === undefined || val === "") && col !== "loc") {
    let missing_col_code_map = {
      'email': 16, 
      'name': 2,
      'email': 16,
      'phone_number': 7
    }
    let code = missing_col_code_map[col]
    return [code, "Blank!", "", "", ""];
  }

  //email cases
  else if (col === "email") {
    //email already taken
    if (databaseUsers.email.includes(val.toLowerCase()) || databaseUsers.email.includes(val.toLowerCase().trim())) {
      let dup_email_index = databaseUsers.email.indexOf(val.toLowerCase().trim())
      let ui = databaseUsers.uid[dup_email_index]
      
      return [3, "Existing Email", ui, null, null];
    }
    //if email is valid
    if (!EmailValidator.validate(val)) {
      return [1, "Not Valid", "", "", ""];
    } 
  } 
  // address
  else if (col === "address") {
    return [null,"", "", ""];
  }
  // name
  else if (col === 'name') {
    // name exists
    if (databaseUsers.fullName.includes(val) || databaseUsers.fullName.includes(val.trim())) {
      let dup_name_index = databaseUsers.fullName.indexOf(val.trim())
      let ui = databaseUsers.uid[dup_name_index]
      let r = [4, "", null , "May be a Duplicate", ui];
      return r
    }
  } 

  //dodged every wrong case? Return a success.

  return [null,"", "", "", ""];
};

export const CheckStudentRow = (row, schools, users, databaseUsers, schoolNames) => {
  let errors = []
  for (const [key, value] of Object.entries(row)) {
    let error = CheckStudentCell(key, value, schools, users, databaseUsers, schoolNames);
    if (error[1] !== "") {
      errors.push(error[0])
    }
  }
  return [errors, ];
};

export const CheckParentRow = (row, schools, users, databaseUsers, schoolNames) => {
  let codes = []
  let error_uid = [null]
  let warning_uid = [null]
  for (const [key, value] of Object.entries(row)) {
    let [code, error_message, err_uid, warn_message, warn_uid] = CheckParentCell(key, value, schools, users, databaseUsers, schoolNames); 
    console.log("checkCell returned")
    console.log([code, error_message, err_uid, warn_message, warn_uid])
    if (code) {
      codes.push(code)
    }
    if (err_uid) {
      error_uid.push(err_uid) 
    }
    if (warn_uid) {
      warning_uid.push(warn_uid)
    }
  }
    return [codes, error_uid.pop(), warning_uid.pop()]
};
