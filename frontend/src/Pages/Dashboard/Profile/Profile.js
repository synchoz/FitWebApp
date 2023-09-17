import React, { Button, input, form, setState, useRef, useCallback, useMemo, useState, useEffect} from 'react';

import dashboardService from '../../../API/Services/dashboard.service'
import authService from '../../../API/Services/auth.service';
import PersonalField from './components/PersonalField';
import PersonalInputField from './components/PersonalInputField';

async function getUserInfo() {
    return await dashboardService.getUserInfo(JSON.parse(authService.getCurrentUser()).username);
}

async function updateUserInfo(username,
    email,
    address,
    phonenumber,
    weight,
    gender,
    fullname) {
        return await authService.updateUserDetails(username,
            email,
            address,
            phonenumber,
            weight,
            gender,
            fullname);

}

export default function Profile() {
    const [isEdit, setIsEdit] = useState(false);
    const [formValues, setFormValues] = useState({});
    useEffect(() => {
        getUserInfo().then(res => {setFormValues(res.result)})
    }, []);

    const handleChange = (e) => {
        console.log('ID:', e.target.id, 'Value:', e.target.value);
        setFormValues({ ...formValues, [e.target.id]: e.target.value });
    };

    function handleClick() {
        setIsEdit(true);
    }

    const handleSubmit = async (e) => {
        console.log(formValues);
        e.preventDefault();
        const res = await updateUserInfo(formValues.username,
                                            formValues.email,
                                            formValues.address,
                                            formValues.phonenumber,
                                            formValues.weight,
                                            formValues.gender,
                                            formValues.fullname
        );
        console.log(res);
        setIsEdit(false);
    };

    return (
        <div className=''>
            <div className='mx-10 mt-10 leftSideProfile w-1/4 flex flex-col items-center float-left'>
                <div className='profileImg bg-cover bg-center h-36 w-36 min-w-[20%] border-2 border-gray-400 rounded-full'></div>
                {!isEdit && <button onClick={handleClick}
                        className="mt-8 rpy-2 py-1 px-3 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none">Edit</button>}
            </div>
            <div className='rightSideProfile w-2/6 float-left mt-10'>
                <h3 className='font-bold text-3xl'>Personal Information</h3>
                <form onSubmit={handleSubmit} className='text-2xl mt-3'>
                    {isEdit ? <PersonalInputField 
                                handleChange={handleChange}
                                label={"Full Name"}
                                id={"fullname"}
                                type="text"
                                value={formValues.fullname}
                                className="w-full border-[1px]"/>
                            :<PersonalField label='Full Name' value={formValues.fullname}/>}
                    {isEdit ? <PersonalInputField 
                                handleChange={handleChange}
                                label={"Address"}
                                id={"address"}
                                type="text"
                                value={formValues.address}
                                className="w-full border-[1px]"/>
                            :<PersonalField label='Address' value={formValues.address}/>}
                    {isEdit ? <PersonalInputField 
                                handleChange={handleChange}
                                label={"Phone Number"}
                                id={"phonenumber"}
                                type="number"
                                value={formValues.phonenumber}
                                className="w-full border-[1px]"/>
                            :<PersonalField label='Phone Number' value={formValues.phonenumber}/>}
                    {isEdit ? <PersonalInputField 
                                handleChange={handleChange}
                                label={"Email"}
                                id={"email"}
                                type="email"
                                value={formValues.email}
                                className="w-full border-[1px]"/>
                            :<PersonalField label='Email' value={formValues.email}/>}
                    {isEdit ? <PersonalInputField 
                                handleChange={handleChange}
                                label={"Gender"}
                                id={"gender"}
                                type="text"
                                value={formValues.gender}
                                className="w-full border-[1px]"/>
                            :<PersonalField label='Gender' value={formValues.gender}/>}
                    {isEdit ? <PersonalInputField 
                                handleChange={handleChange}
                                label={"Weight"}
                                id={"weight"}
                                type="number"
                                value={formValues.weight}
                                className="w-full border-[1px]"/>
                            :<PersonalField label='Weight' value={formValues.weight}/>}
                    {isEdit && <div className='w-full flex justify-center mt-4'>
                                    <button type="submit" className="submit-btn rounded-3xl bg-green-400 hover:bg-green-500 px-10 py-3 text-white text-lg font-medium">
                                        Save
                                    </button>
                                </div>}
                </form>
            </div>
        </div>
    )
    
}