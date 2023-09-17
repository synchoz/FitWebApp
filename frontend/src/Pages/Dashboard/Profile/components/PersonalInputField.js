import CustomInput from "../../../Home/components/CustomInput/CustomInput";
import React from 'react';

function PersonalInputField ({label,handleChange,value,type,className,id}) {

    return(
            <div className="input-group mb-1">
                <label className="text-xl mb-2" htmlFor={id}>{label}:</label>
                <input
                    type={type}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    className={className}
                />
            </div>
    )
}

export default PersonalInputField;