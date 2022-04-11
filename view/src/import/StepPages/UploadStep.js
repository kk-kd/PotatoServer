import { useState, useRef, useEffect } from "react";
import { StepButtons } from "../StepNavigation/StepButtons";
import PropTypes from "prop-types";
import { parse } from "papaparse";

export const UploadStep = ({
  dataType,
  requiredColumns,
  fileData,
  setFileData,
  fileName,
  setFileName,
  step_labels,
  activeStep,
  setActiveStep,
  setRunValidation,
  resetState
}) => {
  const [validFile, setValidFile] = useState(false);
  const [columnMap, setColumnMap] = useState();

  const hiddenFileInput = useRef(null);

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  const correctHeaders = (data) => {
    for (let i = 0; i < requiredColumns.length; i++) {
      if (!Object.keys(data[0]).includes(requiredColumns[i])) {
        // if (!['index', 'loc'].includes(requiredColumns[i])){
        let message =
          "This file is missing required columns. Please select a file with columns  \n - " +
          requiredColumns.join("\n - ");
        alert(message);
        return false;
        // }
      }
    }
    return true;
  };

  const fixHeader = (h) => {
    // TODO: apply column map if input is different

    return h;
  };
  const addIndex = (data) => {
    for (let i = 0; i < data.length; i++) {
      data[i]["index"] = i;
    }
    return data;
  };

  // On Select, update state
  const fileSelect = (e) => {
    parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: fixHeader,
      complete: updateFileData,
    });
  };


  const updateFileData = (result, file) => {
    const data = result.data;
    console.log(result.data);
    const newData = addIndex(data);
    console.log(newData);

    if (correctHeaders(newData)) {
      setFileName(file.name);
      setValidFile(true);
      setFileData(newData);
    }
  };

  // on load:
  // - if there's already a file selected, don't make them resubmit. Handles when they go backwards!
  // - define column conversions
  useEffect(() => {
    console.log(dataType);
    if (fileData) {
      setValidFile(true);
      setFileData(fileData);
      setFileName(fileName);
    }
    if (dataType === "students") {
      setColumnMap({
        //TODO: define student column map
      });
    } else if (dataType === "users") {
      setColumnMap({
        //TODO: define user column map
      });
    }
  }, []);

  return (
    <div>
      <div id="question"> What File Do You Want to Use? </div>

      {fileName && <div id="file-display"> {fileName} </div>}

      <button onClick={handleClick}>
        {fileData ? "Change File" : "Select A File To Upload"}
      </button>

      <input
        type="file"
        style={{ display: "none" }}
        ref={hiddenFileInput}
        onChange={fileSelect}
        accept=".csv"
      />

      <StepButtons
        nextButtonValid={validFile}
        step_labels={step_labels}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setRunValidation={setRunValidation}
        resetState={resetState}
      >
        {" "}
      </StepButtons>
    </div>
  );
};
