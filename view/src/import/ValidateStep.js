

import { StepButtons } from "./StepButtons"

export const ValidateStep = ({errors, setErrors, setFileData, step_labels, activeStep, setActiveStep, setRunValidation}) => {
    //activeError = address, missing, invalid, exists
    
    return (
        <div>
             <div id = 'question'> Fix </div>

             {/* <FixAddress 

              > */}
            


             
            <StepButtons
                nextButtonValid = {!errors} 
                step_labels = {step_labels} 
                activeStep = {activeStep} 
                setActiveStep = {setActiveStep}
                setRunValidation = {setRunValidation}
                 > 
            </StepButtons>
        </div>
    )
}