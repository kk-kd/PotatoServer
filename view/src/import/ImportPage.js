import { HorizontalStepper } from "./HorizontalStepper";
import { PickTypeStep } from "./PickTypeStep";
import { UploadStep } from "./UploadStep";
import { ValidateStep } from "./ValidateStep";
import { SubmitStep } from "./SubmitStep";
import { useState, useEffect } from "react";
import "./ImportPage.css";
import {
  validateBulkStudents,
  validateBulkParents,
} from "../api/axios_wrapper";

export const ImportPage = () => {
    const step_labels = ['Pick Data Type', 'Upload File', 'Fix', 'Submit']
    const [activeStep, setActiveStep] = useState(0)
    const [processingComplete, setProcessingComplete] = useState(false);
    const [dataType, setDataType] = useState()
    const [fileData, setFileData] = useState()
    const [fileName, setFileName] = useState()

    // errors
    const [addressErrors, setAddressErrors] = useState({
        5: [],
        6: []
    }) 

    const [missingErrors, setMissingErrors] = useState({
        1: [],
        2: [],
        7: [],
        9: [],
        10: [],
        99: []
    }) 
    const [invalidErrors, setInvalidErrors] = useState({
        8: [], 
        11: [],
        12: [],
        14: []
    }) 

    const [existErrors, setExistErrors] = useState({
        3: [],
        4: []
    }) 

    const [runValidation, setRunValidation] = useState(false); 


    // run validation
    useEffect(() => {
        if (runValidation){
            console.log("Run Validation")
            if (dataType === 'students') {
                const validation_input = {
                    'students': fileData
                }
                callValidate(validation_input)
                setRunValidation(false)
                console.log(validation_input)
            }
            else if (dataType === 'users') {
                const validation_input = {
                    'users': fileData
                }
                callValidate(validation_input)
                setRunValidation(false)
                console.log(validation_input)
            }        
        }
    }, [runValidation]);

    const addToDict = (arr, setArr, key, val) => {
        let newCopy = arr[key]
        newCopy.push(val)
        const newArr = { ...arr, key: newCopy};
        setArr(newArr);
    }


  const findAndFormatErrors = (data) => {
    var address_codes = Object.keys(addressErrors);
    var missing_codes = Object.keys(missingErrors);
    var invalid_codes = Object.keys(invalidErrors);
    var exist_codes = Object.keys(existErrors);

    for (let i = 0; i < data.length; i++) {
      var entry = data[i];
      for (let k = 0; k < entry["error_code"].length; k++) {
        var code = entry["error_code"][k].toString();
        if (address_codes.includes(code)) {
          addToDict(addressErrors, setAddressErrors, code, i);
        } else if (missing_codes.includes(code)) {
          addToDict(missingErrors, setMissingErrors, code, i);
        } else if (invalid_codes.includes(code)) {
          addToDict(invalidErrors, setInvalidErrors, code, i);
        } else if (exist_codes.includes(code)) {
          addToDict(existErrors, setExistErrors, code, i);
        }
      }
    }
    console.log(addressErrors);
    console.log(missingErrors);
    console.log(invalidErrors);
    console.log(existErrors);
    setProcessingComplete(true);
  };

  async function callValidate(validation_input) {
    try {
      const resp = await validateBulkStudents(validation_input);
      console.log(resp);

      findAndFormatErrors(resp.data.students);
    } catch (e) {
      console.log(e);
    }
    return 1;
  }

  return (
    <div id="content">
      <h2 id="title"> Import Account Information </h2>

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
            addressErrors={addressErrors}
            setAddressErrors={setAddressErrors}
            missingErrors={missingErrors}
            setMissingErrors={setMissingErrors}
            invalidErrors={invalidErrors}
            setInvalidErrors={setInvalidErrors}
            existErrors={existErrors}
            setExistErrors={setExistErrors}
            processingComplete = {processingComplete}
            setProcessingComplete = {setProcessingComplete}
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
          <SubmitStep fileData={fileData} setFileData={setFileData} />
        </div>
      )}
    </div>
  );
};
