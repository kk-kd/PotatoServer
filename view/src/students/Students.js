import { Navigate, Route, Routes } from "react-router-dom";
import { ListStudents } from "./ListStudents";
import { StudentDetail } from "./StudentDetail";

export const Students = () => {
  return (
    <Routes>
      <Route path="list" element={<ListStudents />} />
      <Route path="info/:id" element={<StudentDetail />} />
      <Route path="*" element={<Navigate from="*" to="list" />} />
    </Routes>
  );
};
