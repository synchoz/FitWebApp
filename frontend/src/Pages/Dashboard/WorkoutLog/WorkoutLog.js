import ExerciseWorkoutPage from './components/ExerciseWorkoutPage';
import { ExerciseProvier } from './components/ExercisesContext';

export default function WorkoutLog(){
    return(
    <ExerciseProvier>
        <ExerciseWorkoutPage />
    </ExerciseProvier>
    )
}