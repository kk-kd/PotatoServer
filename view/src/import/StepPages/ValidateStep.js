import { StepButtons } from "../StepNavigation/StepButtons";
import { ErrorPage } from "../ErrorPages/AllErrorsPage";
import { useEffect, useState } from "react";
import React from "react";
import {
  CheckStudentRow,
  CheckParentRow,
  CheckStudentCell,
  CheckParentCell,
} from "../Validation/ValidationUtils";

export const ValidateStep = ({
  users,
  schools,
  schoolNames,
  databaseUsers,
  databaseAllUsers,
  databaseStudents,
  dataType,
  requiredColumns,
  processingComplete,
  setProcessingComplete,
  fileData,
  setFileData,
  submissionData, 
  setSubmissionData,
  step_labels,
  activeStep,
  setActiveStep,
  setRunValidation,
  resetState
}) => {
  const [activeError, setActiveError] = useState(0); // keeps track of which type of error
  const [valid, setValid] = useState(false);
  const [columns, setColumns] = useState();

  const checkRow = (rowData) => {
    if (dataType === "students") {
      return CheckStudentRow(rowData, users, schools, databaseUsers,databaseAllUsers, databaseStudents, schoolNames);
    } else if (dataType === "parents") {
      return CheckParentRow(rowData, users, schools, databaseUsers, databaseAllUsers, schoolNames);
    }
    return false;
  };

  const checkCell = (col, val) => {
    if (dataType === "students") {
      return CheckStudentCell(col, val, users, schools, databaseUsers, databaseAllUsers, databaseStudents, schoolNames);
    } else if (dataType === "parents") {
      return CheckParentCell(col, val, users, schools, databaseUsers, databaseAllUsers, schoolNames);
    }
    return false;
  };

  const studentColumns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Parent Email",
        accessor: "parent_email",
      },
      {
        Header: "School",
        accessor: "school_name",
      },
      {
        Header: "Student ID",
        accessor: "student_id",
      },
      {
        Header: "Student Email",
        accessor: "student_email",
      },
      {
        Header: "Phone Number",
        accessor: "phone_number",
      },
      {
        Header: "",
        accessor: "error_code",
        Cell: ({ row }) => <div></div>
      },
    ],
    []
  );

  const parentColumns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Address",
        accessor: "address",
      },
      {
        Header: "Phone Number",
        accessor: "phone_number",
      },
      {
        Header: "",
        accessor: "loc",
        Cell: ({ row }) => <div></div>,
      },
      {
        Header: "",
        accessor: "error_code",
        Cell: ({ row }) => <div></div>,
      },
    ],
    []
  );
  useEffect(() => {
    if (dataType === "students") {
      setColumns(studentColumns);
    } else {
      setColumns(parentColumns);
    }
  }, []);

  return (
    <div>
      {activeError === 0 && (
        <ErrorPage
          checkRow={checkRow}
          checkCell={checkCell}
          columns={columns}
          dataType={dataType}
          requiredColumns={requiredColumns}
          activeError={activeError}
          setActiveError={setActiveError}
          processingComplete={processingComplete}
          setProcessingComplete={setProcessingComplete}
          fileData={fileData}
          setFileData={setFileData}
          submissionData = {submissionData}
          setSubmissionData = {setSubmissionData}
          step_labels = {step_labels}
          activeStep = {activeStep}
          setActiveStep = {setActiveStep}
          setRunValidation = {setRunValidation} 
          resetState = {resetState}
        />
      )}
    </div>
  );
};
