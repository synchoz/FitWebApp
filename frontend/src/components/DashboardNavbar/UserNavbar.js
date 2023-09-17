import { NavLink, Link, useNavigate } from 'react-router-dom';
import authService from '../../API/Services/auth.service';
import React from 'react';
import "../SharedNavbar/style.css"

const navigation = [
    {name: 'Home', href: '/Home'},
    {name: 'Calendar', href: '/Calendar'},
    {name: 'Profile', href: '/Profile'},
]

export default function UserNavbar({user, setUser}) {
    const navigate = useNavigate();
    const handleLogout = () => {
        authService.logout();
        setUser(authService.getCurrentUser);
        navigate('/');
    }
    return (
        <div>
            <div className='bg-[#1B1C1E] w-full fixed top-0 float-right flex justify-end py-4 font-bold'>
                <div className='text-white w-24'>About us</div>
                <div className='text-white w-24'>Contact us</div>
            </div>
            <div className='container h-screen w-1/4 bg-sky-950 w-16 flex flex-col justify-around float-left h-full sticky top-0'>
                <div className='flex justify-center'>
                    <div className='profileImg bg-cover bg-center h-12 w-12 min-w-[20%] border-2 border-gray-400 rounded-full'></div>
                </div>
                    {navigation.map((navItem) => (
                        <NavLink 
                            key={navItem.name}
                            to={navItem.href}
                            title={navItem.name}
                            className={({isActive}) => {
                                return 'test h-20 ' + 
                                (isActive ? 'active' : 'notactive')
                            }}
                        >
                            <div className='h-1/2 flex flex-col justify-center items-center topnav'>
                                <div className='w-1/2 h-full iconGen iconTraining'></div>
                            </div>
                        </NavLink>
                ))}
                <a onClick={handleLogout} className='cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium text-center'>Sign Out</a>
            </div>
        </div>
    )
}