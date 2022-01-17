import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Header } from "./headers/Header";
import { Schools } from "./schools/Schools";
import React, { useState } from 'react';
import LoginPage from './login/LoginPage';

export const App = () => {
  const [token, setToken] = useState()
  if (!token) {
    return <LoginPage setToken={setToken} />
  }
  else {
    return (
      <div className="App">
        <Header />
        <Routes>
          <Route path="Schools/*" element={<Schools />} />
          <Route path="Users" element={<label>Users List</label>} />
          <Route path="Students" element={<label>Students List</label>} />
          <Route path="Routes" element={<label>Routes List</label>} />
          <Route path="*" element={<label>Whoops</label>} />
        </Routes>
      </div>
    );
  }
}
