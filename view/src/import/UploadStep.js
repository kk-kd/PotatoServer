import { useState, useRef, useEffect } from "react";
import { StepButtons } from "./StepButtons";
import PropTypes from 'prop-types'
import {parse} from 'papaparse';


export const UploadStep = ({fileData, setFileData, fileName, setFileName, step_labels, activeStep, setActiveStep, setRunValidation}) => {

    const [validFile, setValidFile] = useState(false);
    const [indexCount, setIndexCount] = useState(0);
    const [columns, setColumns] = useState();

    const hiddenFileInput = useRef(null);
  
    const handleClick = event => {
        hiddenFileInput.current.click();
    };

    const canParse = (data) => {
        // TODO - check for column names
        return true;
    }

    const fixHeader = (h) => {
       const columns = {
           'name': 'Name', 
           'parent': 'User', 
           'id':'studentid'
       }
       if (Object.keys(columns).includes(h)) {
           return columns[h]
       }
    
    }
    const addIndex = (data) => {
        for (let i = 0; i < data.length; i++) {
            data[i]['index'] = i
        }
        return data
    }

    // On Select, update state
    const fileSelect = (e) => {
        if (canParse(e.target.files[0].data)) {
            parse(e.target.files[0], {'header': true, 'transformHeader': fixHeader, 'complete': updateFileData})
            setValidFile(true);
            setFileName(e.target.files[0].name);
        } 
    };

    const updateFileData = (result, file) => {
        const data = result.data;
        console.log(result.data)
        const newData = addIndex(data)
        console.log(newData)
   
        if (!result.error) { 
            setValidFile(true);
            setFileData(data);
        }
    } 

    // on load, if there's already a file selected, don't make them resubmit. Handles when they go backwards! 
    useEffect(() => {
        if (fileData) {
            setValidFile(true);            
            setFileData(fileData);
            setFileName(fileName);
        }
    }, []);


    return (
        <div>
            <div id = 'question'> What File Do You Want to Use? </div>
            
            <button onClick = {handleClick}>
                {fileData ?  'Change File' :'Select A File To Upload'}
            </button>

              
            {(fileData && fileName) && <div id = 'file-display'> {fileName} </div>
            }

            <input type="file" style = {{display: 'none'}} ref = {hiddenFileInput} onChange={fileSelect} accept=".csv"/>
                  

            <StepButtons nextButtonValid = {validFile} step_labels = {step_labels} activeStep = {activeStep} setActiveStep = {setActiveStep} setRunValidation = {setRunValidation} > </StepButtons>
              
        </div>
    )
}