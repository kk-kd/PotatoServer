import { Navigate, Route, Routes } from "react-router-dom";
import { ListStudents } from "./ListStudents";
import { StudentDetail } from "./StudentDetail";
import { EditStudent } from "./EditStudent";
import { StudentForm } from "./StudentForm";

export const Students = () => {
  return (
    <Routes>
      <Route path="list" element={<ListStudents />} />
      <Route path="info/:id" element={<StudentDetail />} />
      <Route path="edit/:id" element={<EditStudent />} />
      <Route path="create" element={<StudentForm/>} />
      <Route path="*" element={<Navigate from="*" to="list" />} />
    </Routes>
  );
};
