import React, { useState } from 'react';
import './style.css';
import SignInForm from './SignInForm';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

function AuthModal({ setSeen, setUser }) {
    const [registerSeen, setRegisterSeen] = useState(false);
    const [forgotSeen, setForgotSeen] = useState(false);

    const handleToggle = () => {
        setSeen(false);
    }

    const handleRegisterToggle = () => {
        setRegisterSeen((current) => !current);
    };

    const handleForgotToggle = () => {
        setForgotSeen((current) => !current);
    };

    return (
        <div className='fixed z-[100] top-10 sm:top-[140px] left-1/2 -translate-x-1/2'>
            <div className={`registerPopup ${registerSeen ? 'hidden' : ''}`}>
                <SignInForm
                    setUser={setUser}
                    onClose={handleToggle}
                    onRegisterToggle={handleRegisterToggle}
                    onForgotToggle={handleForgotToggle}
                />
            </div>
            { registerSeen && <Register setRegisterSeen={setRegisterSeen} setSeen={setSeen}/> }
            { forgotSeen && <ForgotPassword setForgotSeen={setForgotSeen}/> }
        </div>
    )
}

export default AuthModal;
