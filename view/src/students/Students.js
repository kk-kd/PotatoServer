import { Navigate, Route, Routes } from "react-router-dom";
import { ListStudents } from "./ListStudents";
import { StudentInfo } from "./StudentInfo";
import { StudentForm } from "./StudentForm";

export const Students = () => {
  return (
    <Routes>
      <Route path="list" element={<ListStudents />} />
      <Route path="info/:id" element={<StudentInfo edit = {false} />} />
      <Route path="edit/:id" element={<StudentInfo edit = {true} />} />
      <Route path="create" element={<StudentForm/>} />
      <Route path="*" element={<Navigate from="*" to="list" />} />
    </Routes>
  );
};
