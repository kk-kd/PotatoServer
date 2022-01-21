import { Navigate, Route, Routes } from "react-router-dom";
import { BusRouteInfo } from "./BusRouteInfo";
import { BusRoutePlanner } from "./BusRoutePlanner";
import { ListBusRoutes } from "./ListBusRoutes";

export const BusRoutes = () => {
  return (
      <Routes>
        <Route path="list" element={<ListBusRoutes />} />
        <Route path="planner/:schoolId" element={<BusRoutePlanner />} />
        <Route path="info/:id" element={<BusRouteInfo />} />
        <Route path="*" element={<Navigate from="*" to="list" />} />
      </Routes>
  );
}
