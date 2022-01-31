import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./headers/Header";
import { BusRoutes } from "./routes/BusRoutes";
import { Schools } from "./schools/Schools";
import { useState } from 'react';
import LoginPage from './login/LoginPage';
import { Students } from "./students/Students";
import { Users } from "./users/Users";

export const App = () => {

  const [ loggedIn, setLoggedIn ] = useState(sessionStorage.getItem("token") != null);

  if (!loggedIn) {
    return <div >
        <Routes>
          <Route path="/LogIn" element={<LoginPage setLoggedIn={setLoggedIn} />} />
          <Route path="*" element={<Navigate to="/LogIn" />} />
        </Routes>
      </div>
  }
  else {
    return (
      <div className="App">
        <Header setLoggedIn={setLoggedIn}/>
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
}
