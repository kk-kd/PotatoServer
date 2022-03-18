import { Navigate, Route, Routes } from "react-router-dom";
import { SchoolForm } from "./SchoolForm";
import { ListSchools } from "./ListSchools";
import { SchoolInfo } from "./SchoolInfo";

export const Schools = ({ role }) => {
  if (role === "Admin") {
    return (
        <Routes>
          <Route path="create" element={<SchoolForm />} />
          <Route path="list" element={<ListSchools role={role} />} />
          <Route path="info/:id" element={<SchoolInfo role={role} edit={false}/>} />
          <Route path="*" element={<Navigate from="*" to="list" />} />
        </Routes>
    )
  }
  return (
        <Routes>
          <Route path="list" element={<ListSchools role={role} />} />
          <Route path="info/:id" element={<SchoolInfo role={role} edit={false}/>} />
          <Route path="*" element={<Navigate from="*" to="list" />} />
        </Routes>
  );
}
