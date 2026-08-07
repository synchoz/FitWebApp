import React from 'react';

function PersonalField({label, value}) {
    return(
        <div className='flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0'>
            <span className='text-slate-500 dark:text-slate-400 font-semibold'>{label}</span>
            <span className='text-slate-800 dark:text-slate-100 font-medium'>{value}</span>
        </div>
    )
}

export default PersonalField;