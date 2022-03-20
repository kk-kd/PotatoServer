
import { StepButtons } from "./StepButtons"
import { RadioGroup, FormControlLabel, Radio } from "@mui/material"
import { useEffect } from "react";

export const PickTypeStep = ({dataType, setDataType, step_labels, activeStep, setActiveStep, setRunValidation}) => {
    // if going backwards, remember their selection
    useEffect(() => {
        if (dataType) {
            setDataType(dataType)
        }
    }, []);

    return (
        <div>
            <div id = 'question'> Who do you have data for? </div>
            <div id = 'centered-form'> 
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value)}
                >
                    <FormControlLabel value="students" control={<Radio />} label="Students" />
                    <FormControlLabel value="users" control={<Radio />} label="Admin, Staff, or Parents" />
                </RadioGroup>
            </div>
           
             
            <StepButtons
                nextButtonValid = {dataType} 
                step_labels = {step_labels} 
                activeStep = {activeStep} 
                setActiveStep = {setActiveStep}
                setRunValidation = {setRunValidation}
                 > 
            </StepButtons>
        </div>
    )
}