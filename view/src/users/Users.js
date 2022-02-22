import { Navigate, Route, Routes } from "react-router-dom";
import { CreateUserStudent } from "./CreateUserStudent";
import { UserForm } from "./UserForm";
import { UserInfo } from "./UserInfo";
import { ListUsers } from "./ListUsers";
import { UserDetail } from "./UserDetail";

export const Users = () => {
  return (
      <Routes>
        <Route path="list" element={<ListUsers />} />
        <Route path ="info/:id" element={<UserInfo edit = {true}/>} />
        <Route path="create" element={<UserForm/>} />
        <Route path="edit/:id" element={<UserInfo edit = {true}/>} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
//
