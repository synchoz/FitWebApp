import React from 'react';
import { Link } from "react-router-dom";


function Navigation(){
    return(
            <div>
            <nav>
                <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                </ul>
            </nav>
        
            <hr />
        
            {/* <Outlet /> */}
            </div>
            );
};
    


export default Navigation;