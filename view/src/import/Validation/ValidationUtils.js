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
  emails,
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
    if (!emails.email.includes(val) && !emails.email.includes(val.toLowerCase().trim())) {
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

export const CheckParentCell = (
  col,
  val,
  schools,
  users,
  emails,
  schoolNames
) => {
  if (col === "index" || col === "valid") {
    return [-1,""];
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
    return [code, "Blank!"];
  }

  //email cases
  else if (col === "email") {

    //email already taken
    if (emails.email.includes(val.toLowerCase()) || emails.email.includes(val.toLowerCase().trim())) {
      let dup_email_index = emails.email.indexOf(val.toLowerCase().trim())
      let ui = emails.uid[dup_email_index]
      console.log(val.toLowerCase().trim())
      console.log(emails)
      console.log(dup_email_index)
      console.log(ui)
      
      return [3, "Existing Email", ui];
    }
    //if email is valid
    if (!EmailValidator.validate(val)) {
      return [1, "Not Valid"];
    } 
  } else if (col === "address") {
    return [-1,""];
  }
  //dodged every wrong case? Return a success.

  return [0,""];
};

export const CheckStudentRow = (row, schools, users, emails, schoolNames) => {
  let errors = []
  for (const [key, value] of Object.entries(row)) {
    let error = CheckStudentCell(key, value, schools, users, emails, schoolNames);
    if (error[1] !== "") {
      errors.push(error[0])
    }
  }
  return errors;
};

export const CheckParentRow = (row, schools, users, emails, schoolNames) => {
  let errors = []
  let uid = []
  for (const [key, value] of Object.entries(row)) {
    let error = CheckParentCell(key, value, schools, users, emails, schoolNames);
    if (error[1] !== "") {
      if (error[2]) {
        uid.push(error[2])
      }
      errors.push(error[0])
    }
  }
  return [errors, uid[0]];
};
