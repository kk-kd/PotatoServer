import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./headers/Header";
import { BusRoutes } from "./routes/BusRoutes";
import { Schools } from "./schools/Schools";
import { useEffect, useState } from "react";
import LoginPage from "./login/LoginPage";
import { Runs } from "./run/Runs";
import { Students } from "./students/Students";
import { Users } from "./users/Users";
import { returnUserInfoFromJWT } from "./api/axios_wrapper";
import { MyStudents } from "./parents/MyStudents";
import { ParentStudentInfo } from "./parents/ParentStudentInfo";
import { ChangeMyPassword } from "./parents/ChangeMyPassword";
import { Emails } from "./email/Email";
import { PasswordForgotForm } from "./login/PasswordForgotForm";
import { PasswordResetForm } from "./login/PasswordResetForm";
import { Import } from "./import/Import";


export const App = () => {
  
  const [loggedIn, setLoggedIn] = useState(
    sessionStorage.getItem("token") != null
  );
  const [currentUser, setCurrentUser] = useState();
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const currentUserData = await returnUserInfoFromJWT();
        setCurrentUser(currentUserData.data);
      } catch (e) {
        alert(e.response.data);
      }
    };
    if (loggedIn) {
      getCurrentUser();
    }
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <div className="App">
        <Routes>
          <Route
            path="/LogIn"
            element={<LoginPage setLoggedIn={setLoggedIn} />}
          />
          <Route
            path="/PasswordForgot"
            element={<PasswordForgotForm />}
          />
          <Route
            path="/PasswordReset/:token"
            element={<PasswordResetForm />}
          />
          <Route path="*" element={<Navigate to="/LogIn" />} />
        </Routes>
      </div>
    );
  } else {
    if (!currentUser) {
      return <h1>Loading</h1>;
    } else if (currentUser.role === "Parent") {
      return (
        <div className="App">
          <Header setLoggedIn={setLoggedIn} role={currentUser.role} />
          <Routes>
            <Route path="ChangeMyPassword" element={<ChangeMyPassword />} />
            <Route
              path="MyStudents/:id"
              element={<ParentStudentInfo user={currentUser} />}
            />
            <Route
              path="MyStudents"
              element={<MyStudents user={currentUser} />}
            />
            <Route path="*" element={<Navigate to="MyStudents" />} />
          </Routes>
        </div>
      );
    } else if (currentUser.role === "Student") {
      return (
          <div className="App">
            <Header setLoggedIn={setLoggedIn} role={currentUser.role} />
            <Routes>
              <Route path="ChangeMyPassword" element={<ChangeMyPassword />} />
              <Route
                  path="MyStudents/:id"
                  element={<ParentStudentInfo user={currentUser} />}
              />
              <Route path="*" element={<Navigate to={`MyStudents/${currentUser.studentInfo.uid}`} />} />
            </Routes>
          </div>
      );
    } else {
      return (
        <div className="App">
          <Header setLoggedIn={setLoggedIn} role={currentUser.role} />
          <Routes>
            <Route path="ChangeMyPassword" element={<ChangeMyPassword />} />
            <Route path="Schools/*" element={<Schools role={currentUser.role} />} />
            <Route path="Users/*" element={<Users role={currentUser.role} uid={currentUser.uid} />} />
            <Route path="Students/*" element={<Students role={currentUser.role} />} />
            <Route path="Routes/*" element={<BusRoutes role={currentUser.role} />} />
            <Route path="Runs/*" element={<Runs role={currentUser.role} />} />
            {currentUser.role !== "Driver" && <Route path="Emails/*" element={<Emails role={currentUser.role} />} />}
            <Route path="Import/*" element={<Import />} />
            <Route path="*" element={<Navigate to="Schools" />} />
          </Routes>
        </div>
      );
    }
  }
};
