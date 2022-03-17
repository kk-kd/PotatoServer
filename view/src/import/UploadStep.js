import { useState, useRef, useEffect } from "react";
import { StepButtons } from "./StepButtons";
import PropTypes from 'prop-types'


export const UploadStep = ({fileData, setFileData, step_labels, activeStep, setActiveStep, setRunValidation}) => {

    const [selectedFile, setSelectedFile] = useState();
    const [validFile, setValidFile] = useState(false);

    const hiddenFileInput = useRef(null);
  
    const handleClick = event => {
        hiddenFileInput.current.click();
    };

    const simpleValidate = () => {
        setValidFile(true);
        return [true, 'Good to go']
    }

    // On Select, update state
    const fileSelect = (e) => {
        setSelectedFile(e.target.files[0]);
        if (simpleValidate()[0]) { 
            setFileData(e.target.files[0]);
        }
    };

    // on load, if there's already a file selected, don't make them resubmit. Handles when they go backwards! 
    useEffect(() => {
        if (fileData) {
            setValidFile(true);
            setSelectedFile(fileData);
        }
    }, []);


    return (
        <div>
            <div id = 'title'> Upload A File </div>
            <button onClick = {handleClick}>
                {selectedFile ?  'Change File' :'Select A File To Upload'}
            </button>
            
            {validFile && <h3> File Selected: {selectedFile.name} </h3>
            }
            
            <input type="file" style = {{display: 'none'}} ref = {hiddenFileInput} onChange={fileSelect} accept=".csv"/>

            <StepButtons nextButtonValid = {validFile} step_labels = {step_labels} activeStep = {activeStep} setActiveStep = {setActiveStep} setRunValidation = {setRunValidation} > </StepButtons>
              
        </div>
    )
}