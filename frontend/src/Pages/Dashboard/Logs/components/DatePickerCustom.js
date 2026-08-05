import React, { useState } from 'react';
import DatePicker from '../../../../components/ui/DatePicker';

function DatePickerCustom ({setDate}) {
    const [value, setValue] = useState('');

    const handleChange = (iso) => {
        setValue(iso);
        setDate(iso);
    };

    return (
        <DatePicker value={value} onChange={handleChange} placeholder="Select date" />
    )
}

export default DatePickerCustom