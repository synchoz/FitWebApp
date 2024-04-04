import React, { useState, useRef } from 'react';
import CustomInput from '../CustomInput/CustomInput';
import authService from '../../../../API/Services/auth.service';



const required = (value) => {
    if (!value) {
      return (
        <div className="invalid-feedback d-block">
          This field is required!
        </div>
      );
    }
  };

function Register({setRegisterSeen}) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);


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
        }
    }, []);

    const handleSubmit = (e) => {
        
        e.preventDefault();
        setLoading(true);
        setMessage("");
        const isError =  password.length > 0 && email.length > 0 ? false : true ;

        if(!isError) {
            authService.register(username,email,password).then(
                () => {
                    setMessage("User have been created!");
                    setIsSuccess(true);
                    setTimeout(() => setRegisterSeen(false), 2000);
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

    return (
        <div className='registerNewPopup'>
            <div className='registerPopupContent bg-[#353535]'>
                <div className='flex justify-between m-auto w-10/12 mb-7'>
                    <p className='pt-3 text-[25px] text-white font-bold'>Sign Up</p>
                    <button className='close  text-right mr-1 cursor-pointer text-[38px] text-white hover:font-bold ease-in duration-100' onClick={handleRegisterToggle}>&times;</button>
                </div>
                <form className='flex h-3/4 justify-between flex-col items-center' onSubmit={handleSubmit} /* ref={form} */>
                    <div className='w-full flex flex-col justify-evenly h-3/5'>
                        <CustomInput 
                            type="username"
                            name="username"
                            placeholder="Enter your username..."
                            value={username}
                            errors={errors}
                            onChange={handleChange}
                            className="w-10/12"
                            validations={[required]}
                        />
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
                            <div className={`font-bold text-2xl ${isSuccess? "text-green-700":"text-red-700"}`}>{message}</div>
                        </div>
                    )}
                    <button className='mb-2 font-bold border-0 w-10/12 text-center 
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