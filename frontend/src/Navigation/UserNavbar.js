import { NavLink, Link, useNavigate } from 'react-router-dom';
import React from 'react';
import "./style.css"

const navigation = [
    {name: 'Home', href: '/Home'},
    {name: 'Calendar', href: '/Calendar'},
    {name: 'Profile', href: '/Profile'},
]

export default function UserNavbar({user, setUser}) {
    const navigate = useNavigate();
    const handleLogout = () => {
        setUser(null);
        navigate('/');
    }
    return (
        <div className='container h-screen bg-[#1B1C1E] w-16 flex flex-col justify-around float-left h-full'>
            <a onClick={handleLogout} className='cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium text-center'>Sign Out</a>
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
        </div>
    )
}