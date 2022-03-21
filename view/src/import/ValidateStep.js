

import { StepButtons } from "./StepButtons"
import {AddressErrorPage} from "./ErrorPages/AddressErrorPage";
import {MissingErrorPage} from "./ErrorPages/MissingErrorPage";
import {InvalidErrorPage} from "./ErrorPages/InvalidErrorPage";
import {ExistErrorPage} from "./ErrorPages/ExistErrorPage";
import { useEffect, useState } from "react";

export const ValidateStep = ({addressErrors, setAddressErrors, missingErrors, setMissingErrors, invalidErrors, setInvalidErrors, existErrors, setExistErrors, fileData, setFileData, step_labels, activeStep, setActiveStep, setRunValidation}) => {

    const [activeError, setActiveError] = useState(0);
    const [valid, setValid] = useState(false);

    useEffect(()=> {
        if (activeError === 4) {
            setValid(true)
        }
    }, [activeError])
    
    return (
        <div>
             <div id = 'question'> Fix </div>

             {(activeError === 0) && <AddressErrorPage 
                activeError = {activeError}
                setActiveError = {setActiveError}
                addressErrors = {addressErrors}
                setAddressErrors = {setAddressErrors}
                fileData = {fileData}
                setFileData = {setFileData}          
             />}
    
            {(activeError === 1) && <MissingErrorPage 
                  activeError = {activeError}
                  setActiveError = {setActiveError}
                  missingErrors = {missingErrors}
                  setMissingErrors = {setMissingErrors}
                  fileData = {fileData}
                  setFileData = {setFileData}      
             />}
             
             {(activeError=== 2) && <InvalidErrorPage
                  activeError = {activeError}
                  setActiveError = {setActiveError}
                  invalidErrors = {invalidErrors}
                  setInvalidErrors = {setInvalidErrors}
                  fileData = {fileData}
                  setFileData = {setFileData}       
             />}

            {(activeError === 3) && <ExistErrorPage 
              activeError = {activeError}
              setActiveError = {setActiveError}
              existErrors = {existErrors}
              setExistErrors = {setExistErrors}
              fileData = {fileData}
              setFileData = {setFileData}    
             />}            
             
            <StepButtons
                nextButtonValid = {true} 
                step_labels = {step_labels} 
                activeStep = {activeStep} 
                setActiveStep = {setActiveStep}
                setRunValidation = {setRunValidation}
                 > 
            </StepButtons>
        </div>
    )
}