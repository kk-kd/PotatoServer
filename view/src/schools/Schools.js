import { Navigate, Route, Routes } from "react-router-dom";
import { CreateSchool } from "./CreateSchool";
import { ListSchools } from "./ListSchools";
import { SchoolInfo } from "./SchoolInfo";

export const Schools = () => {
  return (
        <Routes>
          <Route path="create" element={<CreateSchool />} />
          <Route path="list" element={<ListSchools />} />
          <Route path="info/:id" element={<SchoolInfo />} />
          <Route path="*" element={<Navigate from="*" to="list" />} />
        </Routes>
  );
}
