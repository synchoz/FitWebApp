import React,{useState} from "react";


export default function SimpleDropDown({data, exerciseValue, setExerciseValue}) {

    const handleChange = (event) => {
        setExerciseValue(event.target.value);
    }
    return (
        <select className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                defaultValue={exerciseValue} onChange={handleChange}>
            {data.map((item) => { return (
                    <option value={item.value}>{item.label}</option>
                )
            })}
        </select>
    )
}