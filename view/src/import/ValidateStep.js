import { StepButtons } from "./StepButtons";
import { AddressErrorPage } from "./ErrorPages/AddressErrorPage";
import { MissingErrorPage } from "./ErrorPages/MissingErrorPage";
import { InvalidErrorPage } from "./ErrorPages/InvalidErrorPage";
import { ExistErrorPage } from "./ErrorPages/ExistErrorPage";
import { useEffect, useState } from "react";
import React from "react";
import {
  CheckStudentCell,
  CheckStudentRow,
  CheckParentCell,
  CheckParentRow,
} from "./ValidationUtils";

export const ValidateStep = ({
  users,
  schools,
  schoolNames,
  emails,
  dataType,
  requiredColumns,
  addressErrors,
  setAddressErrors,
  missingErrors,
  setMissingErrors,
  invalidErrors,
  setInvalidErrors,
  existErrors,
  setExistErrors,
  processingComplete,
  setProcessingComplete,
  fileData,
  setFileData,
  step_labels,
  activeStep,
  setActiveStep,
  setRunValidation,
}) => {
  const [activeError, setActiveError] = useState(0); // keeps track of which type of error
  const [valid, setValid] = useState(false);
  const [columns, setColumns] = useState();

  const checkRow = (rowData) => {
    if (dataType === "students") {
      return CheckStudentRow(rowData, users, schools, emails, schoolNames);
    } else if (dataType === "parents") {
      return CheckParentRow(rowData, users, schools, emails, schoolNames);
    }
    return false;
  };

  const checkCell = (col, val) => {
    if (dataType === "students") {
      return CheckStudentCell(col, val, users, schools, emails, schoolNames);
    } else if (dataType === "parents") {
      return CheckParentCell(col, val, users, schools, emails, schoolNames);
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
    ],
    []
  );

    const parentColumns = React.useMemo(
        () => [
          {
            Header: 'Name',
            accessor: 'name',
          },
          {
            Header: 'Email',
            accessor: 'email',
          },
          {
            Header: 'Address',
            accessor: 'address',
          },
          {
            Header: 'Phone Number',
            accessor: 'phone_number',
          },
          {
            Header: '',
            accessor: 'loc',
            Cell: ({ row}) => (<div></div>)}
        ],
        []
    )
    useEffect(()=> {
        if (dataType=== 'students') {
            setColumns(studentColumns)
        }
        else {
            setColumns(parentColumns)
        }
    }, [])
  
    useEffect(() => {
    if (activeError === 3) {
      setValid(true);
    }
  }, [activeError]);

  return (
    <div>
      {activeError === 0 && (
        <MissingErrorPage
          checkRow={checkRow}
          checkCell={checkCell}
          columns={columns}
          dataType={dataType}
          requiredColumns={requiredColumns}
          activeError={activeError}
          setActiveError={setActiveError}
          missingErrors={missingErrors}
          setMissingErrors={setMissingErrors}
          processingComplete={processingComplete}
          setProcessingComplete={setProcessingComplete}
          fileData={fileData}
          setFileData={setFileData}
        />
      )}

      {false && (
        <AddressErrorPage
          checkRow={checkRow}
          checkCell={checkCell}
          columns={columns}
          dataType={dataType}
          requiredColumns={requiredColumns}
          activeError={activeError}
          setActiveError={setActiveError}
          addressErrors={addressErrors}
          setAddressErrors={setAddressErrors}
          processingComplete={processingComplete}
          setProcessingComplete={setProcessingComplete}
          fileData={fileData}
          setFileData={setFileData}
        />
      )}

      {activeError === 1 && (
        <InvalidErrorPage
          checkRow={checkRow}
          checkCell={checkCell}
          columns={columns}
          dataType={dataType}
          requiredColumns={requiredColumns}
          activeError={activeError}
          setActiveError={setActiveError}
          invalidErrors={invalidErrors}
          setInvalidErrors={setInvalidErrors}
          processingComplete={processingComplete}
          setProcessingComplete={setProcessingComplete}
          fileData={fileData}
          setFileData={setFileData}
        />
      )}

      {activeError === 2 && (
        <ExistErrorPage
          checkRow={checkRow}
          checkCell={checkCell}
          columns={columns}
          dataType={dataType}
          requiredColumns={requiredColumns}
          activeError={activeError}
          setActiveError={setActiveError}
          existErrors={existErrors}
          setExistErrors={setExistErrors}
          processingComplete={processingComplete}
          setProcessingComplete={setProcessingComplete}
          fileData={fileData}
          setFileData={setFileData}
        />
      )}

      {activeError === 3 && <h6>All Errors Fixed!</h6>}

      <StepButtons
        nextButtonValid={valid}
        step_labels={step_labels}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setRunValidation={setRunValidation}
      ></StepButtons>
    </div>
  );
};
