import React,{useState} from "react"

export default function WorkoutSummary({bodyweight, setCurrBodyWeight, notes, setCurrNotes}){
    return(
        <>
            <div className="block font-semibold mt-4">Bodyweight:</div>
            <div className="block font-semibold mt-2 mb-2 flex items-center"><input className="m-0 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="number" value={bodyweight} onChange={(e)=> setCurrBodyWeight(e.target.value)}/>KG</div>
            <div className="block font-semibold mt-4 mb-2">Notes:</div>
            <textarea className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="text" value={notes} onChange={(e)=> setCurrNotes(e.target.value)}></textarea>
        </>
    )
}