import { HorizontalStepper } from "./StepNavigation/HorizontalStepper";
import { PickTypeStep } from "./StepPages/PickTypeStep";
import { UploadStep } from "./StepPages/UploadStep";
import { ValidateStep } from "./StepPages/ValidateStep";
import { SubmitStep } from "./StepPages/SubmitStep";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./ImportPage.css";
import {
  validateBulkStudents,
  validateBulkParents,
  getAllSchools,
  getAllUsers,
  filterAllSchools,
  filterAllUsers,
  filterAllStudents,
} from "../api/axios_wrapper";

export const ImportPage = () => {
  const step_labels = ["Select Task", "Upload File", "Review", "Submit"];
  const [activeStep, setActiveStep] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [requiredColumns, setRequiredColumns] = useState();

  const [dataType, setDataType] = useState();
  const [fileData, setFileData] = useState();
  const [submissionData, setSubmissionData] = useState();
  const [fileName, setFileName] = useState();

  const [users, setUsers] = useState();
  const [schools, setSchools] = useState();
  const [databaseUsers, setDatabaseUsers] = useState();
  const [databaseStudents, setDatabaseStudents] = useState();
  const [schoolNames, setSchoolNames] = useState();

  const [runValidation, setRunValidation] = useState(false);
  let navigate = useNavigate();

  const fetchSchoolData = async () => {
    try {
      const fetchedData = await filterAllSchools({
        page: 1,
        size: 500,
        filterType: "name",
        filterData: "",
        sort: "none",
        sortDir: "none",
        showAll: "true",
      });

      setSchools(fetchedData.data.schools);
      let a = fetchedData.data.schools.map((school) => school.uniqueName);
      setSchoolNames(a);
      console.log(a)
    } catch (error) {
      alert(error.response.data);
    }
  };

  const fetchUserData = async () => {
    try {
      const fetchedData = await filterAllUsers({
        page: 1,
        size: 500,
        sort: "none",
        sortDir: "none",
        showAll: "true",
      });
      setUsers(fetchedData.data.users);
      let email = fetchedData.data.users.map((user) => user.email);
      let uid =  fetchedData.data.users.map((user) => user.uid);
      let name =  fetchedData.data.users.map((user) => user.fullName);
      let e = {'email': email, 'uid': uid, 'fullName': name}
      console.log(e)
      setDatabaseUsers(e);

    } catch (error) {
      alert(error.response.data);
    }
  };

  const fetchStudentData = async () => {
    try {
      const fetchedData = await filterAllStudents({
        page: 1,
        size: 500,
        sort: "none",
        sortDir: "none",
        fullNameFilter: "",
        showAll: "true",
        idFilter: "",
      });
      console.log("Student Database Data")
      console.log( fetchedData.data.students)
    
      let parent_email = fetchedData.data.students.map((student) => student.parent_email);
      let uid = fetchedData.data.students.map((student) => student.uid);
      let name = fetchedData.data.students.map((student) => student.fullName);

      let e = {'parent_email': parent_email, 'uid': uid, 'fullName': name}
      console.log(e)
      setDatabaseStudents(e);

    } catch (error) {
      alert(error.response.data);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchSchoolData();
    fetchStudentData();
  }, []);

  // run validation
  useEffect(() => {
    if (runValidation) {
      console.log("Run Validation");
      if (dataType === "students") {
        const validation_input = {
          students: fileData,
        };
        callValidate(validation_input);
        setRunValidation(false);
        console.log(validation_input);
      } else if (dataType === "parents") {
        const validation_input = {
          users: fileData,
        };
        callValidate(validation_input);
        setRunValidation(false);
        console.log(validation_input);
      }
    }
  }, [runValidation]);


  const findAndFormatErrors = (data) => {
    setFileData(data)
    setProcessingComplete(true);
    console.log("processing complete")
  };

  const resetState = () => {
    setFileName("");
    setFileData();
    setProcessingComplete(false);
    setActiveStep(0);
    setFileName("")
  };

  async function callValidate(validation_input) {
    try {
      if (dataType === "students") {
        const resp = await validateBulkStudents(validation_input);
        findAndFormatErrors(resp.data.students);
      } else if (dataType === "parents") {
        const resp = await validateBulkParents(validation_input);
        findAndFormatErrors(resp.data.users);
      }
    } catch (e) {
      console.log(e);
    }
    return 1;
  }

  return (
    <div id="content">
      <h2 id="title"> Import </h2>
      
      <div id="stepper">
        <HorizontalStepper
          step_labels={step_labels}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        ></HorizontalStepper>
      </div>
      {activeStep === 0 && (
        <div id="step">
          <PickTypeStep
            dataType={dataType}
            setDataType={setDataType}
            setRequiredColumns={setRequiredColumns}
            step_labels={step_labels}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setRunValidation={setRunValidation}
          />
        </div>
      )}
      {activeStep === 1 && (
        <div id="step">
          <UploadStep
            dataType={dataType}
            requiredColumns={requiredColumns}
            fileData={fileData}
            setFileData={setFileData}
            fileName={fileName}
            setFileName={setFileName}
            step_labels={step_labels}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setRunValidation={setRunValidation}
            resetState={resetState}
          />
        </div>
      )}
      {activeStep === 2 && (
        <div id="step">
          <ValidateStep
            users={users}
            schools={schools}
            databaseUsers={databaseUsers}
            databaseStudents = {databaseStudents}
            schoolNames={schoolNames}
            dataType={dataType}
            requiredColumns={requiredColumns}
            processingComplete={processingComplete}
            setProcessingComplete={setProcessingComplete}
            fileData={fileData}
            setFileData={setFileData}
            submissionData = {submissionData}
            setSubmissionData = {setSubmissionData}
            step_labels={step_labels}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setRunValidation={setRunValidation}
            resetState={resetState}
          />
        </div>
      )}
      {activeStep === 3 && (
        <div id="step">
          <SubmitStep
            dataType={dataType}
            submissionData = {submissionData}
            setSubmissionData = {setSubmissionData}
            resetState={resetState}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        </div>
      )}
    </div>
  );
};
