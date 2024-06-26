import React, { useContext, useState, useEffect } from "react";
import { ExercisesDispatchContext } from "../ExercisesContext";

export default function SetItem({set}){
    const [reps, setReps] = useState(set.reps);
    const [kgs, setKgs] = useState(set.kgs);
    const dispatch = useContext(ExercisesDispatchContext);


    const handleUpdateReps = (e) => {
        dispatch({  type: 'UPDATE_SET_REPS', 
                    payload: { exerciseId: set.exerciseId, setId: set.id, kgs: kgs, reps: e.target.value }})
        setReps(e.target.value);
    }

    const handleUpdateKgs = (e) => {
        dispatch({  type: 'UPDATE_SET_KGS', 
                    payload: { exerciseId: set.exerciseId, setId: set.id, kgs: e.target.value, reps: reps }})
        setKgs(e.target.value);
    }

    return(
        <div className="setWrapper pb-1 flex flex-col" data-set={set.id} data-parentid={set.exerciseId}>
            <div className="items-center borderBottom flex"><input type="number" value={kgs} onChange={handleUpdateKgs} className="mr-1 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/> <div>kg</div></div>
            <div className="items-center flex self-baseline"><input value={reps} type="number" onChange={handleUpdateReps} className="reps mr-1 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/> x</div>
        </div>
    )
}