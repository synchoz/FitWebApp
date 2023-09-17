import React from 'react';

function PersonalField({label, value}) {
    return(
        <div className='flex mb-2'>
            <div className='w-1/2'>{label}:</div><div className='w-1/2'>{value}</div>
        </div>
    )
}

export default PersonalField;