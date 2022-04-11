import { useEffect, useState } from "react";
import { saveBulkParents, saveBulkStudents } from "../../api/axios_wrapper";

export const SubmitStep = ({ dataType, submisisonData, setSubmissionData, resetState, activeStep, setActiveStep}) => {
  useEffect ( () => {
    console.log(submisisonData)
  } ,
    [])
  async function callSave(validation_input) {
    try {
      if (dataType === "students") {
        const resp = await saveBulkStudents(validation_input);
      } else if (dataType === "parents") {
        const resp = await saveBulkParents(validation_input);
      }
      alert("Entries Added Successfully!");
      resetState();
    } catch (e) {
      alert(e.response.data)
      return false;
    }
    return true;
  }

  const handleSubmit = () => {

    let confirm = window.confirm("Please Confirm You Would Like To Submit This Data.");
    
    if (confirm) {
      if (dataType === "students") {
    
        const validation_input_filtered = submisisonData.filter((element) => {
          return element !== null;
        });        
        const validation_input = {
          students: validation_input_filtered,
        };
        callSave(validation_input);

      } else {
        const filter1 = submisisonData.filter((element) => {
          return element !== null;
        });
        const validation_input = {
          users: filter1,
        };
        callSave(validation_input);
      }
    }
  };

  const handleCancel = () => {
    setActiveStep(activeStep -1)
  };

  return (
    <div>
      <h6> Confirmation </h6>
      <button onClick={handleSubmit}> Submit </button>
      <button onClick={handleCancel}> Back </button>
    </div>
  );
};
