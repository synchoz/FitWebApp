import React from 'react';

const Service = ({ iconClass, title, description }) => {
    return (
        <div className='clearfix flex mb-4'>
            <div className='w-12'>
                <div className={`${iconClass} iconGen iconHeight45  float-left w-10`}>&#160;</div>
            </div>
            <div className='pl-5'>
                <div className='font-bold'>{title}</div>
                <div className=''>{description}</div>
            </div>
        </div>
    )
}

export default Service;
