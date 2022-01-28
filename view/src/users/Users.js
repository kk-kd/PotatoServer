import { Navigate, Route, Routes } from "react-router-dom";
import { CreateUser } from "./CreateUser";
import { ListUsers } from "./ListUsers";
import { UserDetail } from "./UserDetail";

export const Users = () => {
  return (
      <Routes>
        <Route path="list" element={<ListUsers />} />
        <Route path ="info/:id" element = {<UserDetail/>} /> 
        <Route path="create" element={<CreateUser />} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
//
