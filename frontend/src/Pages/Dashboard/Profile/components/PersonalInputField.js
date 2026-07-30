import React from 'react';

function PersonalInputField ({label,handleChange,value,type,className,id}) {

    return(
            <div className="flex justify-between items-center gap-4 py-3 border-b border-slate-100 last:border-b-0">
                <label className="text-slate-500 font-semibold whitespace-nowrap" htmlFor={id}>{label}</label>
                <input
                    type={type}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    className="w-1/2 text-right text-slate-800 font-medium bg-transparent border-b border-violet-300 focus:border-violet-600 focus:outline-none"
                />
            </div>
    )
}

export default PersonalInputField;