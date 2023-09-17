import React from 'react';


function FieldInput({title, type, placeholder, value}) {
    return(
        <div>
            <div>{title}</div>
            <div><input value={value} type={type} placeholder={placeholder} className='border-2 border-indigo-600 rounded-md'/></div>
        </div>
    )
}

export default FieldInput;