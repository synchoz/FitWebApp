import React from "react";
import GuestNavbar from "./GuestNavbar";
import UserNavbar from "../DashboardNavbar/UserNavbar";

function Navbar({user, setUser}) {
    return (
        <>
            <GuestNavbar user={user} setUser={setUser} />
            {user && <UserNavbar user={user} setUser={setUser} />} 
        </>
    );
}

export default Navbar;


