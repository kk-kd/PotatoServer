import { Navigate, Route, Routes } from "react-router-dom";
import { BusRouteInfo } from "./BusRouteInfo";
import { BusRouteNavigation } from "./BusRouteNavigation";
import { BusRoutePlanner } from "./BusRoutePlanner";
import { ListBusRoutes } from "./ListBusRoutes";

export const BusRoutes = ({ role }) => {
  if (role === "Admin" || role === "School Staff") {
    return (
        <Routes>
          <Route path="list" element={<ListBusRoutes />} />
          <Route path="planner/:schoolId" element={<BusRoutePlanner />} />
          <Route path="info/:id" element={<BusRouteInfo role={role} />} />
          <Route path="navigation/:id" element={<BusRouteNavigation />} />
          <Route path="*" element={<Navigate from="*" to="list" />} />
        </Routes>
    );
  }
  return (
      <Routes>
        <Route path="list" element={<ListBusRoutes />} />
        <Route path="info/:id" element={<BusRouteInfo role={role} />} />
        <Route path="navigation/:id" element={<BusRouteNavigation />} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
