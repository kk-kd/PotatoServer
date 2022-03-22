import { Navigate, Route, Routes } from "react-router-dom";
import { ImportPage } from "./ImportPage";


export const Import = () => {
  return (
    <Routes>
      <Route path="/upload" element={<ImportPage />} /> 
      <Route path="*" element={<Navigate from="*" to="/upload" />} />
    </Routes>
  );
};
