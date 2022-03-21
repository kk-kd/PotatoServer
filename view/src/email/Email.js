import { Navigate, Route, Routes } from "react-router-dom";
import { EmailForm } from "./EmailForm";


export const Emails = ({ role }) => {
  return (
    <Routes>
      <Route path="/send" element={<EmailForm role={role} />} />
      <Route path="/send/:schoolid" element={<EmailForm role={role} />} />
      <Route path="/send/:schoolid/:routeid" element={<EmailForm role={role} />} />
      <Route path="*" element={<Navigate from="*" to="/send" />} />
    </Routes>
  );
};
