import { Navigate, Route, Routes } from "react-router-dom";
import { ListStudents } from "./ListStudents";
import { StudentInfo } from "./StudentInfo";
import { StudentForm } from "./StudentForm";

export const Students = ({ role }) => {
  if (role === "Admin" || role === "School Staff") {
    return (
        <Routes>
          <Route path="list" element={<ListStudents role={role} />} />
          <Route path="info/:id" element={<StudentInfo edit={false} role={role} />} />
          <Route path="edit/:id" element={<StudentInfo edit={true} role={role} />} />
          <Route path="create" element={<StudentForm/>} />
          <Route path="*" element={<Navigate from="*" to="list" />} />
        </Routes>
    );
  }
  return (
    <Routes>
      <Route path="list" element={<ListStudents role={role} />} />
      <Route path="info/:id" element={<StudentInfo edit={false} role={role} />} />
      <Route path="edit/:id" element={<StudentInfo edit={true} role={role} />} />
      <Route path="*" element={<Navigate from="*" to="list" />} />
    </Routes>
  );
};
