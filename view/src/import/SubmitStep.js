import { useEffect } from "react";
import { saveBulkParents, saveBulkStudents } from "../api/axios_wrapper";

export const SubmitStep = ({ dataType, fileData, setFileData, resetState }) => {
  async function callSave(validation_input) {
    try {
      if (dataType === "students") {
        const resp = await saveBulkStudents(validation_input);

        setFileData(resp);
      } else if (dataType === "parents") {
        const resp = await saveBulkParents(validation_input);

        setFileData(resp);
      }
    } catch (e) {
      console.log(e);
    }
    return 1;
  }

  const fixAddresses = () => {
    const v = fileData.map(user => Object.assign(user, {'address': '998 Chevis Rd, Savannah, GA 31419'}));
    const e = v.map(user => Object.assign(user, {'loc': { longitude: -81.239594, latitude: 31.9619613}}));
    setFileData(e)
    console.log(e)
  }

  useEffect(() => {
    if (dataType === 'parents'){
      fixAddresses();
    }
  }, [])

  
  const handleSubmit = () => {
    let confirm = window.confirm("Do you want to import this data?");

    if (confirm) {
      if (dataType === "students") {
        const validation_input_filtered = fileData.filter((element) => {
          return element !== null;
        });
        const validation_input = {
          students: validation_input_filtered,
        };
        callSave(validation_input);
      } else {
        const validation_input_filtered = fileData.filter((element) => {
          return element !== null;
        });
        const validation_input = {
          users: validation_input_filtered,
        };
        callSave(validation_input);
      }
      alert("Entries Added Successfully!");
      resetState();
    }
  };

  const handleCancel = () => {
    let confirm = window.confirm("Do you want to cancel this import?");
    if (confirm) {
      //reset state
      resetState();
    }
  };

  return (
    <div>
      <h6> Confirmation </h6>
      <button onClick={handleSubmit}> Submit </button>
      <button onClick={handleCancel}> Cancel </button>
    </div>
  );
};
