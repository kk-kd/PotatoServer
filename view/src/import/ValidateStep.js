

import { StepButtons } from "./StepButtons"

export const ValidateStep = ({errors, setErrors, setFileData, step_labels, activeStep, setActiveStep, setRunValidation}) => {
    
    return (
        <div>
             <div id = 'title'> Fix </div>

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