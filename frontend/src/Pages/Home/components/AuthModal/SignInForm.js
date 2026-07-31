import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../CustomInput/CustomInput';
import { required, validEmail, runValidations } from '../CustomInput/validators';
import authService from '../../../../API/Services/auth.service';
import getErrorMessage from '../../../../API/getErrorMessage';

function SignInForm({ setUser, onClose, onRegisterToggle, onForgotToggle }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const navigate = useNavigate();

    const handleChange = React.useCallback((event) => {
        setMessage("");
        const { name, value } = event.target;
        name === 'email' ? setEmail(value) : setPassword(value);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("");
        setSubmitAttempted(true);

        const emailError = runValidations(email, [required, validEmail]);
        const passwordError = runValidations(password, [required]);
        if (emailError || passwordError) {
            setMessage('Please fix the highlighted fields');
            return;
        }

        setLoading(true);
        authService.login(email, password).then(
            () => {
                setUser(authService.getCurrentUser());
                navigate('/Home');
                window.location.reload();
            },
            (error) => {
                setLoading(false);
                setMessage(getErrorMessage(error));
            }
        )
    }

    return (
        <div className='registerPopupContent bg-[#353535]'>
            <div className='flex justify-between m-auto w-10/12 mb-7'>
                <p className='pt-3 text-[25px] text-white font-bold'>Sign In</p>
                <button className='close  text-right mr-1 cursor-pointer text-[38px] text-white hover:font-bold ease-in duration-100' onClick={onClose}>&times;</button>
            </div>
            <form className='flex h-3/4 justify-between flex-col items-center' onSubmit={handleSubmit}>
                <div className='w-full flex flex-col justify-evenly h-3/5'>
                    <CustomInput
                        type="email"
                        name="email"
                        placeholder="Enter your email..."
                        value={email}
                        onChange={handleChange}
                        className="w-10/12"
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
                        className="w-10/12"
                        validations={[required]}
                        forceValidate={submitAttempted}
                        autoComplete="current-password"
                    />
                </div>
                <div className='min-h-[3rem] flex items-center justify-center'>
                    {message && <div className='text-red-700 font-bold text-2xl mb-2'>{message}</div>}
                </div>
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
                        <button type="button" className='text-sky-700 pl-1  hover:underline' onClick={onRegisterToggle}>Sign up now</button>
                    </span>
                </div>
                <div>
                    <button type="button" className='text-sky-700 pl-1 hover:underline' onClick={onForgotToggle}>Forgot password?</button>
                </div>
            </form>
        </div>
    );
}

export default SignInForm;
