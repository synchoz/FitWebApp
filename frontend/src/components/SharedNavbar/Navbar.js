import {React, useEffect } from "react";
import GuestNavbar from "./GuestNavbar";
import UserNavbar from "../DashboardNavbar/UserNavbar";
import { UserContextProvider, useUserContext } from "../UserData/UserData";
import dashboardService from "../../API/Services/dashboard.service";
import authService from "../../API/Services/auth.service";

async function getUserInfo() {
    return await dashboardService.getUserInfo(JSON.parse(authService.getCurrentUser()).username);
}

function Navbar({user, setUser}) {
    const { state, dispatch } = useUserContext();

    useEffect(() => {
        getUserInfo().then(res => {
            dispatch({type: 'SET_IMAGE', payload: res.result.imagelink});
        })
    }, []);

    return (
        <>
            <GuestNavbar user={user} setUser={setUser} />
            {user && <UserNavbar user={user} setUser={setUser} />} 
        </>
    );
}

export default Navbar;


