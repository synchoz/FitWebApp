import { createContext, useReducer } from 'react';

export const ExercisesContext = createContext(null);
export const ExercisesDispatchContext = createContext(null);
export const SetsContext = createContext(null);

export function ExerciseProvier({ children }) {
    const [state, dispatch] = useReducer(
        exercisesReducer,
        initialState
    );

    return (
        <ExercisesContext.Provider value={state}>
            <ExercisesDispatchContext.Provider value={dispatch}>
                {children}
            </ExercisesDispatchContext.Provider>
        </ExercisesContext.Provider>
    )
}

function exercisesReducer(state, action) {
    switch (action.type) {
        case 'ADD_EXERCISE': {
            return {
                ...state,
                exercises: [...state.exercises, action.payload],
                sets: [...state.sets]
            }
        }
        case 'ADD_SET': {
            return {
                ...state,
                sets: [...state.sets, action.payload],
                exercises: state.exercises.map((exercise) => exercise.id === action.payload.exerciseId
                    ? { ...exercise, sets: [...exercise.sets, action.payload.id] }
                    : exercise)
            }
        }
        case 'UPDATE_SET_REPS': {//TODO//
            return {
                ...state,
                exercises: [...state.exercises],
                sets: state.sets.map((set) => {
                    if(set.id == action.payload.setId) {
                        return {
                            ...set,
                            reps: action.payload.reps
                        }
                    } else {
                        return {...set}
                    }
                    
                })
            }
        }
        case 'UPDATE_SET_KGS': {//TODO//
            return {
                ...state,
                exercises: [...state.exercises],
                sets: state.sets.map((set) => {
                    if(set.id == action.payload.setId) {
                        return {
                            ...set,
                            kgs: action.payload.kgs
                        }
                    } else {
                        return {...set}
                    }
                    
                })
            }
        }
        case 'DELETE_EXERCISE': {
            return {
                ...state,
                exercises: state.exercises.filter((exercise) => exercise.id !== action.payload.exerciseId),
                sets: state.sets.filter((set) => set.exerciseId !== action.payload.exerciseId)
            }
        }
        case 'DELETE_LASTSET': {
            let updatedExercises = state.exercises.map((exercise) => {
                if (exercise.id === action.payload.exerciseId) {
                    let updatedSets = exercise.sets.filter((setId) => setId != action.payload.setId)

                    return {
                        ...exercise,
                        sets: updatedSets
                    }
                } else {
                    return { ...exercise }
                }

            })
            return {
                ...state,
                exercises: updatedExercises,
                sets: state.sets.filter((set) => set.id != action.payload.setId)
            }
        }

        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

const initialState =
{
    exercises:
        [
            { id: 1, name: "abs", sets: [2, 3, 4] },
            { id: 2, name: "chest", sets: [5, 6, 7] }
        ],
    sets:
        [
            { id: 2, exerciseId: 1, kgs: 41, reps: 8 },
            { id: 3, exerciseId: 1, kgs: 42, reps: 9 },
            { id: 4, exerciseId: 1, kgs: 43, reps: 10 },
            { id: 6, exerciseId: 2, kgs: 44, reps: 8 },
            { id: 7, exerciseId: 2, kgs: 46, reps: 9 },
            { id: 8, exerciseId: 2, kgs: 48, reps: 10 }
        ],
}