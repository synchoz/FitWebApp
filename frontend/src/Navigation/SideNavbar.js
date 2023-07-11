import react from 'react';
import { NavLink } from 'react-router-dom';
import "./style.css"

const navigation = [
    {name: 'Home', href: '/Home'},
    {name: 'Calendar', href: '/Calendar'},
    {name: 'Settings', href: '#settings'},
]

export default function SideNavbar () {
    return (
        <div className='container h-screen bg-[#1B1C1E] w-16 flex flex-col justify-around'>
            {navigation.map((navItem, index) => (
                <div key={index} className='h-20'>
                    <NavLink 
                        key={navItem.name}
                        to={navItem.href}
                        className={({isActive}) => {
                        }}
                    >
                        <div className='h-1/2 flex flex-col justify-center items-center topnav active'>
                            <div className='w-1/2 h-full iconGen iconTraining'></div>
                        </div>
                    </NavLink>
                </div>
            ))}
        </div>
    )
}