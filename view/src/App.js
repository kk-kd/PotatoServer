import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Header } from "./headers/Header";

export const App = () => {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/Schools" element={<label>Schools List</label>} />
        <Route path="/Users" element={<label>Users List</label>} />
        <Route path="/Students" element={<label>Students List</label>} />
        <Route path="/Routes" element={<label>Routes List</label>} />
        <Route path="" element={<label>Whoops</label>} />
      </Routes>
    </div>
  );
}
