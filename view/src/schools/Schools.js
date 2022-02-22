import { Navigate, Route, Routes } from "react-router-dom";
import { SchoolForm } from "./SchoolForm";
import { ListSchools } from "./ListSchools";
import { SchoolInfo } from "./SchoolInfo";

export const Schools = () => {
  return (
        <Routes>
          <Route path="create" element={<SchoolForm />} />
          <Route path="list" element={<ListSchools />} />
          <Route path="info/:id" element={<SchoolInfo edit = {false}/>} />
          <Route path="*" element={<Navigate from="*" to="list" />} />
        </Routes>
  );
}
