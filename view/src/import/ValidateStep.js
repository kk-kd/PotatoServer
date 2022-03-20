

import { StepButtons } from "./StepButtons"

export const ValidateStep = ({addressErrors, setAddressErrors, missingErrors, setMissingErrors, invalidErrors, setInvalidErrors, existErrors, setExistErrors, setFileData, step_labels, activeStep, setActiveStep, setRunValidation}) => {
    //activeError = address, missing, invalid, exists
    
    return (
        <div>
             <div id = 'question'> Fix </div>

             {/* <FixAddress 

              > */}
            


             
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