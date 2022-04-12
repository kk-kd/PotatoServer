
//labels, activeStep, setActiveStep, completeSteps, setCompleteSteps
import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';


export const HorizontalStepper = ({step_labels, activeStep, setActiveStep}) => {
    const steps = step_labels;  

    
    return (
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep}  alternativeLabel>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    );
  }
  