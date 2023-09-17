import React, { Button, input, form, useState, setState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import './style.css';
import CustomInput from '../CustomInput/CustomInput';
import authService from '../../../../API/Services/auth.service';
import Register from './Register';

const required = (value) => {
    if (!value) {
      return (
        <div className="invalid-feedback d-block">
          This field is required!
        </div>
      );
    }
  };

  function ModalOverlay({ onClick }) {
    return (
        <div 
            className="fixed inset-0 bg-black opacity-50 z-50" 
            onClick={onClick}
        />
    );
}

function RegisterForm({setSeen,user,setUser}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate  = useNavigate();
    const [registerSeen, setRegisterSeen] = useState(false);

    const form = useRef();
    const checkBtn = useRef();

    const handleToggle = () => {
        setSeen(false);
    }

    const handleChange = React.useCallback((event) => {
        setMessage("");
        const { name, value } = event.target;
        name == 'email' ? setEmail(value) : setPassword(value);
    }, []);
    

    const handleSubmit = (e) => {
        
        e.preventDefault();
        setLoading(true);
        setMessage("");
        const isError =  password.length > 0 && email.length > 0 ? false : true ;
       /*  setErrors(error); */
        /* form.current.validateAll(); */
        if(!isError) {
            authService.login(email,password).then(
                () => {
                    setUser(authService.getCurrentUser());
                    navigate('/home');
                    window.location.reload();
                },
                (error) => {
                    const resMessage = 
                        (error.response && 
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();
                        setLoading(false);
                        setMessage(resMessage);
                }
            )
        } else {
            setLoading(false);
            setMessage('Missing details');
        }
    }
    
    const handleRegisterToggle = () => {
        setRegisterSeen((current) => !current);
    };

    return(
        <div className='fixed z-[100] top-[160px]'>
            { <div className={`registerPopup ${ registerSeen ? 'hidden': ''}`}>
                <div className='registerPopupContent bg-[#353535]'>
                    <div className='flex justify-between m-auto w-10/12 mb-7'>
                        <p className='pt-3 text-[25px] text-white font-bold'>Sign In</p>
                        
                        
                        <button className='close  text-right mr-1 cursor-pointer text-[38px] text-white hover:font-bold ease-in duration-100' onClick={handleToggle}>&times;</button>
                    </div>
                    <form className='flex h-3/4 justify-between flex-col items-center' onSubmit={handleSubmit} ref={form}>
                        <div className='w-full flex flex-col justify-evenly h-3/5'>
                            <CustomInput 
                                type="email"
                                name="email"
                                placeholder="Enter your email..."
                                value={email}
                                errors={errors}
                                onChange={handleChange}
                                className="w-10/12"
                                validations={[required]}
                            />
                            <CustomInput 
                                type="password"
                                name="password"
                                placeholder="Enter your password..."
                                value={password}
                                errors={errors}
                                onChange={handleChange}
                                className="w-10/12"
                                validations={[required]}
                            />
                        </div>
                        {message && (
                            <div>
                                <div className='text-red-700 font-bold text-2xl mb-2'>{message}</div>
                            </div>
                        )}
                        <button className='mb-2 font-bold border-0 w-10/12 text-center 
                                                rounded-md text-white bg-red-600 py-4 cursor-pointer hover:bg-yellow-400 
                                                hover:text-black duration-150 ease-out hover:ease-in flex justify-center'
                                type="submit"
                                disabled={loading}
                        > 
                            {loading && <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-7 w-7"></div>}
                            <div className='ml-3'>Log In</div>
                            </button>
                            <div>
                                <span className='text-white'>Not a member? 
                                    <button className='text-sky-700 pl-1  hover:underline' onClick={handleRegisterToggle}>Sign up now</button>
                                </span>
                            </div>
                    </form>
                    
                </div>
            </div>}
            { registerSeen && <Register setRegisterSeen={setRegisterSeen} setSeen={setSeen}/> }
        </div>

    ) 
}

export default RegisterForm;