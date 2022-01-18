import "./CreateSchool.css";
import { useState } from "react";

export const CreateSchool = () => {
  const [name, setName] = useState("");
  const [adress, setAdress] = useState("");
  const onSubmit = (e) => {
    //Http submit
  }

  //TODO: replace address field with Google Maps API
  return (
      <div>
        <h1>Create School</h1>
        <h2>{name}</h2>
        <h2>{adress}</h2>
        <form onSubmit={onSubmit}>
          <label className="input">School Name (max 30 chars.):
            <input
              type="text"
              maxLength="30"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="input">Adress (max 30 chars.):
            <input
                type="text"
                maxLength="30"
                value={adress}
                onChange={(e) => setAdress(e.target.value)}
            />
          </label>
          <input type="submit" value="submit" />
        </form>
      </div>
  );
}
