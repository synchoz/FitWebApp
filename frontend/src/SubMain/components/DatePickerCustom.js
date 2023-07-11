import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
//import { DatePicker } from '@mui/x-date-pickers';
//import { DatePicker } from '@mui/x-date-pickers-pro';
import { useState } from 'react';
import React from 'react';

function DatePickerCustom () {
   /*  const [value, setNewValue] = useState("");
    function setValue(newValue) {
        value = newValue;
    } */

    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="Basic date picker" />
            </LocalizationProvider>
            
        </div>
    )
}

export default DatePickerCustom