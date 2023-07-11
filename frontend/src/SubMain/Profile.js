import React from 'react'
import FieldInput from './components/FieldInput'


export default function Profile() {
    return (
        <div className=''>
            <div className='mx-10 mt-10 leftSideProfile w-1/4 flex flex-col items-center float-left'>
                <div className='profileImg bg-cover bg-center h-36 w-36 min-w-[20%] border-2 border-gray-400 rounded-full'></div>
                <button className="mt-8 rpy-2 py-1 px-3 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none">Edit</button>
            </div>
            <div className='rightSideProfile w-1/5 float-left mt-10'>
                <div className='mt-2'><FieldInput type={'text'} title={'Full Name'}/></div>
                <div className='mt-2'><FieldInput type={'text'} title={'Address'}/></div>
                <div className='mt-2'><FieldInput type={'text'} title={'Phone'}/></div>
                <div className='mt-2'><FieldInput type={'email'} title={'Email'}/></div>
                <div className='mt-2'><FieldInput type={'text'} title={'Gender'}/></div>
                <div className='mt-2'><FieldInput type={'number'} title={'Weight'} placeholder={'KGs'}/></div>
                <div className='mt-2'><FieldInput type={'number'} title={'Height'} placeholder={'in Metric'}/></div>
                <div className='mt-2'><FieldInput type={'number'} title={'Age'}/></div>
                <div className='mt-2'><FieldInput type={'password'} title={'Password'}/></div>
                <button className="mt-8 rpy-2 py-1 px-5 w-[213px]  bg-emerald-400 text-white text-sm font-semibold rounded-md shadow focus:outline-none">Save</button>
            </div>
        </div>
    )
    
}