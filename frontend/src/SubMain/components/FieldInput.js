import React from 'react';


function FieldInput({title, type, placeholder}) {
    return(
        <div>
            <div>{title}</div>
            <div><input type={type} placeholder={placeholder} className='border-2 border-indigo-600 rounded-md'/></div>
        </div>
    )
}

export default FieldInput;