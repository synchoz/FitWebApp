import React,{useState, useContext, useEffect, useReducer} from 'react'
import MainSection from './ExerciseSection/MainSection'
import { ExercisesContext, ExercisesDispatchContext } from './ExercisesContext'
import WorkoutSummary from './WorkoutSummary'

const dropDownData = [
    {label:"Test", value: "test"},
    {label:"Test3", value: "test3"},
    {label:"Test4", value: "test4"},
    {label:"ABS", value: "abs"},
    {label:"Chest", value: "chest"},
    {label:"Test5", value: "test5"}
]

const data = 
[
    {id: 1, currExerciseValue: "abs", 
        sets:   [   
                    {set: 1, kgs:40, reps: 10},
                    {set: 2, kgs:40, reps: 10},
                    {set: 3, kgs:40, reps: 10}
                ]
    },
    {id: 2, currExerciseValue: "chest",
        
        sets:   [   
                    {set: 1, kgs:40, reps: 10},
                    {set: 2, kgs:40, reps: 10},
                    {set: 3, kgs:40, reps: 10}
                ]
    }
]

const currentDate = () => {
    const today = new Date();
    const format = 'yy-mm-dd';
    return format.replace('mm', (today.getMonth() + 1).toString().length == 1 ? '0' + (today.getMonth() + 1).toString() : today.getMonth() + 1)
                .replace('dd', today.getDate().toString().length == 1 ? '0' + today.getDate().toString() : today.getDate())
                .replace('yy', today.getFullYear());
}

export default function ExerciseWorkoutPage() {
    const state = useContext(ExercisesContext);
    const dispatch = useContext(ExercisesDispatchContext);
    const [sectionData, setSectionData] = useState(state);
    const [date, setDate] = useState(currentDate()); 
    const [currBodyweight, setCurrBodyweight] = useState(0);
    const [currNotes, setCurrNotes] = useState("");
    
    useEffect(() => {
        setSectionData(state);
    }, [state])
    

    const handleNewExercise = ()=> {
        const newExercise = { id: Date.now(), name: "abs", sets: [] };
        dispatch({ type: 'ADD_EXERCISE', payload: newExercise });
    }

    return (
        <div className='flex flex-col ml-[65px] px-2'>
            <div className='header'>
                <h1 className='text-2xl font-bold mb-4'>Workout Exercises</h1>
            </div>
            <div className='headerDateSectionAndLoadPrevData flex items-center flex-wrap'>
                <button className='px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mr-2'>Load Prev Workout</button>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mr-2" onClick={handleNewExercise}>Add An Exercise</button>
                Select Date:<input className="m-0 ml-2 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type='date' value={date} onChange={(e)=> setDate(e.target.value)}/>
            </div>
            <div className='exerciseHeader flex flex-col sm:flex-row block font-semibold mt-4 mb-2'>
                <div className='w-full sm:w-1/6'></div>
                <div className='w-full sm:w-1/6'>Exercise</div>
                <div className='w-full sm:w-3/6 pl-2'>Sets</div>
                <div className='w-full sm:w-1/6'>Volume</div>
            </div>
                {sectionData.exercises.map((exercise) => {
                    return(
                        <div key={exercise.id} >
                            <MainSection 
                                /* handleDeleteExercise={handleDeleteExercise}  */
                                handleNewExercise={handleNewExercise}/* duplicateExercise={duplicateExercise} */ 
                                data={exercise} 
                                sets={sectionData.sets.filter((set) => set.exerciseId == exercise.id)} 
                                currValue={exercise.currExerciseValue} 
                                dropDownData={dropDownData} 
                            />
                        </div>
                    )
                })}
                <WorkoutSummary 
                    bodyweight={currBodyweight} setCurrBodyWeight={setCurrBodyweight}
                    notes={currNotes} setCurrNotes={setCurrNotes}
                />
            <div>
                <button className='mt-1 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'>Save Workout</button>
            </div>
        </div>
    )
}