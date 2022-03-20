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

    // errors
    const [Addresserrors, setAddressErrors] = useState() // dict with key of # to list of indexes
    const [Missingerrors, setMissingErrors] = useState() // 
    const [Invaliderrors, setInvalidErrors] = useState() 
    const [Existserrors, setExistsErrors] = useState() 
    const [errors, setErrors] = useState() // 

    // error codes 
    const addressErrorCodes = [5,6]
    const missingErrorCodes = [99, 2, 1, 7, 9, 10]
    const invalidErrorCodes = [14,3,4,8, 11, 12]
    const existsErrorCodes = []


    const [runValidation, setRunValidation] = useState(false); 


    // run validation
    useEffect(() => {
        if (runValidation){
            // TODO - make API call that checks for errors, update error state
            console.log("Run Validation")
            console.log(fileData)
            const validation_input = {
                'students': fileData
            }
            console.log(validation_input)
            callValidate(validation_input)
            
            setRunValidation(false)
        }
    }, [runValidation]);

    const findAndFormatErrors = (data) => {

        // for (let i = 0; i < data.length; i++) {
        //     var entry = data[i]
        //     for (let j = 0; j < addressErrorCodes.length; j++) {
        //         if (entry['error_codes'][i] === addressErrorCodes[j]) {
        //             //addressErrorCodes[]
        //         }
        //     } 
        // }


        //setErrors(response_data);
        console.log('')
  
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