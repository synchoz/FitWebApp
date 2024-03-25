import "./index.css";
import Main from "./Pages/Home/Main";
import Home from "./Pages/Dashboard/Home/Home";
import Calendar from "./Pages/Dashboard/Logs/Calendar";
import Profile from "./Pages/Dashboard/Profile/Profile";
import Navbar from "./components/SharedNavbar/Navbar";
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import authService from "./API/Services/auth.service";


const ProtectedRoute = ({user,redirectPath = '/',children,}) => {
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
}; 

function App() {
  
  const [user, setUser] = useState(authService.getCurrentUser());
  return (
    <div className="overflow-x-hidden h-screen">
      <BrowserRouter>
        <Navbar user={user} setUser={setUser}/>
        <Routes>
          {user && <Route element={<ProtectedRoute user={user} />}>
                    <Route path="/Home" element={<Home />} exact/>
                    <Route path="/Calendar" element={<Calendar />} exact/>
                    <Route path="/Profile" element={<Profile />} exact/>
                  </Route>}
                <Route path="/" index element={<Main user={user} setUser={setUser}/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}; 

export default App;