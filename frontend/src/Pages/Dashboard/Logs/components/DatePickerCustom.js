import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import React from 'react';

function DatePickerCustom ({setDate}) {
    const handleChange = (event) => {
        setDate(event.toLocaleString());
    };

    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="Basic date picker" onChange={handleChange}/>
            </LocalizationProvider>
        </div>
    )
}

export default DatePickerCustom