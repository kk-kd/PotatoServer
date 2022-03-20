import { Navigate, Route, Routes } from "react-router-dom";
import { UserForm } from "./UserForm";
import { UserInfo } from "./UserInfo";
import { ListUsers } from "./ListUsers";

export const Users = ({ role, uid }) => {
  if (role === "Admin" || role === "School Staff") {
    return (
        <Routes>
          <Route path="list" element={<ListUsers role={role} />} />
          <Route path ="info/:id" element={<UserInfo edit={false} role={role} uid={uid} />} />
          <Route path="create" element={<UserForm role={role} />} />
          <Route path="edit/:id" element={<UserInfo edit={true} role={role} uid={uid} />} />
          <Route path="*" element={<Navigate from="*" to="list" />} />
        </Routes>
    );
  }
  return (
      <Routes>
        <Route path="list" element={<ListUsers role={role} />} />
        <Route path ="info/:id" element={<UserInfo edit={false} role={role} uid={uid} />} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
//
