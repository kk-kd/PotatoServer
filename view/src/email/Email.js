import { Navigate, Route, Routes } from "react-router-dom";
import { EmailForm } from "./EmailForm";


export const Emails = () => {
  return (
    <Routes>
      <Route path="/send" element={<EmailForm />} />
      <Route path="*" element={<Navigate from="*" to="/send" />} />
    </Routes>
  );
};
