import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { React, useState } from 'react';
import {
    HomeIcon,
    CalendarDaysIcon,
    UserIcon,
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import authService from '../../API/Services/auth.service';
import { useUserContext } from '../UserData/UserData';

const BASE_NAVIGATION = [
    { name: 'Profile', href: '/Profile', icon: UserIcon },
    { name: 'Home', href: '/Home', icon: HomeIcon },
    { name: 'Calendar', href: '/Calendar', icon: CalendarDaysIcon },
]

const ADMIN_NAV_ITEM = { name: 'Admin', href: '/Admin', icon: ShieldCheckIcon };

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function UserNavbar({user, setUser}) {
    const {state} = useUserContext();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const {username, email, role} = user ? JSON.parse(user) : {};
    const navigation = role === 'admin' ? [...BASE_NAVIGATION, ADMIN_NAV_ITEM] : BASE_NAVIGATION;
    const [expanded, setExpanded] = useState(false);

    const handleLogout = async () => {
        await authService.logout();
        setUser(authService.getCurrentUser());
        navigate('/');
    }

    const isVisible = navigation.some((navItem) => navItem.href === currentPath);

    if (!isVisible) {
        return null;
    }

    const avatar = (size) => state.imageLink
        ? <div className={`${size} rounded-full bg-slate-700 bg-cover bg-center flex-shrink-0`} style={{backgroundImage: `url(${state.imageLink})`}}></div>
        : <UserCircleIcon className={`${size} text-slate-400 flex-shrink-0`} />;

    const sidebarNav = (onNavigate) => (
        <>
            <div className='flex items-center gap-2.5 px-5 pb-6 mb-4 border-b border-white/10'>
                {avatar('w-10 h-10')}
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
                            onClick={onNavigate}
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
        </>
    );

    return (
        <>
            {/* Mobile icon rail */}
            <div className='md:hidden fixed top-0 left-0 h-full w-14 z-[100] bg-[#16233b] flex flex-col items-center py-4 gap-4 border-r border-white/10'>
                {avatar('w-9 h-9')}
                <nav className='flex flex-col items-center gap-1 flex-1'>
                    {navigation.map((navItem) => {
                        const Icon = navItem.icon;
                        const active = currentPath === navItem.href;
                        return (
                            <NavLink
                                key={navItem.name}
                                to={navItem.href}
                                title={navItem.name}
                                className={classNames(
                                    'flex items-center justify-center w-10 h-10 rounded-lg',
                                    active
                                        ? 'bg-violet-600/15 text-white'
                                        : 'text-slate-300 hover:bg-white/5'
                                )}
                            >
                                <Icon className='w-5 h-5 flex-shrink-0' />
                            </NavLink>
                        );
                    })}
                </nav>
                <button
                    onClick={() => setExpanded(true)}
                    title='Expand menu'
                    className='flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:bg-white/5'
                >
                    <span className='sr-only'>Expand menu</span>
                    <Bars3Icon className='w-5 h-5' />
                </button>
                <button
                    onClick={handleLogout}
                    title='Sign Out'
                    className='flex items-center justify-center w-10 h-10 rounded-lg text-red-400 hover:bg-white/5'
                >
                    <span className='sr-only'>Sign Out</span>
                    <ArrowLeftOnRectangleIcon className='w-5 h-5' />
                </button>
            </div>

            {/* Mobile expanded drawer */}
            {expanded && (
                <>
                    <div
                        className='md:hidden fixed inset-0 bg-black/40 z-[100]'
                        onClick={() => setExpanded(false)}
                    />
                    <div className='md:hidden fixed top-0 left-0 h-full w-[240px] z-[101] bg-[#16233b] flex flex-col py-6'>
                        <button
                            onClick={() => setExpanded(false)}
                            title='Collapse menu'
                            className='absolute top-4 right-3 p-1.5 text-slate-300 hover:text-white'
                        >
                            <span className='sr-only'>Collapse menu</span>
                            <XMarkIcon className='w-5 h-5' />
                        </button>
                        {sidebarNav(() => setExpanded(false))}
                    </div>
                </>
            )}

            {/* Desktop sidebar */}
            <div className='hidden md:flex fixed w-[220px] h-full bg-[#16233b] flex-col py-6'>
                {sidebarNav()}
            </div>
        </>
    )
}
