import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Header } from "./headers/Header";
import { BusRoutes } from "./routes/BusRoutes";
import { Schools } from "./schools/Schools";
import { Students } from "./students/Students";
import { Users } from "./users/Users";

export const App = () => {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="Schools/*" element={<Schools />} />
        <Route path="Users/*" element={<Users />} />
        <Route path="Students/*" element={<Students />} />
        <Route path="Routes/*" element={<BusRoutes />} />
        <Route path="*" element={<label>Whoops</label>} />
      </Routes>
    </div>
  );
}
