import { HorizontalStepper } from "./HorizontalStepper"
import { UploadStep } from "./UploadStep"
import { ValidateStep } from "./ValidateStep"
import { SubmitStep } from "./SubmitStep"
import { useState, useEffect } from "react"
import './ImportPage.css'


export const ImportPage = () => {
    const step_labels = ['Upload', 'Fix', 'Submit']
    const [activeStep, setActiveStep] = useState(0)
    const [fileData, setFileData] = useState()
    const [errors, setErrors] = useState()
    const [runValidation, setRunValidation] = useState(false); 

    // run validation
    useEffect(() => {
        if (runValidation){
            // TODO - make API call that checks for errors, update error state
            setRunValidation(false)
        }
    }, [runValidation]);

    return (
        <div id="content">
            <h2 id = 'title'> Import Account Information </h2>

            <div id = 'stepper'>
                <HorizontalStepper 
                    step_labels = {step_labels}
                    activeStep = {activeStep}
                    setActiveStep = {setActiveStep}
                ></HorizontalStepper>
            </div>
    
            {(activeStep === 0) && 
                <div id = 'step'>
                    <UploadStep 
                        fileData = {fileData}
                        setFileData = {setFileData} 
                        step_labels = {step_labels}
                        activeStep = {activeStep} 
                        setActiveStep = {setActiveStep}
                        setRunValidation = {setRunValidation}
                    />    
                </div>
            }
            {(activeStep === 1) && 
                <div id = 'step'>
                    <ValidateStep 
                        errors = {errors} 
                        setErrors = {setErrors} 
                        setFileData = {setFileData} 
                        step_labels = {step_labels}
                        activeStep = {activeStep} 
                        setActiveStep = {setActiveStep}
                        setRunValidation = {setRunValidation}
                    />    
                </div>
            }
            {(activeStep === 2) && 
                <div id = 'step'>
                    <SubmitStep errors = {errors} />    
                </div>
            } 
            
        </div>)
}