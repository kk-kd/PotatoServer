import { Navigate, Route, Routes } from "react-router-dom";
import { ListStudents } from "./ListStudents";
import { StudentInfo } from "./StudentInfo";

export const Students = () => {
  return (
      <Routes>
        <Route path="list" element={<ListStudents />} />
        <Route path="info/:id" element={<StudentInfo />} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
