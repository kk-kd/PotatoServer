import { HorizontalStepper } from "./HorizontalStepper"
import { PickTypeStep } from "./PickTypeStep"
import { UploadStep } from "./UploadStep"
import { ValidateStep } from "./ValidateStep"
import { SubmitStep } from "./SubmitStep"
import { useState, useEffect } from "react"
import './ImportPage.css'
import {validateBulkStudents, validateBulkParents} from "../api/axios_wrapper";



export const ImportPage = () => {
    const step_labels = ['Pick Data Type', 'Upload File', 'Fix', 'Submit']
    const [activeStep, setActiveStep] = useState(0)
    const [dataType, setDataType] = useState()
    const [fileData, setFileData] = useState()
    const [fileName, setFileName] = useState()
    const [errors, setErrors] = useState()

    const [runValidation, setRunValidation] = useState(false); 


    // run validation
    useEffect(() => {
        if (runValidation){
            // TODO - make API call that checks for errors, update error state
            console.log("Run Validation")
            const validation_input = {
                'students': fileData
            }
            callValidate(validation_input)
            
            setRunValidation(false)
        }
    }, [runValidation]);

    const findAndFormatErrors = (response_data) => {
        // error_code:
        
        setErrors(response_data);
    }

    async function callValidate(validation_input) {
        try {
            const resp = await validateBulkStudents(validation_input);
            findAndFormatErrors(resp)
        }
        catch (e) {
            console.log(e)
        }
        return 1;
    }


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
                    <PickTypeStep 
                        dataType = {dataType}
                        setDataType = {setDataType}
                        step_labels = {step_labels}
                        activeStep = {activeStep} 
                        setActiveStep = {setActiveStep}
                        setRunValidation = {setRunValidation}
                    />    
                </div>
            }
            {(activeStep === 1) && 
                <div id = 'step'>
                    <UploadStep 
                        dataType = {dataType}
                        fileData = {fileData}
                        setFileData = {setFileData} 
                        fileName = {fileName}
                        setFileName = {setFileName} 
                        step_labels = {step_labels}
                        activeStep = {activeStep} 
                        setActiveStep = {setActiveStep}
                        setRunValidation = {setRunValidation}
                    />    
                </div>
            }
            {(activeStep === 2) && 
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
            {(activeStep === 3) && 
                <div id = 'step'>
                    <SubmitStep errors = {errors} />    
                </div>
            } 
            
        </div>)
}