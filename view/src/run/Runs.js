import { Navigate, Route, Routes } from "react-router-dom";
import { RunLogs } from "./RunLogs";
import { RunMap } from "./RunMap";

export const Runs = ({ role, uid }) => {
  if (role === "Admin" || role === "School Staff") {
    return (
        <Routes>
          <Route path="logs" element={<RunLogs role={role} />} />
          <Route path="map" element={<RunMap />} />
          <Route path="*" element={<Navigate from="*" to="logs" />} />
        </Routes>
    );
  }
  return (
      <Routes>
        <Route path="logs" element={<RunLogs role={role} />} />
        <Route path="map" element={<RunMap />} />
        <Route path="*" element={<Navigate from="*" to="logs" />} />
      </Routes>
  );
}