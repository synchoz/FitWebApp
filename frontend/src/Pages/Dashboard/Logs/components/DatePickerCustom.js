import React from 'react';

function DatePickerCustom ({setDate}) {
    const handleChange = (event) => {
        setDate(event.target.value);
    };

    return (
        <input
            type="date"
            onChange={handleChange}
            className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
    )
}

export default DatePickerCustom