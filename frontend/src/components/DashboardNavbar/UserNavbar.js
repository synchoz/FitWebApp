import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { React } from 'react';
import {
    HomeIcon,
    CalendarDaysIcon,
    UserIcon,
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import authService from '../../API/Services/auth.service';
import { useUserContext } from '../UserData/UserData';

const navigation = [
    { name: 'Profile', href: '/Profile', icon: UserIcon },
    { name: 'Home', href: '/Home', icon: HomeIcon },
    { name: 'Calendar', href: '/Calendar', icon: CalendarDaysIcon },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function UserNavbar({user, setUser}) {
    const {state} = useUserContext();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const {username, email} = user ? JSON.parse(user) : {};

    const handleLogout = async () => {
        await authService.logout();
        setUser(authService.getCurrentUser());
        navigate('/');
    }

    const isVisible = navigation.some((navItem) => navItem.href === currentPath);

    return (
        <div className={classNames(
            isVisible ? 'fixed w-[220px] h-full bg-[#16233b] flex flex-col py-6' : 'hidden'
        )}>
            <div className='flex items-center gap-2.5 px-5 pb-6 mb-4 border-b border-white/10'>
                {state.imageLink
                    ? <div className='w-10 h-10 rounded-full bg-slate-700 bg-cover bg-center flex-shrink-0' style={{backgroundImage: `url(${state.imageLink})`}}></div>
                    : <UserCircleIcon className='w-10 h-10 text-slate-400 flex-shrink-0' />}
                <div className='min-w-0'>
                    <div className='text-[13px] font-semibold text-white truncate'>{username}</div>
                    <div className='text-[11px] text-slate-400 truncate'>{email}</div>
                </div>
            </div>
            <nav className='flex flex-col gap-1 flex-1'>
                {navigation.map((navItem) => {
                    const Icon = navItem.icon;
                    const active = currentPath === navItem.href;
                    return (
                        <NavLink
                            key={navItem.name}
                            to={navItem.href}
                            title={navItem.name}
                            className={classNames(
                                'flex items-center gap-3 px-5 py-2.5 text-sm border-l-[3px]',
                                active
                                    ? 'bg-violet-600/15 border-violet-600 text-white'
                                    : 'border-transparent text-slate-300 hover:bg-white/5'
                            )}
                        >
                            <Icon className='w-[18px] h-[18px] flex-shrink-0' />
                            {navItem.name}
                        </NavLink>
                    );
                })}
            </nav>
            <div className='border-t border-white/10 pt-3'>
                <button
                    onClick={handleLogout}
                    className='flex items-center gap-3 px-5 py-2.5 text-sm text-red-400 hover:bg-white/5 w-full text-left'
                >
                    <ArrowLeftOnRectangleIcon className='w-[18px] h-[18px] flex-shrink-0' />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
