import { useEffect, useState } from "react";
import { saveBulkParents, saveBulkStudents } from "../../api/axios_wrapper";

export const SubmitStep = ({ dataType, fileData, setFileData, resetState }) => {
  const [emails, setEmails] = useState();
  async function callSave(validation_input) {
    try {
      if (dataType === "students") {
        const resp = await saveBulkStudents(validation_input);

        setFileData(resp);
      } else if (dataType === "parents") {
        const resp = await saveBulkParents(validation_input);
        setFileData(resp);
      }
      alert("Entries Added Successfully!");
      resetState();
    } catch (e) {
      alert(e.response.data)
      resetState();
      return false;
    }
    return true;
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
        let emails = []
        const validation_input_filtered = fileData.filter((element) => {
          return element !== null;
        });        
        const validation_input = {
          students: validation_input_filtered,
        };
        let val2 = callSave(validation_input);
        // if (val2) {
        //   alert("Entries Added Successfully!");
        //   resetState();
        // }

      } else {
        const filter1 = fileData.filter((element) => {
          return element !== null;
        });
        const validation_input = {
          users: filter1,
        };
        console.log(validation_input)
        let val = callSave(validation_input);
        // if (val) {
        //   alert("Entries Added Successfully!");
        //   resetState();
        // }

      }
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
