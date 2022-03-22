export const CheckStudentCell = (
  col,
  val,
  schools,
  users,
  emails,
  schoolNames
) => {
  if (col === "index" || col === "valid") {
    return "";
  }
  // catches blank cases
  else if (val === null || val === undefined) {
    return "Blank!";
  }
  // If the student isn't numerical
  else if (col === "student_id") {
    if (isNaN(val)) {
      return "Not a number";
    }
  } else if (col === "parent_email") {
    if (!emails.includes(val) && !emails.includes(val.toLowerCase().trim())) {
      return "Email not registered";
    }
  } else if (col === "school_name") {
    if (
      !schoolNames.includes(val) &&
      !schoolNames.includes(val.toLowerCase().trim())
    ) {
      return "School not registered";
    }
  }
  //dodged every wrong case? Return a success.
  return "";
};

export const CheckParentCell = (
  col,
  val,
  schools,
  users,
  emails,
  schoolNames
) => {};

export const CheckStudentRow = (row, schools, users, emails, schoolNames) => {
  console.log(row);

  for (const [key, value] of Object.entries(row)) {
    let m = CheckStudentCell(key, value);
    if (m !== "") {
      return "Error found";
    }
  }
  return "";
};

export const CheckParentRow = (row, schools, users, emails, schoolNames) => {
  return "";
};
