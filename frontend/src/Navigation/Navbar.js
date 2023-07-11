import React from "react";
import GuestNavbar from "./GuestNavbar";
import UserNavbar from "./UserNavbar";

function Navbar({user, setUser}) {
    return (
        <>
            {user ? <UserNavbar user={user} setUser={setUser} />: <GuestNavbar user={user} setUser={setUser} />} 
        </>
    );
}

export default Navbar;


