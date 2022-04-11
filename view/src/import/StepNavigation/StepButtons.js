import Button from "@mui/material/Button";
import * as React from "react";

export const StepButtons = ({
  nextButtonValid,
  step_labels,
  activeStep,
  setActiveStep,
  setRunValidation,
  resetState,
}) => {
  const handleNext = () => {
    if (activeStep === 1) {
      setRunValidation(true);
    }
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    // if (activeStep > 1) {
    //   setActiveStep(1);
    //   // resetState();
    // }
    setActiveStep(activeStep - 1);
  };

  return (
    <div style={{ margin: "auto" }}>
      <React.Fragment>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
         Back
        </Button>

        <Button onClick={handleNext} disabled={!nextButtonValid}>
          {activeStep === step_labels.length - 1 ? "Submit" : "Next"}
        </Button>
      </React.Fragment>
    </div>
  );
};
