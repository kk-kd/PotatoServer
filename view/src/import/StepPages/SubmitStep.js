import { useEffect, useState } from "react";
import { saveBulkParents, saveBulkStudents } from "../../api/axios_wrapper";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

export const SubmitStep = ({ dataType, submissionData, setSubmissionData, resetState, activeStep, setActiveStep}) => {
  let navigate = useNavigate();
  useEffect ( () => {
    console.log(submissionData)
  } ,
    [])
  async function callSave(validation_input) {
    try {
      if (dataType === "students") {
        const resp = await saveBulkStudents(validation_input);
      } else if (dataType === "parents") {
        const resp = await saveBulkParents(validation_input);
      }
      if (submissionData.length > 1) {
        alert(submissionData.length + " Entries Added Successfully!");
      }
      else {
        alert(submissionData.length + " Entry Added Successfully!");
      }
      
      window.location.reload()
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
    
        const validation_input_filtered = submissionData.filter((element) => {
          return element !== null;
        });   
        console.log(validation_input_filtered)    
        const validation_input = {
          students: validation_input_filtered,
        };
        if (validation_input_filtered.length === 0) {
          alert("Your Submission has no rows. Please go back to the previous step.")
        }
        callSave(validation_input);

      } else {
        const filter1 = submissionData.filter((element) => {
          return element !== null;
        });
     
        const validation_input = {
          users: filter1,
        };
        if (filter1.length === 0) {
          alert("Your Submission has no rows. Please go back to the previous step.")
        }
        callSave(validation_input);
      }
    }
  };

  const handleCancel = () => {
    let confirm = window.confirm("Please Confirm You Would Like To Cancel This Submission. All edits will be lost.");
    
    if (confirm) {
     window.location.reload()
    }
  };

  return (
    <div>
    <div>
      <button onClick={handleSubmit}> Submit </button>
    </div>
    <div>
      <button onClick={()=> setActiveStep(activeStep -1)}> Back </button>
      <button onClick={handleCancel}> Cancel Import </button>
      
    </div>
    </div>
  );
};
