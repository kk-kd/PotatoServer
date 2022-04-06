import { HorizontalStepper } from "./StepNavigation/HorizontalStepper";
import { PickTypeStep } from "./StepPages/PickTypeStep";
import { UploadStep } from "./StepPages/UploadStep";
import { ValidateStep } from "./StepPages/ValidateStep";
import { SubmitStep } from "./StepPages/SubmitStep";
import { useState, useEffect } from "react";
import "./ImportPage.css";
import {
  validateBulkStudents,
  validateBulkParents,
  getAllSchools,
  getAllUsers,
  filterAllSchools,
  filterAllUsers,
} from "../api/axios_wrapper";

export const ImportPage = () => {
  const step_labels = ["Select Task", "Upload File", "Fix", "Submit"];
  const [activeStep, setActiveStep] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [requiredColumns, setRequiredColumns] = useState();

  const [dataType, setDataType] = useState();
  const [fileData, setFileData] = useState();
  const [fileName, setFileName] = useState();

  const [users, setUsers] = useState();
  const [schools, setSchools] = useState();
  const [databaseUsers, setDatabaseUsers] = useState();
  const [schoolNames, setSchoolNames] = useState();

  // errors
  const [addressErrors, setAddressErrors] = useState({
    5: [],
    6: [],
  });

  const [invalidErrors, setInvalidErrors] = useState({
    3: [],
    4: [],
    5: [],
    6: [],
    1: [],
    2: [],
    7: [],
    9: [],
    10: [],
    99: [],
    16: [],
    8: [],
    11: [],
    12: [],
    14: [],
    15: [],
  });

  const [existErrors, setExistErrors] = useState({
    3: [],
    4: [],
  });

  const [runValidation, setRunValidation] = useState(false);

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

  useEffect(() => {
    fetchUserData();
    fetchSchoolData();
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

  const addToDict = (arr, setArr, key, val) => {
    let newCopy = arr[key];
    newCopy.push(val);
    const newArr = { ...arr, key: newCopy };
    setArr(newArr);
  };

  const findAndFormatErrors = (data) => {
    setFileData(data)
    console.log("file data set")
    console.log(data)
    setProcessingComplete(true);
    console.log("processing complete")
  };

  const resetState = () => {
    setFileName("");
    setFileData([]);
    setProcessingComplete(false);
    setAddressErrors({
      5: [],
      6: [],
    });
    setInvalidErrors({
      1: [],
      2: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: [],
      12: [],
      14: [],
      15: [],
      16: [],
      99: [],
      16: [],
    });

    setExistErrors({
      3: [],
      4: [],
    });
    setDataType();
    setActiveStep(0);
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
          />
        </div>
      )}
      {activeStep === 2 && (
        <div id="step">
          <ValidateStep
            users={users}
            schools={schools}
            databaseUsers={databaseUsers}
            schoolNames={schoolNames}
            dataType={dataType}
            requiredColumns={requiredColumns}
            processingComplete={processingComplete}
            setProcessingComplete={setProcessingComplete}
            fileData={fileData}
            setFileData={setFileData}
            step_labels={step_labels}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setRunValidation={setRunValidation}
          />
        </div>
      )}
      {activeStep === 3 && (
        <div id="step">
          <SubmitStep
            dataType={dataType}
            fileData={fileData}
            setFileData={setFileData}
            resetState={resetState}
          />
        </div>
      )}
    </div>
  );
};
