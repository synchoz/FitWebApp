import "./index.css";
import Main from "./Pages/Home/Main";
import Home from "./Pages/Dashboard/Home/Home";
import Calendar from "./Pages/Dashboard/Logs/Calendar";
import Profile from "./Pages/Dashboard/Profile/Profile";
import Admin from "./Pages/Dashboard/Admin/Admin";
import ResetPassword from "./Pages/Home/components/ResetPassword/ResetPassword";
import Navbar from "./components/SharedNavbar/Navbar";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import React, { useState } from 'react';
import authService from "./API/Services/auth.service";
import { UserContextProvider } from "./components/UserData/UserData";
import { ThemeProvider } from "./components/ThemeContext/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";



const ProtectedRoute = ({user,redirectPath = '/',children,}) => {
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

const AdminRoute = ({user,redirectPath = '/Home',children,}) => {
  if (!user || !authService.isAdmin()) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

function App() {
  
  const [user, setUser] = useState(authService.getCurrentUser());
  return (
    <ThemeProvider>
    <div className="overflow-x-hidden h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <BrowserRouter>
        <UserContextProvider>
          <Navbar user={user} setUser={setUser}/>
          <ErrorBoundary>
            <Routes>
              {user && <Route element={<ProtectedRoute user={user} />}>
                        <Route path="/Home" element={<Home />} exact/>
                        <Route path="/Calendar" element={<Calendar />} exact/>
                        <Route path="/Profile" element={<Profile />} exact/>
                      </Route>}
              {user && <Route element={<AdminRoute user={user} />}>
                        <Route path="/Admin" element={<Admin />} exact/>
                      </Route>}
                    <Route path="/" index element={<Main user={user} setUser={setUser}/>} />
                    <Route path="/reset-password" element={<ResetPassword/>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </UserContextProvider>
      </BrowserRouter>
    </div>
    </ThemeProvider>
  );
};

export default App;