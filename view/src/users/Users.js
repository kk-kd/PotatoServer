import { Navigate, Route, Routes } from "react-router-dom";
import { ListUsers } from "./ListUsers";

export const Users = () => {
  return (
      <Routes>
        <Route path="list" element={<ListUsers />} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
