import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (event) => {
        setMessage("");
        const { name, value } = event.target;
        name === 'newPassword' ? setNewPassword(value) : setConfirmPassword(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!token) {
            setMessage('This reset link is missing or invalid.');
            return;
        }
        if (!newPassword || newPassword !== confirmPassword) {
            setMessage('Passwords must match and cannot be empty.');
            return;
        }

        setLoading(true);
        setMessage("");
        authService.resetPassword(token, newPassword).then(
            () => {
                setLoading(false);
                setIsSuccess(true);
                setMessage('Password has been reset. Redirecting to login...');
                setTimeout(() => navigate('/'), 2000);
            },
            (error) => {
                setLoading(false);
                setMessage(getErrorMessage(error));
            }
        );
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-black'>
            <div className='registerPopupContent bg-[#353535] p-8 rounded-md'>
                <div className='flex justify-between m-auto w-10/12 mb-7'>
                    <p className='pt-3 text-[25px] text-white font-bold'>Set a new password</p>
                </div>
                <form className='flex h-3/4 justify-between flex-col items-center' onSubmit={handleSubmit}>
                    <div className='w-full flex flex-col justify-evenly h-3/5'>
                        <CustomInput
                            type="password"
                            name="newPassword"
                            placeholder="New password..."
                            value={newPassword}
                            onChange={handleChange}
                            className="w-10/12"
                            validations={[required]}
                        />
                        <CustomInput
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm new password..."
                            value={confirmPassword}
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
                        <div className='ml-3'>Reset Password</div>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
