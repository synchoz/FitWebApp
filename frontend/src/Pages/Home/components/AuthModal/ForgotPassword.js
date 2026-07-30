import React, { useState } from 'react';
import CustomInput from '../CustomInput/CustomInput';
import authService from '../../../../API/Services/auth.service';
import getErrorMessage from '../../../../API/getErrorMessage';

const required = (value) => {
    if (!value) {
      return (
        <div className="invalid-feedback d-block">
          This field is required!
        </div>
      );
    }
  };

function ForgotPassword({setForgotSeen}) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleClose = () => {
        setForgotSeen(false);
    }

    const handleChange = (event) => {
        setMessage("");
        setEmail(event.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            setMessage('Enter your email address');
            return;
        }
        setLoading(true);
        setMessage("");

        authService.forgotPassword(email).then(
            (data) => {
                setLoading(false);
                setIsSuccess(true);
                setMessage(data.message || 'If an account exists for that email, a reset link has been sent');
            },
            (error) => {
                setLoading(false);
                setMessage(getErrorMessage(error));
            }
        );
    }

    return (
        <div className='registerNewPopup'>
            <div className='registerPopupContent bg-[#353535]'>
                <div className='flex justify-between m-auto w-10/12 mb-7'>
                    <p className='pt-3 text-[25px] text-white font-bold'>Reset Password</p>
                    <button className='close  text-right mr-1 cursor-pointer text-[38px] text-white hover:font-bold ease-in duration-100' onClick={handleClose}>&times;</button>
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
                            validations={[required]}
                        />
                    </div>
                    {message && (
                        <div>
                            <div className={`font-bold text-xl ${isSuccess ? "text-green-700" : "text-red-700"}`}>{message}</div>
                        </div>
                    )}
                    <button className='mb-2 font-bold border-0 w-10/12 text-center
                                            rounded-md text-white bg-red-600 py-4 cursor-pointer hover:bg-yellow-400
                                            hover:text-black duration-150 ease-out hover:ease-in flex justify-center'
                            type="submit"
                            disabled={loading || isSuccess}
                    >
                        {loading && <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-7 w-7"></div>}
                        <div className='ml-3'>Send reset link</div>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ForgotPassword;
