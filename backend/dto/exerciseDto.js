function toExerciseCatalogDto(exercise) {
    return {
        exercise: exercise.exercise,
        category: exercise.category,
    };
}

function toExerciseCatalogListDto(exercises) {
    return exercises.map(toExerciseCatalogDto);
}

function toUserExerciseDto(userExercise) {
    return {
        id: userExercise.id,
        setnumber: userExercise.setnumber,
        reps: userExercise.reps,
        weight: userExercise.weight,
        logdate: userExercise.logdate,
        exercise: userExercise.exercise ? toExerciseCatalogDto(userExercise.exercise) : null,
    };
}

function toUserExerciseListDto(userExercises) {
    return userExercises.map(toUserExerciseDto);
}

module.exports = { toExerciseCatalogDto, toExerciseCatalogListDto, toUserExerciseDto, toUserExerciseListDto };
