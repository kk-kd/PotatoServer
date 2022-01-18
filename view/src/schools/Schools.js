import { Navigate, Route, Routes } from "react-router-dom";
import { CreateSchool } from "./CreateSchool";
import { ListSchools } from "./ListSchools";

export const Schools = () => {
  return (
        <Routes>
          <Route path="create" element={<CreateSchool />} />
          <Route path="list" element={<ListSchools />} />
          <Route path="info" element={<h1>School Info</h1>} />
          <Route path="*" element={<Navigate from="*" to="list" />} />
        </Routes>
  );
}
