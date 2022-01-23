import { Navigate, Route, Routes } from "react-router-dom";
import { CreateUser } from "./CreateUser";
import { ListUsers } from "./ListUsers";
import { ShowUserDetail } from "./ShowUserDetail";

export const Users = () => {
  return (
      <Routes>
        <Route path="list" element={<ListUsers />} />
        <Route path ="info/*" element = {<ShowUserDetail/>} />
        <Route path="create" element={<CreateUser />} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
//
