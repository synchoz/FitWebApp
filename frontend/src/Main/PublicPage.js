import React from 'react'
import Main from './Main';
import Home from '../SubMain/Home';
import { BrowserRouter, Routes, Route, Link,Navigate } from "react-router-dom";

function PublicPage() {
    return (
        <>
       {/*  <div>
            <nav>
                <Link to="home">To Home!</Link>
            </nav>
    
            <Routes>
                <Route path="home" element={<Home />} />
            </Routes>
        </div> */}
            <Main/>
        </>
    );
}

export default PublicPage;