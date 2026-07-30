import React, { useState, useEffect} from 'react';
import { useUserContext } from '../../../components/UserData/UserData';

import dashboardService from '../../../API/Services/dashboard.service'
import authService from '../../../API/Services/auth.service';
import PersonalField from './components/PersonalField';
import PersonalInputField from './components/PersonalInputField';

async function getUserInfo() {
    return await dashboardService.getUserInfo();
}

async function upload(formData) {
    return await dashboardService.upload(formData);
}

async function updateUserInfo(email,
    address,
    phonenumber,
    weight,
    gender,
    fullname) {
        return await authService.updateUserDetails(email,
            address,
            phonenumber,
            weight,
            gender,
            fullname);

}

export default function Profile() {
    const [image, setImage] = useState({ preview: '', data: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [status] = useState('')
    const [imageLink, setImageLink] = useState('');
    const [backgroundImageStyle, setBackgroundImageStyle] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [msg, setMsg] = useState('');
    const { dispatch } = useUserContext();

    const handleReSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault()
        let formData = new FormData();
        formData.append('file', image.data);
        const response = await upload(formData);

        dispatch({type: 'SET_IMAGE', payload: response.result.imagelink});
        setIsLoading(false);
        setMsg(response.message);
    }

  const handleFileChange = (e) => {
    const img = {
        preview: URL.createObjectURL(e.target.files[0]),
        data: e.target.files[0],
    }
    setImage(img)
    setBackgroundImageStyle({backgroundImage: `url(${img.preview})`})
  }
    
    useEffect(() => {
        getUserInfo().then(res => {
            setFormValues(res.result);
            setImageLink(res.result.imagelink);
            dispatch({type: 'SET_IMAGE', payload: res.result.imagelink});
        })
        setBackgroundImageStyle({backgroundImage: `url(${imageLink})`});
    }, [imageLink, dispatch]);


    const handleChange = (e) => {
        setFormValues({ ...formValues, [e.target.id]: e.target.value });
    };

    function handleClick() {
        setIsEdit(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateUserInfo(formValues.email,
                                formValues.address,
                                formValues.phonenumber,
                                formValues.weight,
                                formValues.gender,
                                formValues.fullname
        );
        setMsg('');
        setIsEdit(false);
    };
    return (
        <div className='ml-[220px] min-h-screen bg-slate-50 py-10 px-10'>
            <div className='max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
                <div className='relative bg-gradient-to-br from-[#16233b] to-violet-700 text-white text-center px-10 py-10'>
                    {!isEdit && (
                        <button onClick={handleClick}
                            className='absolute top-5 right-5 bg-white text-violet-700 border-none px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:bg-violet-600 hover:text-white transition'>
                            Edit
                        </button>
                    )}
                    {imageLink && <div style={backgroundImageStyle} className='bg-cover bg-center h-28 w-28 mx-auto rounded-full border-4 border-white' />}
                    <h2 className='text-2xl font-bold mt-4'>{formValues.fullname}</h2>
                    <p className='opacity-80 text-sm'>Personal Information</p>

                    {isEdit && (
                        <form onSubmit={handleReSubmit} className='mt-5 flex flex-col items-center gap-2'>
                            <input type='file' name='file' onChange={handleFileChange}
                                className='text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-white file:text-violet-700 file:font-semibold file:text-xs'></input>
                            {isLoading
                                ? <div className='text-sm opacity-80'>Uploading...</div>
                                : <button type='submit' className='bg-white text-violet-700 px-5 py-1.5 rounded-full text-sm font-semibold shadow-sm hover:bg-violet-600 hover:text-white transition'>Save Image</button>}
                            {msg && <div className='text-emerald-300 text-sm font-semibold'>{msg}</div>}
                            {status && <h4>{status}</h4>}
                        </form>
                    )}
                </div>

                <form onSubmit={handleSubmit} className='px-10 py-6'>
                    {isEdit ? <PersonalInputField
                                handleChange={handleChange}
                                label={"Full Name"}
                                id={"fullname"}
                                type="text"
                                value={formValues.fullname}/>
                            :<PersonalField label='Full Name' value={formValues.fullname}/>}
                    {isEdit ? <PersonalInputField
                                handleChange={handleChange}
                                label={"Address"}
                                id={"address"}
                                type="text"
                                value={formValues.address}/>
                            :<PersonalField label='Address' value={formValues.address}/>}
                    {isEdit ? <PersonalInputField
                                handleChange={handleChange}
                                label={"Phone Number"}
                                id={"phonenumber"}
                                type="number"
                                value={formValues.phonenumber}/>
                            :<PersonalField label='Phone Number' value={formValues.phonenumber}/>}
                    {isEdit ? <PersonalInputField
                                handleChange={handleChange}
                                label={"Email"}
                                id={"email"}
                                type="email"
                                value={formValues.email}/>
                            :<PersonalField label='Email' value={formValues.email}/>}
                    {isEdit ? <PersonalInputField
                                handleChange={handleChange}
                                label={"Gender"}
                                id={"gender"}
                                type="text"
                                value={formValues.gender}/>
                            :<PersonalField label='Gender' value={formValues.gender}/>}
                    {isEdit ? <PersonalInputField
                                handleChange={handleChange}
                                label={"Weight"}
                                id={"weight"}
                                type="number"
                                value={formValues.weight}/>
                            :<PersonalField label='Weight' value={formValues.weight}/>}
                    {isEdit && <div className='w-full flex justify-center mt-6'>
                                    <button type="submit" className="rounded-full bg-violet-600 hover:bg-violet-700 transition px-10 py-2.5 text-white font-semibold shadow-sm">
                                        Save
                                    </button>
                                </div>}
                </form>
            </div>
        </div>
    )

}