import { Navigate, Route, Routes } from "react-router-dom";
import { CreateUser } from "./CreateUser";
import { ListUsers } from "./ListUsers";

export const Users = () => {
  return (
      <Routes>
        <Route path="list" element={<ListUsers />} />
        <Route path="create" element={<CreateUser />} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
