import { Navigate, Route, Routes } from "react-router-dom";
import { UserForm } from "./UserForm";
import { UserInfo } from "./UserInfo";
import { ListUsers } from "./ListUsers";

export const Users = () => {
  return (
      <Routes>
        <Route path="list" element={<ListUsers />} />
        <Route path ="info/:id" element={<UserInfo edit = {false}/>} />
        <Route path="create" element={<UserForm/>} />
        <Route path="edit/:id" element={<UserInfo edit = {true}/>} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
//
