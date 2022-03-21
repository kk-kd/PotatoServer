

import { StepButtons } from "./StepButtons"
import {AddressErrorPage} from "./ErrorPages/AddressErrorPage";
import {MissingErrorPage} from "./ErrorPages/MissingErrorPage";
import {InvalidErrorPage} from "./ErrorPages/InvalidErrorPage";
import {ExistErrorPage} from "./ErrorPages/ExistErrorPage";
import { useEffect, useState} from "react";
import React from "react";

export const ValidateStep = ({addressErrors, setAddressErrors, missingErrors, setMissingErrors, invalidErrors, setInvalidErrors, existErrors, setExistErrors, processingComplete, setProcessingComplete, fileData, setFileData, step_labels, activeStep, setActiveStep, setRunValidation}) => {

    const [activeError, setActiveError] = useState(0);
    const [valid, setValid] = useState(false);

    const columns = React.useMemo(
        () => [
          {
            Header: 'Name',
            accessor: 'name',
          },
          {
            Header: 'Email',
            accessor: 'parent_email',
          },
          {
            Header: 'School',
            accessor: 'school_name',
          },
        ],
        []
    )

    useEffect(()=> {
        if (activeError === 4) {
            setValid(true)
        }
    }, [activeError])
    
    return (
        <div>
             <div id = 'question'> Fix </div>
    
            {(activeError === 0) && <MissingErrorPage 
                  columns = {columns}
                  activeError = {activeError}
                  setActiveError = {setActiveError}
                  missingErrors = {missingErrors}
                  setMissingErrors = {setMissingErrors}
                  processingComplete = {processingComplete}
                  setProcessingComplete = {setProcessingComplete}
                  fileData = {fileData}
                  setFileData = {setFileData}      
             />}

            {(activeError === 1) && <AddressErrorPage 
                columns = {columns}
                activeError = {activeError}
                setActiveError = {setActiveError}
                addressErrors = {addressErrors}
                setAddressErrors = {setAddressErrors}
                processingComplete = {processingComplete}
                setProcessingComplete = {setProcessingComplete}
                fileData = {fileData}
                setFileData = {setFileData}          
             />}
             
             {(activeError=== 2) && <InvalidErrorPage
                  columns = {columns}
                  activeError = {activeError}
                  setActiveError = {setActiveError}
                  invalidErrors = {invalidErrors}
                  setInvalidErrors = {setInvalidErrors}
                  processingComplete = {processingComplete}
                  setProcessingComplete = {setProcessingComplete}
                  fileData = {fileData}
                  setFileData = {setFileData}       
             />}

            {(activeError === 3) && <ExistErrorPage 
                columns = {columns}
              activeError = {activeError}
              setActiveError = {setActiveError}
              existErrors = {existErrors}
              setExistErrors = {setExistErrors}
              processingComplete = {processingComplete}
              setProcessingComplete = {setProcessingComplete}
              fileData = {fileData}
              setFileData = {setFileData}    
             />}            
             
            <StepButtons
                nextButtonValid = {valid} 
                step_labels = {step_labels} 
                activeStep = {activeStep} 
                setActiveStep = {setActiveStep}
                setRunValidation = {setRunValidation}
                 > 
            </StepButtons>
        </div>
    )
}