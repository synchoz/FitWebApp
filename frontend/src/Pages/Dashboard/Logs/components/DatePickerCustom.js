import React from 'react';

function DatePickerCustom ({setDate}) {
    const handleChange = (event) => {
        setDate(event.target.value);
    };

    return (
        <input
            type="date"
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
        />
    )
}

export default DatePickerCustom