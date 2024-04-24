import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import authService from '../../API/Services/auth.service';
/* import dashboardService from '../../API/Services/dashboard.service'; */
import {React,useState, useEffect} from 'react';
import "../SharedNavbar/style.css"
import { useUserContext } from '../UserData/UserData';

const navigation = [
    {name: 'Profile', href: '/Profile'},
    {name: 'Home', href: '/Home', icon: 'iconDashboard'},
    {name: 'Calendar', href: '/Calendar', icon: 'iconTraining'},
]
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}


/* const isInNavigation = navigation.some((navItem) => navItem.href === item.current); */

export default function UserNavbar({user, setUser}) {
    const {state} = useUserContext();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const handleLogout = () => {
        authService.logout();
        setUser(authService.getCurrentUser);
        navigate('/');
    }
    return (
        <div className={classNames(
            user && navigation.some((navItem) => navItem.href === currentPath) ? 'fixed w-[65px] h-full bg-sky-950' 
                : 'hidden'
        )}>
            <div className='container w-16 bg-sky-950 flex flex-col justify-around float-left sticky top-0  h-3/4 overflow-y-auto'>
                {/* <div className='flex justify-center'>
                    <div className='profileImg bg-cover bg-center h-12 w-12 min-w-[20%] border-2 border-gray-400 rounded-full '></div>
                </div> */}
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
                            {navItem.name == 'Profile'  ?   <div className='flex justify-center topnav'>
                                                               <div className='profileImg bg-cover bg-center h-12 w-12 min-w-[20%] border-2 border-gray-400 rounded-full ' style={{backgroundImage: `url(${state.imageLink})`}}></div>
                                                            </div> 
                                                        :   <div className='h-1/2 flex flex-col justify-center items-center topnav'>
                                <div className={'w-1/2 h-full iconGen ' + navItem.icon}></div>
                            </div>}
                        </NavLink>
                ))}
                <a onClick={handleLogout} className='cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium text-center'>Sign Out</a>
            </div>
        </div>
    )
}