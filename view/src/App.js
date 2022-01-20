import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Header } from "./headers/Header";
import { Schools } from "./schools/Schools";
import { Users } from "./users/Users";

export const App = () => {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="Schools/*" element={<Schools />} />
        <Route path="Users/*" element={<Users />} />
        <Route path="Students" element={<label>Students List</label>} />
        <Route path="Routes" element={<label>Routes List</label>} />
        <Route path="*" element={<label>Whoops</label>} />
      </Routes>
    </div>
  );
}
