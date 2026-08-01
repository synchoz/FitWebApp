import React, { useState } from 'react';
import CustomInput from '../CustomInput/CustomInput';
import { required, validEmail, strongPassword, runValidations } from '../CustomInput/validators';
import authService from '../../../../API/Services/auth.service';
import getErrorMessage from '../../../../API/getErrorMessage';

function Register({setRegisterSeen}) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);


    const handleRegisterToggle = () => {
        setRegisterSeen(false);
    }

    const handleChange = React.useCallback((event) => {
        setMessage("");
        const { name, value } = event.target;
        switch (name) {
            case 'email':
                setEmail(value);
                break;
            case 'username':
                setUsername(value);
                break;
            case 'password':
                setPassword(value);
                break;
            default:
                break;
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("");
        setSubmitAttempted(true);

        const usernameError = runValidations(username, [required]);
        const emailError = runValidations(email, [required, validEmail]);
        const passwordError = runValidations(password, [required, strongPassword]);
        if (usernameError || emailError || passwordError) {
            setMessage('Please fix the highlighted fields');
            return;
        }

        setLoading(true);
        authService.register(username,email,password).then(
            () => {
                setMessage("User have been created!");
                setIsSuccess(true);
                setTimeout(() => setRegisterSeen(false), 2000);
            },
            (error) => {
                setLoading(false);
                setMessage(getErrorMessage(error));
            }
        )
    }

    return (
        <div className='registerNewPopup'>
            <div className='registerPopupContent bg-[#353535]'>
                <div className='flex justify-between w-full mb-6'>
                    <p className='pt-3 text-[22px] text-white font-bold'>Sign Up</p>
                    <button className='close  text-right mr-1 cursor-pointer text-[38px] text-white hover:font-bold ease-in duration-100' onClick={handleRegisterToggle}>&times;</button>
                </div>
                <form className='flex h-3/4 justify-between flex-col items-center w-full' onSubmit={handleSubmit} /* ref={form} */>
                    <div className='w-full flex flex-col justify-evenly h-3/5'>
                        <CustomInput
                            type="text"
                            name="username"
                            placeholder="Enter your username..."
                            value={username}
                            onChange={handleChange}
                            validations={[required]}
                            forceValidate={submitAttempted}
                            autoComplete="username"
                        />
                        <CustomInput
                            type="email"
                            name="email"
                            placeholder="Enter your email..."
                            value={email}
                            onChange={handleChange}
                            validations={[required, validEmail]}
                            forceValidate={submitAttempted}
                            autoComplete="email"
                        />
                        <CustomInput
                            type="password"
                            name="password"
                            placeholder="Enter your password..."
                            value={password}
                            onChange={handleChange}
                            validations={[required, strongPassword]}
                            forceValidate={submitAttempted}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className='min-h-[3rem] flex items-center justify-center'>
                        {message && <div className={`font-bold text-xl ${isSuccess? "text-green-700":"text-red-700"}`}>{message}</div>}
                    </div>
                    <button className='mb-2 font-bold border-0 w-full text-center
                                            rounded-md text-white bg-red-600 py-4 cursor-pointer hover:bg-yellow-400 
                                            hover:text-black duration-150 ease-out hover:ease-in flex justify-center'
                            type="submit"
                            disabled={loading}
                    > 
                        {loading && <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-7 w-7"></div>}
                        <div className='ml-3'>Register</div>
                        </button>
                </form>
            </div>
        </div>
    ) 

}

export default Register;