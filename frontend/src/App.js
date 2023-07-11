import "./index.css";
//import NavbarMain from "./Navigation/NavbarMain.js";
import Main from "./Main/Main";
import Home from "./SubMain/Home";
import Calendar from "./SubMain/Calendar";
import Profile from "./SubMain/Profile";
import Navbar from "./Navigation/Navbar";
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import PublicPage from "./Main/PublicPage";
import LoginPage from "./Main/LoginPage";
import ProtectedPage from "./ProtectedPage";
import React, { useEffect, useState } from 'react';
/* import Navigation from "./Main/Navigation"; */


const ProtectedRoute = ({user,redirectPath = '/',children,}) => {
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
}; 

function App() {
  
  const [user, setUser] = useState(null);
  return (
    <div>
      <BrowserRouter>
        <Navbar user={user} setUser={setUser}/>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {user ? <Route element={<ProtectedRoute user={user} />}>
                    <Route path="/Home" element={<Home />} exact/>
                    <Route path="/Calendar" element={<Calendar />} exact/>
                    <Route path="/Profile" element={<Profile />} exact/>
                  </Route>
                : <Route path="/" index element={<PublicPage />} />}
        </Routes>
      </BrowserRouter>
    </div>
  );
}; 

export default App;