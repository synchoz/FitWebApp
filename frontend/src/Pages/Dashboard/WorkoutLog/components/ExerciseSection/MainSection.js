import React, { useState, useEffect, useContext } from "react";
import SimpleDropDown from "../SimpleDropDown";
import './style.css';
import SetItem from "./SetItem";
import { ExercisesDispatchContext } from "../ExercisesContext";

export default function MainSection({ data, sets, dropDownData, currValue }) {
    const [exerciseValue, setExerciseValue] = useState(currValue);

    const [currSets, setCurrSets] = useState(sets);
    const [currVolume, setCurrVolume] = useState(0);
    const dispatch = useContext(ExercisesDispatchContext);

    const [currData, setCurrData] = useState(data);

    const handleAddSet = () => {
        const newSet = {
            id: Date.now(),
            kgs: 0,
            reps: 0,
            exerciseId: data.id,
        }
        dispatch({ type: 'ADD_SET', payload: newSet });
    }

    const handleAddExercise = () => {
        const newExercise =
        {
            id: Date.now(),
            name: 'abs',
            sets: []
        }
        dispatch({ type: 'ADD_EXERCISE', payload: newExercise });
    }

    const handleDeleteExercise = () => {
        dispatch({ type: 'DELETE_EXERCISE', payload: { exerciseId: data.id } })
    }

    const handleDeleteSet = () => {
        if (currSets.length > 0) {
            dispatch({ type: 'DELETE_LASTSET', payload: { exerciseId: data.id, setId: currSets[currSets.length - 1].id } });
        }
    }

    useEffect(() => {
        setCurrData({ id: data.id, currExerciseValue: exerciseValue, sets: [...currSets] });
        let volume = currSets.reduce(function (accumulator, curValue) {
            return accumulator + (curValue.kgs * curValue.reps)
        }, 0);
        let realSets = currSets.reduce(function (accumulator, curValue) {
            return curValue.kgs > 0 && curValue.reps > 0 ? accumulator + 1 : accumulator + 0
        }, 0);
        volume *= realSets;
        console.log(`Exercise: ${exerciseValue}, Volume: ${volume}`);
        setCurrVolume(volume);
        setCurrSets(sets);
    }, [exerciseValue, currSets, sets])

    let nextId = 9;

    return (
        <div className="flex flex-col sm:flex-row border-b pb-2 pt-2" data={data.id}>
            <div className="w-full flex items-center sm:w-1/6 mb-2 sm:mb-0">
                <div className="flex space-x-1">
                    <button title="Remove An Exercise" className="ml-1 bg-gray-200 p-1 rounded hover:bg-gray-300" onClick={() => handleDeleteExercise(data.id)}>-</button>
                    <button title="Delete Set" className="ml-1 mr-1 bg-gray-200 p-1 rounded hover:bg-gray-300" onClick={handleDeleteSet}>--</button>
                    <button title="Add New Set" className="mr-1 bg-gray-200 p-1 rounded hover:bg-gray-300" onClick={handleAddSet}>+</button>
                    <button title="Duplicate An Exercise" className="mr-1 bg-gray-200 p-1 rounded hover:bg-gray-300" onClick={handleAddExercise}>++</button>
                </div>
            </div>
            <div className="w-full flex items-center sm:w-1/6 mb-2 sm:mb-0">
                <SimpleDropDown data={dropDownData} exerciseValue={exerciseValue} setExerciseValue={setExerciseValue} />
            </div>
            <div className="w-full sm:w-3/6 flex flex-wrap mb-2 sm:mb-0">
                {currSets.map((set) => {
                    return (
                        <div className="" style={{minWidth: '100px'}} key={set.id}>
                            <SetItem set={set} />
                        </div>
                    );
                })}
            </div>
            <div className="w-full flex items-center sm:w-1/6 text-gray-700 font-semibold">{currVolume}</div>
        </div>
    );
}