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
// * 4 - existing name in database (warning)
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
  databaseAllUsers,
  databaseStudents,
  schoolNames
) => {
  if (col === "index" || col === "valid") {
    return [null, '', '', '', ''];
  }
  // catches blank cases
  else if (val === null || val === undefined || val === "") {
    let missing_col_code_map = {
      'name': 2,
      'school_name': 9,
      'parent_email': 10,
    }
    let code = missing_col_code_map[col]
    if (code) {
      return [code, "Blank!", "", "", ""];
    }
    else {
      return [code, "", "", "", ""];
    }
  }
  // If the student isn't numerical
  else if (col === "student_id") {
    if (isNaN(val)) {
      return [15, "Not a number", "", "", ""];
    }
  } else if (col === "parent_email") {
    if (!databaseUsers.email.includes(val) && !databaseUsers.email.includes(val.toString().toLowerCase().trim())) {
      return [12, "Email not registered parent", "", "", ""];
    }
     if (!EmailValidator.validate(val.toString().toLowerCase().trim())) {
      return [14, "Not Valid" ,"", "", ""];
    }
  } else if (col === "school_name") {
    if (
      !schoolNames.includes(val) &&
      !schoolNames.includes(val.toString().toLowerCase().trim())
    ) {
      return [11, "Does not match any authorized schools", "", "", ""];
    }
  }
   // name
   else if (col === 'name') {
    // name exists
    if (databaseStudents.fullName.includes(val) || databaseStudents.fullName.includes(val.toString().toLowerCase().trim())) {
      let dup_name_index = databaseStudents.fullName.indexOf(val.toString().trim())
      let ui = databaseStudents.uid[dup_name_index]
      let r = [4, "", null , "May be a Duplicate", ui];
      return r
    }
  } 
  else if (col === 'student_email') {
    //email already taken
    if (databaseAllUsers.email.includes(val.toString().toLowerCase().trim()) || databaseAllUsers.email.includes(val.toString().toLowerCase().trim())) {
      let dup_email_index = databaseAllUsers.email.indexOf(val.toString().toLowerCase().trim())
      let ui = databaseAllUsers.uid[dup_email_index]
      
      return [18, "Existing Email", ui, null, null];
    }
    //if email is valid
    if (!EmailValidator.validate(val.toString().toLowerCase().trim())) {
      return [17, "Not Valid", "", "", ""];
    } 
  }
  //dodged every wrong case? Return a success.
  return [null,"", "", "", ""];
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
  databaseAllUsers,
  schoolNames
) => {
  if (col === "index" || col === "valid") {
    return [null,"", "", "", ""];
  }
  // catches blank cases
  else if ((val === null || val === undefined || val === "") && col !== "loc" && (col !== 'address')) {
    let missing_col_code_map = {
      'email': 16, 
      'name': 2,
      'phone_number': 7
    }
    let code = missing_col_code_map[col]
    if (code) {
      return [code, "Blank!", "", "", ""];
    }
    else {
      return [code, "", "", "", ""];
    }
  }

  //email cases
  else if (col === "email") {
    //email already taken
    if (databaseAllUsers.email.includes(val.toString().toLowerCase()) || databaseAllUsers.email.includes(val.toString().toLowerCase().trim())) {
      let dup_email_index = databaseAllUsers.email.indexOf(val.toString().toLowerCase().trim())
      let ui = databaseAllUsers.uid[dup_email_index]

      return [3, "Existing Email", ui, null, null];
    }
    //if email is valid
    if (!EmailValidator.validate(val)) {
      return [1, "Not Valid", "", "", ""];
    } 
  } 
  // address
  else if (col === "address") {
    if (!val) {
      return [6,"Invalid Address", "", ""];
    }
    else {
      return [null ,"", "", ""];
    }
  }
  // name
  else if (col === 'name') {
    // name exists
    if (databaseAllUsers.fullName.includes(val) || databaseAllUsers.fullName.includes(val.toString().trim())) {
      let dup_name_index = databaseAllUsers.fullName.indexOf(val.toString().trim())
      let ui = databaseAllUsers.uid[dup_name_index]
      let r = [4, "", null , "May be a Duplicate", ui];
      return r
    }
  } 

  //dodged every wrong case? Return a success.

  return [null,"", "", "", ""];
};

export const CheckStudentRow = (row, schools, users, databaseUsers, databaseAllUsers, databaseStudents, schoolNames) => {
  let codes = []
  let error_uid = [null]
  let warning_uid = [null]

  for (const [key, value] of Object.entries(row)) {
    let [code, error_message, err_uid, warn_message, warn_uid] = CheckStudentCell(key, value, schools, users, databaseUsers, databaseAllUsers, databaseStudents, schoolNames); 
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
  return [codes, error_uid.pop(), warning_uid.pop()];
};

export const CheckParentRow = (row, schools, users, databaseUsers,databaseAllUsers, schoolNames) => {
  let codes = []
  let error_uid = [null]
  let warning_uid = [null]

  for (const [key, value] of Object.entries(row)) {

    let [code, error_message, err_uid, warn_message, warn_uid] = CheckParentCell(key, value, schools, users, databaseUsers, databaseAllUsers, schoolNames); 
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
